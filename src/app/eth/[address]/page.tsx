"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import QRCodeButton from "@/components/QRCodeButton";
import TokenIcon from "@/components/TokenIcon";
import QuickSearch from "@/components/QuickSearch";
import AdSection from "@/components/AdSection";
import Pagination from "@/components/Pagination";

interface Props {
  params: { address: string };
}

interface EthData {
  balance: {
    address: string;
    balance: string;
    balanceUSD: number;
    tokens: any[];
  };
  transactions: any[];
  ethPrice: number;
}

export default function EthAddressPage({ params }: Props) {
  const { address } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 20;
  
  // 过滤状态
  const [filters, setFilters] = useState({
    fromAddress: '',
    toAddress: '',
    txType: 'all', // all, sent, received
    status: 'all', // all, success, failed
  });
  
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [address, currentPage]);
  
  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [data, filters]);
  
  const applyFilters = () => {
    if (!data) return;
    
    let filtered = [...data.transactions];
    
    // 按发送方过滤
    if (filters.fromAddress) {
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase().includes(filters.fromAddress.toLowerCase())
      );
    }
    
    // 按接收方过滤
    if (filters.toAddress) {
      filtered = filtered.filter(tx => 
        tx.to.toLowerCase().includes(filters.toAddress.toLowerCase())
      );
    }
    
    // 按交易类型过滤
    if (filters.txType !== 'all') {
      filtered = filtered.filter(tx => {
        const isSent = tx.from.toLowerCase() === address.toLowerCase();
        return filters.txType === 'sent' ? isSent : !isSent;
      });
    }
    
    // 按状态过滤
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => {
        const isSuccess = tx.status === '1' || tx.status === 'success' || tx.status === 1;
        return filters.status === 'success' ? isSuccess : !isSuccess;
      });
    }
    
    setFilteredTransactions(filtered);
  };
  
  const handleClearFilters = () => {
    setFilters({
      fromAddress: '',
      toAddress: '',
      txType: 'all',
      status: 'all',
    });
  };

  useEffect(() => {
    loadData();
  }, [address, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/eth/${address}?page=${currentPage}&limit=${itemsPerPage}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData(result);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    router.push(`/eth/${address}?page=${page}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
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

  const { balance, transactions, ethPrice } = data;
  const balanceETH = parseFloat(balance.balance);
  const balanceUSD = balanceETH * ethPrice;

  // 使用过滤后的交易
  const displayTransactions = filteredTransactions.length > 0 || 
    filters.fromAddress || filters.toAddress || filters.txType !== 'all' || filters.status !== 'all'
    ? filteredTransactions 
    : transactions;

  // 计算代币总价值
  let tokensValue = 0;
  balance.tokens.forEach(token => {
    if (token.valueUSD) {
      tokensValue += token.valueUSD;
    }
  });

  const totalValue = balanceUSD + tokensValue;

  // 统计转账数量（使用过滤后的数据）
  const transferStats = {
    total: displayTransactions.length,
    sent: displayTransactions.filter(tx => tx.from.toLowerCase() === address.toLowerCase()).length,
    received: displayTransactions.filter(tx => tx.to.toLowerCase() === address.toLowerCase()).length,
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
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex-shrink-0"></span>
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
                {/* ETH余额 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> ETH余额:
                  </span>
                  <span className="font-semibold">{balanceETH.toFixed(6)} ETH</span>
                </div>

                {/* 交易 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 交易:
                  </span>
                  <span className="font-semibold">{transferStats.total}</span>
                </div>

                {/* 转账 */}
                <div className="flex items-center justify-between py-2">
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
              </div>
            </div>

            {/* 右侧：代币列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
              {/* 标签页 */}
              <div className="border-b dark:border-gray-700 px-4 py-2 flex-shrink-0">
                <div className="flex gap-4 text-sm">
                  <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">钱包</button>
                </div>
              </div>

              {/* 代币列表 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {/* ETH */}
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <TokenIcon 
                        src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
                        alt="ETH"
                        symbol="ETH"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">ETH (Ethereum)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{balanceETH.toFixed(6)}</p>
                      <p className="text-xs text-gray-500">≈ ${balanceUSD.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* ERC-20 代币 */}
                  {balance.tokens.map((token, index) => {
                    const tokenBalance = parseFloat(token.balance) / Math.pow(10, token.decimals);
                    // 尝试从 Trust Wallet 获取代币 logo
                    const tokenLogoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.contractAddress}/logo.png`;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <TokenIcon 
                            src={tokenLogoUrl}
                            alt={token.symbol}
                            symbol={token.symbol}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{token.symbol} ({token.name})</span>
                              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                                erc20
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">{token.contractAddress.substring(0, 10)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{tokenBalance.toFixed(6)}</p>
                          {token.valueUSD && token.valueUSD > 0 && (
                            <p className="text-xs text-gray-500">≈ ${token.valueUSD.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 中部广告位 */}
          <AdSection position="detail-middle" />

          {/* 下半部分：交易记录 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* 筛选栏 */}
            <div className="border-b dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="发送方地址"
                  value={filters.fromAddress}
                  onChange={(e) => setFilters({ ...filters, fromAddress: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="接收方地址"
                  value={filters.toAddress}
                  onChange={(e) => setFilters({ ...filters, toAddress: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                />
                <select
                  value={filters.txType}
                  onChange={(e) => setFilters({ ...filters, txType: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">全部类型</option>
                  <option value="sent">转出</option>
                  <option value="received">转入</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">全部状态</option>
                  <option value="success">成功</option>
                  <option value="failed">失败</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  共计 {transferStats.total} 条数据 
                  <span className="ml-2">
                    收入 <span className="text-green-600 font-semibold">{transferStats.received}</span>
                  </span>
                  <span className="ml-2">
                    支出 <span className="text-red-600 font-semibold">{transferStats.sent}</span>
                  </span>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-sm transition-colors"
                >
                  清空筛选
                </button>
              </div>
            </div>

            {/* 交易表格 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">交易时间</th>
                    <th className="px-4 py-3 text-left font-semibold">发送方</th>
                    <th className="px-4 py-3 text-left font-semibold">接收方</th>
                    <th className="px-4 py-3 text-center font-semibold">类型</th>
                    <th className="px-4 py-3 text-right font-semibold">金额</th>
                    <th className="px-4 py-3 text-center font-semibold">交易哈希</th>
                    <th className="px-4 py-3 text-center font-semibold">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {displayTransactions.map((tx) => {
                    const isSent = tx.from.toLowerCase() === address.toLowerCase();
                    
                    return (
                      <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(tx.timestamp * 1000).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {tx.from.substring(0, 10)}...{tx.from.substring(tx.from.length - 8)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {tx.to.substring(0, 10)}...{tx.to.substring(tx.to.length - 8)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded ${
                            isSent 
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {isSent ? '转出' : '转入'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            isSent ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {isSent ? '-' : ''}{tx.value}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs">
                          <a 
                            href={`https://etherscan.io/tx/${tx.hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {tx.hash.substring(0, 8)}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded ${
                            tx.status === '1' || tx.status === 'success' || tx.status === 1
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {tx.status === '1' || tx.status === 'success' || tx.status === 1 ? '成功' : '失败'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {displayTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无符合条件的交易记录</p>
              </div>
            )}

            {/* 分页 */}
            {displayTransactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={1000} // API 通常限制最多返回1000条
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* 底部广告位 */}
          <AdSection position="detail-bottom" />
        </div>
      </div>
    );
}
