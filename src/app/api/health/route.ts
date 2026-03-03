import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getRedisClient } from "@/lib/redis";

export async function GET() {
  const health: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 检查 MongoDB
  try {
    await connectDB();
    health.services.mongodb = {
      status: "connected",
      message: "MongoDB 连接正常",
    };
  } catch (error: any) {
    health.status = "unhealthy";
    health.services.mongodb = {
      status: "disconnected",
      message: error.message,
    };
  }

  // 检查 Redis
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.ping();
      health.services.redis = {
        status: "connected",
        message: "Redis 连接正常",
      };
    } else {
      health.services.redis = {
        status: "disabled",
        message: "Redis 未启用",
      };
    }
  } catch (error: any) {
    health.services.redis = {
      status: "disconnected",
      message: error.message,
    };
  }

  // 检查内存使用
  const memoryUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
  };

  // 检查运行时间
  health.uptime = `${Math.floor(process.uptime())} 秒`;

  const statusCode = health.status === "healthy" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
