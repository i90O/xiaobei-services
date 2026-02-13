/**
 * 翻译服务 - x402 付费
 * POST /api/translate
 * Price: $0.001 USDC
 */

const PAY_TO = "0xda53D50572B8124A6B9d6d147d532Db59ABe0610";

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

  const paymentHeader = req.headers["x-payment"] || req.headers["x402-payment"];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: "Payment Required",
      x402: {
        accepts: [{
          scheme: "exact",
          network: "base",
          maxAmountRequired: "1000",
          resource: "https://xiaobei-services.vercel.app/api/translate",
          payTo: PAY_TO,
          description: "中英双语翻译 (Chinese-English Translation)",
        }],
      },
    });
  }

  const { text, from = "auto", to = "en" } = req.body || {};
  
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const containsChinese = /[\u4e00-\u9fa5]/.test(text);
  const detectedFrom = from === "auto" ? (containsChinese ? "zh" : "en") : from;
  
  const lower = text.toLowerCase().trim();
  const translated = dict[lower] || dict[text] || `[翻译] ${text}`;

  res.json({
    translated,
    from: detectedFrom,
    to,
    paid: true,
  });
};
