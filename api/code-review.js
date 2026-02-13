/**
 * 代码审查服务 - x402 付费
 * POST /api/code-review
 * Price: $0.01 USDC
 */

const PAY_TO = "0xda53D50572B8124A6B9d6d147d532Db59ABe0610";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const paymentHeader = req.headers["x-payment"];
  
  if (!paymentHeader) {
    return res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: [{
        scheme: "exact",
        network: "base",
        maxAmountRequired: "10000", // $0.01
        resource: "https://xiaobei-services.vercel.app/api/code-review",
        description: "静态代码审查 - 检测常见问题和安全漏洞",
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
              code: { type: "string", description: "Code to review", required: true },
              language: { type: "string", description: "Programming language" },
            },
          },
          output: {
            score: { type: "number" },
            grade: { type: "string" },
            issues: { type: "array" },
            suggestions: { type: "array" },
          },
        },
        extra: { name: "USD Coin", version: "2" },
      }],
    });
  }

  const { code, language = "javascript" } = req.body || {};
  
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const issues = [];
  const suggestions = [];
  let score = 100;

  const consoleMatches = code.match(/console\.(log|warn|error)/g);
  if (consoleMatches) {
    issues.push(`Found ${consoleMatches.length} console statement(s)`);
    score -= consoleMatches.length * 3;
  }

  const todoMatches = code.match(/(TODO|FIXME|XXX)/gi);
  if (todoMatches) {
    issues.push(`Found ${todoMatches.length} TODO/FIXME comment(s)`);
    score -= todoMatches.length * 2;
  }

  if (/password\s*[:=]\s*['"][^'"]+['"]/i.test(code) || 
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    issues.push("⚠️ Potential hardcoded credentials");
    score -= 20;
  }

  if (/\bdebugger\b/.test(code)) {
    issues.push("debugger statement found");
    score -= 10;
  }

  if (issues.length === 0) suggestions.push("✨ No major issues found!");
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  res.json({ score, grade, issues, suggestions, paid: true });
};
