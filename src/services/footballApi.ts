import { PredictionMarketContract } from '../types';
import { ALL_LEAGUES, LeagueInfo, REGIONS, Region } from '../config/leagues';

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/123';

// Raw event shape from TheSportsDB
interface SportsDbEvent {
  idEvent: string;
  strEvent: string;
  strTimestamp: string | null;
  dateEvent: string;
  strTime: string | null;
  idLeague: string;
  strLeague: string;
  strLeagueBadge?: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strVenue?: string;
  strCountry?: string;
  strStatus?: string;
}

// Deterministic pseudo-random pool generator so pools look realistic & stable
const seededPools = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000000;
  const base = 20000 + (h % 80000);
  const t1 = Math.round(base * (0.3 + ((h % 40) / 100)));
  const t2 = Math.round(base * (0.25 + ((h % 33) / 100)));
  const draw = Math.round(base * 0.2);
  return { total: t1 + t2 + draw, t1, t2, draw };
};

const buildBbcText = (e: SportsDbEvent, resolved: boolean): string => {
  if (resolved) {
    return `BBC Sport - Scores & Fixtures
${e.strLeague} - ${e.dateEvent}
${e.strVenue || ''} ${e.strCountry || ''}
Match Status: Full Time
${e.strHomeTeam} ${e.intHomeScore} - ${e.intAwayScore} ${e.strAwayTeam}
Match finished.`;
  }
  return `BBC Sport - Scores & Fixtures
${e.strLeague} - ${e.dateEvent}
${e.strVenue || ''} ${e.strCountry || ''}
${e.strHomeTeam} Kick off ${e.strTime?.substring(0, 5) || 'TBD'} ${e.strAwayTeam}
Match Preview: Coverage starting soon.`;
};

const mapEventToMarket = (e: SportsDbEvent): PredictionMarketContract => {
  const homeScore = e.intHomeScore != null ? parseInt(e.intHomeScore, 10) : null;
  const awayScore = e.intAwayScore != null ? parseInt(e.intAwayScore, 10) : null;
  const resolved = homeScore != null && awayScore != null;

  let winner = -1;
  let score = '';
  if (resolved) {
    score = `${homeScore}:${awayScore}`;
    winner = homeScore! > awayScore! ? 1 : homeScore! < awayScore! ? 2 : 0;
  }

  const pools = seededPools(e.idEvent);

  return {
    id: `sdb-${e.idEvent}`,
    contractAddress:
      'gl1' + e.idEvent.padEnd(38, '0').substring(0, 38),
    gameDate: e.dateEvent,
    team1: e.strHomeTeam,
    team2: e.strAwayTeam,
    league: e.strLeague,
    resolutionUrl: `https://www.bbc.com/sport/football/scores-fixtures/${e.dateEvent}`,
    hasResolved: resolved,
    winner,
    score,
    totalPool: pools.total,
    poolTeam1: pools.t1,
    poolTeam2: pools.t2,
    poolDraw: pools.draw,
    simulationData: {
      bbcWebText: buildBbcText(e, resolved),
      expectedScore: resolved ? score : '-',
      expectedWinner: winner,
    },
  };
};

async function fetchLeagueEvents(
  league: LeagueInfo,
  type: 'next' | 'past'
): Promise<PredictionMarketContract[]> {
  const endpoint = type === 'next' ? 'eventsnextleague.php' : 'eventspastleague.php';
  try {
    const res = await fetch(`${API_BASE}/${endpoint}?id=${league.id}`);
    if (!res.ok) return [];
    const data = await res.json();
    const events: SportsDbEvent[] = data?.events || [];
    return events
      .filter((e) => e.strHomeTeam && e.strAwayTeam)
      .slice(0, 6)
      .map(mapEventToMarket);
  } catch (err) {
    console.warn(`Failed to fetch league ${league.name}`, err);
    return [];
  }
}

// FIFA World Cup league id on TheSportsDB
export const WORLD_CUP_LEAGUE_ID = '4429';

export interface RegionMarkets {
  region: Region;
  markets: PredictionMarketContract[];
}

const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Fetch ALL FIFA World Cup matches happening on a specific day
 * (both already-played and upcoming). Defaults to today.
 * Uses eventsday.php and filters by the World Cup league id.
 */
