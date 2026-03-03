import { NextRequest } from "next/server";
import { getCachedData, setCachedData } from "./redis";
import { getNumberSetting } from "./settings";

interface RateLimitConfig {
  interval: number; // 时间窗口（秒）
  maxRequests: number; // 最大请求数
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// 默认限流配置
const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60, // 1 分钟
  maxRequests: 30, // 30 次请求
};

/**
 * 获取限流配置（从数据库或使用默认值）
 */
async function getRateLimitConfig(config?: Partial<RateLimitConfig>): Promise<RateLimitConfig> {
  if (config?.interval && config?.maxRequests) {
    return config as RateLimitConfig;
  }

  const interval = await getNumberSetting("RATELIMIT_INTERVAL", DEFAULT_CONFIG.interval);
  const maxRequests = await getNumberSetting("RATELIMIT_MAX_REQUESTS", DEFAULT_CONFIG.maxRequests);

  return {
    interval: config?.interval || interval,
    maxRequests: config?.maxRequests || maxRequests,
  };
}

/**
 * 获取客户端标识符（IP 地址或其他唯一标识）
 */
function getClientIdentifier(request: NextRequest): string {
  // 优先使用真实 IP（通过代理时）
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  
  return ip;
}

/**
 * 检查是否超过限流
 */
export async function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const rateLimitConfig = await getRateLimitConfig(config);
  const { interval, maxRequests } = rateLimitConfig;
  const identifier = getClientIdentifier(request);
  const key = `ratelimit:${identifier}`;

  try {
    // 获取当前计数
    const data = await getCachedData<{ count: number; resetAt: number }>(key);
    const now = Date.now();

    if (!data || now > data.resetAt) {
      // 首次请求或时间窗口已过期，重置计数
      const resetAt = now + interval * 1000;
      await setCachedData(key, { count: 1, resetAt }, interval);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: Math.floor(resetAt / 1000),
      };
    }

    // 检查是否超过限制
    if (data.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.floor(data.resetAt / 1000),
      };
    }

    // 增加计数
    const newCount = data.count + 1;
    const ttl = Math.ceil((data.resetAt - now) / 1000);
    await setCachedData(key, { count: newCount, resetAt: data.resetAt }, ttl);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - newCount,
      reset: Math.floor(data.resetAt / 1000),
    };
  } catch (error) {
    console.error("限流检查失败:", error);
    // Redis 失败时，允许请求通过（降级策略）
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: Math.floor((Date.now() + interval * 1000) / 1000),
    };
  }
}

/**
 * 限流中间件（用于 API 路由）
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<Response | null> {
  const result = await checkRateLimit(request, config);

  // 添加限流响应头
  const headers = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (!result.success) {
    const retryAfter = result.reset - Math.floor(Date.now() / 1000);
    return new Response(
      JSON.stringify({
        error: "请求过于频繁，请稍后再试",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  return null; // 允许请求继续
}

/**
 * IP 黑名单检查
 */
const BLACKLIST_KEY = "ratelimit:blacklist";

export async function isBlacklisted(ip: string): Promise<boolean> {
  try {
    const blacklist = await getCachedData<string[]>(BLACKLIST_KEY);
    return blacklist ? blacklist.includes(ip) : false;
  } catch (error) {
    console.error("黑名单检查失败:", error);
    return false;
  }
}

export async function addToBlacklist(ip: string, duration: number = 3600): Promise<void> {
  try {
    const blacklist = (await getCachedData<string[]>(BLACKLIST_KEY)) || [];
    if (!blacklist.includes(ip)) {
      blacklist.push(ip);
      await setCachedData(BLACKLIST_KEY, blacklist, duration);
      console.log(`✓ IP ${ip} 已加入黑名单 (${duration}秒)`);
    }
  } catch (error) {
    console.error("添加黑名单失败:", error);
  }
}

export async function removeFromBlacklist(ip: string): Promise<void> {
  try {
    const blacklist = (await getCachedData<string[]>(BLACKLIST_KEY)) || [];
    const filtered = blacklist.filter((item) => item !== ip);
    await setCachedData(BLACKLIST_KEY, filtered, 3600);
    console.log(`✓ IP ${ip} 已从黑名单移除`);
  } catch (error) {
    console.error("移除黑名单失败:", error);
  }
}
