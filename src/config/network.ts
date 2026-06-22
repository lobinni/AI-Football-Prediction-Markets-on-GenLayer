// GenLayer Testnet Chain configuration (EVM compatible)

export const GENLAYER_CHAIN_ID = 4221;
export const GENLAYER_CHAIN_ID_HEX = '0x107d'; // 4221 in hex

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: 'GenLayer Testnet Chain',
  nativeCurrency: {
    name: 'GenLayer',
    symbol: 'GEN',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet-chain.genlayer.com'],
  blockExplorerUrls: ['https://explorer.testnet-chain.genlayer.com'],
};

// Where bets are sent (demo treasury / market escrow address).
// In a real deployment this would be the deployed PredictionMarket contract address.
export const MARKET_TREASURY_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const explorerTxUrl = (txHash: string) =>
  `${GENLAYER_NETWORK.blockExplorerUrls[0]}/tx/${txHash}`;

export const explorerAddressUrl = (address: string) =>
  `${GENLAYER_NETWORK.blockExplorerUrls[0]}/address/${address}`;

export const shortenAddress = (address: string) =>
  address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
