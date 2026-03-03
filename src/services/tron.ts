import axios from "axios";
import { TrxBalance, TrxTransaction, TrxToken } from "@/types";
import { getCachedDataWithFallback } from "@/lib/redis";
import { callApiWithFallback, ApiPlatform } from "@/lib/apiConfig";

export async function getTrxBalance(address: string): Promise<TrxBalance> {
  const cacheKey = `trx:balance:${address}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      const data = await callApiWithFallback("TRX", async (platform: ApiPlatform) => {
        if (platform.name === "TronScan" || platform.url.includes("tronscan")) {
          return await getBalanceFromTronScan(address, platform);
        } else if (platform.name === "TronGrid" || platform.url.includes("trongrid")) {
          return await getBalanceFromTronGrid(address, platform);
        } else {
          return await getBalanceFromTronScan(address, platform);
        }
      });

      return {
        address,
        ...data,
        balanceUSD: 0,
      };
    },
    60
  );
}

async function getBalanceFromTronScan(address: string, platform: ApiPlatform) {
  const res = await axios.get(`${platform.url}/account`, {
    params: { address },
    timeout: 10000,
  });
  
  const tokens: TrxToken[] = [];
  if (res.data.tokens && Array.isArray(res.data.tokens)) {
    tokens.push(...res.data.tokens
      .filter((token: any) => token.tokenId !== '_')
      .map((token: any) => ({
        contractAddress: token.tokenId,
        name: token.tokenName,
        symbol: token.tokenAbbr,
        balance: token.balance,
        decimals: token.tokenDecimal || 6,
        tokenType: token.tokenType,
        tokenLogo: token.tokenLogo,
      })));
  }

  // TronScan 返回的余额单位是 sun (1 TRX = 1,000,000 sun)
  const balanceInTrx = (res.data.balance || 0) / 1e6;

  return {
    balance: balanceInTrx,
    bandwidth: res.data.bandwidth?.freeNetRemaining || 0,
    energy: res.data.accountResource?.energyRemaining || 0,
    tokens,
  };
}

async function getBalanceFromTronGrid(address: string, platform: ApiPlatform) {
  const headers: any = {};
  if (platform.apiKey) {
    headers["TRON-PRO-API-KEY"] = platform.apiKey;
  }

  const accountRes = await axios.get(`${platform.url}/v1/accounts/${address}`, {
    headers,
    timeout: 10000,
  });
  
  const accountData = accountRes.data.data[0] || {};
  
  const tokens: TrxToken[] = [];
  try {
    const tokensRes = await axios.get(`${platform.url}/v1/accounts/${address}/tokens`, {
      headers,
      timeout: 10000,
    });
    const tokensData = tokensRes.data.data || [];
    tokens.push(...tokensData.map((token: any) => ({
      contractAddress: token.token_id,
      name: token.token_name,
      symbol: token.token_abbr,
      balance: token.balance,
      decimals: token.token_decimal || 6,
    })));
  } catch (error) {
    console.warn("获取 TRC-20 代币失败:", error);
  }

  // TronGrid 返回的余额单位是 sun (1 TRX = 1,000,000 sun)
  const balanceInTrx = (accountData.balance || 0) / 1e6;

  return {
    balance: balanceInTrx,
    bandwidth: accountData.bandwidth?.freeNetRemaining || 0,
    energy: accountData.accountResource?.energyRemaining || 0,
    tokens,
  };
}

export async function getTrxTransactions(address: string, limit: number = 50): Promise<TrxTransaction[]> {
  const cacheKey = `trx:transactions:${address}:${limit}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      return await callApiWithFallback("TRX", async (platform: ApiPlatform) => {
        if (platform.name === "TronScan" || platform.url.includes("tronscan")) {
          return await getTransactionsFromTronScan(address, platform, limit);
        } else if (platform.name === "TronGrid" || platform.url.includes("trongrid")) {
          return await getTransactionsFromTronGrid(address, platform, limit);
        } else {
          return await getTransactionsFromTronScan(address, platform, limit);
        }
      });
    },
    120
  );
}

