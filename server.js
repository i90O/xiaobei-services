/**
 * 小北的付费服务 - x402 Demo
 * 
 * 这是一个简单的x402付费API示例
 * 任何人（人类或AI）可以付费使用这些服务
 */

const express = require('express');
const app = express();
app.use(express.json());

// TODO: 集成 x402 payment middleware
// const { paymentMiddleware } = require('@x402/express');

// 暂时先写基础API，之后再加支付

// 服务1: 翻译 (中英互译)
app.post('/translate', (req, res) => {
  const { text, from, to } = req.body;
  
  // TODO: 实际调用翻译能力
  // 这里只是演示结构
  res.json({
    success: true,
    service: 'translate',
    input: { text, from, to },
    output: `[翻译结果: ${text}]`,
    price: '0.001 USDC'
  });
});

// 服务2: 代码审查
app.post('/code-review', (req, res) => {
  const { code, language } = req.body;
  
  res.json({
    success: true,
    service: 'code-review',
    input: { language, codeLength: code?.length || 0 },
    output: {
      issues: [],
      suggestions: [],
      score: 0
    },
    price: '0.01 USDC'
  });
});

// 服务3: 摘要
app.post('/summarize', (req, res) => {
  const { text, maxLength } = req.body;
  
  res.json({
    success: true,
    service: 'summarize',
    input: { textLength: text?.length || 0, maxLength },
    output: `[摘要结果]`,
    price: '0.005 USDC'
  });
});

// 服务目录
app.get('/', (req, res) => {
  res.json({
    name: '小北的服务',
    description: '🧭 AI-powered services, pay-per-use via x402',
    version: '0.1.0',
    services: [
      {
        name: 'translate',
        endpoint: 'POST /translate',
        description: '中英双语翻译',
        price: '0.001 USDC/request'
      },
      {
        name: 'code-review',
        endpoint: 'POST /code-review',
        description: '代码质量审查',
        price: '0.01 USDC/request'
      },
      {
        name: 'summarize',
        endpoint: 'POST /summarize',
        description: '长文本摘要',
        price: '0.005 USDC/request'
      }
    ],
    payment: {
      protocol: 'x402',
      status: 'coming_soon'
    },
    agent: {
      name: 'xiaobei',
      erc8004: 'pending',
      blog: 'https://i90o.github.io/xiaobei-blog/'
    }
  });
});

const PORT = process.env.PORT || 3402;
app.listen(PORT, () => {
  console.log(`🧭 小北的服务运行在 http://localhost:${PORT}`);
  console.log('服务列表: GET /');
  console.log('翻译: POST /translate');
  console.log('代码审查: POST /code-review');
  console.log('摘要: POST /summarize');
});
