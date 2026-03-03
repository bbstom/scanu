import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSetting } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSetting("SITE_TITLE", "加密钱包查询工具 - 支持ETH/BTC/TRX多链查询");
  const siteName = await getSetting("SITE_NAME", "加密钱包查询工具");
  const siteDescription = await getSetting(
    "SITE_DESCRIPTION",
    "免费的加密货币钱包查询工具，支持以太坊、比特币、波场等多链地址查询，实时显示余额、交易记录和USDT-TRC20代币信息"
  );
  const siteKeywords = await getSetting(
    "SITE_KEYWORDS",
    "加密钱包查询,以太坊钱包,比特币地址查询,USDT-TRC20查询,TRX钱包,区块链查询工具"
  );
  const faviconUrl = await getSetting("SITE_FAVICON_URL", "");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const metadata: Metadata = {
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: baseUrl,
      siteName: siteName,
      title: siteTitle,
      description: siteDescription,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [`${baseUrl}/twitter-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // 可以在后台配置中添加
      // google: 'google-site-verification-code',
      // yandex: 'yandex-verification-code',
      // bing: 'bing-verification-code',
    },
  };

  // 如果配置了自定义 Favicon，添加到 metadata
  if (faviconUrl) {
    metadata.icons = {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // 网站结构化数据
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "加密钱包查询工具",
    "url": baseUrl,
    "description": "免费的加密货币钱包查询工具，支持以太坊、比特币、波场等多链地址查询",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 组织结构化数据
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "加密钱包查询工具",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "sameAs": [
      // 可以添加社交媒体链接
    ]
  };

  return (
    <html lang="zh-CN">
      <head>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
