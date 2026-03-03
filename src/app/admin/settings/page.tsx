"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到以太坊 API 配置页面
    router.replace("/admin/settings/api/ethereum");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p>加载中...</p>
    </div>
  );
}
