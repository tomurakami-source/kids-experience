import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memoFilePath = path.join(__dirname, 'memo.txt');

function addMemo(message) {
  if (!message) {
    console.error('メモの内容を入力してください');
    process.exit(1);
  }

  const now = new Date();
  const dateString = now.toLocaleString('ja-JP');
  const entry = `[${dateString}] ${message}\n`;

  fs.appendFileSync(memoFilePath, entry, 'utf8');
  console.log('メモを保存しました:', message);
}

const args = process.argv.slice(2);
const message = args.join(' ');

addMemo(message);
