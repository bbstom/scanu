"use client";

import { useState } from "react";

interface QRCodeButtonProps {
  address: string;
}

export default function QRCodeButton({ address }: QRCodeButtonProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="relative">
      <button 
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="显示二维码"
        onMouseEnter={() => setShowQR(true)}
        onMouseLeave={() => setShowQR(false)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>

      {/* 二维码弹出层 */}
      {showQR && (
        <div 
          className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4"
          onMouseEnter={() => setShowQR(true)}
          onMouseLeave={() => setShowQR(false)}
        >
          <div className="text-center">
            <p className="text-sm font-semibold mb-3">地址二维码</p>
            {/* 使用在线二维码生成服务 - 正方形 */}
            <div className="w-52 h-52 mx-auto bg-white p-2 rounded">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`}
                alt="Address QR Code"
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 break-all">
              {address.substring(0, 10)}...{address.substring(address.length - 10)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
