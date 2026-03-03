import Link from "next/link";
import Image from "next/image";
import { getSetting } from "@/lib/settings";

export default async function Header() {
  const logoText = await getSetting("SITE_LOGO_TEXT", "加密钱包查询");
  const logoUrl = await getSetting("SITE_LOGO_URL", "");

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
            {logoUrl ? (
              <>
                <img 
                  src={logoUrl} 
                  alt={logoText}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    // 如果图片加载失败，隐藏图片并显示文字
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className={logoUrl ? "hidden" : ""}>{logoText}</span>
              </>
            ) : (
              <span>{logoText}</span>
            )}
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              首页
            </Link>
            <Link href="/guide" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              使用教程
            </Link>
            <Link href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              常见问题
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
