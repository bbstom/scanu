"use client";

import { useEffect, useState } from "react";

interface Ad {
  _id: string;
  title: string;
  type: "text" | "image" | "html";
  content: string;
  imageUrl?: string;
  imageHeight?: number;
  linkUrl?: string;
  position: string;
  enabled: boolean;
  order: number;
}

interface AdSectionProps {
  position: "home" | "detail-top" | "detail-middle" | "detail-bottom";
}

export default function AdSection({ position }: AdSectionProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [position]);

  const loadAds = async () => {
    try {
      const res = await fetch(`/api/ads?position=${position}`);
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

  if (loading || ads.length === 0) {
    return null;
  }

  // 根据广告数量决定列数
  const getGridCols = () => {
    if (ads.length === 1) return "grid-cols-1";
    if (ads.length === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  const renderAd = (ad: Ad) => {
    const content = (
      <div className="h-full">
        {ad.type === "image" && ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.content || ad.title}
            className="w-full object-cover rounded-lg"
            style={{ height: `${ad.imageHeight || 200}px` }}
          />
        )}
        {ad.type === "text" && (
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300">{ad.content}</p>
          </div>
        )}
        {ad.type === "html" && (
          <div className="p-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          </div>
        )}
      </div>
    );

    if (ad.linkUrl) {
      return (
        <a
          key={ad._id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
        >
          {content}
        </a>
      );
    }

    return (
      <div
        key={ad._id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {content}
      </div>
    );
  };

  return (
    <div className="my-8">
      <div className={`grid ${getGridCols()} gap-6`}>
        {ads.map((ad) => renderAd(ad))}
      </div>
    </div>
  );
}
