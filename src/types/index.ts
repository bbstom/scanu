// 区块链类型
export type ChainType = "eth" | "btc" | "trx";

// 以太坊相关类型
export interface EthBalance {
  address: string;
  balance: string;
  balanceUSD: number;
  tokens: EthToken[];
}

export interface EthToken {
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  price?: number;
  valueUSD?: number;
}

export interface EthTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  status: string;
}

// 比特币相关类型
export interface BtcBalance {
  address: string;
  balance: number;
  balanceUSD: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  unconfirmedBalance?: number;
  unconfirmedTxCount?: number;
}

export interface BtcTransaction {
  hash: string;
  time: number;
  inputs: BtcInput[];
  outputs: BtcOutput[];
  fee: number;
  confirmations: number;
}

export interface BtcInput {
  address: string;
  value: number;
}

export interface BtcOutput {
  address: string;
  value: number;
}

// 波场相关类型
export interface TrxBalance {
  address: string;
  balance: number;
  balanceUSD: number;
  bandwidth: number;
  energy: number;
  tokens: TrxToken[];
}

export interface TrxToken {
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  price?: number;
  valueUSD?: number;
  tokenType?: string; // trc10 或 trc20
  tokenLogo?: string; // 代币图标 URL
}

export interface TrxTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: string;
  result: string;
  fee?: number;
  tokenSymbol?: string; // 代币符号（如 USDT）
  tokenName?: string; // 代币名称
  tokenType?: string; // 代币类型（trc20）
  contractAddress?: string; // 合约地址
}

// 价格数据
export interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
