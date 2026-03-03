import axios from "axios";
import { BtcBalance, BtcTransaction } from "@/types";
import { getCachedDataWithFallback } from "@/lib/redis";
import { callApiWithFallback, ApiPlatform } from "@/lib/apiConfig";

export async function getBtcBalance(address: string): Promise<BtcBalance> {
  const cacheKey = `btc:balance:${address}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      const data = await callApiWithFallback("BTC", async (platform: ApiPlatform) => {
        if (platform.name === "Blockchain.info" || platform.url.includes("blockchain.info")) {
          return await getBalanceFromBlockchainInfo(address, platform);
        } else if (platform.name === "Blockchair" || platform.url.includes("blockchair")) {
          return await getBalanceFromBlockchair(address, platform);
        } else if (platform.name === "Blockcypher" || platform.url.includes("blockcypher")) {
          return await getBalanceFromBlockcypher(address, platform);
        } else {
          return await getBalanceFromBlockchainInfo(address, platform);
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

async function getBalanceFromBlockchainInfo(address: string, platform: ApiPlatform) {
  const res = await axios.get(`${platform.url}/rawaddr/${address}`, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });
  
  return {
    balance: res.data.final_balance / 1e8,
    totalReceived: res.data.total_received / 1e8,
    totalSent: res.data.total_sent / 1e8,
    txCount: res.data.n_tx,
    unconfirmedBalance: (res.data.unconfirmed_balance || 0) / 1e8,
    unconfirmedTxCount: res.data.unconfirmed_n_tx || 0,
  };
}

async function getBalanceFromBlockchair(address: string, platform: ApiPlatform) {
  const url = `${platform.url}/dashboards/address/${address}`;
  const res = await axios.get(url, {
    timeout: 10000,
  });
  
  const data = res.data.data[address];
  return {
    balance: data.address.balance / 1e8,
    totalReceived: data.address.received / 1e8,
    totalSent: data.address.spent / 1e8,
    txCount: data.address.transaction_count,
    unconfirmedBalance: (data.address.unconfirmed_balance || 0) / 1e8,
    unconfirmedTxCount: data.address.unconfirmed_transaction_count || 0,
  };
}

async function getBalanceFromBlockcypher(address: string, platform: ApiPlatform) {
  const url = `${platform.url}/addrs/${address}/balance`;
  const res = await axios.get(url, {
    timeout: 10000,
  });
  
  return {
    balance: res.data.final_balance / 1e8,
    totalReceived: res.data.total_received / 1e8,
    totalSent: res.data.total_sent / 1e8,
    txCount: res.data.n_tx,
    unconfirmedBalance: (res.data.unconfirmed_balance || 0) / 1e8,
    unconfirmedTxCount: res.data.unconfirmed_n_tx || 0,
  };
}

export async function getBtcTransactions(address: string, limit: number = 20): Promise<BtcTransaction[]> {
  const cacheKey = `btc:transactions:${address}:${limit}`;
  
  return getCachedDataWithFallback(
    cacheKey,
    async () => {
      return await callApiWithFallback("BTC", async (platform: ApiPlatform) => {
        if (platform.name === "Blockchain.info" || platform.url.includes("blockchain.info")) {
          return await getTransactionsFromBlockchainInfo(address, platform, limit);
        } else if (platform.name === "Blockchair" || platform.url.includes("blockchair")) {
          return await getTransactionsFromBlockchair(address, platform, limit);
        } else if (platform.name === "Blockcypher" || platform.url.includes("blockcypher")) {
          return await getTransactionsFromBlockcypher(address, platform, limit);
        } else {
          return await getTransactionsFromBlockchainInfo(address, platform, limit);
        }
      });
    },
    120
  );
}

async function getTransactionsFromBlockchainInfo(address: string, platform: ApiPlatform, limit: number): Promise<BtcTransaction[]> {
  try {
    const res = await axios.get(`${platform.url}/rawaddr/${address}?limit=${limit}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    // 获取最新区块高度（从第一个已确认交易获取）
    let latestBlockHeight = 0;
    for (const tx of res.data.txs || []) {
      if (tx.block_height && tx.block_height > latestBlockHeight) {
        latestBlockHeight = tx.block_height;
      }
    }
    
    return (res.data.txs || []).map((tx: any) => {
    // 计算确认数
    const confirmations = tx.block_height && latestBlockHeight
      ? latestBlockHeight - tx.block_height + 1 
      : 0;
    
    // 处理输入
    const inputs = (tx.inputs || []).map((input: any) => ({
      address: input.prev_out?.addr || "Coinbase",
      value: (input.prev_out?.value || 0) / 1e8,
    }));
    
    // 处理输出
    const outputs = (tx.out || []).map((output: any) => ({
      address: output.addr || "Unknown",
      value: (output.value || 0) / 1e8,
    }));
    
    // 计算手续费：输入总额 - 输出总额
    const totalInput = inputs.reduce((sum: number, input: any) => sum + input.value, 0);
    const totalOutput = outputs.reduce((sum: number, output: any) => sum + output.value, 0);
    const fee = Math.max(0, totalInput - totalOutput);
    
    return {
      hash: tx.hash,
      time: tx.time,
      inputs,
      outputs,
      fee,
      confirmations,
    };
  });
  } catch (error) {
    console.error('BTC API Error:', error);
    throw error;
  }
}

async function getTransactionsFromBlockchair(address: string, platform: ApiPlatform, limit: number): Promise<BtcTransaction[]> {
  const url = `${platform.url}/dashboards/address/${address}`;
  const res = await axios.get(url, {
    params: { limit },
    timeout: 10000,
  });
  
  const txs = res.data.data[address].transactions || [];
  return txs.slice(0, limit).map((hash: string) => ({
    hash,
    time: 0,
    inputs: [],
    outputs: [],
    fee: 0,
    confirmations: 0,
  }));
}

async function getTransactionsFromBlockcypher(address: string, platform: ApiPlatform, limit: number): Promise<BtcTransaction[]> {
  const url = `${platform.url}/addrs/${address}/full`;
  const res = await axios.get(url, {
    params: { limit },
    timeout: 10000,
  });
  
  const txs = res.data.txs || [];
  
  // 获取最新区块高度
  let latestBlockHeight = res.data.txs?.[0]?.block_height || 0;
  
  return txs.slice(0, limit).map((tx: any) => {
    // 计算确认数
    const confirmations = tx.block_height && latestBlockHeight
      ? latestBlockHeight - tx.block_height + 1
      : tx.confirmations || 0;
    
    // 处理输入
    const inputs = (tx.inputs || []).map((input: any) => ({
      address: input.addresses?.[0] || input.prev_out?.addresses?.[0] || "Coinbase",
      value: (input.output_value || 0) / 1e8,
    }));
    
    // 处理输出
    const outputs = (tx.outputs || []).map((output: any) => ({
      address: output.addresses?.[0] || "Unknown",
      value: (output.value || 0) / 1e8,
    }));
    
    // 计算手续费
    const totalInput = inputs.reduce((sum: number, input: any) => sum + input.value, 0);
    const totalOutput = outputs.reduce((sum: number, output: any) => sum + output.value, 0);
    const fee = tx.fees ? tx.fees / 1e8 : Math.max(0, totalInput - totalOutput);
    
    return {
      hash: tx.hash,
      time: new Date(tx.confirmed || tx.received).getTime() / 1000,
      inputs,
      outputs,
      fee,
      confirmations,
    };
  });
}
