import JSZip from 'jszip';
import { Quest, getDifficultyStars } from '@/components/questUtils';

interface CompletedData {
  photoUrl: string | null;
  aiComment: string | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'チュートリアル': '✌️',
  '自然・生存': '🌿',
  '社会・多様性': '🌍',
  '自立・経済': '💰',
  '精神・レジリエンス': '🔥',
  'デジタルリテラシー': '💻',
};

const CATEGORY_COLOR: Record<string, string> = {
  'チュートリアル': '#d97706',
  '自然・生存': '#059669',
  '社会・多様性': '#0284c7',
  '自立・経済': '#b45309',
  '精神・レジリエンス': '#e11d48',
  'デジタルリテラシー': '#7c3aed',
};

function buildHtml(
  adventurerName: string,
  quests: Quest[],
  completedData: Map<number, CompletedData>,
  photoFilenames: Map<number, string>,
): string {
  const completedCount = completedData.size;
  const totalCount = quests.length;
  const exportedAt = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const questCards = quests.map((quest) => {
    const data = completedData.get(quest.id);
    const isCompleted = !!data;
    const filename = photoFilenames.get(quest.id);
    const stars = '★'.repeat(getDifficultyStars(quest.difficulty)) + '☆'.repeat(3 - getDifficultyStars(quest.difficulty));
    const color = CATEGORY_COLOR[quest.category] ?? '#92400e';
    const emoji = CATEGORY_EMOJI[quest.category] ?? '📖';

    const photoSection = isCompleted && filename
      ? `<div class="photo-wrap">
           <img src="photos/${filename}" alt="${quest.title}の達成写真" />
           ${data?.aiComment ? `<div class="ai-comment">💬 ${data.aiComment}</div>` : ''}
         </div>`
      : `<div class="no-photo">
           <p class="no-photo-icon">🗺️</p>
           <p class="no-photo-text">まだ挑戦中...</p>
           <p class="quest-desc">${quest.description}</p>
         </div>`;

    return `
    <div class="quest-card ${isCompleted ? 'completed' : 'incomplete'}">
      <div class="quest-header" style="border-left: 5px solid ${color}">
        <div class="quest-meta">
          <span class="category-badge" style="background:${color}20; color:${color}">${emoji} ${quest.category}</span>
          <span class="stars">${stars}</span>
          ${isCompleted ? '<span class="cleared-badge">✓ クリア</span>' : ''}
        </div>
        <h2 class="quest-title">${quest.title}</h2>
        <p class="quest-id">Quest #${String(quest.id).padStart(2, '0')}</p>
      </div>
      ${photoSection}
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${adventurerName}の冒険の書</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Hiragino Mincho ProN', serif;
    background: #fef9ee;
    color: #1c1008;
    padding: 24px 16px;
  }
  .header {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #1a0a2e 0%, #0f3460 100%);
    border-radius: 20px;
    margin-bottom: 32px;
    color: #fde68a;
  }
  .header h1 { font-size: 2rem; font-weight: 900; margin-bottom: 8px; }
  .header .subtitle { font-size: 0.85rem; opacity: 0.7; margin-bottom: 16px; }
  .progress-bar-wrap { background: rgba(255,255,255,0.15); border-radius: 999px; height: 8px; max-width: 280px; margin: 0 auto 8px; }
  .progress-bar { height: 8px; border-radius: 999px; background: linear-gradient(90deg, #f59e0b, #d97706); }
  .progress-text { font-size: 1.1rem; font-weight: 700; }
  .export-date { font-size: 0.75rem; opacity: 0.5; margin-top: 12px; }

  .quest-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

  .quest-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.2s;
  }
  .quest-card.incomplete { opacity: 0.7; }
  .quest-header { padding: 16px 16px 12px; }
  .quest-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  .category-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
  .stars { font-size: 0.75rem; color: #d97706; letter-spacing: 1px; }
  .cleared-badge {
    font-size: 0.7rem; font-weight: 900; color: #fff;
    background: #dc2626; padding: 3px 8px; border-radius: 999px;
  }
  .quest-title { font-size: 1rem; font-weight: 900; line-height: 1.4; margin-bottom: 4px; }
  .quest-id { font-size: 0.7rem; color: #aaa; font-family: monospace; }

  .photo-wrap img { width: 100%; height: 220px; object-fit: cover; display: block; }
  .ai-comment {
    background: #fffbeb; padding: 10px 14px;
    font-size: 0.82rem; line-height: 1.6; color: #78350f;
    border-top: 1px solid #fde68a;
  }

  .no-photo {
    background: #f9f5eb; padding: 24px 16px;
    text-align: center; border-top: 1px solid #e5d9b6;
  }
  .no-photo-icon { font-size: 2rem; margin-bottom: 6px; }
  .no-photo-text { font-size: 0.8rem; color: #a16207; font-weight: 700; margin-bottom: 8px; }
  .quest-desc { font-size: 0.78rem; color: #78716c; line-height: 1.6; }

  @media print {
    body { background: white; }
    .quest-card { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <div style="font-size:3rem;margin-bottom:12px">📖</div>
    <h1>${adventurerName}の冒険の書</h1>
    <p class="subtitle">Season 1: Global Adventure</p>
    <div class="progress-bar-wrap">
      <div class="progress-bar" style="width:${Math.round((completedCount / totalCount) * 100)}%"></div>
    </div>
    <p class="progress-text">${completedCount} / ${totalCount} クエスト達成</p>
    <p class="export-date">${exportedAt} 時点のアルバム</p>
  </div>

  <div class="quest-list">
    ${questCards}
  </div>
</body>
</html>`;
}

export async function exportAlbum(
  adventurerName: string,
  quests: Quest[],
  completedData: Map<number, CompletedData>,
): Promise<void> {
  const zip = new JSZip();
  const photosFolder = zip.folder('photos')!;
  const photoFilenames = new Map<number, string>();

  // Download photos in parallel
  await Promise.all(
    quests.map(async (quest) => {
      const data = completedData.get(quest.id);
      if (!data?.photoUrl) return;
      try {
        const res = await fetch(data.photoUrl);
        if (!res.ok) return;
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        const filename = `quest-${String(quest.id).padStart(2, '0')}.${ext}`;
        photosFolder.file(filename, blob);
        photoFilenames.set(quest.id, filename);
      } catch {
        // skip failed photo
      }
    }),
  );

  const html = buildHtml(adventurerName, quests, completedData, photoFilenames);
  zip.file('index.html', html);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${adventurerName}の冒険の書.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
