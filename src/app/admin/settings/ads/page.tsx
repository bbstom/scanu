"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Ad {
  _id: string;
  title: string;
  type: "text" | "image" | "html";
  content: string;
  imageUrl?: string;
  imageHeight?: number;
  linkUrl?: string;
  position: "home" | "detail-top" | "detail-middle" | "detail-bottom";
  enabled: boolean;
  order: number;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: "",
    type: "text" as "text" | "image" | "html",
    content: "",
    imageUrl: "",
    imageHeight: 200,
    linkUrl: "",
    position: "home" as "home" | "detail-top" | "detail-middle" | "detail-bottom",
    enabled: true,
    order: 0,
  });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadAds();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  };

  const loadAds = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/ads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAds(data.ads);
      }
    } catch (error) {
      console.error("加载广告失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      
      if (editingAd) {
        // 更新
        const res = await fetch("/api/admin/ads", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingAd._id, ...formData }),
        });

        if (res.ok) {
          setMessage("✅ 更新成功");
          loadAds();
          resetForm();
        } else {
          setMessage("❌ 更新失败");
        }
      } else {
        // 创建
        const res = await fetch("/api/admin/ads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setMessage("✅ 创建成功");
          loadAds();
          resetForm();
        } else {
          setMessage("❌ 创建失败");
        }
      }
    } catch (error) {
      setMessage("❌ 操作失败");
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type,
      content: ad.content,
      imageUrl: ad.imageUrl || "",
      imageHeight: ad.imageHeight || 200,
      linkUrl: ad.linkUrl || "",
      position: ad.position,
      enabled: ad.enabled,
      order: ad.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个广告吗？")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/ads?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage("✅ 删除成功");
        loadAds();
      } else {
        setMessage("❌ 删除失败");
      }
    } catch (error) {
      setMessage("❌ 删除失败");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "text",
      content: "",
      imageUrl: "",
      imageHeight: 200,
      linkUrl: "",
      position: "home",
      enabled: true,
      order: 0,
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      home: "首页底部",
      "detail-top": "详情页顶部",
      "detail-middle": "详情页中部",
      "detail-bottom": "详情页底部",
    };
    return labels[position] || position;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "文字",
      image: "图片",
      html: "富文本",
    };
    return labels[type] || type;
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">广告管理</h1>
              <p className="text-gray-600 dark:text-gray-400">
                管理网站广告位，支持文字、图片和富文本
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showForm ? "取消" : "+ 新建广告"}
            </button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* 表单 */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingAd ? "编辑广告" : "新建广告"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">广告标题</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">广告类型</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="text">文字</option>
                      <option value="image">图片</option>
                      <option value="html">富文本</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">显示位置</label>
                    <select
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="home">首页底部</option>
                      <option value="detail-top">详情页顶部</option>
                      <option value="detail-middle">详情页中部</option>
                      <option value="detail-bottom">详情页底部</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">排序（越小越靠前）</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                {formData.type === "image" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">图片 URL</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        图片高度: {formData.imageHeight}px
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="600"
                        step="10"
                        value={formData.imageHeight}
                        onChange={(e) =>
                          setFormData({ ...formData, imageHeight: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>100px</span>
                        <span>350px</span>
                        <span>600px</span>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.type === "text" ? "文字内容" : formData.type === "html" ? "HTML 内容" : "图片 Alt 文字（SEO）"}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={formData.type === "html" ? 8 : formData.type === "image" ? 2 : 4}
                    required={formData.type !== "image"}
                    placeholder={formData.type === "image" ? "图片的替代文字（可选）" : ""}
                  />
                  {formData.type === "image" && (
                    <p className="mt-1 text-xs text-gray-500">用于 SEO 和图片加载失败时显示，不会在页面上显示</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">跳转链接（可选）</label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">启用广告</label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAd ? "更新" : "创建"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 广告列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">广告列表</h2>

              {ads.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无广告</p>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div
                      key={ad._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{ad.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                ad.enabled
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {ad.enabled ? "启用" : "禁用"}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {getTypeLabel(ad.type)}
                            </span>
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                              {getPositionLabel(ad.position)}
                            </span>
                            <span className="text-xs text-gray-500">排序: {ad.order}</span>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {ad.type === "image" && ad.imageUrl && (
                              <div className="mb-2">
                                <img
                                  src={ad.imageUrl}
                                  alt={ad.content || ad.title}
                                  className="object-contain rounded"
                                  style={{ height: `${ad.imageHeight || 200}px` }}
                                />
                                <p className="text-xs text-gray-500 mt-1">高度: {ad.imageHeight || 200}px</p>
                              </div>
                            )}
                            {ad.type !== "image" && (
                              <p className="line-clamp-2">{ad.content}</p>
                            )}
                          </div>

                          {ad.linkUrl && (
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {ad.linkUrl}
                            </a>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(ad)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
