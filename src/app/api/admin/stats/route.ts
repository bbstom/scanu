import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";
import { getCachedDataWithFallback } from "@/lib/redis";

// 验证 token
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return Boolean(token && token.length > 0);
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // 24h, 7d, 30d, all

    const cacheKey = `stats:${period}`;

    const stats = await getCachedDataWithFallback(
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

        // 基础统计
        const totalSearches = await SearchHistory.aggregate([
          { $group: { _id: null, total: { $sum: "$searchCount" } } }
        ]);

        const uniqueAddresses = await SearchHistory.countDocuments();
        const recentSearches = await SearchHistory.countDocuments(timeFilter);
        const favoriteCount = await SearchHistory.countDocuments({ isFavorite: true });

        // 按链类型统计
        const chainStats = await SearchHistory.aggregate([
          {
            $group: {
              _id: "$chainType",
              totalSearches: { $sum: "$searchCount" },
              uniqueAddresses: { $sum: 1 },
              avgSearchCount: { $avg: "$searchCount" },
              totalBalanceUSD: { $sum: "$lastBalanceUSD" },
            },
          },
          { $sort: { totalSearches: -1 } }
        ]);

        // 热门地址（搜索次数最多）
        const topAddresses = await SearchHistory.find()
          .sort({ searchCount: -1 })
          .limit(10)
          .select("address chainType searchCount lastSearchAt lastBalance lastBalanceUSD tags note");

        // 最近搜索
        const recentAddresses = await SearchHistory.find()
          .sort({ lastSearchAt: -1 })
          .limit(10)
          .select("address chainType searchCount lastSearchAt lastBalance lastBalanceUSD");

        // 每日搜索趋势（最近 30 天）
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dailyTrend = await SearchHistory.aggregate([
          {
            $match: {
              lastSearchAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$lastSearchAt" }
              },
              searches: { $sum: 1 },
              uniqueAddresses: { $addToSet: "$address" }
            }
          },
          {
            $project: {
              date: "$_id",
              searches: 1,
              uniqueAddresses: { $size: "$uniqueAddresses" }
            }
          },
          { $sort: { date: 1 } }
        ]);

        // 标签统计
        const tagStats = await SearchHistory.aggregate([
          { $unwind: "$tags" },
          {
            $group: {
              _id: "$tags",
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]);

        // 搜索频率分布
        const searchFrequency = await SearchHistory.aggregate([
          {
            $bucket: {
              groupBy: "$searchCount",
              boundaries: [1, 2, 5, 10, 20, 50, 100, 1000],
              default: "1000+",
              output: {
                count: { $sum: 1 },
                addresses: { $push: "$address" }
              }
            }
          }
        ]);

        return {
          summary: {
            totalSearches: totalSearches[0]?.total || 0,
            uniqueAddresses,
            recentSearches,
            favoriteCount,
            period,
          },
          chainStats,
          topAddresses,
          recentAddresses,
          dailyTrend,
          tagStats,
          searchFrequency,
        };
      },
      300 // 缓存 5 分钟
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
