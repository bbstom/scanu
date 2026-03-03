"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const detectAddressType = (addr: string): string | null => {
    // 以太坊地址 (0x开头，42字符)
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      return "eth";
    }
    // 比特币地址
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr) || /^bc1[a-z0-9]{39,59}$/.test(addr)) {
      return "btc";
    }
    // 波场地址 (T开头，34字符)
    if (/^T[a-zA-Z0-9]{33}$/.test(addr)) {
      return "trx";
    }
    return null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLoading) return;

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError("请输入钱包地址");
      return;
    }

    const type = detectAddressType(trimmedAddress);
    if (!type) {
      setError("无效的地址格式，请检查后重试");
      return;
    }

    setIsLoading(true);
    router.push(`/${type}/${trimmedAddress}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="输入钱包地址 (ETH/BTC/TRX)"
          disabled={isLoading}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              查询中...
            </>
          ) : (
            '查询'
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>支持的地址格式：</p>
        <ul className="mt-2 space-y-1">
          <li>• 以太坊: 0x 开头，42 字符</li>
          <li>• 比特币: 1/3/bc1 开头</li>
          <li>• 波场: T 开头，34 字符</li>
        </ul>
      </div>
    </div>
  );
}
