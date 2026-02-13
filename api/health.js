/**
 * Health check endpoint (免费)
 */
module.exports = (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "xiaobei-services",
    wallet: "0xda53D50572B8124A6B9d6d147d532Db59ABe0610",
  });
};
