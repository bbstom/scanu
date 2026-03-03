import { connectDB } from "./mongodb";
import Settings from "@/models/Settings";

// 缓存设置，避免频繁查询数据库
let settingsCache: { [key: string]: string } = {};
let cacheTime = 0;
const CACHE_TTL = 60000; // 1分钟缓存

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  // 如果有环境变量，优先使用环境变量
  const envValue = process.env[key];
  if (envValue) {
    return envValue;
  }

  // 检查缓存
  const now = Date.now();
  if (settingsCache[key] && now - cacheTime < CACHE_TTL) {
    return settingsCache[key];
  }

  try {
    await connectDB();
    const setting = await Settings.findOne({ key });
    
    if (setting) {
      settingsCache[key] = setting.value;
      cacheTime = now;
      return setting.value;
    }
  } catch (error) {
    console.error(`获取设置 ${key} 失败:`, error);
  }

  return defaultValue;
}

export async function getNumberSetting(key: string, defaultValue: number): Promise<number> {
  const value = await getSetting(key, String(defaultValue));
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export async function getBooleanSetting(key: string, defaultValue: boolean): Promise<boolean> {
  const value = await getSetting(key, String(defaultValue));
  return value === "true" || value === "1";
}

export async function setSetting(key: string, value: string, description?: string): Promise<void> {
  try {
    await connectDB();
    await Settings.findOneAndUpdate(
      { key },
      { 
        value, 
        description,
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );
    
    // 清除缓存
    delete settingsCache[key];
  } catch (error) {
    console.error(`设置 ${key} 失败:`, error);
    throw error;
  }
}

export async function getAllSettings(): Promise<ISettings[]> {
  try {
    await connectDB();
    const settings = await Settings.find({}).sort({ key: 1 });
    return settings;
  } catch (error) {
    console.error("获取所有设置失败:", error);
    return [];
  }
}

export async function clearSettingsCache(): Promise<void> {
  settingsCache = {};
  cacheTime = 0;
}

// 导出类型
export interface ISettings {
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}
