import { PredictionMarketContract } from '../types';

export const pythonContractCode = `# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing

class PredictionMarket(gl.Contract):
    has_resolved: bool
    team1: str
    team2: str
    resolution_url: str
    winner: u256
    score: str

    def __init__(self, game_date: str, team1: str, team2: str):
        """
        Initializes a new prediction market with the specified game date and teams.
        """
        self.has_resolved = False
        self.resolution_url = (
            "https://www.bbc.com/sport/football/scores-fixtures/" + game_date
        )
        self.team1 = team1
        self.team2 = team2
        self.winner = u256(0)
        self.score = ""

    @gl.public.write
    def resolve(self) -> typing.Any:
        if self.has_resolved:
            raise gl.vm.UserError("Already resolved")

        market_resolution_url = self.resolution_url
        team1 = self.team1
        team2 = self.team2

        def get_match_result() -> typing.Any:
            web_data = gl.nondet.web.render(market_resolution_url, mode="text")
            print(web_data)

            task = f"""
In the following web page, find the winning team in a matchup between the following teams:
Team 1: {team1}
Team 2: {team2}

Web page content:
{web_data}
End of web page data.

If it says "Kick off [time]" between the names of the two teams, it means the game hasn't started yet.
If you fail to extract the score, assume the game is not resolved yet.

Respond with the following JSON format:
{{
    "score": str, // The score with numbers only, e.g, "1:2", or "-" if the game is not resolved yet
    "winner": int, // The number of the winning team, 0 for draw, or -1 if the game is not yet finished
}}
It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
            """
            result = (
                gl.nondet.exec_prompt(task).replace("json", "").replace("'''", "")
            )
            print(result)
            return json.loads(result)

        result_json = gl.eq_principle.strict_eq(get_match_result)

        if result_json["winner"] > -1:
            self.has_resolved = True
            self.winner = result_json["winner"]
            self.score = result_json["score"]

        return result_json

    @gl.public.view
    def get_resolution_data(self) -> dict[str, typing.Any]:
        return {
            "winner": self.winner,
            "score": self.score,
            "has_resolved": self.has_resolved,
        }
`;

