import { NextRequest, NextResponse } from "next/server";
import { getEthBalance, getEthTransactions, getEthTokens } from "@/services/ethereum";
import { getEthPrice } from "@/services/price";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const { address } = params;

    const [balanceData, transactions, tokens, ethPrice] = await Promise.all([
      getEthBalance(address),
      getEthTransactions(address, page, limit),
      getEthTokens(address),
      getEthPrice(),
    ]);

    // 合并余额和代币数据
    const balance = {
      ...balanceData,
      tokens,
    };

    // 记录搜索历史（异步，不阻塞响应）
    const balanceETH = parseFloat(balance.balance);
    const balanceUSD = balanceETH * ethPrice;
    
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        chainType: 'eth',
        balance: balanceETH.toString(),
        balanceUSD,
      }),
    }).catch(err => console.error('记录搜索历史失败:', err));

    return NextResponse.json({
      balance,
      transactions,
      ethPrice,
    });
  } catch (error: any) {
    console.error("ETH 查询失败:", error);
    return NextResponse.json(
      { error: error.message || "查询失败" },
      { status: 500 }
    );
  }
}
