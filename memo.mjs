import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const memoFilePath = path.join(__dirname, 'memo.txt');

function getMemoText() {
  const args = process.argv.slice(2);
  return args.join(' ');
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

function appendMemo(text) {
  if (!text.trim()) {
    console.log('Error: Please provide a memo text');
    process.exit(1);
  }

  const timestamp = getCurrentDate();
  const entry = `[${timestamp}] ${text}\n`;

  try {
    fs.appendFileSync(memoFilePath, entry, 'utf8');
    console.log('Memo saved successfully');
  } catch (error) {
    console.error('Error saving memo:', error.message);
    process.exit(1);
  }
}

const memoText = getMemoText();
appendMemo(memoText);
