"use client";

import { useState } from "react";

interface TokenIconProps {
  src?: string;
  alt: string;
  symbol: string;
  isUSDT?: boolean;
}

export default function TokenIcon({ src, alt, symbol, isUSDT = false }: TokenIconProps) {
  const [imageError, setImageError] = useState(false);

  // 根据代币符号返回对应的背景色
  const getTokenColor = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes('USDT')) return 'bg-green-600';
    if (upperSymbol.includes('TRX')) return 'bg-red-600';
    if (upperSymbol.includes('ETH')) return 'bg-blue-600';
    if (upperSymbol.includes('BTC')) return 'bg-orange-600';
    if (upperSymbol.includes('USDC')) return 'bg-blue-500';
    if (upperSymbol.includes('DAI')) return 'bg-yellow-500';
    if (upperSymbol.includes('BNB')) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  if (!src || imageError) {
    // 显示首字母备用图标
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-semibold text-xs ${getTokenColor(symbol)}`}>
        {symbol.charAt(0)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className="w-5 h-5 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  );
}
