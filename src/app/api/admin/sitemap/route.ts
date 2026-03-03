import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchHistory from "@/models/SearchHistory";

// 验证 token
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return Boolean(token && token.length > 0);
}

// 获取站点地图数据
export async function GET(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    await connectDB();

    // 获取热门搜索地址（按搜索次数排序）
    const popularAddresses = await SearchHistory.find()
      .sort({ searchCount: -1 })
      .limit(100)
      .select("address chainType searchCount lastSearchAt")
      .lean();

    // 获取最近搜索地址
    const recentAddresses = await SearchHistory.find()
      .sort({ lastSearchAt: -1 })
      .limit(50)
      .select("address chainType searchCount lastSearchAt")
      .lean();

    // 统计信息
    const stats = {
      totalAddresses: await SearchHistory.countDocuments(),
      ethAddresses: await SearchHistory.countDocuments({ chainType: "eth" }),
      btcAddresses: await SearchHistory.countDocuments({ chainType: "btc" }),
      trxAddresses: await SearchHistory.countDocuments({ chainType: "trx" }),
    };

    return NextResponse.json({
      popularAddresses,
      recentAddresses,
      stats,
    });
  } catch (error) {
    console.error("获取站点地图数据失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 生成站点地图
export async function POST(request: NextRequest) {
  try {
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { includePopular, includeRecent, maxUrls } = await request.json();

    await connectDB();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const urls: any[] = [];

    // 静态页面
    urls.push({
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    });

    urls.push({
      url: `${baseUrl}/guide`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    urls.push({
      url: `${baseUrl}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    });

    // 动态地址页面
    let query: any = {};
    let limit = maxUrls || 100;

    if (includePopular && includeRecent) {
      // 混合：热门 + 最近
      const popular = await SearchHistory.find()
        .sort({ searchCount: -1 })
        .limit(Math.floor(limit / 2))
        .lean();

      const recent = await SearchHistory.find()
        .sort({ lastSearchAt: -1 })
        .limit(Math.ceil(limit / 2))
        .lean();

      const combined = [...popular, ...recent];
      // 去重
      const uniqueAddresses = Array.from(
        new Map(combined.map((item) => [`${item.chainType}-${item.address}`, item])).values()
      );

      uniqueAddresses.forEach((addr) => {
        urls.push({
          url: `${baseUrl}/${addr.chainType}/${addr.address}`,
          lastModified: addr.lastSearchAt.toISOString(),
          changeFrequency: "daily",
          priority: 0.6,
        });
      });
    } else if (includePopular) {
      // 仅热门
      const addresses = await SearchHistory.find()
        .sort({ searchCount: -1 })
        .limit(limit)
        .lean();

      addresses.forEach((addr) => {
        urls.push({
          url: `${baseUrl}/${addr.chainType}/${addr.address}`,
          lastModified: addr.lastSearchAt.toISOString(),
          changeFrequency: "daily",
          priority: 0.6,
        });
      });
    } else if (includeRecent) {
      // 仅最近
      const addresses = await SearchHistory.find()
        .sort({ lastSearchAt: -1 })
        .limit(limit)
        .lean();

      addresses.forEach((addr) => {
        urls.push({
          url: `${baseUrl}/${addr.chainType}/${addr.address}`,
          lastModified: addr.lastSearchAt.toISOString(),
          changeFrequency: "daily",
          priority: 0.6,
        });
      });
    }

    // 生成 XML
    const xml = generateSitemapXML(urls);

    return NextResponse.json({
      success: true,
      urlCount: urls.length,
      xml,
    });
  } catch (error) {
    console.error("生成站点地图失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 生成 Sitemap XML
function generateSitemapXML(urls: any[]): string {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;
}
