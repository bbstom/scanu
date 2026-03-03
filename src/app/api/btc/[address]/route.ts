import { NextRequest, NextResponse } from "next/server";
import { getBtcBalance, getBtcTransactions } from "@/services/bitcoin";
import { getBtcPrice } from "@/services/price";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const { address } = params;

    const [balance, transactions, btcPrice] = await Promise.all([
      getBtcBalance(address),
      getBtcTransactions(address, limit),
      getBtcPrice(),
    ]);

    // 记录搜索历史（异步，不阻塞响应）
    const balanceUSD = balance.balance * btcPrice;
    
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        chainType: 'btc',
        balance: balance.balance.toString(),
        balanceUSD,
      }),
    }).catch(err => console.error('记录搜索历史失败:', err));

    return NextResponse.json({
      balance,
      transactions,
      btcPrice,
    });
  } catch (error: any) {
    console.error("BTC 查询失败:", error);
    return NextResponse.json(
      { error: error.message || "查询失败" },
      { status: 500 }
    );
  }
}
