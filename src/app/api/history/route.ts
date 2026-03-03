import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

// 获取搜索历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "recent"; // recent, popular, favorites
    const chainType = searchParams.get("chain"); // eth, btc, trx
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    let query: any = {};
    let sort: any = {};

    // 根据类型构建查询
    switch (type) {
      case "popular":
        sort = { searchCount: -1 };
        break;
      case "favorites":
        query.isFavorite = true;
        sort = { lastSearchAt: -1 };
        break;
      case "recent":
      default:
        sort = { lastSearchAt: -1 };
        break;
    }

    // 按链类型筛选
    if (chainType && ["eth", "btc", "trx"].includes(chainType)) {
      query.chainType = chainType;
    }

    const histories = await SearchHistory.find(query)
      .sort(sort)
      .limit(limit)
      .select("address chainType searchCount lastSearchAt isFavorite tags note lastBalance lastBalanceUSD");

    return NextResponse.json({ histories });
  } catch (error) {
    console.error("获取搜索历史失败:", error);
    return NextResponse.json(
      { error: "获取搜索历史失败" },
      { status: 500 }
    );
  }
}

// 更新搜索历史（添加标签、备注、收藏等）
export async function PATCH(request: NextRequest) {
  try {
    const { address, chainType, updates } = await request.json();

    if (!address || !chainType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    await connectDB();

    const allowedUpdates = ["tags", "note", "isFavorite"];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    const history = await SearchHistory.findOneAndUpdate(
      { address, chainType },
      { $set: updateData },
      { new: true }
    );

    if (!history) {
      return NextResponse.json(
        { error: "未找到搜索记录" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("更新搜索历史失败:", error);
    return NextResponse.json(
      { error: "更新搜索历史失败" },
      { status: 500 }
    );
  }
}

// 删除搜索历史
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const chainType = searchParams.get("chain");

    if (!address || !chainType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    await connectDB();

    await SearchHistory.findOneAndDelete({ address, chainType });

    return NextResponse.json({
      success: true,
      message: "搜索历史已删除",
    });
  } catch (error) {
    console.error("删除搜索历史失败:", error);
    return NextResponse.json(
      { error: "删除搜索历史失败" },
      { status: 500 }
    );
  }
}
