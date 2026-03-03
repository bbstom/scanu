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

interface BtcData {
  balance: {
    address: string;
    balance: number;
    totalReceived: number;
    totalSent: number;
    txCount: number;
    unconfirmedBalance?: number;
    unconfirmedTxCount?: number;
  };
  transactions: any[];
  btcPrice: number;
}

export default function BtcAddressPage({ params }: Props) {
  const { address } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<BtcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 20;
  
  // 过滤状态
  const [filters, setFilters] = useState({
    txHash: '',
    senderAddress: '',
    receiverAddress: '',
    txType: 'all', // all, sent, received, self
    minConfirmations: '',
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
  
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/btc/${address}?page=${currentPage}&limit=${itemsPerPage}`);
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
  
  const applyFilters = () => {
    if (!data) return;
    
    let filtered = [...data.transactions];
    
    // 按交易哈希过滤
    if (filters.txHash) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(filters.txHash.toLowerCase())
      );
    }
    
    // 按发送方地址过滤
    if (filters.senderAddress) {
      filtered = filtered.filter(tx => 
        tx.inputs.some((input: any) => 
          input.address.toLowerCase().includes(filters.senderAddress.toLowerCase())
        )
      );
    }
    
    // 按接收方地址过滤
    if (filters.receiverAddress) {
      filtered = filtered.filter(tx => 
        tx.outputs.some((output: any) => 
          output.address.toLowerCase().includes(filters.receiverAddress.toLowerCase())
        )
      );
    }
    
    // 按交易类型过滤
    if (filters.txType !== 'all') {
      filtered = filtered.filter(tx => {
        const isReceived = tx.outputs.some((output: any) => 
          output.address.toLowerCase() === address.toLowerCase()
        );
        const isSent = tx.inputs.some((input: any) => 
          input.address.toLowerCase() === address.toLowerCase()
        );
        
        if (filters.txType === 'received') return isReceived && !isSent;
        if (filters.txType === 'sent') return isSent && !isReceived;
        if (filters.txType === 'self') return isSent && isReceived;
        return true;
      });
    }
    
    // 按确认数过滤
    if (filters.minConfirmations) {
      const minConf = parseInt(filters.minConfirmations);
      filtered = filtered.filter(tx => tx.confirmations >= minConf);
    }
    
    setFilteredTransactions(filtered);
  };
  
  const handleClearFilters = () => {
    setFilters({
      txHash: '',
      senderAddress: '',
      receiverAddress: '',
      txType: 'all',
      minConfirmations: '',
    });
  };

  const handlePageChange = (page: number) => {
    router.push(`/btc/${address}?page=${page}`);
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

  const { balance, transactions, btcPrice } = data;
  const balanceUSD = balance.balance * btcPrice;
  
  // 使用过滤后的交易
  const displayTransactions = filteredTransactions.length > 0 || 
    filters.txHash || filters.senderAddress || filters.receiverAddress || 
    filters.txType !== 'all' || filters.minConfirmations
    ? filteredTransactions 
    : transactions;

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
              <span className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-sm">
                📋
              </span>
              账户信息
            </h1>
            <QuickSearch />
          </div>

          {/* 上半部分：账户信息和统计 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6 items-stretch">
            {/* 左侧：账户详情 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
              {/* 标题 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex-shrink-0"></span>
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
                  <span className="text-2xl font-bold">{balanceUSD.toFixed(2)}美元</span>
                </div>
              </div>

              {/* 详细信息列表 */}
              <div className="space-y-3 text-sm flex-1">
                {/* BTC余额 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> BTC余额:
                  </span>
                  <span className="font-semibold">{balance.balance.toFixed(8)} BTC</span>
                </div>

                {/* 美元价值 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 美元价值:
                  </span>
                  <span className="font-semibold">${balanceUSD.toFixed(2)}</span>
                </div>

                {/* BTC价格 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> BTC价格:
                  </span>
                  <span className="font-semibold">${btcPrice.toFixed(2)}</span>
                </div>

                {/* 总接收 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 总接收:
                  </span>
                  <span className="font-semibold">{balance.totalReceived.toFixed(8)} BTC</span>
                </div>

                {/* 总接收美元 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 总接收美元:
                  </span>
                  <span className="font-semibold">${(balance.totalReceived * btcPrice).toFixed(2)}</span>
                </div>

                {/* 总发送 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 总发送:
                  </span>
                  <span className="font-semibold">{balance.totalSent.toFixed(8)} BTC</span>
                </div>

                {/* 总发送美元 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 总发送美元:
                  </span>
                  <span className="font-semibold">${(balance.totalSent * btcPrice).toFixed(2)}</span>
                </div>

                {/* 交易数量 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 交易数量:
                  </span>
                  <span className="font-semibold">{balance.txCount}</span>
                </div>

                {/* 未确认交易 */}
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 未确认交易:
                  </span>
                  <span className="font-semibold">{balance.unconfirmedTxCount || 0}</span>
                </div>

                {/* 未确认余额 */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400">?</span> 未确认余额:
                  </span>
                  <span className="font-semibold">{(balance.unconfirmedBalance || 0).toFixed(8)} BTC</span>
                </div>
              </div>
            </div>

            {/* 右侧：BTC 信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
              {/* 标签页 */}
              <div className="border-b dark:border-gray-700 px-4 py-2 flex-shrink-0">
                <div className="flex gap-4 text-sm">
                  <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">钱包</button>
                </div>
              </div>

              {/* BTC 信息 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-1">
                  {/* BTC */}
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <TokenIcon 
                        src="https://bitcoin.org/img/icons/opengraph.png"
                        alt="BTC"
                        symbol="BTC"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">BTC (Bitcoin)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{balance.balance.toFixed(8)}</p>
                      <p className="text-xs text-gray-500">≈ ${balanceUSD.toFixed(2)}</p>
                    </div>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="交易哈希"
                  value={filters.txHash}
                  onChange={(e) => setFilters({ ...filters, txHash: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="发送方地址"
                  value={filters.senderAddress}
                  onChange={(e) => setFilters({ ...filters, senderAddress: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  placeholder="接收方地址"
                  value={filters.receiverAddress}
                  onChange={(e) => setFilters({ ...filters, receiverAddress: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                />
                <select
                  value={filters.txType}
                  onChange={(e) => setFilters({ ...filters, txType: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                >
                  <option value="all">全部类型</option>
                  <option value="received">转入</option>
                  <option value="sent">转出</option>
                  <option value="self">内部转账</option>
                </select>
                <input
                  type="number"
                  placeholder="最小确认数"
                  value={filters.minConfirmations}
                  onChange={(e) => setFilters({ ...filters, minConfirmations: e.target.value })}
                  className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                  min="0"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  共计 {displayTransactions.length} 条交易记录
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
                    <th className="px-4 py-3 text-left font-semibold">交易哈希</th>
                    <th className="px-4 py-3 text-left font-semibold">发送方</th>
                    <th className="px-4 py-3 text-left font-semibold">接收方</th>
                    <th className="px-4 py-3 text-center font-semibold">类型</th>
                    <th className="px-4 py-3 text-right font-semibold">金额</th>
                    <th className="px-4 py-3 text-center font-semibold">确认数</th>
                    <th className="px-4 py-3 text-right font-semibold">手续费</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {displayTransactions.map((tx) => {
                    // 判断是转入还是转出
                    const isReceived = tx.outputs.some((output: any) => 
                      output.address.toLowerCase() === address.toLowerCase()
                    );
                    const isSent = tx.inputs.some((input: any) => 
                      input.address.toLowerCase() === address.toLowerCase()
                    );
                    
                    // 计算当前地址在交易中接收和发送的金额
                    const receivedAmount = tx.outputs
                      .filter((output: any) => output.address.toLowerCase() === address.toLowerCase())
                      .reduce((sum: number, output: any) => sum + output.value, 0);
                    
                    const sentAmount = tx.inputs
                      .filter((input: any) => input.address.toLowerCase() === address.toLowerCase())
                      .reduce((sum: number, input: any) => sum + input.value, 0);
                    
                    // 计算净变化
                    const netAmount = receivedAmount - sentAmount;
                    
                    // 确定交易类型和显示金额
                    let txType: string;
                    let displayAmount: number;
                    
                    if (isReceived && !isSent) {
                      // 纯转入：显示接收的金额
                      txType = 'received';
                      displayAmount = receivedAmount;
                    } else if (isSent && !isReceived) {
                      // 纯转出：显示转出到其他地址的总金额（不包括找零）
                      txType = 'sent';
                      displayAmount = tx.outputs
                        .filter((output: any) => output.address.toLowerCase() !== address.toLowerCase())
                        .reduce((sum: number, output: any) => sum + output.value, 0);
                    } else if (isSent && isReceived) {
                      // 内部转账：显示净变化（通常是负的手续费）
                      txType = 'self';
                      displayAmount = Math.abs(netAmount);
                    } else {
                      txType = 'unknown';
                      displayAmount = 0;
                    }
                    
                    // 获取发送方地址
                    let mainSender: string;
                    const allSenders = tx.inputs.map((input: any) => input.address);
                    
                    if (txType === 'received') {
                      // 转入交易：显示实际发送方（非当前地址）
                      mainSender = allSenders.find((addr: string) => 
                        addr !== 'Coinbase' && addr.toLowerCase() !== address.toLowerCase()
                      ) || allSenders[0] || 'Unknown';
                    } else {
                      // 转出或内部：显示当前地址
                      mainSender = address;
                    }
                    
                    // 获取接收方地址
                    let mainReceiver: string;
                    const allReceivers = tx.outputs.map((output: any) => output.address);
                    
                    if (txType === 'sent') {
                      // 转出交易：显示实际接收方（非当前地址）
                      mainReceiver = allReceivers.find((addr: string) => 
                        addr.toLowerCase() !== address.toLowerCase()
                      ) || allReceivers[0] || 'Unknown';
                    } else if (txType === 'received') {
                      // 转入交易：显示当前地址
                      mainReceiver = address;
                    } else {
                      // 内部转账：显示当前地址
                      mainReceiver = address;
                    }
                    
                    const senderAddresses = tx.inputs.filter((input: any) => input.address !== 'Coinbase').map((input: any) => input.address);
                    const receiverAddresses = tx.outputs.map((output: any) => output.address);
                    
                    return (
                      <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(tx.time * 1000).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <a 
                            href={`https://blockchain.info/tx/${tx.hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {tx.hash.substring(0, 16)}...
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <div className="max-w-[120px] truncate" title={mainSender}>
                            {mainSender === 'Coinbase' ? (
                              <span className="text-gray-500">Coinbase</span>
                            ) : (
                              <a 
                                href={`/btc/${mainSender}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {mainSender.substring(0, 8)}...
                              </a>
                            )}
                          </div>
                          {senderAddresses.length > 1 && (
                            <span className="text-xs text-gray-500">+{senderAddresses.length - 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <div className="max-w-[120px] truncate" title={mainReceiver}>
                            <a 
                              href={`/btc/${mainReceiver}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {mainReceiver.substring(0, 8)}...
                            </a>
                          </div>
                          {receiverAddresses.length > 1 && (
                            <span className="text-xs text-gray-500">+{receiverAddresses.length - 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded ${
                            txType === 'received'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : txType === 'sent'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {txType === 'received' ? '转入' : txType === 'sent' ? '转出' : '内部'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            txType === 'received' ? 'text-green-600' : txType === 'sent' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {txType === 'sent' ? '-' : txType === 'received' ? '+' : ''}{displayAmount.toFixed(8)} BTC
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tx.confirmations === 0
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : tx.confirmations < 6
                              ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {tx.confirmations === 0 ? '未确认' : `${tx.confirmations} 确认`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-400">
                          {tx.fee.toFixed(8)} BTC
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
                totalItems={1000}
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
