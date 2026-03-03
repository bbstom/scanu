import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, deleteCachedData } from "@/lib/redis";

// 验证 token
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return Boolean(token && token.length > 0);
}

// 获取缓存统计
export async function GET(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json({
        enabled: false,
        message: "Redis 未启用",
      });
    }

    // 获取所有缓存键
    const keys = await redis.keys("*");
    
    // 按前缀分组统计
    const stats: any = {
      total: keys.length,
      byPrefix: {},
    };

    for (const key of keys) {
      const prefix = key.split(":")[0];
      if (!stats.byPrefix[prefix]) {
        stats.byPrefix[prefix] = {
          count: 0,
          keys: [],
        };
      }
      stats.byPrefix[prefix].count++;
      stats.byPrefix[prefix].keys.push(key);
    }

    // 获取 Redis 内存信息
    try {
      const info = await redis.info("memory");
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      if (memoryMatch) {
        stats.memoryUsed = memoryMatch[1].trim();
      }
    } catch (error) {
      console.warn("获取 Redis 内存信息失败");
    }

    return NextResponse.json({
      enabled: true,
      stats,
    });
  } catch (error) {
    console.error("获取缓存统计失败:", error);
    return NextResponse.json(
      { error: "获取缓存统计失败" },
      { status: 500 }
    );
  }
}

// 清除缓存
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern") || "*"; // 缓存键模式
    const type = searchParams.get("type"); // 清除类型：key, prefix, all

    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: "Redis 未启用" },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (type === "all") {
      // 清除所有缓存
      await redis.flushAll();
      deletedCount = -1; // 表示全部清除
    } else if (type === "prefix") {
      // 清除指定前缀的缓存
      const keys = await redis.keys(`${pattern}*`);
      for (const key of keys) {
        await redis.del(key);
        deletedCount++;
      }
    } else {
      // 清除单个缓存键
      await deleteCachedData(pattern);
      deletedCount = 1;
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: deletedCount === -1 ? "已清除所有缓存" : `已清除 ${deletedCount} 个缓存`,
    });
  } catch (error) {
    console.error("清除缓存失败:", error);
    return NextResponse.json(
      { error: "清除缓存失败" },
      { status: 500 }
    );
  }
}