async function getTransactionsFromTronScan(address: string, platform: ApiPlatform, limit: number = 50): Promise<TrxTransaction[]> {
  // TRX 交易
  const trxRes = await axios.get(`${platform.url}/transaction`, {
    params: {
      sort: "-timestamp",
      count: true,
      limit: Math.floor(limit / 2), // 分配一半给 TRX 交易
      start: 0,
      address,
    },
    timeout: 15000,
  });

  const trxTransactions = (trxRes.data.data || [])
    .filter((tx: any) => tx.contractType === 1)
    .map((tx: any) => ({
      hash: tx.hash,
      from: tx.ownerAddress,
      to: tx.toAddress,
      value: (tx.amount / 1e6).toFixed(6),
      timestamp: tx.timestamp,
      type: "Transfer",
      result: tx.confirmed ? "SUCCESS" : "PENDING",
      tokenSymbol: "TRX",
      tokenName: "Tron",
      contractAddress: "",
    }));

  // TRC-20 代币交易（包括 USDT）
  const trc20Res = await axios.get(`${platform.url}/token_trc20/transfers`, {
    params: {
      relatedAddress: address,
      start: 0,
      limit: Math.floor(limit / 2), // 分配一半给 TRC-20 交易
      sort: "-timestamp",
    },
    timeout: 15000,
  });

  const trc20Transactions = (trc20Res.data.token_transfers || []).map((tx: any) => ({
    hash: tx.transaction_id,
    from: tx.from_address,
    to: tx.to_address,
    value: (tx.quant / Math.pow(10, tx.tokenInfo?.tokenDecimal || 6)).toFixed(6),
    timestamp: tx.block_ts,
    type: "Transfer",
    result: tx.finalResult || "SUCCESS",
    tokenSymbol: tx.tokenInfo?.tokenAbbr || "Unknown",
    tokenName: tx.tokenInfo?.tokenName || "Unknown Token",
    contractAddress: tx.tokenInfo?.tokenId || "",
    tokenType: "trc20",
  }));

  // 合并并按时间戳排序，然后限制总数量
  return [...trxTransactions, ...trc20Transactions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

async function getTransactionsFromTronGrid(address: string, platform: ApiPlatform, limit: number = 50): Promise<TrxTransaction[]> {
  const headers: any = {};
  if (platform.apiKey) {
    headers["TRON-PRO-API-KEY"] = platform.apiKey;
  }

  const res = await axios.get(`${platform.url}/v1/accounts/${address}/transactions`, {
    headers,
    params: {
      limit,
      order_by: "block_timestamp,desc",
    },
    timeout: 15000,
  });

  const transactions = res.data.data || [];
  
  return transactions.map((tx: any) => ({
    hash: tx.txID,
    from: tx.raw_data?.contract[0]?.parameter?.value?.owner_address || "",
    to: tx.raw_data?.contract[0]?.parameter?.value?.to_address || "",
    value: ((tx.raw_data?.contract[0]?.parameter?.value?.amount || 0) / 1e6).toFixed(6),
    timestamp: tx.block_timestamp,
    type: tx.raw_data?.contract[0]?.type || "Transfer",
    result: tx.ret && tx.ret[0]?.contractRet === "SUCCESS" ? "SUCCESS" : "FAILED",
    tokenSymbol: "TRX",
    tokenName: "Tron",
    contractAddress: "",
  }));
}

export async function getTrxTokens(address: string): Promise<TrxToken[]> {
  const cacheKey = `trx:tokens:${address}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      return await callApiWithFallback("TRX", async (platform: ApiPlatform) => {
        if (platform.name === "TronScan" || platform.url.includes("tronscan")) {
          return await getTokensFromTronScan(address, platform);
        } else if (platform.name === "TronGrid" || platform.url.includes("trongrid")) {
          return await getTokensFromTronGrid(address, platform);
        } else {
          return await getTokensFromTronScan(address, platform);
        }
      });
    },
    120
  );
}

async function getTokensFromTronScan(address: string, platform: ApiPlatform): Promise<TrxToken[]> {
  const res = await axios.get(`${platform.url}/account`, {
    params: { address },
    timeout: 10000,
  });
  
  if (!res.data.tokens || !Array.isArray(res.data.tokens)) {
    return [];
  }

  return res.data.tokens
    .filter((token: any) => token.tokenId !== '_')
    .map((token: any) => ({
      contractAddress: token.tokenId,
      name: token.tokenName,
      symbol: token.tokenAbbr,
      balance: token.balance,
      decimals: token.tokenDecimal || 6,
      tokenType: token.tokenType,
      tokenLogo: token.tokenLogo,
    }));
}

async function getTokensFromTronGrid(address: string, platform: ApiPlatform): Promise<TrxToken[]> {
  const headers: any = {};
  if (platform.apiKey) {
    headers["TRON-PRO-API-KEY"] = platform.apiKey;
  }

  const res = await axios.get(`${platform.url}/v1/accounts/${address}/tokens`, {
    headers,
    timeout: 10000,
  });
  
  const tokensData = res.data.data || [];
  return tokensData.map((token: any) => ({
    contractAddress: token.token_id,
    name: token.token_name,
    symbol: token.token_abbr,
    balance: token.balance,
    decimals: token.token_decimal,
  }));
}
