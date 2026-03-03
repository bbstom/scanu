import { NextRequest, NextResponse } from "next/server";
import { createAdmin, hasAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 检查是否已有管理员
    const adminExists = await hasAdmin();
    if (adminExists) {
      return NextResponse.json(
        { error: "管理员已存在" },
        { status: 400 }
      );
    }

    const { username, password, setupKey } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 验证 setup 密钥（如果配置了的话）
    const requiredSetupKey = process.env.ADMIN_SETUP_KEY;
    if (requiredSetupKey && requiredSetupKey.trim() !== "") {
      if (!setupKey || setupKey !== requiredSetupKey) {
        return NextResponse.json(
          { error: "无效的初始化密钥" },
          { status: 403 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少需要6个字符" },
        { status: 400 }
      );
    }

    const success = await createAdmin(username, password);

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: "管理员创建成功" 
      });
    } else {
      return NextResponse.json(
        { error: "创建失败" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("创建管理员失败:", error);
    return NextResponse.json(
      { error: "创建失败" },
      { status: 500 }
    );
  }
}
