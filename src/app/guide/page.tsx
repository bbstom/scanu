import { Metadata } from "next";

export const metadata: Metadata = {
  title: "使用教程 - 如何查询加密钱包余额和交易记录",
  description: "详细的加密钱包查询教程，教你如何查询以太坊、比特币、波场钱包的余额和交易记录",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">使用教程</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">如何查询钱包地址</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">步骤 1：获取钱包地址</h3>
              <p>从你的钱包应用（如 MetaMask、Trust Wallet、imToken 等）复制钱包地址</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">步骤 2：输入地址</h3>
              <p>在首页搜索框中粘贴钱包地址，系统会自动识别地址类型</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">步骤 3：查看结果</h3>
              <p>查询结果会显示余额、代币列表和最近的交易记录</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">以太坊钱包查询</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p><strong>地址格式：</strong>以 0x 开头，共 42 个字符</p>
            <p><strong>示例：</strong>0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</p>
            <p><strong>可查询内容：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>ETH 余额</li>
              <li>ERC-20 代币（如 USDT、USDC 等）</li>
              <li>交易历史记录</li>
              <li>Gas 费用信息</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">比特币地址查询</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p><strong>地址格式：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Legacy 地址：以 1 开头</li>
              <li>SegWit 地址：以 3 开头</li>
              <li>Bech32 地址：以 bc1 开头</li>
            </ul>
            <p><strong>示例：</strong>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</p>
            <p><strong>可查询内容：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>BTC 余额</li>
              <li>总接收和总发送金额</li>
              <li>交易数量</li>
              <li>交易历史和确认数</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">波场钱包查询</h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300">
            <p><strong>地址格式：</strong>以 T 开头，共 34 个字符</p>
            <p><strong>示例：</strong>TRX9Yqwj4qr6W9DeKjUAvyShcFfHii7yn</p>
            <p><strong>可查询内容：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>TRX 余额</li>
              <li>TRC-20 代币（重点支持 USDT-TRC20）</li>
              <li>带宽和能量信息</li>
              <li>交易历史记录</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-200">注意事项</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-300">
            <li>本工具仅查询公开的区块链数据，不会存储你的私钥</li>
            <li>查询结果可能有 1-2 分钟的延迟</li>
            <li>请确保输入的地址格式正确</li>
            <li>价格数据来自第三方 API，仅供参考</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
