<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Node.js固有のAPIは使わず、Edge準拠で実装して。特にSupabaseのクライアント作成時は @supabase/ssr を使って、Cookieの扱いをWorkersランタイムに最適化させてね。