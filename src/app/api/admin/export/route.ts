import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

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
    const format = searchParams.get("format") || "json"; // json, csv
    const chainType = searchParams.get("chain");
    const limit = parseInt(searchParams.get("limit") || "1000");

    await connectDB();

    // 构建查询
    const query: any = {};
    if (chainType && ["eth", "btc", "trx"].includes(chainType)) {
      query.chainType = chainType;
    }

    const data = await SearchHistory.find(query)
      .sort({ searchCount: -1 })
      .limit(limit)
      .select("-__v")
      .lean();

    if (format === "csv") {
      // 生成 CSV
      const headers = [
        "地址",
        "链类型",
        "搜索次数",
        "最后搜索时间",
        "创建时间",
        "是否收藏",
        "标签",
        "备注",
        "最后余额",
        "最后余额(USD)",
      ];

      const rows = data.map((item: any) => [
        item.address,
        item.chainType,
        item.searchCount,
        new Date(item.lastSearchAt).toISOString(),
        new Date(item.createdAt).toISOString(),
        item.isFavorite ? "是" : "否",
        (item.tags || []).join(";"),
        item.note || "",
        item.lastBalance || "0",
        item.lastBalanceUSD || 0,
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="search-history-${Date.now()}.csv"`,
        },
      });
    }

    // 默认返回 JSON
    return NextResponse.json({
      total: data.length,
      data,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("导出数据失败:", error);
    return NextResponse.json(
      { error: "导出数据失败" },
      { status: 500 }
    );
  }
}
