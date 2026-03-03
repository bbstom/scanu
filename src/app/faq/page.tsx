import { Metadata } from "next";

export const metadata: Metadata = {
  title: "常见问题 - 加密钱包查询工具FAQ",
  description: "关于加密钱包查询工具的常见问题解答，包括如何使用、支持的币种、安全性等问题",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "这个工具是免费的吗？",
      answer: "是的，我们的加密钱包查询工具完全免费，无需注册即可使用。"
    },
    {
      question: "支持哪些区块链？",
      answer: "目前支持以太坊（ETH）、比特币（BTC）和波场（TRX）三条主流区块链，未来会添加更多链的支持。"
    },
    {
      question: "查询会泄露我的私钥吗？",
      answer: "不会。我们只查询公开的区块链数据，不需要也不会存储你的私钥。钱包地址是公开信息，任何人都可以在区块链浏览器上查询。"
    },
    {
      question: "为什么查询结果有延迟？",
      answer: "查询结果来自区块链网络和第三方 API，可能会有 1-2 分钟的数据延迟。这是正常现象。"
    },
    {
      question: "可以查询 USDT-TRC20 余额吗？",
      answer: "可以。在查询波场（TRX）地址时，会自动显示该地址的所有 TRC-20 代币，包括 USDT-TRC20。"
    },
    {
      question: "如何区分不同类型的地址？",
      answer: "以太坊地址以 0x 开头（42字符），比特币地址以 1/3/bc1 开头，波场地址以 T 开头（34字符）。我们的系统会自动识别地址类型。"
    },
    {
      question: "查询的价格数据准确吗？",
      answer: "价格数据来自 CoinGecko 等第三方 API，实时更新，但仅供参考。实际交易价格可能因交易所而异。"
    },
    {
      question: "可以查询交易详情吗？",
      answer: "可以。查询结果会显示最近的交易记录，包括交易哈希、时间、金额等信息。点击交易哈希可以跳转到区块链浏览器查看详细信息。"
    },
    {
      question: "为什么有些代币没有显示价格？",
      answer: "部分小众代币可能没有价格数据，或者价格 API 暂不支持。我们会持续优化代币价格数据的覆盖范围。"
    },
    {
      question: "可以导出查询结果吗？",
      answer: "目前暂不支持导出功能，但这个功能在我们的开发计划中，敬请期待。"
    },
    {
      question: "查询次数有限制吗？",
      answer: "为了保证服务质量，我们对查询频率有一定限制。正常使用不会受到影响。"
    },
    {
      question: "如何联系技术支持？",
      answer: "如果遇到问题或有建议，欢迎通过页面底部的联系方式与我们联系。"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">常见问题</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {index + 1}. {faq.question}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-200">
            还有其他问题？
          </h3>
          <p className="text-blue-800 dark:text-blue-300">
            如果以上内容没有解答你的疑问，欢迎通过页面底部的联系方式与我们联系，我们会尽快回复。
          </p>
        </div>
      </div>
    </div>
  );
}
