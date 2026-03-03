import { getSetting } from "./settings";

export interface ApiPlatform {
  name: string;
  url: string;
  apiKey: string;
  enabled: boolean;
  priority: number;
}

/**
 * 获取指定链的 API 配置
 * @param chainType - 链类型: ETH, BTC, TRX, PRICE
 * @returns 按优先级排序的启用平台列表
 */
export async function getApiConfig(chainType: "ETH" | "BTC" | "TRX" | "PRICE"): Promise<ApiPlatform[]> {
  try {
    const configKey = `API_CONFIG_${chainType}`;
    const configValue = await getSetting(configKey, "");
    
    if (!configValue) {
      return getDefaultConfig(chainType);
    }

    const platforms: ApiPlatform[] = JSON.parse(configValue);
    
    // 过滤启用的平台并按优先级排序
    return platforms
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error(`获取 ${chainType} API 配置失败:`, error);
    return getDefaultConfig(chainType);
  }
}

/**
 * 获取默认配置
 */
function getDefaultConfig(chainType: "ETH" | "BTC" | "TRX" | "PRICE"): ApiPlatform[] {
  const defaults: Record<string, ApiPlatform[]> = {
    ETH: [
      { name: "Etherscan", url: "https://api.etherscan.io/api", apiKey: "", enabled: true, priority: 1 },
      { name: "Ethplorer", url: "https://api.ethplorer.io", apiKey: "", enabled: true, priority: 2 },
      { name: "Blockscout", url: "https://eth.blockscout.com/api", apiKey: "", enabled: true, priority: 3 },
    ],
    BTC: [
      { name: "Blockchain.info", url: "https://blockchain.info", apiKey: "", enabled: true, priority: 1 },
      { name: "Blockchair", url: "https://api.blockchair.com/bitcoin", apiKey: "", enabled: true, priority: 2 },
      { name: "Blockcypher", url: "https://api.blockcypher.com/v1/btc/main", apiKey: "", enabled: true, priority: 3 },
    ],
    TRX: [
      { name: "TronScan", url: "https://apilist.tronscan.org/api", apiKey: "", enabled: true, priority: 1 },
      { name: "TronGrid", url: "https://api.trongrid.io", apiKey: "", enabled: true, priority: 2 },
    ],
    PRICE: [
      { name: "CoinGecko", url: "https://api.coingecko.com/api/v3", apiKey: "", enabled: true, priority: 1 },
    ],
  };

  console.log(`使用默认配置: ${chainType}`, defaults[chainType]);
  return defaults[chainType] || [];
}

/**
 * 使用配置的平台依次尝试调用 API
 * @param chainType - 链类型
 * @param apiCall - API 调用函数，接收平台配置作为参数
 * @returns API 调用结果
 */
export async function callApiWithFallback<T>(
  chainType: "ETH" | "BTC" | "TRX" | "PRICE",
  apiCall: (platform: ApiPlatform) => Promise<T>
): Promise<T> {
  const platforms = await getApiConfig(chainType);

  console.log(`[callApiWithFallback] ${chainType} 可用平台数: ${platforms.length}`);
  platforms.forEach(p => {
    console.log(`  - ${p.name} (优先级 ${p.priority}, URL: ${p.url})`);
  });

  if (platforms.length === 0) {
    throw new Error(`没有可用的 ${chainType} API 平台`);
  }

  let lastError: Error | null = null;

  for (const platform of platforms) {
    try {
      console.log(`[${chainType}] 尝试使用 ${platform.name} (优先级 ${platform.priority})...`);
      const result = await apiCall(platform);
      console.log(`[${chainType}] ${platform.name} 调用成功`);
      return result;
    } catch (error) {
      console.error(`[${chainType}] ${platform.name} 调用失败:`, error);
      lastError = error as Error;
      // 继续尝试下一个平台
      continue;
    }
  }

  // 所有平台都失败了
  throw new Error(
    `所有 ${chainType} API 平台都失败了。最后错误: ${lastError?.message || "未知错误"}`
  );
}
