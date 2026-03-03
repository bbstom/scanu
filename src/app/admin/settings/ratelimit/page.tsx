"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function RateLimitSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const defaultSettings: Setting[] = [
    {
      key: "RATELIMIT_INTERVAL",
      value: "60",
      description: "限流时间窗口（秒）",
    },
    {
      key: "RATELIMIT_MAX_REQUESTS",
      value: "30",
      description: "限流最大请求数",
    },
    {
      key: "SEARCH_RATELIMIT_MAX",
      value: "20",
      description: "搜索 API 限流",
    },
  ];

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const merged = defaultSettings.map((def) => {
          const saved = data.settings.find((s: Setting) => s.key === def.key);
          return saved || def;
        });
        setSettings(merged);
      }
    } catch (error) {
      console.error("加载设置失败:", error);
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
        body: JSON.stringify({ settings }),
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

  const updateSetting = (key: string, value: string) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
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
            <h1 className="text-3xl font-bold mb-2">限流配置</h1>
            <p className="text-gray-600 dark:text-gray-400">
              调整限流参数可以防止 API 滥用，保护服务器资源
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">配置说明</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• 限流时间窗口：统计请求数的时间范围</li>
              <li>• 限流最大请求数：时间窗口内允许的最大请求次数</li>
              <li>• 搜索 API 限流：专门针对搜索接口的限制</li>
              <li>• 超过限制的请求会返回 429 错误</li>
              <li>• 建议根据服务器性能和用户量调整</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium mb-2">{setting.description}</label>
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    推荐范围: 1-1000 | 配置项: {setting.key}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
