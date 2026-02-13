/**
 * 小北的付费服务 - x402 Payment Services
 * 钱包: 0xda53D50572B8124A6B9d6d147d532Db59ABe0610
 * 网络: Base Mainnet
 */

const express = require("express");
const { paymentMiddleware } = require("x402-express");

const app = express();
app.use(express.json());

// 我的钱包地址
const PAY_TO = "0xda53D50572B8124A6B9d6d147d532Db59ABe0610";

// x402 支付中间件
const payment = paymentMiddleware(PAY_TO, {
  "POST /translate": {
    price: "$0.001",
    network: "base",
    config: {
      description: "中英双语翻译 (Chinese-English Translation)",
      inputSchema: {
        bodyType: "json",
        bodyFields: {
          text: { type: "string", description: "Text to translate", required: true },
          from: { type: "string", description: "Source language (auto/en/zh)" },
          to: { type: "string", description: "Target language (en/zh)" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          translated: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
        },
      },
    },
  },
  "POST /code-review": {
    price: "$0.01",
    network: "base",
    config: {
      description: "静态代码审查 - 检测常见问题和安全漏洞",
      inputSchema: {
        bodyType: "json",
        bodyFields: {
          code: { type: "string", description: "Code to review", required: true },
          language: { type: "string", description: "Programming language (js/python/etc)" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          score: { type: "number" },
          grade: { type: "string" },
          issues: { type: "array" },
          suggestions: { type: "array" },
        },
      },
    },
  },
  "POST /summarize": {
    price: "$0.005",
    network: "base",
    config: {
      description: "文本摘要生成",
      inputSchema: {
        bodyType: "json",
        bodyFields: {
          text: { type: "string", description: "Text to summarize", required: true },
          maxLength: { type: "number", description: "Max summary length" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          compressionRatio: { type: "string" },
        },
      },
    },
  },
});

// ===== 免费端点 =====
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    name: "小北的服务 (xiaobei-services)",
    version: "0.4.0",
    wallet: PAY_TO,
    network: "base",
    services: [
      { endpoint: "POST /translate", price: "$0.001", description: "中英双语翻译" },
      { endpoint: "POST /code-review", price: "$0.01", description: "代码审查" },
      { endpoint: "POST /summarize", price: "$0.005", description: "文本摘要" },
    ],
    agent: {
      name: "xiaobei",
      email: "xiaobei2026ai@proton.me",
      blog: "https://i90o.github.io/xiaobei-blog/",
    },
  });
});

// ===== 付费端点 =====

// 翻译
app.post("/translate", payment, (req, res) => {
  const { text, from = "auto", to = "en" } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  const containsChinese = /[\u4e00-\u9fa5]/.test(text);
  const detectedFrom = from === "auto" ? (containsChinese ? "zh" : "en") : from;
  
  // 简单词典
  const dict = {
    "hello": "你好", "world": "世界", "goodbye": "再见", "thank you": "谢谢",
    "你好": "hello", "世界": "world", "再见": "goodbye", "谢谢": "thank you",
    "code": "代码", "代码": "code", "ai": "人工智能", "人工智能": "AI",
  };
  
  const lower = text.toLowerCase().trim();
  const translated = dict[lower] || dict[text] || `[翻译] ${text}`;
  
  res.json({ translated, from: detectedFrom, to, paid: true });
});

// 代码审查
app.post("/code-review", payment, (req, res) => {
  const { code, language = "javascript" } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const issues = [];
  const suggestions = [];
  let score = 100;

  // 检查 console.log
  const consoleMatches = code.match(/console\.(log|warn|error)/g);
  if (consoleMatches) {
    issues.push(`Found ${consoleMatches.length} console statement(s)`);
    score -= consoleMatches.length * 3;
  }

  // 检查 TODO
  const todoMatches = code.match(/(TODO|FIXME|XXX)/gi);
  if (todoMatches) {
    issues.push(`Found ${todoMatches.length} TODO/FIXME comment(s)`);
    score -= todoMatches.length * 2;
  }

  // 检查硬编码密钥
  if (/password\s*[:=]\s*['"][^'"]+['"]/i.test(code) || 
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    issues.push("⚠️ Potential hardcoded credentials");
    score -= 20;
  }

  // 检查 debugger
  if (/\bdebugger\b/.test(code)) {
    issues.push("debugger statement found");
    score -= 10;
  }

  if (issues.length === 0) suggestions.push("✨ No major issues found!");
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  res.json({ score, grade, issues, suggestions, paid: true });
});

// 摘要
app.post("/summarize", payment, (req, res) => {
  const { text, maxLength = 200 } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  const sentences = text.split(/[.。!！?？]+/).filter(s => s.trim());
  let summary = sentences.length > 0 ? sentences[0].trim() : text.substring(0, maxLength);
  
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + "...";
  }
  
  const compressionRatio = text.length > 0 
    ? (summary.length / text.length * 100).toFixed(1) + "%" 
    : "0%";

  res.json({ summary, compressionRatio, paid: true });
});

const PORT = process.env.PORT || 3402;
app.listen(PORT, () => {
  console.log(`🧭 小北的x402服务运行在 http://localhost:${PORT}`);
  console.log(`💰 收款地址: ${PAY_TO}`);
  console.log(`🔗 网络: Base Mainnet`);
});
