/**
 * 代码审查服务 - x402 付费
 * POST /api/code-review
 * Price: $0.01 USDC
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
          maxAmountRequired: "10000", // $0.01 = 10000 micro USDC
          resource: `https://xiaobei-services.vercel.app/api/code-review`,
          payTo: PAY_TO,
          description: "静态代码审查 - 检测常见问题和安全漏洞",
        }],
      },
    });
  }

  const { code, language = "javascript" } = req.body || {};
  
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

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
};
