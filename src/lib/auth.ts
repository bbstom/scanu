import { connectDB } from "./mongodb";
import Admin from "@/models/Admin";

// 简单的密码哈希（生产环境建议使用 bcrypt）
function hashPassword(password: string): string {
  // 这里使用简单的哈希，生产环境应该使用 bcrypt
  return Buffer.from(password).toString("base64");
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    await connectDB();
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return false;
    }

    const hashedPassword = hashPassword(password);
    return admin.password === hashedPassword;
  } catch (error) {
    console.error("验证管理员失败:", error);
    return false;
  }
}

export async function createAdmin(username: string, password: string): Promise<boolean> {
  try {
    await connectDB();
    
    // 检查是否已存在
    const existing = await Admin.findOne({ username });
    if (existing) {
      return false;
    }

    const hashedPassword = hashPassword(password);
    await Admin.create({
      username,
      password: hashedPassword,
    });

    return true;
  } catch (error) {
    console.error("创建管理员失败:", error);
    return false;
  }
}

export async function hasAdmin(): Promise<boolean> {
  try {
    await connectDB();
    const count = await Admin.countDocuments();
    return count > 0;
  } catch (error) {
    console.error("检查管理员失败:", error);
    return false;
  }
}
