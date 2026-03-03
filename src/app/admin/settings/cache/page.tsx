"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function CacheSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const defaultSettings: Setting[] = [
    {
      key: "CACHE_BALANCE_TTL",
      value: "60",
      description: "余额缓存时间（秒）",
    },
    {
      key: "CACHE_TRANSACTIONS_TTL",
      value: "120",
      description: "交易缓存时间（秒）",
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
            <h1 className="text-3xl font-bold mb-2">缓存配置</h1>
            <p className="text-gray-600 dark:text-gray-400">
              调整缓存时间可以平衡数据实时性和 API 调用频率
            </p>
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
                    min="10"
                    max="3600"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    推荐范围: 10-3600 秒 | 配置项: {setting.key}
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
