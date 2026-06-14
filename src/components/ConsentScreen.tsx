'use client';

import { motion } from 'framer-motion';

const CONSENT_KEY = 'adventure_book_consented';

export function hasConsented(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

export default function ConsentScreen({ onConsent }: { onConsent: () => void }) {
  function handleConsent() {
    localStorage.setItem(CONSENT_KEY, 'true');
    onConsent();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(160deg, #1a0a2e 0%, #16213e 40%, #0f3460 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, #fefaed 0%, #fdf4d8 100%)',
            border: '3px solid rgba(146,64,14,0.3)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 py-6 text-center"
            style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f3460 100%)' }}
          >
            <div className="text-4xl mb-2">📜</div>
            <h1 className="text-lg font-black text-amber-200" style={{ fontFamily: 'Georgia, serif' }}>
              はじめにお読みください
            </h1>
            <p className="text-amber-400/70 text-xs mt-1">保護者の方へ</p>
          </div>

          <div className="px-7 py-6 space-y-5 text-sm text-amber-950/80 leading-relaxed">

            <section className="space-y-1.5">
              <h2 className="font-black text-amber-900 flex items-center gap-1.5">
                <span>📋</span> 収集する情報と目的
              </h2>
              <ul className="space-y-1 pl-2 text-xs">
                <li><span className="font-bold">メールアドレス</span> — ログイン認証のみに使用します</li>
                <li><span className="font-bold">クエスト達成時の写真</span> — AIによる達成判定にのみ使用します</li>
              </ul>
              <p className="text-xs text-amber-800/60">広告・マーケティング・第三者提供には使用しません。</p>
            </section>

            <section className="space-y-1.5">
              <h2 className="font-black text-amber-900 flex items-center gap-1.5">
                <span>☁️</span> データの保管について
              </h2>
              <p className="text-xs">
                メールアドレスと写真はクラウドに保存されます。アプリ内のプロフィール削除機能を使うと、そのプロフィールに紐づく写真・記録はすべて削除されます。
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="font-black text-amber-900 flex items-center gap-1.5">
                <span>⚠️</span> 安全について
              </h2>
              <p className="text-xs">
                火おこし・野草採取・一人での外出など、一部のクエストには怪我や事故のリスクが伴います。必ず保護者が同伴・監督した上で実施してください。クエスト中に生じた事故・怪我について、開発者は責任を負いません。
              </p>
            </section>

          </div>

          <div className="px-7 pb-7">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConsent}
              className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
                boxShadow: '0 4px 20px rgba(180,83,9,0.4)',
              }}
            >
              同意して冒険を始める ✨
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
