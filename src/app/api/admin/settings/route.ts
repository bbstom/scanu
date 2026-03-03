import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setSetting, clearSettingsCache } from "@/lib/settings";

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

    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("获取设置失败:", error);
    return NextResponse.json(
      { error: "获取设置失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const { settings } = await request.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: "无效的数据格式" },
        { status: 400 }
      );
    }

    // 保存所有设置
    for (const setting of settings) {
      await setSetting(setting.key, setting.value, setting.description);
    }

    // 清除缓存
    await clearSettingsCache();

    return NextResponse.json({ 
      success: true,
      message: "设置保存成功" 
    });
  } catch (error) {
    console.error("保存设置失败:", error);
    return NextResponse.json(
      { error: "保存设置失败" },
      { status: 500 }
    );
  }
}
