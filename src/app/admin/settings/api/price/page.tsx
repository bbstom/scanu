"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface ApiPlatform {
  name: string;
  url: string;
  apiKey: string;
  enabled: boolean;
  priority: number;
}

export default function PriceApiPage() {
  const [platforms, setPlatforms] = useState<ApiPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const defaultPlatforms: ApiPlatform[] = [
    { name: "CoinGecko", url: "https://api.coingecko.com/api/v3", apiKey: "", enabled: true, priority: 1 },
  ];

  useEffect(() => {
    checkAuth();
    loadConfig();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  };

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const apiConfig = data.settings.find((s: any) => s.key === "API_CONFIG_PRICE");
        
        if (apiConfig && apiConfig.value) {
          try {
            setPlatforms(JSON.parse(apiConfig.value));
          } catch {
            setPlatforms(defaultPlatforms);
          }
        } else {
          setPlatforms(defaultPlatforms);
        }
      }
    } catch (error) {
      console.error("加载配置失败:", error);
      setPlatforms(defaultPlatforms);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: [{
            key: "API_CONFIG_PRICE",
            value: JSON.stringify(platforms),
            description: "价格查询 API 配置",
          }],
        }),
      });

      if (res.ok) {
        setMessage("保存成功！");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("保存失败，请重试");
      }
    } catch (error) {
      setMessage("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const updatePlatform = (index: number, field: keyof ApiPlatform, value: any) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    setPlatforms(newPlatforms);
  };

  const addPlatform = () => {
    setPlatforms([
      ...platforms,
      {
        name: "新平台",
        url: "",
        apiKey: "",
        enabled: true,
        priority: platforms.length + 1,
      },
    ]);
  };

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">价格查询 API 配置</h1>
            <p className="text-gray-600 dark:text-gray-400">
              配置加密货币价格查询的 API 平台，系统会按优先级顺序调用
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">配置说明</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• 优先级数字越小，优先级越高（1 最高）</li>
              <li>• 系统会按优先级顺序尝试调用 API</li>
              <li>• 可以禁用某个平台，系统会自动跳过</li>
              <li>• CoinGecko 免费版无需 API Key</li>
              <li>• 可以添加其他价格查询平台作为备用</li>
            </ul>
          </div>

          <div className="space-y-4 mb-6">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platform.enabled}
                      onChange={(e) => updatePlatform(index, "enabled", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={platform.name}
                      onChange={(e) => updatePlatform(index, "name", e.target.value)}
                      className="font-medium px-3 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      placeholder="平台名称"
                    />
                    <span className="text-sm text-gray-500">优先级:</span>
                    <input
                      type="number"
                      value={platform.priority}
                      onChange={(e) => updatePlatform(index, "priority", parseInt(e.target.value))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      min="1"
                    />
                  </div>
                  <button
                    onClick={() => removePlatform(index)}
                    className="text-red-600 hover:text-red-700 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">API URL</label>
                    <input
                      type="text"
                      value={platform.url}
                      onChange={(e) => updatePlatform(index, "url", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key（可选）</label>
                    <input
                      type="text"
                      value={platform.apiKey}
                      onChange={(e) => updatePlatform(index, "apiKey", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="留空使用免费 API"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addPlatform}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-6"
          >
            + 添加平台
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {message && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  message.includes("成功")
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {saving ? "保存中..." : "保存配置"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
