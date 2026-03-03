"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [apiMenuOpen, setApiMenuOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  const isActive = (path: string) => pathname === path;
  const isApiActive = pathname?.startsWith("/admin/settings/api");

  return (
    <div className="w-64 bg-white dark:bg-gray-800 min-h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">后台管理</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">系统配置与管理</p>
      </div>

      <nav className="px-3 flex-1">
        {/* API 配置 - 可展开菜单 */}
        <div className="mb-2">
          <button
            onClick={() => setApiMenuOpen(!apiMenuOpen)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              isApiActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>API 配置</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${apiMenuOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* API 子菜单 */}
          {apiMenuOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => router.push("/admin/settings/api/ethereum")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/admin/settings/api/ethereum")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                以太坊 (ETH)
              </button>
              <button
                onClick={() => router.push("/admin/settings/api/bitcoin")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/admin/settings/api/bitcoin")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                比特币 (BTC)
              </button>
              <button
                onClick={() => router.push("/admin/settings/api/tron")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/admin/settings/api/tron")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                波场 (TRX)
              </button>
              <button
                onClick={() => router.push("/admin/settings/api/price")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive("/admin/settings/api/price")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                价格查询
              </button>
            </div>
          )}
        </div>

        {/* 缓存配置 */}
        <button
          onClick={() => router.push("/admin/settings/cache")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/settings/cache")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span>缓存配置</span>
          </div>
        </button>

        {/* 限流配置 */}
        <button
          onClick={() => router.push("/admin/settings/ratelimit")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/settings/ratelimit")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>限流配置</span>
          </div>
        </button>

        {/* 网站配置 */}
        <button
          onClick={() => router.push("/admin/settings/website")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/settings/website")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>网站配置</span>
          </div>
        </button>

        {/* 站点地图 */}
        <button
          onClick={() => router.push("/admin/settings/sitemap")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/settings/sitemap")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>站点地图</span>
          </div>
        </button>

        {/* 广告管理 */}
        <button
          onClick={() => router.push("/admin/settings/ads")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/settings/ads")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span>广告管理</span>
          </div>
        </button>

        {/* 数据统计 */}
        <button
          onClick={() => router.push("/admin/stats")}
          className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
            isActive("/admin/stats")
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>数据统计</span>
          </div>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

        {/* 返回首页 */}
        <button
          onClick={() => router.push("/")}
          className="w-full text-left px-4 py-3 rounded-lg mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>返回首页</span>
          </div>
        </button>

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>退出登录</span>
          </div>
        </button>
      </nav>
    </div>
  );
}
