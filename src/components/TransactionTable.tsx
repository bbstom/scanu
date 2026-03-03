"use client";

import { useState } from "react";
import TokenIcon from "./TokenIcon";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: string;
  result: string;
  fee?: number;
  tokenSymbol?: string;
  tokenType?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  currentAddress: string;
  transferStats: {
    total: number;
    sent: number;
    received: number;
  };
  chainType: 'trx' | 'eth' | 'btc';
}

export default function TransactionTable({ 
  transactions, 
  currentAddress, 
  transferStats,
  chainType 
}: TransactionTableProps) {
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStartTime, setFilterStartTime] = useState("");
  const [filterEndTime, setFilterEndTime] = useState("");
  const [filterToken, setFilterToken] = useState("全部");
  const [filterAmount, setFilterAmount] = useState("不限金额/数额");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 复制地址到剪贴板
  const copyAddress = async (address: string, uniqueId: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(uniqueId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 筛选交易
  const filteredTransactions = transactions.filter(tx => {
    const matchFrom = !filterFrom || tx.from.toLowerCase().includes(filterFrom.toLowerCase());
    const matchTo = !filterTo || tx.to.toLowerCase().includes(filterTo.toLowerCase());
    
    // 时间筛选
    let matchTime = true;
    if (filterStartTime || filterEndTime) {
      const txDate = new Date(tx.timestamp);
      if (filterStartTime) {
        const startDate = new Date(filterStartTime);
        matchTime = matchTime && txDate >= startDate;
      }
      if (filterEndTime) {
        const endDate = new Date(filterEndTime);
        // 设置结束时间为当天的 23:59:59
        endDate.setHours(23, 59, 59, 999);
        matchTime = matchTime && txDate <= endDate;
      }
    }
    
    // 代币筛选 - 修复逻辑
    let matchToken = true;
    if (filterToken !== "全部") {
      if (filterToken === "TRX") {
        // TRX: 没有 tokenSymbol 或 tokenSymbol 为 TRX
        matchToken = !tx.tokenSymbol || tx.tokenSymbol === "TRX";
      } else if (filterToken === "USDT") {
        // USDT: tokenSymbol 包含 USDT
        matchToken = tx.tokenSymbol?.toUpperCase().includes("USDT") || false;
      }
    }
    
    return matchFrom && matchTo && matchTime && matchToken;
  });

  const handleClear = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterStartTime("");
    setFilterEndTime("");
    setFilterToken("全部");
    setFilterAmount("不限金额/数额");
    setCurrentPage(1); // 重置到第一页
  };

  // 统计筛选后的数据
  const filteredStats = {
    total: filteredTransactions.length,
    sent: filteredTransactions.filter(tx => tx.from.toLowerCase() === currentAddress.toLowerCase()).length,
    received: filteredTransactions.filter(tx => tx.to.toLowerCase() === currentAddress.toLowerCase()).length,
  };

  // 分页计算
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // 页码范围计算（显示当前页前后2页）
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 最多显示5个页码
    
    if (totalPages <= maxVisible) {
      // 总页数少于等于5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数大于5，显示省略号
      if (currentPage <= 3) {
        // 当前页在前面
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 筛选栏 */}
      <div className="border-b dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="发送方地址"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 w-48"
          />
          <input
            type="text"
            placeholder="接收方地址"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 w-48"
          />
          <input
            type="date"
            placeholder="开始时间"
            value={filterStartTime}
            onChange={(e) => setFilterStartTime(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 w-40"
          />
          <input
            type="date"
            placeholder="结束时间"
            value={filterEndTime}
            onChange={(e) => setFilterEndTime(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 w-40"
          />
          {chainType === 'trx' && (
            <select 
              value={filterToken}
              onChange={(e) => setFilterToken(e.target.value)}
              className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option>全部</option>
              <option>TRX</option>
              <option>USDT</option>
            </select>
          )}
          <select 
            value={filterAmount}
            onChange={(e) => setFilterAmount(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
          >
            <option>不限金额/数额</option>
          </select>
          <button 
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 rounded text-sm"
          >
            清空
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
            筛选
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          共计 {filteredStats.total} 条数据 收入 {filteredStats.received} 支出 {filteredStats.sent}
          {filteredStats.total > pageSize && (
            <span className="ml-4">
              显示 {startIndex + 1}-{Math.min(endIndex, filteredStats.total)} 条
            </span>
          )}
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
              <th className="px-4 py-3 text-left font-semibold">代币</th>
              <th className="px-4 py-3 text-center font-semibold">类型</th>
              <th className="px-4 py-3 text-right font-semibold">金额</th>
              <th className="px-4 py-3 text-center font-semibold">交易哈希</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {paginatedTransactions.map((tx) => {
              const isSent = tx.from.toLowerCase() === currentAddress.toLowerCase();
              const tokenSymbol = tx.tokenSymbol || 'TRX';
              const isUSDT = tokenSymbol.toUpperCase().includes('USDT');
              
              return (
                <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <button
                      onClick={() => copyAddress(tx.from, `${tx.hash}-from`)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors relative group"
                      title="点击复制完整地址"
                    >
                      {tx.from.substring(0, 10)}...{tx.from.substring(tx.from.length - 8)}
                      {copiedId === `${tx.hash}-from` && (
                        <span className="absolute -top-8 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          已复制!
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <button
                      onClick={() => copyAddress(tx.to, `${tx.hash}-to`)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors relative group"
                      title="点击复制完整地址"
                    >
                      {tx.to.substring(0, 10)}...{tx.to.substring(tx.to.length - 8)}
                      {copiedId === `${tx.hash}-to` && (
                        <span className="absolute -top-8 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          已复制!
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <TokenIcon 
                        src={isUSDT ? "https://static.tronscan.org/production/logo/usdtlogo.png" : "https://static.tronscan.org/production/logo/trx.png"}
                        alt={tokenSymbol}
                        symbol={tokenSymbol}
                        isUSDT={isUSDT}
                      />
                      <span className="text-xs">{tokenSymbol}</span>
                    </div>
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
                      href={`https://tronscan.org/#/transaction/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {tx.hash.substring(0, 8)}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="border-t dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">条</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              上一页
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-1 border dark:border-gray-600 rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              下一页
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              末页
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            第 {currentPage} / {totalPages} 页
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无交易记录</p>
        </div>
      )}
    </div>
  );
}
