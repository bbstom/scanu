import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";
import { getCachedDataWithFallback } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainType = searchParams.get("chain");
    const period = searchParams.get("period") || "24h"; // 24h, 7d, 30d, all
    const limit = parseInt(searchParams.get("limit") || "10");

    const cacheKey = `trending:${chainType || "all"}:${period}:${limit}`;

    const trending = await getCachedDataWithFallback(
      cacheKey,
      async () => {
        await connectDB();

        // 计算时间范围
        let timeFilter: any = {};
        const now = new Date();

        switch (period) {
          case "24h":
            timeFilter = { lastSearchAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
            break;
          case "7d":
            timeFilter = { lastSearchAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
            break;
          case "30d":
            timeFilter = { lastSearchAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
            break;
          case "all":
          default:
            timeFilter = {};
            break;
        }

        // 构建查询条件
        const filter: any = { ...timeFilter };
        if (chainType && ["eth", "btc", "trx"].includes(chainType)) {
          filter.chainType = chainType;
        }

        // 查询热门地址
        const addresses = await SearchHistory.find(filter)
          .sort({ searchCount: -1, lastSearchAt: -1 })
          .limit(limit)
          .select("address chainType searchCount lastSearchAt lastBalance lastBalanceUSD tags");

        return addresses;
      },
      300 // 缓存 5 分钟
    );

    return NextResponse.json({ trending });
  } catch (error) {
    console.error("获取热门地址失败:", error);
    return NextResponse.json(
      { error: "获取热门地址失败" },
      { status: 500 }
    );
  }
}
