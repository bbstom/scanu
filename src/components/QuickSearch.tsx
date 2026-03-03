"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function QuickSearch() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 监听路由变化，重置加载状态
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim() || isLoading) return;

    const trimmedAddress = address.trim();
    setIsLoading(true);

    // 判断地址类型
    let targetPath = "";
    if (trimmedAddress.startsWith("0x") && trimmedAddress.length === 42) {
      // 以太坊地址
      targetPath = `/eth/${trimmedAddress}`;
    } else if (trimmedAddress.startsWith("T") && trimmedAddress.length === 34) {
      // 波场地址
      targetPath = `/trx/${trimmedAddress}`;
    } else if (
      (trimmedAddress.startsWith("1") || 
       trimmedAddress.startsWith("3") || 
       trimmedAddress.startsWith("bc1")) &&
      trimmedAddress.length >= 26 &&
      trimmedAddress.length <= 62
    ) {
      // 比特币地址
      targetPath = `/btc/${trimmedAddress}`;
    } else {
      setIsLoading(false);
      alert("无法识别的地址格式，请输入有效的以太坊、比特币或波场地址");
      return;
    }

    // 检查是否是当前页面
    if (pathname === targetPath) {
      // 如果是相同地址，强制刷新页面
      window.location.href = targetPath;
    } else {
      // 不同地址，使用路由跳转
      router.push(targetPath);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="输入地址快速查询..."
        disabled={isLoading}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            查询中...
          </>
        ) : (
          '查询'
        )}
      </button>
    </form>
  );
}
