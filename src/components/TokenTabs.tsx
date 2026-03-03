"use client";

import { useState } from "react";
import TokenIcon from "./TokenIcon";
import { TrxToken } from "@/types";

interface TokenTabsProps {
  balance: number;
  balanceUSD: number;
  tokens: TrxToken[];
}

export default function TokenTabs({ balance, balanceUSD, tokens }: TokenTabsProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'authorization' | 'permissions' | 'projects'>('wallet');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
      {/* 标签页 */}
      <div className="border-b dark:border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex gap-4 text-sm">
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`pb-2 ${activeTab === 'wallet' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            钱包
          </button>
          <button 
            onClick={() => setActiveTab('authorization')}
            className={`pb-2 ${activeTab === 'authorization' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            授权列表
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`pb-2 ${activeTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            账户权限
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`pb-2 ${activeTab === 'projects' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            参与项目
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 钱包标签页 */}
        {activeTab === 'wallet' && (
          <div className="p-4 space-y-1">
            {/* TRX */}
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <div className="flex items-center gap-2">
                <TokenIcon 
                  src="https://static.tronscan.org/production/logo/trx.png"
                  alt="TRX"
                  symbol="TRX"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">trx (trx)</span>
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      trc10
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{balance.toFixed(6)}</p>
                <p className="text-xs text-gray-500">≈ ${balanceUSD.toFixed(2)}</p>
              </div>
            </div>

            {/* 所有代币 */}
            {tokens.map((token, index) => {
              const tokenBalance = parseFloat(token.balance) / Math.pow(10, token.decimals);
              const isUSDT = token.symbol.toUpperCase() === 'USDT';
              const valueUSD = isUSDT ? tokenBalance : 0;
              const tokenType = token.tokenType || 'trc20';
              
              return (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className="flex items-center gap-2">
                    <TokenIcon 
                      src={token.tokenLogo}
                      alt={token.symbol}
                      symbol={token.symbol}
                      isUSDT={isUSDT}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{token.symbol} ({token.name})</span>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          tokenType === 'trc20' 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}>
                          {tokenType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{token.contractAddress.substring(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{tokenBalance.toFixed(6)}</p>
                    {valueUSD > 0 && (
                      <p className="text-xs text-gray-500">≈ ${valueUSD.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 授权列表标签页 */}
        {activeTab === 'authorization' && (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm">暂无授权记录</p>
          </div>
        )}

        {/* 账户权限标签页 */}
        {activeTab === 'permissions' && (
          <div className="p-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Owner 权限</span>
                  <span className="text-xs text-gray-500">阈值: 1</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">拥有账户的完全控制权</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active 权限</span>
                  <span className="text-xs text-gray-500">阈值: 1</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">可以执行除更改权限外的所有操作</p>
              </div>
            </div>
          </div>
        )}

        {/* 参与项目标签页 */}
        {activeTab === 'projects' && (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">暂无参与项目</p>
          </div>
        )}
      </div>
    </div>
  );
}
