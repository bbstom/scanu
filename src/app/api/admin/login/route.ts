import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const isValid = await verifyAdmin(username, password);

    if (isValid) {
      // 生成简单的 token（生产环境应使用 JWT）
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: "登录成功" 
      });
    } else {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
