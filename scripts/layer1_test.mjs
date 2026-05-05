import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  // 鍵はプログラムに書かず、環境変数から読み込む設定にします
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

console.log("🚀 Layer 1: SDKテスト開始...");

try {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", // これが必要です！
    max_tokens: 1024,
    messages: [{ role: "user", content: "1+1は？（数字のみ）" }],
  });

  console.log("✅ 成功！ 回答:", message.content[0].text);
} catch (error) {
  console.error("❌ エラー詳細:", error.message);
}