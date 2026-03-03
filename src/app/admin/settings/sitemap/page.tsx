"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface SitemapStats {
  totalAddresses: number;
  ethAddresses: number;
  btcAddresses: number;
  trxAddresses: number;
}

interface Address {
  address: string;
  chainType: string;
  searchCount: number;
  lastSearchAt: string;
}

export default function SitemapPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [popularAddresses, setPopularAddresses] = useState<Address[]>([]);
  const [recentAddresses, setRecentAddresses] = useState<Address[]>([]);
  const [message, setMessage] = useState("");
  const [generatedXML, setGeneratedXML] = useState("");
  
  // 配置选项
  const [includePopular, setIncludePopular] = useState(true);
  const [includeRecent, setIncludeRecent] = useState(true);
  const [maxUrls, setMaxUrls] = useState(100);

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/sitemap", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPopularAddresses(data.popularAddresses);
        setRecentAddresses(data.recentAddresses);
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage("");
    setGeneratedXML("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/sitemap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          includePopular,
          includeRecent,
          maxUrls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedXML(data.xml);
        setMessage(`✅ 成功生成站点地图！共 ${data.urlCount} 个 URL`);
      } else {
        setMessage("❌ 生成失败，请重试");
      }
    } catch (error) {
      setMessage("❌ 生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedXML], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedXML);
    setMessage("✅ 已复制到剪贴板");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">站点地图生成</h1>
            <p className="text-gray-600 dark:text-gray-400">
              生成包含动态地址页面的 sitemap.xml，提升 SEO 效果
            </p>
          </div>

          {/* 统计信息 */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">总地址数</div>
              <div className="text-3xl font-bold">{stats?.totalAddresses.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">以太坊</div>
              <div className="text-3xl font-bold text-blue-600">{stats?.ethAddresses.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">比特币</div>
              <div className="text-3xl font-bold text-orange-600">{stats?.btcAddresses.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">波场</div>
              <div className="text-3xl font-bold text-red-600">{stats?.trxAddresses.toLocaleString()}</div>
            </div>
          </div>

          {/* 配置选项 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">生成配置</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePopular}
                    onChange={(e) => setIncludePopular(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">包含热门地址</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRecent}
                    onChange={(e) => setIncludeRecent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium">包含最近搜索</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  最大 URL 数量: {maxUrls}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxUrls}
                  onChange={(e) => setMaxUrls(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>250</span>
                  <span>500</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">说明</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• 站点地图包含 3 个静态页面（首页、指南、FAQ）</li>
                  <li>• 动态页面根据搜索历史自动生成</li>
                  <li>• 热门地址：按搜索次数排序</li>
                  <li>• 最近搜索：按最后搜索时间排序</li>
                  <li>• 建议定期更新站点地图以包含最新内容</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={generating || (!includePopular && !includeRecent)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {generating ? "生成中..." : "生成站点地图"}
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  message.includes("✅")
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* 生成的 XML */}
          {generatedXML && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">生成的 Sitemap XML</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    复制
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    下载 sitemap.xml
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                  {generatedXML}
                </pre>
              </div>
            </div>
          )}

          {/* 热门地址预览 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">热门地址 Top 10</h2>
              <div className="space-y-2">
                {popularAddresses.slice(0, 10).map((addr, index) => (
                  <div
                    key={`${addr.chainType}-${addr.address}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                      <div>
                        <div className="text-sm font-mono">
                          {addr.address.substring(0, 10)}...{addr.address.substring(addr.address.length - 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {addr.chainType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {addr.searchCount} 次
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">最近搜索 Top 10</h2>
              <div className="space-y-2">
                {recentAddresses.slice(0, 10).map((addr, index) => (
                  <div
                    key={`${addr.chainType}-${addr.address}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                      <div>
                        <div className="text-sm font-mono">
                          {addr.address.substring(0, 10)}...{addr.address.substring(addr.address.length - 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {addr.chainType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(addr.lastSearchAt).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
