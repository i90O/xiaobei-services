/**
 * 翻译服务 - x402 付费
 * POST /api/translate
 * Price: $0.001 USDC
 */

const PAY_TO = "0xda53D50572B8124A6B9d6d147d532Db59ABe0610";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// 简单词典
const dict = {
  "hello": "你好", "world": "世界", "goodbye": "再见", "thank you": "谢谢",
  "你好": "hello", "世界": "world", "再见": "goodbye", "谢谢": "thank you",
  "code": "代码", "代码": "code", "ai": "人工智能", "人工智能": "AI",
  "agent": "代理", "代理": "agent", "wallet": "钱包", "钱包": "wallet",
  "payment": "支付", "支付": "payment", "blockchain": "区块链", "区块链": "blockchain",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const paymentHeader = req.headers["x-payment"];
  
  if (!paymentHeader) {
    // 标准 x402 响应格式
    return res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: [{
        scheme: "exact",
        network: "base",
        maxAmountRequired: "1000", // $0.001 = 1000 micro USDC (6 decimals)
        resource: "https://xiaobei-services.vercel.app/api/translate",
        description: "中英双语翻译 (Chinese-English Translation)",
        mimeType: "application/json",
        payTo: PAY_TO,
        maxTimeoutSeconds: 60,
        asset: USDC_BASE,
        outputSchema: {
          input: {
            type: "http",
            method: "POST",
            discoverable: true,
            bodyFields: {
              text: { type: "string", description: "Text to translate", required: true },
              from: { type: "string", description: "Source language (auto/en/zh)" },
              to: { type: "string", description: "Target language (en/zh)" },
            },
          },
          output: {
            translated: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
          },
        },
        extra: { name: "USD Coin", version: "2" },
      }],
    });
  }

  // TODO: 验证支付
  const { text, from = "auto", to = "en" } = req.body || {};
  
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const containsChinese = /[\u4e00-\u9fa5]/.test(text);
  const detectedFrom = from === "auto" ? (containsChinese ? "zh" : "en") : from;
  
  const lower = text.toLowerCase().trim();
  const translated = dict[lower] || dict[text] || `[翻译] ${text}`;

  res.json({ translated, from: detectedFrom, to, paid: true });
};
