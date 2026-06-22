import React, { useState } from 'react';
import { t } from '../data/mockData';
import { REGIONS } from '../config/leagues';
import { MatchResult, fetchResultsByDate, fetchResultsByLeague, WORLD_CUP_LEAGUE_ID } from '../services/footballApi';
import { Calendar, Trophy, Search, Loader2, CalendarSearch, ListFilter, MapPin, CalendarClock } from 'lucide-react';

type Mode = 'date' | 'league';

const todayStr = () => new Date().toISOString().split('T')[0];

// World Cup 2026 notable matchdays for quick selection
const WC_QUICK_DATES = [
  { label: 'Opening (Jun 11)', date: '2026-06-11' },
  { label: 'Jun 12', date: '2026-06-12' },
  { label: 'Jun 13', date: '2026-06-13' },
  { label: 'Today', date: todayStr() },
];

export const ResultsFinder: React.FC = () => {
  const [mode, setMode] = useState<Mode>('date');
  const [date, setDate] = useState<string>(todayStr());
  const [leagueId, setLeagueId] = useState<string>('all');
  const [dateLeagueId, setDateLeagueId] = useState<string>('all');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data =
        mode === 'date'
          ? await fetchResultsByDate(date, dateLeagueId)
          : await fetchResultsByLeague(leagueId);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const ScoreBadge: React.FC<{ m: MatchResult }> = ({ m }) => {
    if (!m.finished) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {m.time || t.notStarted}
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center">
        <div className="text-lg font-extrabold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 tabular-nums">
          {m.homeScore} <span className="text-slate-500">-</span> {m.awayScore}
        </div>
        <span className="text-[9px] font-bold text-emerald-400 mt-0.5">{t.fullTime}</span>
      </div>
    );
  };

  const TeamName: React.FC<{ name: string; badge?: string; win: boolean; align: 'left' | 'right' }> = ({
    name,
    badge,
    win,
    align,
  }) => (
    <div className={`flex items-center gap-2 flex-1 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {badge ? (
        <img src={badge} alt="" className="w-6 h-6 object-contain flex-shrink-0" loading="lazy" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
          {name.charAt(0)}
        </div>
      )}
      <span className={`text-sm truncate ${win ? 'font-extrabold text-white' : 'font-medium text-slate-300'}`}>
        {name}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl text-slate-950 shadow-lg">
            <CalendarSearch className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{t.resultsTitle}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t.resultsSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Search controls */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        {/* Mode toggle */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs font-semibold w-full sm:w-fit">
          <button
            onClick={() => setMode('date')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all flex-1 sm:flex-none justify-center ${
              mode === 'date' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.searchByDate}</span>
          </button>
          <button
            onClick={() => setMode('league')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all flex-1 sm:flex-none justify-center ${
              mode === 'league' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{t.searchByLeague}</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mode === 'date' ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.selectDate}</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                {/* Quick World Cup dates */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <CalendarClock className="w-3 h-3" />
                    <span>{t.quickDates}:</span>
                  </span>
                  {WC_QUICK_DATES.map((q) => (
                    <button
                      key={q.date}
                      type="button"
                      onClick={() => {
                        setDate(q.date);
                        setDateLeagueId(WORLD_CUP_LEAGUE_ID);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors ${
                        date === q.date
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
                      }`}
                    >
                      🏆 {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{t.selectLeague}</span>
                </label>
                <select
                  value={dateLeagueId}
                  onChange={(e) => setDateLeagueId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">{t.allLeagues}</option>
                  {REGIONS.map((r) => (
                    <optgroup key={r.key} label={`${r.emoji} ${r.nameEn}`}>
                      {r.leagues.map((lg) => (
                        <option key={lg.id} value={lg.id}>
                          {lg.flag} {lg.shortName}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t.selectLeague}</span>
              </label>
              <select
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all" disabled>
                  {t.selectLeague}
                </option>
                {REGIONS.map((r) => (
                  <optgroup key={r.key} label={`${r.emoji} ${r.nameEn}`}>
                    {r.leagues.map((lg) => (
                      <option key={lg.id} value={lg.id}>
                        {lg.flag} {lg.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || (mode === 'league' && leagueId === 'all')}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{t.searchBtn}</span>
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="p-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span>{t.searching}</span>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-slate-300 font-semibold">{t.noResults}</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{t.noResultsHint}</p>
          {mode === 'date' && dateLeagueId !== 'all' && (
            <button
              onClick={() => {
                setMode('league');
                setLeagueId(dateLeagueId);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition-colors"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{t.searchByLeague}</span>
            </button>
          )}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 px-1">
            <span className="font-bold text-cyan-400">{results.length}</span> {t.resultsFound}
          </div>
          {results.map((m) => {
            const homeWin = m.winner === 'home';
            const awayWin = m.winner === 'away';
            return (
              <div
                key={m.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-md overflow-hidden"
              >
                {/* League header */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-slate-800/70">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    {m.leagueBadge && <img src={m.leagueBadge} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                    <span className="font-semibold text-slate-300">{m.league}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                </div>

                {/* Match row */}
                <div className="flex items-center px-4 py-4 gap-3">
                  <TeamName name={m.homeTeam} badge={m.homeBadge} win={homeWin} align="left" />
                  <ScoreBadge m={m} />
                  <TeamName name={m.awayTeam} badge={m.awayBadge} win={awayWin} align="right" />
                </div>

                {/* Venue */}
                {m.venue && (
                  <div className="px-4 pb-3 -mt-1 flex items-center space-x-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{m.venue}{m.country ? `, ${m.country}` : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-sm">
          {t.resultsSubtitle}.
        </div>
      )}
    </div>
  );
};
