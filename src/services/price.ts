import axios from "axios";
import { PriceData } from "@/types";
import { callApiWithFallback, ApiPlatform } from "@/lib/apiConfig";

export async function getPrices(ids: string[]): Promise<PriceData> {
  try {
    return await callApiWithFallback("PRICE", async (platform: ApiPlatform) => {
      if (platform.name === "CoinGecko" || platform.url.includes("coingecko")) {
        return await getPricesFromCoinGecko(ids, platform);
      } else {
        return await getPricesFromCoinGecko(ids, platform);
      }
    });
  } catch (error) {
    console.error("获取价格数据失败:", error);
    return {};
  }
}

async function getPricesFromCoinGecko(ids: string[], platform: ApiPlatform): Promise<PriceData> {
  const params: any = {
    ids: ids.join(","),
    vs_currencies: "usd",
    include_24hr_change: true,
  };

  if (platform.apiKey) {
    params.x_cg_pro_api_key = platform.apiKey;
  }

  const res = await axios.get(`${platform.url}/simple/price`, {
    params,
    timeout: 10000,
  });

  return res.data;
}

export async function getEthPrice(): Promise<number> {
  const prices = await getPrices(["ethereum"]);
  return prices.ethereum?.usd || 0;
}

export async function getBtcPrice(): Promise<number> {
  const prices = await getPrices(["bitcoin"]);
  return prices.bitcoin?.usd || 0;
}

export async function getTrxPrice(): Promise<number> {
  const prices = await getPrices(["tron"]);
  return prices.tron?.usd || 0;
}
