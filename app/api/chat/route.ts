import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json(); // リクエストボディをJSONとして読む
  const { message } = body; // ユーザー入力受取

  const cityInfo = `
    自治体情報: 東京でプラスチックごみはリサイクルに出してください。燃えるごみは毎週火曜日です。
    質問に答える。
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: cityInfo },
        { role: 'user', content: message }
      ],
    });

    const responseText = completion.choices[0].message.content;

    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: responseText,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    return new Response(JSON.stringify({ text: responseText, audio: audioBuffer.toString('base64') }), {
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