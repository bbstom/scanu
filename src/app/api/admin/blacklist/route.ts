import { NextRequest, NextResponse } from "next/server";
import { getCachedData } from "@/lib/redis";

// TODO: Implement these functions in redis.ts
async function addToBlacklist(ip: string, duration: number) {
  console.log(`TODO: Add ${ip} to blacklist for ${duration} seconds`);
}

async function removeFromBlacklist(ip: string) {
  console.log(`TODO: Remove ${ip} from blacklist`);
}

// 验证 token
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return Boolean(token && token.length > 0);
}

// 获取黑名单
export async function GET(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const blacklist = (await getCachedData<string[]>("ratelimit:blacklist")) || [];
    return NextResponse.json({ blacklist });
  } catch (error) {
    console.error("获取黑名单失败:", error);
    return NextResponse.json(
      { error: "获取黑名单失败" },
      { status: 500 }
    );
  }
}

// 添加到黑名单
export async function POST(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const { ip, duration = 3600 } = await request.json();

    if (!ip) {
      return NextResponse.json(
        { error: "缺少 IP 地址" },
        { status: 400 }
      );
    }

    await addToBlacklist(ip, duration);

    return NextResponse.json({
      success: true,
      message: `IP ${ip} 已加入黑名单`,
    });
  } catch (error) {
    console.error("添加黑名单失败:", error);
    return NextResponse.json(
      { error: "添加黑名单失败" },
      { status: 500 }
    );
  }
}

// 从黑名单移除
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    if (!ip) {
      return NextResponse.json(
        { error: "缺少 IP 地址" },
        { status: 400 }
      );
    }

    await removeFromBlacklist(ip);

    return NextResponse.json({
      success: true,
      message: `IP ${ip} 已从黑名单移除`,
    });
  } catch (error) {
    console.error("移除黑名单失败:", error);
    return NextResponse.json(
      { error: "移除黑名单失败" },
      { status: 500 }
    );
  }
}
