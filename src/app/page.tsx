import SearchBox from "@/components/SearchBox";
import AdSection from "@/components/AdSection";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              加密钱包查询
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              支持以太坊、比特币、波场多链地址实时查询
            </p>
          </div>
          
          <SearchBox />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" viewBox="0 0 256 417" fill="currentColor">
                  <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fillOpacity=".6"/>
                  <path d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                  <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fillOpacity=".6"/>
                  <path d="M127.962 416.905v-104.72L0 236.585z"/>
                  <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fillOpacity=".2"/>
                  <path d="M0 212.32l127.96 75.638v-133.8z" fillOpacity=".6"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">以太坊</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              查询 ETH 余额、ERC-20 代币和交易历史记录
            </p>
          </div>

          <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">比特币</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              查询 BTC 余额、交易记录和地址统计信息
            </p>
          </div>

          <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 0L3 9l13 7.5L29 9 16 0zm0 18.5L3 11v11l13 7.5 13-7.5V11l-13 7.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">波场</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              查询 TRX、USDT-TRC20 及所有代币余额
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">功能特性</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">实时查询余额和代币信息</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">完整的交易历史记录</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">支持交易筛选和分页</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">一键复制地址和生成二维码</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">使用步骤</h3>
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">输入地址</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">在搜索框输入钱包地址</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">自动识别</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">系统自动识别地址类型</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">查看结果</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">查看余额、代币和交易记录</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 广告位 */}
        <div className="max-w-5xl mx-auto">
          <AdSection position="home" />
        </div>
      </div>
    </div>
  );
}
