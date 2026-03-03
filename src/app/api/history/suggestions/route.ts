import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const chainType = searchParams.get("chain");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectDB();

    // 构建查询条件
    const filter: any = {
      address: { $regex: query, $options: "i" }, // 不区分大小写
    };

    if (chainType && ["eth", "btc", "trx"].includes(chainType)) {
      filter.chainType = chainType;
    }

    // 查询匹配的地址，按搜索次数排序
    const suggestions = await SearchHistory.find(filter)
      .sort({ searchCount: -1, lastSearchAt: -1 })
      .limit(limit)
      .select("address chainType searchCount lastSearchAt tags");

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("获取搜索建议失败:", error);
    return NextResponse.json(
      { error: "获取搜索建议失败" },
      { status: 500 }
    );
  }
}
