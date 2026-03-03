"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const defaultSettings: Setting[] = [
    {
      key: "SITE_NAME",
      value: "加密钱包查询工具",
      description: "网站名称",
    },
    {
      key: "SITE_TITLE",
      value: "加密钱包查询工具 - 支持ETH/BTC/TRX多链查询",
      description: "浏览器标签页标题",
    },
    {
      key: "SITE_DESCRIPTION",
      value: "免费的加密货币钱包查询工具，支持以太坊、比特币、波场等多链地址查询，实时显示余额、交易记录和USDT-TRC20代币信息",
      description: "网站描述（SEO）",
    },
    {
      key: "SITE_KEYWORDS",
      value: "加密钱包查询,以太坊钱包,比特币地址查询,USDT-TRC20查询,TRX钱包,区块链查询工具",
      description: "网站关键词（SEO）",
    },
    {
      key: "SITE_LOGO_URL",
      value: "",
      description: "网站 Logo 图片 URL（留空则显示文字）",
    },
    {
      key: "SITE_LOGO_TEXT",
      value: "加密钱包查询",
      description: "网站 Logo 文字（Logo 图片为空时显示）",
    },
    {
      key: "SITE_FAVICON_URL",
      value: "",
      description: "网站 Favicon 图标 URL（留空则使用默认）",
    },
    {
      key: "FOOTER_TEXT",
      value: "© 2024 加密钱包查询工具. All rights reserved.",
      description: "页脚版权信息",
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
            <h1 className="text-3xl font-bold mb-2">网站配置</h1>
            <p className="text-gray-600 dark:text-gray-400">
              自定义网站名称、Logo、SEO 信息和页脚内容
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">配置说明</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• <strong>网站名称</strong>: 网站的基本名称，用于各种显示场景</li>
              <li>• <strong>浏览器标签页标题</strong>: 显示在浏览器标签页上的完整标题</li>
              <li>• <strong>网站描述</strong>: 用于搜索引擎优化（SEO），显示在搜索结果中</li>
              <li>• <strong>网站关键词</strong>: 帮助搜索引擎理解网站内容，多个关键词用逗号分隔</li>
              <li>• <strong>Logo 图片 URL</strong>: 网站 Logo 图片地址（支持外链或本地路径，如 /logo.png）</li>
              <li>• <strong>Logo 文字</strong>: 当 Logo 图片为空时显示的文字标识</li>
              <li>• <strong>Favicon 图标 URL</strong>: 浏览器标签页图标地址（推荐 32x32 或 64x64 像素）</li>
              <li>• <strong>页脚版权信息</strong>: 显示在页面底部的版权声明</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium mb-2">{setting.description}</label>
                  {setting.key === "SITE_DESCRIPTION" || setting.key === "SITE_KEYWORDS" ? (
                    <textarea
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      placeholder={`请输入${setting.description}`}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      placeholder={`请输入${setting.description}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">配置项: {setting.key}</p>
                  
                  {/* Logo 图片预览 */}
                  {setting.key === "SITE_LOGO_URL" && setting.value && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">预览:</p>
                      <img 
                        src={setting.value} 
                        alt="Logo Preview" 
                        className="h-10 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <p className="text-xs text-red-600 hidden">图片加载失败，请检查 URL 是否正确</p>
                    </div>
                  )}
                  
                  {/* Favicon 预览 */}
                  {setting.key === "SITE_FAVICON_URL" && setting.value && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">预览:</p>
                      <img 
                        src={setting.value} 
                        alt="Favicon Preview" 
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <p className="text-xs text-red-600 hidden">图片加载失败，请检查 URL 是否正确</p>
                    </div>
                  )}
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