export const initialMarkets: PredictionMarketContract[] = [
  {
    id: 'market-1',
    contractAddress: 'gl1x94f8a29b47cd29e1f82c49a71b0583b27e99',
    gameDate: '2026-03-15',
    team1: 'Arsenal',
    team2: 'Chelsea',
    league: 'Premier League',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures/2026-03-15',
    hasResolved: false,
    winner: -1,
    score: '',
    totalPool: 45000,
    poolTeam1: 25000,
    poolTeam2: 12000,
    poolDraw: 8000,
    myBet: { choice: 1, amount: 500, claimed: false },
    simulationData: {
      bbcWebText: `BBC Sport - Scores & Fixtures
Premier League - Sunday 15 March 2026
Emirates Stadium, London
Match Status: Full Time
Arsenal 2 - 1 Chelsea
Goal scorers: Saka 24', Odegaard 67' (Arsenal); Palmer 42' (Chelsea)
Attendance: 60,214. Match finished.`,
      expectedScore: '2:1',
      expectedWinner: 1
    }
  },
  {
    id: 'market-2',
    contractAddress: 'gl1m83e7b39c58fe38d1e93b58c72a1954f63c88',
    gameDate: '2026-03-18',
    team1: 'Vietnam',
    team2: 'Thailand',
    league: 'AFF Championship Match',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures/2026-03-18',
    hasResolved: false,
    winner: -1,
    score: '',
    totalPool: 88000,
    poolTeam1: 52000,
    poolTeam2: 24000,
    poolDraw: 12000,
    simulationData: {
      bbcWebText: `BBC Sport - World International Matches
Wednesday 18 March 2026
My Dinh National Stadium, Hanoi
Match Status: Full Time
Vietnam 3 - 1 Thailand
Goals: Nguyen Tien Linh 14', 55', Nguyen Quang Hai 82' (Vietnam); Supachai 45+2' (Thailand)
Excellent victory for the Golden Star Warriors in front of a roaring home crowd.`,
      expectedScore: '3:1',
      expectedWinner: 1
    }
  },
  {
    id: 'market-3',
    contractAddress: 'gl1k45d2a93b21fa79e4e73b28d45f9175c29a11',
    gameDate: '2026-03-20',
    team1: 'Real Madrid',
    team2: 'Barcelona',
    league: 'La Liga (El Clasico)',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures/2026-03-20',
    hasResolved: false,
    winner: -1,
    score: '',
    totalPool: 120000,
    poolTeam1: 50000,
    poolTeam2: 50000,
    poolDraw: 20000,
    simulationData: {
      bbcWebText: `BBC Sport - European Football
Friday 20 March 2026
Santiago Bernabeu, Madrid
Match Status: Full Time
Real Madrid 2 - 2 Barcelona
Goals: Mbappe 12', Vinicius Jr 74' (Real Madrid); Yamal 33', Pedri 89' (Barcelona)
A thrilling El Clasico ends in a spectacular draw.`,
      expectedScore: '2:2',
      expectedWinner: 0
    }
  },
  {
    id: 'market-4',
    contractAddress: 'gl1p77b1e42c89db18f3a52c34a91e8476d72b55',
    gameDate: '2026-03-25',
    team1: 'Manchester City',
    team2: 'Liverpool',
    league: 'Premier League',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures/2026-03-25',
    hasResolved: false,
    winner: -1,
    score: '',
    totalPool: 95000,
    poolTeam1: 40000,
    poolTeam2: 35000,
    poolDraw: 20000,
    simulationData: {
      bbcWebText: `BBC Sport - Scores & Fixtures
Wednesday 25 March 2026
Etihad Stadium, Manchester
Manchester City Kick off 16:30 Liverpool
Match Preview: Top of the table clash. Live coverage starting soon.`,
      expectedScore: '-',
      expectedWinner: -1
    }
  },
  {
    id: 'market-5',
    contractAddress: 'gl1z99c8f31b28fa54d2e13a48e71c9834e56z12',
    gameDate: '2026-03-10',
    team1: 'Bayern Munich',
    team2: 'PSG',
    league: 'UEFA Champions League',
    resolutionUrl: 'https://www.bbc.com/sport/football/scores-fixtures/2026-03-10',
    hasResolved: true,
    winner: 2,
    score: '1:2',
    totalPool: 75000,
    poolTeam1: 40000,
    poolTeam2: 25000,
    poolDraw: 10000,
    myBet: { choice: 2, amount: 1000, claimed: false },
    simulationData: {
      bbcWebText: `BBC Sport - Champions League
Tuesday 10 March 2026
Allianz Arena, Munich
Bayern Munich 1 - 2 PSG
Match Status: Full Time. PSG advances to the quarter-finals.`,
      expectedScore: '1:2',
      expectedWinner: 2
    }
  }
];

