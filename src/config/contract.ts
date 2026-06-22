// PredictionMarket smart contract configuration (EVM ABI interface).
//
// This ABI mirrors a Solidity-style wrapper around the py-genlayer
// PredictionMarket contract so the dApp can call it from an EVM wallet.
//
// Replace DEFAULT_MARKET_CONTRACT with your deployed contract address.

export const DEFAULT_MARKET_CONTRACT = '0x0000000000000000000000000000000000000000';

// Standard human-readable ABI (ethers v6 supports this format directly)
export const PREDICTION_MARKET_ABI = [
  // --- Views ---
  'function team1() view returns (string)',
  'function team2() view returns (string)',
  'function hasResolved() view returns (bool)',
  'function winner() view returns (uint256)',
  'function score() view returns (string)',
  'function totalPool() view returns (uint256)',
  'function poolOf(uint8 choice) view returns (uint256)',
  'function betOf(address user) view returns (uint8 choice, uint256 amount, bool claimed)',
  'function getResolutionData() view returns (uint256 winner, string score, bool hasResolved)',

  // --- Writes (payable / state-changing) ---
  // choice: 0 = Draw, 1 = Team1, 2 = Team2. The bet amount is sent as msg.value (native GEN).
  'function placeBet(uint8 choice) payable',
  // Triggers the GenLayer AI consensus resolution (gl.eq_principle.strict_eq)
  'function resolve()',
  // Claim winnings after the market resolves
  'function claimWinnings()',

  // --- Events ---
  'event BetPlaced(address indexed bettor, uint8 choice, uint256 amount)',
  'event MarketResolved(uint256 winner, string score)',
  'event WinningsClaimed(address indexed bettor, uint256 amount)',
];

// Choice enum used on-chain
export const BET_CHOICE = {
  DRAW: 0,
  TEAM1: 1,
  TEAM2: 2,
} as const;
