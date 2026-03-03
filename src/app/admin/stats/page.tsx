"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Stats {
  summary: {
    totalSearches: number;
    uniqueAddresses: number;
    recentSearches: number;
    favoriteCount: number;
    period: string;
  };
  chainStats: Array<{
    _id: string;
    totalSearches: number;
    uniqueAddresses: number;
    avgSearchCount: number;
    totalBalanceUSD: number;
  }>;
  topAddresses: Array<{
    address: string;
    chainType: string;
    searchCount: number;
    lastSearchAt: string;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("24h");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadStats();
  }, [period]);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("加载统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">数据统计</h1>
            <p className="text-gray-600 dark:text-gray-400">查看系统使用情况和热门地址</p>
          </div>

          {/* 时间范围选择 */}
          <div className="mb-6 flex gap-2">
          {["24h", "7d", "30d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {p === "24h" && "24 小时"}
              {p === "7d" && "7 天"}
              {p === "30d" && "30 天"}
              {p === "all" && "全部"}
            </button>
          ))}
          </div>

          {/* 概览卡片 */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">总搜索次数</div>
            <div className="text-3xl font-bold">{stats?.summary.totalSearches.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">唯一地址</div>
            <div className="text-3xl font-bold">{stats?.summary.uniqueAddresses.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">最近搜索</div>
            <div className="text-3xl font-bold">{stats?.summary.recentSearches.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">收藏数量</div>
            <div className="text-3xl font-bold">{stats?.summary.favoriteCount.toLocaleString()}</div>
          </div>
          </div>

          {/* 链统计 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">链统计</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats?.chainStats.map((chain) => (
              <div key={chain._id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="text-lg font-bold mb-3">{chain._id.toUpperCase()}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">搜索次数:</span>
                    <span className="font-semibold">{chain.totalSearches.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">唯一地址:</span>
                    <span className="font-semibold">{chain.uniqueAddresses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">平均搜索:</span>
                    <span className="font-semibold">{chain.avgSearchCount.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">总余额:</span>
                    <span className="font-semibold">${chain.totalBalanceUSD.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* 热门地址 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">热门地址 Top 10</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">排名</th>
                  <th className="px-4 py-3 text-left">地址</th>
                  <th className="px-4 py-3 text-left">链</th>
                  <th className="px-4 py-3 text-right">搜索次数</th>
                  <th className="px-4 py-3 text-left">最后搜索</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {stats?.topAddresses.map((addr, index) => (
                  <tr key={addr.address} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {addr.address.substring(0, 10)}...{addr.address.substring(addr.address.length - 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {addr.chainType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{addr.searchCount}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(addr.lastSearchAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
