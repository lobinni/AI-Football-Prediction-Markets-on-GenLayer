import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  GENLAYER_NETWORK,
  GENLAYER_CHAIN_ID_HEX,
  MARKET_TREASURY_ADDRESS,
} from '../config/network';
import { PREDICTION_MARKET_ABI } from '../config/contract';

const isValidContract = (addr?: string) =>
  !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr) && addr !== ethers.ZeroAddress;

// Minimal EIP-1193 provider type
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type TxStatus = 'idle' | 'estimating' | 'awaiting_signature' | 'pending' | 'confirmed' | 'failed';

export interface BetFeeEstimate {
  gasLimit: string;
  gasPriceGwei: string;
  feeGen: string; // total fee in GEN
  totalGen: string; // stake + fee
}

export interface WalletState {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  balance: string; // formatted GEN balance
  txStatus: TxStatus;
}

export interface UseWalletResult extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  sendBet: (amountGen: number) => Promise<string>; // returns tx hash
  estimateBetFee: (amountGen: number) => Promise<string>; // simple fee in GEN
  estimateBetFeeDetailed: (amountGen: number) => Promise<BetFeeEstimate | null>;

  // --- Real smart-contract calls ---
  // Place a bet by calling placeBet(choice) payable on the deployed contract.
  placeBetOnContract: (contractAddress: string, choice: number, amountGen: number) => Promise<string>;
  // Trigger AI resolution by calling resolve().
  resolveOnContract: (contractAddress: string) => Promise<string>;
  // Claim winnings by calling claimWinnings().
  claimOnContract: (contractAddress: string) => Promise<string>;
  // Detailed fee estimate for a contract placeBet() call.
  estimateContractBetFee: (
    contractAddress: string,
    choice: number,
    amountGen: number
  ) => Promise<BetFeeEstimate | null>;
}

const TARGET_CHAIN_ID = parseInt(GENLAYER_CHAIN_ID_HEX, 16);

