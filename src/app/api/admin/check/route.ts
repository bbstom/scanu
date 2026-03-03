import { NextResponse } from "next/server";
import { hasAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const adminExists = await hasAdmin();
    return NextResponse.json({ hasAdmin: adminExists });
  } catch (error) {
    console.error("检查管理员失败:", error);
    return NextResponse.json({ hasAdmin: false });
  }
}