export async function fetchWorldCupByDate(date: string = todayISO()): Promise<PredictionMarketContract[]> {
  try {
    const res = await fetch(`${API_BASE}/eventsday.php?d=${date}&s=Soccer`);
    if (!res.ok) return [];
    const data = await res.json();
    const events: SportsDbEvent[] = data?.events || [];
    return events
      .filter((e) => e.idLeague === WORLD_CUP_LEAGUE_ID && e.strHomeTeam && e.strAwayTeam)
      .map(mapEventToMarket)
      // sort by kick-off time within the day
      .sort((a, b) => a.gameDate.localeCompare(b.gameDate));
  } catch (err) {
    console.warn('fetchWorldCupByDate failed', err);
    return [];
  }
}

/**
 * Featured World Cup matches for the home banner.
 * Prefers today's matches; if there are none today, falls back to the
 * nearest recent results + upcoming fixtures so the banner is never empty
 * during the tournament.
 */
export async function fetchWorldCupMarkets(): Promise<PredictionMarketContract[]> {
  const league: LeagueInfo = {
    id: WORLD_CUP_LEAGUE_ID,
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    country: 'World',
    flag: '🏆',
  };

  // 1) Try today's matches first
  const today = await fetchWorldCupByDate();
  if (today.length > 0) return today;

  // 2) Fallback: recent results + upcoming fixtures
  const [next, past] = await Promise.all([
    fetchLeagueEvents(league, 'next'),
    fetchLeagueEvents(league, 'past'),
  ]);
  return [...past.slice(0, 4), ...next.slice(0, 8)];
}

/**
 * Fetch upcoming + recent matches for every notable league, grouped by region.
 */
export async function fetchAllRegionMarkets(): Promise<RegionMarkets[]> {
  const results = await Promise.all(
    REGIONS.map(async (region) => {
      const perLeague = await Promise.all(
        region.leagues.map(async (lg) => {
          const [next, past] = await Promise.all([
            fetchLeagueEvents(lg, 'next'),
            fetchLeagueEvents(lg, 'past'),
          ]);
          // 3 upcoming + 2 recent results per league
          return [...next.slice(0, 3), ...past.slice(0, 2)];
        })
      );
      const markets = perLeague.flat();
      return { region, markets };
    })
  );
  return results.filter((r) => r.markets.length > 0);
}

/** Flat list of all markets across regions */
export async function fetchAllMarkets(): Promise<PredictionMarketContract[]> {
  const regions = await fetchAllRegionMarkets();
  return regions.flatMap((r) => r.markets);
}

// ===================== MATCH RESULTS SEARCH =====================

export interface MatchResult {
  id: string;
  date: string;
  time: string;
  leagueId: string;
  league: string;
  leagueBadge?: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge?: string;
  awayBadge?: string;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  country?: string;
  finished: boolean;
  winner: 'home' | 'away' | 'draw' | null;
}

const mapEventToResult = (e: SportsDbEvent): MatchResult => {
  const homeScore = e.intHomeScore != null && e.intHomeScore !== '' ? parseInt(e.intHomeScore, 10) : null;
  const awayScore = e.intAwayScore != null && e.intAwayScore !== '' ? parseInt(e.intAwayScore, 10) : null;
  const finished = homeScore != null && awayScore != null;
  let winner: MatchResult['winner'] = null;
  if (finished) {
    winner = homeScore! > awayScore! ? 'home' : homeScore! < awayScore! ? 'away' : 'draw';
  }
  return {
    id: e.idEvent,
    date: e.dateEvent,
    time: e.strTime?.substring(0, 5) || '',
    leagueId: e.idLeague,
    league: e.strLeague,
    leagueBadge: e.strLeagueBadge,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeBadge: e.strHomeTeamBadge,
    awayBadge: e.strAwayTeamBadge,
    homeScore,
    awayScore,
    venue: e.strVenue,
    country: e.strCountry,
    finished,
    winner,
  };
};

// Guess plausible season strings for a league from a target date.
// Cup/tournament leagues use a single year (e.g. "2026"),
// domestic leagues use cross-year (e.g. "2025-2026").
const seasonCandidates = (date: string): string[] => {
  const year = parseInt(date.substring(0, 4), 10) || new Date().getFullYear();
  const month = parseInt(date.substring(5, 7), 10) || 1;
  // For Aug-Dec, the cross-year season starts this year; for Jan-Jul it started last year
  const crossStart = month >= 7 ? year : year - 1;
  return [
    `${year}`,
    `${crossStart}-${crossStart + 1}`,
    `${year - 1}-${year}`,
    `${year}-${year + 1}`,
  ];
};

