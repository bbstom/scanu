import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Advertisement from "@/models/Advertisement";

// 获取指定位置的广告（公开接口）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    await connectDB();

    const query: any = { enabled: true };
    if (position) {
      query.position = position;
    }

    const ads = await Advertisement.find(query).sort({ order: 1 }).lean();

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("获取广告失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
