import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // 简单验证 token（生产环境应使用 JWT）
    if (token && token.length > 0) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { error: "无效的 token" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "验证失败" },
      { status: 500 }
    );
  }
}
