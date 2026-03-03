import axios from "axios";
import { EthBalance, EthTransaction, EthToken } from "@/types";
import { getCachedDataWithFallback } from "@/lib/redis";
import { callApiWithFallback, ApiPlatform } from "@/lib/apiConfig";

export async function getEthBalance(address: string): Promise<EthBalance> {
  const cacheKey = `eth:balance:${address}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      const balance = await callApiWithFallback("ETH", async (platform: ApiPlatform) => {
        if (platform.name === "Etherscan" || platform.url.includes("etherscan")) {
          return await getBalanceFromEtherscan(address, platform);
        } else if (platform.name === "Ethplorer" || platform.url.includes("ethplorer")) {
          return await getBalanceFromEthplorer(address, platform);
        } else if (platform.name === "Blockscout" || platform.url.includes("blockscout")) {
          return await getBalanceFromBlockscout(address, platform);
        } else {
          return await getBalanceFromEtherscan(address, platform);
        }
      });

      return {
        address,
        balance,
        balanceUSD: 0,
        tokens: [],
      };
    },
    60
  );
}

async function getBalanceFromEtherscan(address: string, platform: ApiPlatform): Promise<string> {
  const params: any = {
    module: "account",
    action: "balance",
    address,
    tag: "latest",
  };
  
  if (platform.apiKey) {
    params.apikey = platform.apiKey;
  }

  const res = await axios.get(platform.url, { params, timeout: 10000 });

  if (res.data.status === "0") {
    throw new Error(res.data.message || "API 返回错误");
  }

  return (parseInt(res.data.result) / 1e18).toFixed(6);
}

async function getBalanceFromEthplorer(address: string, platform: ApiPlatform): Promise<string> {
  const apiKey = platform.apiKey || "freekey";
  const res = await axios.get(`${platform.url}/getAddressInfo/${address}`, {
    params: { apiKey },
    timeout: 10000,
  });

  return res.data.ETH.balance.toFixed(6);
}

async function getBalanceFromBlockscout(address: string, platform: ApiPlatform): Promise<string> {
  const res = await axios.get(platform.url, {
    params: {
      module: "account",
      action: "balance",
      address,
    },
    timeout: 10000,
  });

  if (res.data.status === "0") {
    throw new Error(res.data.message || "API 返回错误");
  }

  return (parseInt(res.data.result) / 1e18).toFixed(6);
}

export async function getEthTransactions(address: string, page: number = 1, limit: number = 20): Promise<EthTransaction[]> {
  const cacheKey = `eth:transactions:${address}:${page}:${limit}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      return await callApiWithFallback("ETH", async (platform: ApiPlatform) => {
        if (platform.name === "Etherscan" || platform.url.includes("etherscan")) {
          return await getTransactionsFromEtherscan(address, platform, page, limit);
        } else if (platform.name === "Blockscout" || platform.url.includes("blockscout")) {
          return await getTransactionsFromBlockscout(address, platform, page, limit);
        } else {
          return await getTransactionsFromEtherscan(address, platform, page, limit);
        }
      });
    },
    120
  );
}

async function getTransactionsFromEtherscan(address: string, platform: ApiPlatform, page: number = 1, limit: number = 20): Promise<EthTransaction[]> {
  const params: any = {
    module: "account",
    action: "txlist",
    address,
    startblock: 0,
    endblock: 99999999,
    page,
    offset: limit,
    sort: "desc",
  };
  
  if (platform.apiKey) {
    params.apikey = platform.apiKey;
  }

  const res = await axios.get(platform.url, { params, timeout: 15000 });

  if (res.data.status === "0" && res.data.message !== "No transactions found") {
    throw new Error(res.data.message || "API 返回错误");
  }

  const transactions = res.data.result || [];
  
  return transactions.map((tx: any) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: (parseInt(tx.value) / 1e18).toFixed(6),
    timestamp: parseInt(tx.timeStamp),
    blockNumber: parseInt(tx.blockNumber),
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    status: tx.isError === '0' ? 'success' : 'failed',
  }));
}

async function getTransactionsFromBlockscout(address: string, platform: ApiPlatform, page: number = 1, limit: number = 20): Promise<EthTransaction[]> {
  const res = await axios.get(platform.url, {
    params: {
      module: "account",
      action: "txlist",
      address,
      page,
      offset: limit,
      sort: "desc",
    },
    timeout: 15000,
  });

  if (res.data.status === "0" && res.data.message !== "No transactions found") {
    throw new Error(res.data.message || "API 返回错误");
  }

  const transactions = res.data.result || [];
  
  return transactions.map((tx: any) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: (parseInt(tx.value) / 1e18).toFixed(6),
    timestamp: parseInt(tx.timeStamp),
    blockNumber: parseInt(tx.blockNumber),
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    status: tx.isError === '0' ? 'success' : 'failed',
  }));
}

export async function getEthTokens(address: string): Promise<EthToken[]> {
  const cacheKey = `eth:tokens:${address}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      return await callApiWithFallback("ETH", async (platform: ApiPlatform) => {
        if (platform.name === "Etherscan" || platform.url.includes("etherscan")) {
          return await getTokensFromEtherscan(address, platform);
        } else if (platform.name === "Ethplorer" || platform.url.includes("ethplorer")) {
          return await getTokensFromEthplorer(address, platform);
        } else {
          return await getTokensFromEtherscan(address, platform);
        }
      });
    },
    120
  );
}

async function getTokensFromEtherscan(address: string, platform: ApiPlatform): Promise<EthToken[]> {
  const params: any = {
    module: "account",
    action: "tokentx",
    address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 100,
    sort: "desc",
  };
  
  if (platform.apiKey) {
    params.apikey = platform.apiKey;
  }

  const res = await axios.get(platform.url, { params, timeout: 15000 });

  if (res.data.status === "0" && res.data.message !== "No transactions found") {
    throw new Error(res.data.message || "API 返回错误");
  }

  const transactions = res.data.result || [];
  const tokenMap = new Map<string, EthToken>();

  transactions.forEach((tx: any) => {
    const contractAddress = tx.contractAddress.toLowerCase();
    if (!tokenMap.has(contractAddress)) {
      tokenMap.set(contractAddress, {
        contractAddress: tx.contractAddress,
        name: tx.tokenName,
        symbol: tx.tokenSymbol,
        decimals: parseInt(tx.tokenDecimal),
        balance: "0",
      });
    }
  });

  return Array.from(tokenMap.values());
}

async function getTokensFromEthplorer(address: string, platform: ApiPlatform): Promise<EthToken[]> {
  const apiKey = platform.apiKey || "freekey";
  const res = await axios.get(`${platform.url}/getAddressInfo/${address}`, {
    params: { apiKey },
    timeout: 15000,
  });

  const tokens = res.data.tokens || [];
  
  return tokens.map((token: any) => ({
    contractAddress: token.tokenInfo.address,
    name: token.tokenInfo.name,
    symbol: token.tokenInfo.symbol,
    decimals: parseInt(token.tokenInfo.decimals),
    balance: (token.balance / Math.pow(10, token.tokenInfo.decimals)).toFixed(6),
  }));
}
