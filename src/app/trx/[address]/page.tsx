import { Metadata } from "next";
import { getTrxBalance, getTrxTransactions } from "@/services/tron";
import { getTrxPrice } from "@/services/price";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import QRCodeButton from "@/components/QRCodeButton";
import TokenTabs from "@/components/TokenTabs";
import QuickSearch from "@/components/QuickSearch";
import TransactionTable from "@/components/TransactionTable";
import AdSection from "@/components/AdSection";

interface Props {
  params: { address: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${baseUrl}/trx/${params.address}`;
  
  return {
    title: `波场地址查询 ${params.address} - TRX和USDT-TRC20余额`,
    description: `查询波场地址 ${params.address} 的 TRX 余额、USDT-TRC20 代币和交易历史记录`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: pageUrl,
      siteName: '加密钱包查询工具',
      title: `波场地址查询 ${params.address}`,
      description: `查询波场地址 ${params.address} 的 TRX 余额、USDT-TRC20 代币和交易历史记录`,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: '波场地址查询',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `波场地址查询 ${params.address}`,
      description: `查询波场地址的 TRX 余额、USDT-TRC20 代币和交易历史记录`,
    },
  };
}

export default async function TrxAddressPage({ params }: Props) {
  const { address } = params;

  try {
    const [balance, transactions, trxPrice] = await Promise.all([
      getTrxBalance(address),
      getTrxTransactions(address, 50),
      getTrxPrice(),
    ]);

    const balanceUSD = balance.balance * trxPrice;
    
    // 计算 USDT 代币总价值
    let tokensValue = 0;
    const usdtTokens = balance.tokens.filter(t => {
      const symbol = (t.symbol || '').toUpperCase();
      const name = (t.name || '').toUpperCase();
      return symbol === 'USDT' || name === 'USDT' || 
             symbol.includes('USDT') || name.includes('USDT');
    });
    
    if (usdtTokens.length > 0) {
      tokensValue = usdtTokens.reduce((sum, token) => {
        const balance = parseFloat(token.balance || '0');
        const decimals = token.decimals || 6;
        return sum + (balance / Math.pow(10, decimals));
      }, 0);
    }
    
    const totalValue = balanceUSD + tokensValue;
    
    // 记录搜索历史（异步，不阻塞页面渲染）
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        chainType: 'trx',
        balance: balance.balance.toString(),
        balanceUSD: totalValue,
      }),
    }).catch(err => console.error('记录搜索历史失败:', err));

    // 统计转账数量
    const transferStats = {
      total: transactions.length,
      sent: transactions.filter(tx => tx.from.toLowerCase() === address.toLowerCase()).length,
      received: transactions.filter(tx => tx.to.toLowerCase() === address.toLowerCase()).length,
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* 返回按钮 */}
          <div className="mb-4">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              ← 返回首页
            </Link>
          </div>

          {/* 顶部广告位 */}
          <AdSection position="detail-top" />

          {/* 标题 */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm">
                📋
              </span>
              账户信息
            </h1>
            <QuickSearch />
          </div>

          {/* 上半部分：账户信息和代币列表 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6 items-stretch">
            {/* 左侧：账户详情 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* 标题 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex-shrink-0"></span>
                  <h2 className="text-lg font-bold break-all flex-1">{address}</h2>
                  <div className="flex gap-2 flex-shrink-0">
                    <CopyButton text={address} />
                    <QRCodeButton address={address} />
                  </div>
                </div>
              </div>

              {/* 资产卡片 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    资产
                    <span className="text-red-500">›</span>
                  </h3>
                  <span className="text-2xl font-bold">{totalValue.toFixed(2)}美元</span>
                </div>
              </div>

              {/* 详细信息列表 */}
              <div className="space-y-3 text-sm">
                {/* TRX可用 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> TRX可用:
                  </span>
                  <span className="font-semibold">{balance.balance.toFixed(6)} TRX</span>
                </div>

                {/* TRX质押 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> TRX质押:
                  </span>
                  <span className="font-semibold">0 TRX</span>
                </div>

                {/* USDT余额 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> USDT余额:
                  </span>
                  <span className="font-semibold">
                    {(() => {
                      // 查找所有 USDT 代币（包括 symbol 和 name）
                      const usdtTokens = balance.tokens.filter(t => {
                        const symbol = (t.symbol || '').toUpperCase();
                        const name = (t.name || '').toUpperCase();
                        return symbol === 'USDT' || name === 'USDT' || 
                               symbol.includes('USDT') || name.includes('USDT');
                      });
                      
                      if (usdtTokens.length > 0) {
                        // 计算总 USDT 余额
                        const totalUsdt = usdtTokens.reduce((sum, token) => {
                          const balance = parseFloat(token.balance || '0');
                          const decimals = token.decimals || 6; // USDT 通常是 6 位小数
                          return sum + (balance / Math.pow(10, decimals));
                        }, 0);
                        return totalUsdt.toFixed(6);
                      }
                      return '0.000000';
                    })()} USDT
                  </span>
                </div>

                {/* 交易 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 交易:
                  </span>
                  <span className="font-semibold">{transferStats.total}</span>
                </div>

                {/* 转账 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 转账:
                  </span>
                  <span className="font-semibold">
                    {transferStats.total}
                    <span className="ml-2">
                      (<span className="text-green-600">↓ {transferStats.received}</span>
                      <span className="text-red-600 ml-1">↑ {transferStats.sent}</span>)
                    </span>
                  </span>
                </div>

                {/* 活力 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 活力:
                  </span>
                  <span className="font-semibold">
                    可用: <span className="underline">{balance.energy}</span> / <span className="underline">0</span>
                  </span>
                </div>

                {/* 带宽 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 带宽:
                  </span>
                  <span className="font-semibold">
                    可用: <span className="underline">{balance.bandwidth}</span> / <span className="underline">{balance.bandwidth}</span>
                  </span>
                </div>

                {/* 投票数 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 投票数:
                  </span>
                  <span className="font-semibold">
                    已投票: 0 / 0 <span className="text-gray-400 ml-1">⚙️</span>
                  </span>
                </div>

                {/* 可领取的选民/SR奖励 */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 可领取的选民/SR奖励:
                  </span>
                  <span className="font-semibold">0 TRX</span>
                </div>
              </div>
            </div>

            {/* 右侧：代币列表 */}
            <TokenTabs 
              balance={balance.balance}
              balanceUSD={balanceUSD}
              tokens={balance.tokens}
            />
          </div>

          {/* 中部广告位 */}
          <AdSection position="detail-middle" />

          {/* 下半部分：交易记录 */}
          <TransactionTable 
            transactions={transactions}
            currentAddress={address}
            transferStats={transferStats}
            chainType="trx"
          />

          {/* 底部广告位 */}
          <AdSection position="detail-bottom" />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              查询失败
            </h2>
            <p className="text-red-600 dark:text-red-300">
              无法获取地址信息，请检查地址是否正确或稍后重试
            </p>
            <Link href="/" className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
