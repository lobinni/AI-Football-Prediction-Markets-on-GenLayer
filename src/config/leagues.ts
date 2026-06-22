// Notable football leagues grouped by region, using TheSportsDB league IDs.
// Free API (no key needed beyond the public test key "123").
// https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id={idLeague}

export interface LeagueInfo {
  id: string; // TheSportsDB idLeague
  name: string;
  shortName: string;
  country: string;
  flag: string; // emoji
}

export interface Region {
  key: string;
  nameVi: string;
  nameEn: string;
  emoji: string;
  leagues: LeagueInfo[];
}

export const REGIONS: Region[] = [
  {
    key: 'europe',
    nameVi: 'Châu Âu',
    nameEn: 'Europe',
    emoji: '🇪🇺',
    leagues: [
      { id: '4328', name: 'English Premier League', shortName: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { id: '4335', name: 'Spanish La Liga', shortName: 'La Liga', country: 'Spain', flag: '🇪🇸' },
      { id: '4331', name: 'German Bundesliga', shortName: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
      { id: '4332', name: 'Italian Serie A', shortName: 'Serie A', country: 'Italy', flag: '🇮🇹' },
      { id: '4334', name: 'French Ligue 1', shortName: 'Ligue 1', country: 'France', flag: '🇫🇷' },
      { id: '4480', name: 'UEFA Champions League', shortName: 'Champions League', country: 'Europe', flag: '🏆' },
    ],
  },
  {
    key: 'asia',
    nameVi: 'Châu Á',
    nameEn: 'Asia',
    emoji: '🌏',
    leagues: [
      { id: '4350', name: 'Japanese J1 League', shortName: 'J1 League', country: 'Japan', flag: '🇯🇵' },
      { id: '4509', name: 'Saudi Pro League', shortName: 'Saudi Pro League', country: 'Saudi Arabia', flag: '🇸🇦' },
      { id: '4566', name: 'Chinese Super League', shortName: 'CSL', country: 'China', flag: '🇨🇳' },
      { id: '4373', name: 'South Korean K League 1', shortName: 'K League 1', country: 'South Korea', flag: '🇰🇷' },
      { id: '4744', name: 'Australian A-League', shortName: 'A-League', country: 'Australia', flag: '🇦🇺' },
    ],
  },
  {
    key: 'americas',
    nameVi: 'Châu Mỹ',
    nameEn: 'Americas',
    emoji: '🌎',
    leagues: [
      { id: '4346', name: 'American Major League Soccer', shortName: 'MLS', country: 'USA', flag: '🇺🇸' },
      { id: '4351', name: 'Brazilian Serie A', shortName: 'Brasileirão', country: 'Brazil', flag: '🇧🇷' },
      { id: '4406', name: 'Argentine Primera División', shortName: 'Liga Argentina', country: 'Argentina', flag: '🇦🇷' },
      { id: '4356', name: 'Mexican Liga MX', shortName: 'Liga MX', country: 'Mexico', flag: '🇲🇽' },
    ],
  },
  {
    key: 'world',
    nameVi: 'Quốc tế',
    nameEn: 'International',
    emoji: '🌍',
    leagues: [
      { id: '4429', name: 'FIFA World Cup', shortName: 'World Cup', country: 'World', flag: '🏆' },
      { id: '4502', name: 'UEFA European Championship', shortName: 'EURO', country: 'Europe', flag: '🇪🇺' },
      { id: '4423', name: 'CONMEBOL Copa America', shortName: 'Copa America', country: 'South America', flag: '🌎' },
    ],
  },
];

// Flat lookup helpers
export const ALL_LEAGUES: LeagueInfo[] = REGIONS.flatMap((r) => r.leagues);

export const getLeagueById = (id: string) => ALL_LEAGUES.find((l) => l.id === id);

export const getRegionByLeagueId = (id: string) =>
  REGIONS.find((r) => r.leagues.some((l) => l.id === id));
