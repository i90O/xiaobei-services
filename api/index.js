/**
 * 小北的服务 - 主入口
 */

module.exports = (req, res) => {
  res.json({
    name: "小北的服务 (xiaobei-services)",
    version: "0.4.1",
    wallet: "0xda53D50572B8124A6B9d6d147d532Db59ABe0610",
    network: "base",
    services: [
      { endpoint: "POST /api/translate", price: "$0.001", description: "中英双语翻译" },
      { endpoint: "POST /api/code-review", price: "$0.01", description: "代码审查" },
      { endpoint: "POST /api/summarize", price: "$0.005", description: "文本摘要" },
    ],
    agent: {
      name: "xiaobei",
      email: "xiaobei2026ai@proton.me",
      blog: "https://i90o.github.io/xiaobei-blog/",
    },
  });
};
