import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

// Vercel: allow up to 60s for Claude Vision + Storage upload
export const maxDuration = 60;

interface JudgeResult {
  success: boolean;
  feedback: string;
}

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      questId: number;
      imageData: string;
      mediaType?: string;
      profileId: string;
      debugForceSuccess?: boolean;
    };

    const { questId, imageData, mediaType = 'image/jpeg', profileId, debugForceSuccess } = body;

    if (questId == null || !imageData || !profileId) {
      return Response.json(
        { error: 'questId, imageData, profileId は必須です', success: false, feedback: '' },
        { status: 400 },
      );
    }

    const isLocal = profileId === 'local';
    const supabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Supabase auth & duplicate check (skipped in local mode)
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
    if (!isLocal && supabaseConfigured) {
      supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return Response.json({ error: 'Unauthorized', success: false, feedback: '' }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        return Response.json({ error: 'Profile not found', success: false, feedback: '' }, { status: 404 });
      }

      const { data: existing } = await supabase
        .from('quest_logs')
        .select('id, photo_url, ai_comment')
        .eq('profile_id', profileId)
        .eq('quest_id', questId)
        .eq('status', 'completed')
        .single();

      if (existing) {
        return Response.json({
          success: true,
          feedback: 'このクエストはもうクリア済みだよ！すごいね！',
          alreadyCompleted: true,
          photoUrl: existing.photo_url ?? null,
          aiComment: existing.ai_comment ?? null,
        });
      }
    }

    // Find quest from Supabase
    const supabaseForQuest = await createClient();
    const { data: questRow } = await supabaseForQuest
      .from('quests')
      .select('title, criteria')
      .eq('id', Number(questId))
      .single();
    if (!questRow) {
      return Response.json(
        { error: 'クエストが見つかりません', success: false, feedback: '' },
        { status: 404 },
      );
    }
    const quest = {
      title: questRow.title as string,
      photo_criteria: (questRow.criteria as Record<string, string>)?.photo_criteria ?? '',
    };

    // DEV: force success without calling Claude Vision (development only)
    if (debugForceSuccess && process.env.NODE_ENV === 'development') {
      const devResult: JudgeResult = { success: true, feedback: '[DEV] デバッグ達成' };
      if (supabase) {
        await supabase
          .from('quest_logs')
          .upsert(
            { profile_id: profileId, quest_id: Number(questId), status: 'completed',
              photo_url: null, ai_comment: devResult.feedback, completed_at: new Date().toISOString() },
            { onConflict: 'profile_id,quest_id' },
          );
      }
      return Response.json({ ...devResult, photoUrl: null });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY が設定されていません', success: false, feedback: '' },
        { status: 500 },
      );
    }

    // Claude Vision judgment
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const judgePrompt = `あなたは子供の冒険を全力で応援する優しい判定員です。この画像が以下の「証明写真の条件」をおおむね満たしているか判定してください。

【クエスト名】
${quest.title}

【証明写真の条件】
${quest.photo_criteria}

【判定のルール】
- 条件に少しでも関係する内容が写っていれば success: true にする
- 挑戦した様子が伝わればOK。完璧でなくてもよい
- 撮影者が大人でも子供でも関係なく条件だけで判定する
- 画像が条件と全く無関係な場合のみ success: false
- 迷ったら success: true にする（応援する気持ちを優先）
- feedback は日本語で50文字以内。成功なら思いきり褒める。失敗なら優しく次への期待を込める

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

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    console.log('[submit] imageDataLen:', imageData.length, 'mediaType:', mediaType);
    console.log('[submit] Claude rawText:', rawText);

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

    // Persist to Supabase on success (skipped in local mode)
    let photoUrl: string | null = null;
    if (result.success && supabase) {
      // Upload photo to Storage
      try {
        const binaryStr = atob(imageData);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const blob = new Blob([bytes], { type: mediaType });
        const storagePath = `${profileId}/${questId}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('quest-photos')
          .upload(storagePath, blob, { upsert: true, contentType: mediaType });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('quest-photos').getPublicUrl(storagePath);
          photoUrl = urlData.publicUrl;
        }
      } catch { /* storage failure is non-fatal */ }

      const { error: upsertError } = await supabase
        .from('quest_logs')
        .upsert(
          {
            profile_id: profileId,
            quest_id: Number(questId),
            status: 'completed',
            photo_url: photoUrl,
            ai_comment: result.feedback,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id,quest_id' },
        );
      if (upsertError) console.error('[quest_logs upsert]', upsertError);
    }

    return Response.json({ ...result, photoUrl });

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