export const t = {
  appTitle: 'GenLayer AI Prediction Market',
  appSubtitle: 'Decentralized Prediction Markets powered by AI Validators & the Equivalence Principle',
  navMarkets: 'Markets',
  navResults: 'Results',
  navFaucet: 'Daily GEN',
  navCreate: 'Create Market',
  navStudio: 'Contract Studio',
  navMyBets: 'My Bets & Wallet',
  // Daily faucet
  faucetTitle: 'Daily GEN Faucet',
  faucetSubtitle: 'Claim free GEN every day to place bets. Keep your streak for bigger rewards!',
  faucetClaim: 'Claim Daily GEN',
  faucetClaimed: 'Claimed Today ✓',
  faucetClaimedDesc: 'Come back tomorrow to continue your streak!',
  faucetNextReward: 'Next Reward',
  faucetCurrentStreak: 'Current Streak',
  faucetTotalClaimed: 'Total Claimed',
  faucetDays: 'days',
  faucetDay: 'day',
  faucetStreakInfo: 'Consecutive Days Bonus',
  faucetStreakDesc: 'Each consecutive day adds +25 GEN (up to day 7). Miss a day and the streak resets!',
  faucetMilestones: 'Streak Milestones',
  faucetMilestoneHit: '🎉 Milestone bonus',
  faucetHistory: 'Claim History',
  faucetNoHistory: 'No claims yet. Start your streak today!',
  faucetSuccess: 'You received',
  faucetWeekProgress: '7-Day Streak Progress',
  faucetClaimedDay: 'Claimed',
  faucetMissedDay: 'Missed',
  faucetTodayDay: 'Today',
  faucetUpcomingDay: 'Soon',
  // Results page
  resultsTitle: 'Match Results Finder',
  resultsSubtitle: 'Search past match results by date and league',
  searchByDate: 'By Date',
  searchByLeague: 'By League (recent)',
  selectDate: 'Select date',
  selectLeague: 'Select league',
  searchBtn: 'Search Results',
  searching: 'Searching matches...',
  noResults: 'No matches found for the selected criteria.',
  noResultsHint: 'Tip: this league may not have a match on this date. Try "By League" mode to see all tournament matches, or pick a date within the competition window.',
  quickDates: 'Quick dates',
  fullTime: 'FT',
  notStarted: 'Upcoming',
  resultsFound: 'results found',
  createMarketFromResult: 'Create Market',
  betNow: 'Bet',
  walletConnect: 'Connect Wallet',
  walletConnected: 'Connected',
  installMetamask: 'Install MetaMask',
  wrongNetwork: 'Wrong Network',
  switchNetwork: 'Switch to GenLayer',
  disconnect: 'Disconnect',
  onchainBalance: 'On-chain GEN Balance',
  txPending: 'Transaction pending in wallet...',
  txConfirmed: 'Bet transaction submitted on-chain!',
  txRejected: 'Transaction rejected or failed.',
  walletRequired: 'Please connect your wallet to place a bet.',
  networkRequired: 'Please switch to GenLayer Testnet Chain.',
  viewOnExplorer: 'View on Explorer',
  estimatedFee: 'Est. Network Fee',
  liveData: 'Live Data',
  worldCupTitle: 'FIFA World Cup 2026',
  worldCupSubtitle: 'The biggest stage in football — bet on the tournament now',
  worldCupTag: 'LIVE NOW',
  worldCupToday: "Today's Matches",
  worldCupFinished: 'Played',
  worldCupUpcoming: 'Upcoming',
  worldCupNoToday: 'No World Cup matches today — showing latest fixtures',
  viewAllMatches: 'View all matches below',
  loadingMatches: 'Loading real-time matches...',
  refreshData: 'Refresh',
  dataSource: 'Live fixtures via TheSportsDB',
  loadError: 'Could not load live data. Showing demo markets.',
  allRegions: 'All Regions',
  upcomingMatches: 'Upcoming & Recent Matches',
  matchesCount: 'matches',
  confirmBetTitle: 'Confirm On-chain Bet',
  confirmBetDesc: 'Review the transaction details. This will be signed in your wallet and broadcast to GenLayer Testnet.',
  betStakeRow: 'Bet Stake',
  gasLimitRow: 'Gas Limit',
  gasPriceRow: 'Gas Price',
  networkFeeRow: 'Network Fee',
  totalRow: 'Total (Stake + Fee)',
  cancelBtn: 'Cancel',
  signSendBtn: 'Sign & Send',
  txAwaitingSig: 'Awaiting signature in wallet...',
  txBroadcasting: 'Broadcasting transaction...',
  calculatingFee: 'Calculating network fee...',
  balance: 'Balance',
  allLeagues: 'All Leagues',
  searchPlaceholder: 'Search teams, leagues...',
  filterAll: 'All Markets',
  filterActive: 'Active Bets',
  filterResolved: 'Resolved',
  activeTag: 'Betting Open',
  resolvedTag: 'Resolved',
  unresolvedTag: 'Not Completed',
  poolTotal: 'Total Pool',
  odds: 'Estimated Payout Ratio',
  stakeTitle: 'Place Your Bet',
  btnPlaceBet: 'Confirm Bet',
  btnResolve: 'Trigger AI Resolve',
  team1: 'Team 1',
  team2: 'Team 2',
  draw: 'Draw',
  selectWinner: 'Select predicted outcome:',
  enterAmount: 'Enter amount ($GEN):',
  stakeSuccess: 'Bet placed successfully!',
  insufficientFunds: 'Insufficient funds!',
  resolveSimulationTitle: 'GenLayer AI Consensus Simulation (Nondeterministic Web & LLM)',
  validatorStatusInit: 'Initializing Validator Nodes...',
  validatorStatusFetch: 'Rendering BBC Sport webpage...',
  validatorStatusPrompt: 'Executing LLM Prompt to extract match score...',
  validatorStatusConsensus: 'Matching results (gl.eq_principle.strict_eq)...',
  validatorStatusComplete: 'Consensus Achieved! Contract state updated.',
  nodeAlpha: 'AI Validator Alpha (UK)',
  nodeBeta: 'AI Validator Beta (Germany)',
  nodeGamma: 'AI Validator Gamma (Singapore)',
  stepInit: '1. Init Request',
  stepFetch: '2. gl.nondet.web.render()',
  stepPrompt: '3. gl.nondet.exec_prompt()',
  stepConsensus: '4. Strict_eq Check',
  stepComplete: '5. Contract Finalized',
  rawBbcData: 'Scraped BBC web data:',
  llmJsonOutput: 'LLM JSON Output:',
  strictEqMatch: '100% Consensus (Strict Equality)',
  strictEqFailed: 'Consensus Failed / Match not started yet',
  unresolvedExplain: 'According to BBC data, the match says "Kick off [time]" or is not finished. Contract remains in unresolved state.',
  closeModal: 'Close Simulation',
  createTitle: 'Deploy New Prediction Market Contract',
  createSubtitle: 'Deploy a py-genlayer PredictionMarket contract to the GenLayer testnet.',
  formTeam1: 'Team 1 Name (e.g. Real Madrid)',
  formTeam2: 'Team 2 Name (e.g. Manchester City)',
  formDate: 'Game Date (YYYY-MM-DD)',
  formLeague: 'League Name (e.g. Champions League)',
  formInitStake: 'Initial liquidity $GEN stake',
  btnDeploy: '🚀 Deploy Smart Contract',
  deploySuccess: 'GenLayer Contract deployed successfully!',
  studioTitle: 'GenLayer Smart Contract Source Code (Python)',
  studioDescription: 'GenLayer enables writing Smart Contracts in Python, integrating nondeterministic AI execution and reaching on-chain consensus via the Equivalence Principle.',
  codeExplanationTitle: 'How GenLayer AI Contracts Work:',
  exp1Title: '1. Nondeterministic Web Render (gl.nondet.web.render)',
  exp1Desc: 'Allows the smart contract to fetch real-world webpage content (here, BBC Sport football fixtures) without needing complex third-party oracle networks.',
  exp2Title: '2. LLM Execution (gl.nondet.exec_prompt)',
  exp2Desc: 'Sends the HTML/text content along with a strict prompt instructing an LLM to parse the score and determine the winning team, returning pure JSON.',
  exp3Title: '3. Equivalence Principle (gl.eq_principle.strict_eq)',
  exp3Desc: 'A network of independent AI Validators run get_match_result(). If all nodes return the exact same JSON (strict_eq), the contract state is updated on the blockchain.',
  betsTitle: 'My Bets & Wallet Management',
  totalBalance: 'Current Balance ($GEN)',
  winningsAvailable: 'Claimable Winnings',
  noBets: 'You have not placed any bets yet.',
  betOn: 'Staked on:',
  stakeAmount: 'Amount:',
  statusClaimable: '🎉 Claimable Reward',
  statusClaimed: '✅ Reward Claimed',
  statusWaiting: '⏳ Waiting for match resolution',
  statusLost: '❌ Prediction incorrect',
  btnClaim: 'Claim Winnings',
  claimSuccess: 'Winnings claimed successfully!',
  txHistory: 'GenLayer Transaction History',
  txHash: 'Tx Hash',
  winningsCalc: 'Calculated based on share proportion in the winning pool.',
};