export function useWallet(): UseWalletResult {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const isInstalled = typeof window !== 'undefined' && !!window.ethereum;
  const isConnected = !!account;
  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;

  const getProvider = () => new ethers.BrowserProvider(window.ethereum as any);

  const refreshBalance = useCallback(async () => {
    if (!window.ethereum || !account) return;
    try {
      const provider = getProvider();
      const raw = await provider.getBalance(account);
      setBalance(parseFloat(ethers.formatEther(raw)).toFixed(4));
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  }, [account]);

  // Switch / add the GenLayer Testnet network
  const switchNetwork = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [GENLAYER_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add GenLayer network', addError);
          return false;
        }
      }
      console.error('Failed to switch network', switchError);
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts && accounts.length > 0) setAccount(accounts[0]);

      const currentChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      const numericChain = parseInt(currentChain, 16);
      setChainId(numericChain);

      if (numericChain !== TARGET_CHAIN_ID) await switchNetwork();
    } catch (err) {
      console.error('Wallet connection rejected', err);
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance('0');
    setTxStatus('idle');
  }, []);

  // Compute gas limit + gas price from the live network
  const computeFee = useCallback(
    async (amountGen: number) => {
      const provider = getProvider();
      const value = ethers.parseEther(amountGen.toString());

      let gasLimit: bigint;
      try {
        gasLimit = await provider.estimateGas({
          from: account ?? undefined,
          to: MARKET_TREASURY_ADDRESS,
          value,
        });
      } catch {
        gasLimit = 21000n;
      }

      const feeData = await provider.getFeeData();
      const maxFee = feeData.maxFeePerGas ?? undefined;
      const maxPriority = feeData.maxPriorityFeePerGas ?? undefined;
      const gasPrice = feeData.gasPrice ?? undefined;
      const effectivePrice = maxFee ?? gasPrice ?? 0n;

      return { provider, value, gasLimit, maxFee, maxPriority, gasPrice, effectivePrice };
    },
    [account]
  );

  // Simple fee estimate (GEN string) - used inline in the bet form
  const estimateBetFee = useCallback(
    async (amountGen: number): Promise<string> => {
      if (!window.ethereum || !account) return '0';
      try {
        const { gasLimit, effectivePrice } = await computeFee(amountGen);
        const feeWei = gasLimit * effectivePrice;
        return parseFloat(ethers.formatEther(feeWei)).toFixed(8);
      } catch (e) {
        console.warn('estimateBetFee failed', e);
        return '0';
      }
    },
    [account, computeFee]
  );

  // Detailed fee estimate for the confirm dialog
  const estimateBetFeeDetailed = useCallback(
    async (amountGen: number): Promise<BetFeeEstimate | null> => {
      if (!window.ethereum || !account) return null;
      try {
        const { gasLimit, effectivePrice, value } = await computeFee(amountGen);
        const feeWei = gasLimit * effectivePrice;
        return {
          gasLimit: gasLimit.toString(),
          gasPriceGwei: parseFloat(ethers.formatUnits(effectivePrice, 'gwei')).toFixed(4),
          feeGen: parseFloat(ethers.formatEther(feeWei)).toFixed(8),
          totalGen: parseFloat(ethers.formatEther(value + feeWei)).toFixed(6),
        };
      } catch (e) {
        console.warn('estimateBetFeeDetailed failed', e);
        return null;
      }
    },
    [account, computeFee]
  );

  // ============ REAL SMART CONTRACT CALLS ============

  const ensureReady = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet detected');
    if (!account) throw new Error('Wallet not connected');
    if (chainId !== TARGET_CHAIN_ID) {
      const ok = await switchNetwork();
      if (!ok) throw new Error('Please switch to GenLayer Testnet Chain');
    }
  }, [account, chainId, switchNetwork]);

  const getContract = useCallback(async (contractAddress: string) => {
    if (!isValidContract(contractAddress)) {
      throw new Error('Invalid contract address');
    }
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, signer);
  }, []);

  // placeBet(choice) payable  — sends amount as msg.value
  const placeBetOnContract = useCallback(
    async (contractAddress: string, choice: number, amountGen: number): Promise<string> => {
      await ensureReady();
      setTxStatus('awaiting_signature');
      try {
        const contract = await getContract(contractAddress);
        const value = ethers.parseEther(amountGen.toString());

        // Let ethers estimate gas; wallet will display GEN/gas fee on confirm
        const tx = await contract.placeBet(choice, { value });

        setTxStatus('pending');
        tx.wait()
          .then((receipt: any) => {
            setTxStatus(receipt && receipt.status === 1 ? 'confirmed' : 'failed');
            refreshBalance();
            setTimeout(() => setTxStatus('idle'), 4000);
          })
          .catch(() => {
            setTxStatus('failed');
            setTimeout(() => setTxStatus('idle'), 4000);
          });

        return tx.hash;
      } catch (err) {
        setTxStatus('failed');
        throw err;
      }
    },
    [ensureReady, getContract, refreshBalance]
  );

  // resolve() — triggers GenLayer AI consensus
  const resolveOnContract = useCallback(
    async (contractAddress: string): Promise<string> => {
      await ensureReady();
      setTxStatus('awaiting_signature');
      try {
        const contract = await getContract(contractAddress);
        const tx = await contract.resolve();
        setTxStatus('pending');
        tx.wait()
          .then((r: any) => {
            setTxStatus(r && r.status === 1 ? 'confirmed' : 'failed');
            setTimeout(() => setTxStatus('idle'), 4000);
          })
          .catch(() => setTxStatus('failed'));
        return tx.hash;
      } catch (err) {
        setTxStatus('failed');
        throw err;
      }
    },
    [ensureReady, getContract]
  );

  // claimWinnings()
  const claimOnContract = useCallback(
    async (contractAddress: string): Promise<string> => {
      await ensureReady();
      setTxStatus('awaiting_signature');
      try {
        const contract = await getContract(contractAddress);
        const tx = await contract.claimWinnings();
        setTxStatus('pending');
        tx.wait()
          .then((r: any) => {
            setTxStatus(r && r.status === 1 ? 'confirmed' : 'failed');
            refreshBalance();
            setTimeout(() => setTxStatus('idle'), 4000);
          })
          .catch(() => setTxStatus('failed'));
        return tx.hash;
      } catch (err) {
        setTxStatus('failed');
        throw err;
      }
    },
    [ensureReady, getContract, refreshBalance]
  );

  // Estimate fee for a placeBet() contract call
  const estimateContractBetFee = useCallback(
    async (contractAddress: string, choice: number, amountGen: number): Promise<BetFeeEstimate | null> => {
      if (!window.ethereum || !account || !isValidContract(contractAddress)) return null;
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, provider);
        const value = ethers.parseEther(amountGen.toString());

        let gasLimit: bigint;
        try {
          gasLimit = await contract.placeBet.estimateGas(choice, { value, from: account });
        } catch {
          gasLimit = 120000n; // typical payable call fallback
        }

        const feeData = await provider.getFeeData();
        const effectivePrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? 0n;
        const feeWei = gasLimit * effectivePrice;

        return {
          gasLimit: gasLimit.toString(),
          gasPriceGwei: parseFloat(ethers.formatUnits(effectivePrice, 'gwei')).toFixed(4),
          feeGen: parseFloat(ethers.formatEther(feeWei)).toFixed(8),
          totalGen: parseFloat(ethers.formatEther(value + feeWei)).toFixed(6),
        };
      } catch (e) {
        console.warn('estimateContractBetFee failed', e);
        return null;
      }
    },
    [account]
  );

  // Send a REAL on-chain bet transaction. MetaMask will show GEN/gas fee.
  const sendBet = useCallback(
    async (amountGen: number): Promise<string> => {
      if (!window.ethereum) throw new Error('No wallet detected');
      if (!account) throw new Error('Wallet not connected');
      if (chainId !== TARGET_CHAIN_ID) {
        const ok = await switchNetwork();
        if (!ok) throw new Error('Please switch to GenLayer Testnet Chain');
      }

      setTxStatus('estimating');
      const { provider, value, gasLimit, maxFee, maxPriority, gasPrice, effectivePrice } =
        await computeFee(amountGen);

      // Pre-check on-chain balance can cover stake + gas
      const onchain = await provider.getBalance(account);
      const totalNeeded = value + gasLimit * effectivePrice;
      if (onchain < totalNeeded) {
        setTxStatus('failed');
        throw new Error('insufficient funds for stake + gas');
      }

      // Build raw tx params for eth_sendTransaction (guarantees MetaMask fee UI)
      const txParams: Record<string, string> = {
        from: account,
        to: MARKET_TREASURY_ADDRESS,
        value: '0x' + value.toString(16),
        gas: '0x' + gasLimit.toString(16),
      };

      if (maxFee && maxPriority) {
        txParams.maxFeePerGas = '0x' + maxFee.toString(16);
        txParams.maxPriorityFeePerGas = '0x' + maxPriority.toString(16);
      } else if (gasPrice) {
        txParams.gasPrice = '0x' + gasPrice.toString(16);
      }

      setTxStatus('awaiting_signature');
      let txHash: string;
      try {
        txHash = (await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        })) as string;
      } catch (err) {
        setTxStatus('failed');
        throw err;
      }

      setTxStatus('pending');
      // Wait for confirmation in the background
      provider
        .waitForTransaction(txHash)
        .then((receipt) => {
          setTxStatus(receipt && receipt.status === 1 ? 'confirmed' : 'failed');
          refreshBalance();
          setTimeout(() => setTxStatus('idle'), 4000);
        })
        .catch(() => {
          setTxStatus('failed');
          setTimeout(() => setTxStatus('idle'), 4000);
        });

      return txHash;
    },
    [account, chainId, switchNetwork, computeFee, refreshBalance]
  );

  // Detect already-connected accounts on mount + listen to changes
  useEffect(() => {
    if (!window.ethereum) return;

    const init = async () => {
      try {
        const accounts = (await window.ethereum!.request({ method: 'eth_accounts' })) as string[];
        if (accounts && accounts.length > 0) setAccount(accounts[0]);
        const currentChain = (await window.ethereum!.request({ method: 'eth_chainId' })) as string;
        setChainId(parseInt(currentChain, 16));
      } catch (err) {
        console.error(err);
      }
    };
    init();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance('0');
      } else {
        setAccount(accounts[0]);
      }
    };
    const handleChainChanged = (newChainId: string) => setChainId(parseInt(newChainId, 16));

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    if (account && isCorrectNetwork) refreshBalance();
  }, [account, isCorrectNetwork, refreshBalance]);

  return {
    isInstalled,
    isConnected,
    isConnecting,
    account,
    chainId,
    isCorrectNetwork,
    balance,
    txStatus,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    sendBet,
    estimateBetFee,
    estimateBetFeeDetailed,
    placeBetOnContract,
    resolveOnContract,
    claimOnContract,
    estimateContractBetFee,
  };
}
