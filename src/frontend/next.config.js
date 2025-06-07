/**
 * 如果你使用 "output: export"（靜態匯出），不能用 `next start`，要用 `npx serve out`
 * 若要用 `next start`，請移除或註解掉 `output: "export"` 設定
 */
const nextConfig = {
  // output: "export", // ← 註解或移除這行
};

module.exports = nextConfig;