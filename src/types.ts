export type TabType = 'markets' | 'results' | 'faucet' | 'create' | 'studio' | 'my-bets';

export interface PredictionMarketContract {
  id: string;
  contractAddress: string;
  // Optional real deployed EVM contract address (0x...). When present, bets
  // are sent by calling placeBet() on this contract instead of a plain transfer.
  evmContractAddress?: string;
  gameDate: string;
  team1: string;
  team2: string;
  league: string;
  resolutionUrl: string;
  hasResolved: boolean;
  winner: number; // 0: Draw, 1: Team 1, 2: Team 2, -1: Unresolved
  score: string;
  totalPool: number;
  poolTeam1: number;
  poolTeam2: number;
  poolDraw: number;
  myBet?: {
    choice: number; // 1 for Team 1, 2 for Team 2, 0 for Draw
    amount: number;
    claimed: boolean;
  };
  simulationData: {
    bbcWebText: string;
    expectedScore: string;
    expectedWinner: number;
  };
}

export interface ValidatorNode {
  id: string;
  name: string;
  location: string;
  status: 'idle' | 'fetching' | 'prompting' | 'success' | 'error';
  renderedText?: string;
  llmOutput?: string;
  parsedResult?: {
    score: string;
    winner: number;
  };
  latency: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  type: 'BET' | 'DEPLOY' | 'RESOLVE' | 'CLAIM';
  title: string;
  amount?: number;
  txHash: string;
}
