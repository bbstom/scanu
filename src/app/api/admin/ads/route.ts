import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Advertisement from "@/models/Advertisement";

// 验证 token
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return Boolean(token && token.length > 0);
}

// 获取所有广告
export async function GET(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    await connectDB();

    const ads = await Advertisement.find().sort({ position: 1, order: 1 });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("获取广告失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 创建广告
export async function POST(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();

    // 如果是图片类型且 content 为空，设置默认值
    if (data.type === 'image' && !data.content) {
      data.content = data.title || 'Advertisement';
    }

    await connectDB();

    const ad = await Advertisement.create(data);

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error("创建广告失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 更新广告
export async function PUT(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id, ...data } = await request.json();

    // 如果是图片类型且 content 为空，设置默认值
    if (data.type === 'image' && !data.content) {
      data.content = data.title || 'Advertisement';
    }

    await connectDB();

    const ad = await Advertisement.findByIdAndUpdate(id, data, { new: true });

    if (!ad) {
      return NextResponse.json({ error: "广告不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error("更新广告失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 删除广告
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少广告 ID" }, { status: 400 });
    }

    await connectDB();

    await Advertisement.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除广告失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