// In-memory cache so repeated date searches on the same league are instant
const seasonCache = new Map<string, SportsDbEvent[]>();

async function fetchSeasonEvents(leagueId: string, season: string): Promise<SportsDbEvent[]> {
  const cacheKey = `${leagueId}:${season}`;
  if (seasonCache.has(cacheKey)) return seasonCache.get(cacheKey)!;
  try {
    const res = await fetch(`${API_BASE}/eventsseason.php?id=${leagueId}&s=${season}`);
    if (!res.ok) return [];
    const data = await res.json();
    const events: SportsDbEvent[] = data?.events || [];
    seasonCache.set(cacheKey, events);
    return events;
  } catch {
    return [];
  }
}

/**
 * Fetch the full set of matches for a league across plausible seasons.
 * This returns the entire tournament/season (not just the last 15),
 * so older matches and pre-tournament searches work correctly.
 */
async function fetchFullLeagueEvents(leagueId: string, hintDate?: string): Promise<SportsDbEvent[]> {
  const seasons = hintDate ? seasonCandidates(hintDate) : seasonCandidates(todayISO());
  const all: SportsDbEvent[] = [];
  const seen = new Set<string>();
  for (const season of seasons) {
    const events = await fetchSeasonEvents(leagueId, season);
    for (const e of events) {
      if (!seen.has(e.idEvent)) {
        seen.add(e.idEvent);
        all.push(e);
      }
    }
    // Stop early once we have a decent set from a matching season
    if (all.length > 0 && season === seasons[0]) break;
  }
  return all;
}

/**
 * Fetch all soccer matches on a specific date, optionally filtered by league id.
 * date format: YYYY-MM-DD
 *
 * Strategy:
 *  - "All leagues": use eventsday.php and keep only our notable leagues.
 *  - A specific league: load that league's full season and filter by the date.
 *    This guarantees results for ANY date (including World Cup group stage,
 *    dates before/after the tournament window, etc.).
 */
export async function fetchResultsByDate(date: string, leagueId?: string): Promise<MatchResult[]> {
  // Specific league -> use full season data (reliable for any date)
  if (leagueId && leagueId !== 'all') {
    const events = await fetchFullLeagueEvents(leagueId, date);
    return events
      .filter((e) => e.dateEvent === date && e.strHomeTeam && e.strAwayTeam)
      .map(mapEventToResult)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  // All leagues -> day endpoint, restricted to our notable leagues
  try {
    const res = await fetch(`${API_BASE}/eventsday.php?d=${date}&s=Soccer`);
    if (!res.ok) return [];
    const data = await res.json();
    const notableIds = new Set([...ALL_LEAGUES.map((l) => l.id), WORLD_CUP_LEAGUE_ID]);
    const events: SportsDbEvent[] = (data?.events || []).filter((e: SportsDbEvent) =>
      notableIds.has(e.idLeague)
    );
    const all: SportsDbEvent[] = data?.events || [];
    // Prefer notable leagues, but fall back to all soccer if none matched
    const list = events.length > 0 ? events : all;
    return list
      .filter((e) => e.strHomeTeam && e.strAwayTeam)
      .map(mapEventToResult)
      .sort((a, b) => a.time.localeCompare(b.time));
  } catch (err) {
    console.warn('fetchResultsByDate failed', err);
    return [];
  }
}

/**
 * Fetch the FULL set of results for a specific league (whole season/tournament),
 * newest first. Falls back to the last-15 endpoint if season data is empty.
 */
export async function fetchResultsByLeague(leagueId: string): Promise<MatchResult[]> {
  // Try full season first (covers entire World Cup, all rounds)
  const seasonEvents = await fetchFullLeagueEvents(leagueId);
  if (seasonEvents.length > 0) {
    return seasonEvents
      .filter((e) => e.strHomeTeam && e.strAwayTeam)
      .map(mapEventToResult)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }

  // Fallback: recent results endpoint
  try {
    const res = await fetch(`${API_BASE}/eventspastleague.php?id=${leagueId}`);
    if (!res.ok) return [];
    const data = await res.json();
    const events: SportsDbEvent[] = data?.events || [];
    return events
      .filter((e) => e.strHomeTeam && e.strAwayTeam)
      .map(mapEventToResult)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.warn('fetchResultsByLeague failed', err);
    return [];
  }
}

export { ALL_LEAGUES };
