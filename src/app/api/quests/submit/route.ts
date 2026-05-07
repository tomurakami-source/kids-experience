import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Paths resolved from Next.js project root (kids-experience/app)
const QUESTS_FILE = join(process.cwd(), 'src', 'data', 'quests.json');
const PROGRESS_FILE = join(process.cwd(), '..', 'data', 'user_progress.json');

interface Quest {
  id: number;
  title: string;
  photo_criteria: string;
}

interface UserProgress {
  achieved_quest_ids: number[];
}

interface JudgeResult {
  success: boolean;
  feedback: string;
}

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function loadProgress(): UserProgress {
  try {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8')) as UserProgress;
  } catch {
    return { achieved_quest_ids: [] };
  }
}

function saveProgress(progress: UserProgress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      questId: number;
      imageData: string;
      mediaType?: string;
    };

    const { questId, imageData, mediaType = 'image/jpeg' } = body;

    if (!questId || !imageData) {
      return Response.json(
        { error: 'questId と imageData は必須です', success: false, feedback: '' },
        { status: 400 },
      );
    }

    // Load quest data
    const questFile = JSON.parse(readFileSync(QUESTS_FILE, 'utf-8')) as { quests: Quest[] };
    const quest = questFile.quests.find((q) => q.id === Number(questId));
    if (!quest) {
      return Response.json(
        { error: 'クエストが見つかりません', success: false, feedback: '' },
        { status: 404 },
      );
    }

    // Check if already completed
    const progress = loadProgress();
    if (progress.achieved_quest_ids.includes(Number(questId))) {
      return Response.json({
        success: true,
        feedback: 'このクエストはもうクリア済みだよ！すごいね！',
        alreadyCompleted: true,
      });
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY が設定されていません', success: false, feedback: '' },
        { status: 500 },
      );
    }

    // Call Claude claude-sonnet-4-6 Vision
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const judgePrompt = `あなたは子供の冒険を応援する判定員です。この画像が、以下の「証明写真の条件」を満たしているか判定してください。

【クエスト名】
${quest.title}

【証明写真の条件】
${quest.photo_criteria}

【判定のルール】
- 条件を明らかに満たしている場合は success: true
- 子供が一生懸命挑戦した様子が伝わるなら、少し不完全でも success: true でOK
- 画像が全く関係ない内容の場合は success: false
- feedback は5〜12歳の子供向けに、日本語で励ますように書く（成功なら褒める、失敗なら優しく次への期待を込める）
- feedbackは50文字以内にする

必ずこのJSON形式だけで返してください（説明文は不要）:
{"success": true, "feedback": "メッセージ"}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as ImageMediaType,
                data: imageData,
              },
            },
            { type: 'text', text: judgePrompt },
          ],
        },
      ],
    });

    // Parse JSON from response
    const rawText =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    let result: JudgeResult = {
      success: false,
      feedback: 'うまく判定できなかった…もう一度やってみよう！',
    };

    try {
      const match = rawText.match(/\{[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as JudgeResult;
        result = {
          success: Boolean(parsed.success),
          feedback: String(parsed.feedback ?? result.feedback),
        };
      }
    } catch {
      // use default result
    }

    // Persist progress on success
    if (result.success) {
      progress.achieved_quest_ids = [
        ...new Set([...progress.achieved_quest_ids, Number(questId)]),
      ];
      saveProgress(progress);
    }

    return Response.json(result);

  } catch (err) {
    console.error('[/api/quests/submit]', err);
    return Response.json(
      {
        success: false,
        feedback: 'エラーが起きちゃった！もう一度試してみてね。',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
