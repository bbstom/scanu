import { getSetting } from "@/lib/settings";

export default async function Footer() {
  const footerText = await getSetting("FOOTER_TEXT", "© 2024 加密钱包查询工具. All rights reserved.");
  const siteName = await getSetting("SITE_NAME", "加密钱包查询工具");

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              免费的加密货币钱包查询工具，支持多链地址查询
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">支持的区块链</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• 以太坊 (ETH)</li>
              <li>• 比特币 (BTC)</li>
              <li>• 波场 (TRX)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• 使用教程</li>
              <li>• 常见问题</li>
              <li>• 隐私政策</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{footerText}</p>
        </div>
      </div>
    </footer>
  );
}
