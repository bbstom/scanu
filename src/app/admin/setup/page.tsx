"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [requiresSetupKey, setRequiresSetupKey] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    checkSetupKeyRequired();
  }, []);

  const checkSetupKeyRequired = () => {
    // 检查是否需要 setup 密钥（通过尝试不带密钥的请求来判断）
    // 这里只是前端提示，真正的验证在后端
    setRequiresSetupKey(true); // 默认显示密钥输入框
  };

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/admin/check");
      const data = await res.json();
      if (data.hasAdmin) {
        setHasAdmin(true);
      }
    } catch (error) {
      console.error("检查管理员失败:", error);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, setupKey }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("管理员账号创建成功！");
        router.push("/admin");
      } else {
        setError(data.error || "创建失败");
      }
    } catch (error) {
      setError("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">管理员已存在</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              系统已经有管理员账号，请直接登录
            </p>
            <button
              onClick={() => router.push("/admin")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-2">创建管理员账号</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            首次使用，请创建管理员账号
          </p>

          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                minLength={6}
              />
            </div>

            {requiresSetupKey && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  初始化密钥
                  <span className="text-xs text-gray-500 ml-2">
                    (在 .env 文件中配置的 ADMIN_SETUP_KEY)
                  </span>
                </label>
                <input
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="请输入初始化密钥"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  如果服务器配置了 ADMIN_SETUP_KEY，则必须提供正确的密钥才能创建管理员
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "创建中..." : "创建管理员"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
