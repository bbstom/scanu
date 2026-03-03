import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false"; // 默认启用

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;

export async function getRedisClient() {
  if (!REDIS_ENABLED) {
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    // 等待连接完成
    await new Promise(resolve => setTimeout(resolve, 100));
    return getRedisClient();
  }

  try {
    isConnecting = true;
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn("Redis 连接失败，禁用缓存");
            return false;
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("✓ Redis 连接成功");
    });

    await redisClient.connect();
    isConnecting = false;
    return redisClient;
  } catch (error) {
    console.warn("Redis 连接失败，将不使用缓存:", error);
    isConnecting = false;
    redisClient = null;
    return null;
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    if (data) {
      console.log(`✓ 缓存命中: ${key}`);
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttl: number = 300) {
  try {
    const client = await getRedisClient();
    if (!client) return;

    await client.setEx(key, ttl, JSON.stringify(data));
    console.log(`✓ 缓存设置: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

export async function deleteCachedData(key: string) {
  try {
    const client = await getRedisClient();
    if (!client) return;

    await client.del(key);
    console.log(`✓ 缓存删除: ${key}`);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

export async function getCachedDataWithFallback<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // 尝试从缓存获取
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 缓存未命中，执行查询
  console.log(`✗ 缓存未命中: ${key}，执行查询...`);
  const data = await fetchFn();

  // 保存到缓存
  await setCachedData(key, data, ttl);

  return data;
}
