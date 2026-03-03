import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";
import { rateLimitMiddleware } from "@/lib/rateLimit";
import { getNumberSetting } from "@/lib/settings";

export async function POST(request: NextRequest) {
  // 从配置读取限流参数
  const maxRequests = await getNumberSetting("SEARCH_RATELIMIT_MAX", 20);
  
  // 应用限流
  const rateLimitResponse = await rateLimitMiddleware(request, {
    interval: 60,
    maxRequests,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { address, chainType, balance, balanceUSD } = await request.json();

    if (!address || !chainType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    await connectDB();

    // 更新或创建搜索记录
    const updateData: any = {
      $inc: { searchCount: 1 },
      $set: { lastSearchAt: new Date() },
    };

    // 如果提供了余额信息，更新余额
    if (balance !== undefined) {
      updateData.$set.lastBalance = balance;
    }
    if (balanceUSD !== undefined) {
      updateData.$set.lastBalanceUSD = balanceUSD;
    }

    // 设置首次搜索时间（仅在创建时）
    updateData.$setOnInsert = { firstSearchAt: new Date() };

    await SearchHistory.findOneAndUpdate(
      { address, chainType },
      updateData,
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("记录搜索历史失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
