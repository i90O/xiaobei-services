/**
 * 摘要服务 - x402 付费
 * POST /api/summarize
 * Price: $0.005 USDC
 */

const PAY_TO = "0xda53D50572B8124A6B9d6d147d532Db59ABe0610";

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
          maxAmountRequired: "5000", // $0.005 = 5000 micro USDC
          resource: `https://xiaobei-services.vercel.app/api/summarize`,
          payTo: PAY_TO,
          description: "文本摘要生成",
        }],
      },
    });
  }

  const { text, maxLength = 200 } = req.body || {};
  
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const sentences = text.split(/[.。!！?？]+/).filter(s => s.trim());
  let summary = sentences.length > 0 ? sentences[0].trim() : text.substring(0, maxLength);
  
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + "...";
  }
  
  const compressionRatio = text.length > 0 
    ? (summary.length / text.length * 100).toFixed(1) + "%" 
    : "0%";

  res.json({ summary, compressionRatio, paid: true });
};
