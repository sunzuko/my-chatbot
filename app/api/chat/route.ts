import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json();
  const { message } = body;

  const cityInfo = `
    自治体情報: 東京でプラスチックごみはリサイクルに出してください。燃えるごみは毎週火曜日です。
    質問に答える。
  `;

  try {
    // GPTでテキスト生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: cityInfo },
        { role: 'user', content: message }
      ],
    });

    const responseText = completion.choices[0].message.content || '';

    // TTSで音声生成 (MP3)
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // 自然な声 (日本語OK)
      input: responseText,
    });

    // MP3をbase64に変換
    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    // テキスト + base64返却
    return new Response(JSON.stringify({ text: responseText, audio: audioBase64 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'OpenAIエラー: ' + (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}