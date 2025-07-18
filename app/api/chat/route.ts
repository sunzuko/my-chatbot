import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const body = await req.json();
  const { message } = body;

  const cityInfo = `
    自治体情報: 以下は行方市の地理、地形、歴史、沿革の概要です。この情報を基に、ユーザーの質問に正確で自然な日本語で応答してください。情報が不足する場合、推測せず「詳細は公式HPをご確認ください」と答えてください。

- 地理・位置: 行方市は茨城県東南部に位置し、東京都心から約70km、水戸市から約40km。面積166.33km² (湖含む222.48km²)。北: 鉾田市・小美玉市、南: 潮来市、東: 北浦、西: 霞ヶ浦。東西約12km、南北約24km。
- 地形・自然: 西側霞ヶ浦沿岸は低地でなだらか、東側北浦沿岸は起伏富む。内陸部は標高30mの丘陵台地 (行方台地)。霞ヶ浦湖岸の一部は水郷筑波国定公園指定で美しい景観。未来展望: 茨城空港開港で観光活性化、東関東自動車道水戸線で首都圏連携強化、地域経済発展期待。
- 沿革 (旧麻生町): 
  昭和30年: 合併で麻生町誕生。初町議会、町長選挙 (高野勝氏)、幼稚園開設、合併祝賀式。
  昭和31年: 町議選、行方小学校上棟、国保全町実施。
  昭和32年: 国保病棟完成、観光協会発足、町民体育大会、農業祭。
  昭和33年: 小高小学校新校舎、国保病棟、有線放送施設、台風被害。
  昭和34年: 町長再選、支所廃止、大和第三小学校上棟。
  昭和35年: 公衆電話、町議選。
  昭和36年: 国保診療所経営移管、自動電話。
  昭和37年: 交通安全協会、交通安全都市宣言。
  昭和38年: 老人福祉センター完成、鹿行大橋着工。
  昭和39年: 農業空中散布、農協有線放送、合併10周年、鹿行大橋着工。
  昭和40年: 津澄小学校完成、教職員住宅、母子健康センター、農集電話。
  昭和41年: 要小学校完成、北浦中プール。
  昭和42年: 町長選 (高柳庄次郎氏)、国際電信電話開局。
  昭和43年: 老人休養ホーム、鹿行大橋開通。
  昭和44年: 議員定数削減、老人休養ホーム。
  昭和45年: 給食センター、津澄体育館。
  昭和46年: 勢司村長就任、農協合併、公民館完成。
  昭和47年: バイパス開通。
  昭和48年: 幼稚園開園、商工会館、農協本所。
  昭和49年: 芸術祭、小貫体育館、柔剣道場。
  昭和50年: 村長再選、合併20周年、幼稚園開園、土地改良区。
  昭和51年: 行方北部消防署、長期総合計画。
  昭和52年: 河野村長就任、老人福祉センター移管、村民運動会。
  昭和53年: 福祉法人保育園、役場新庁舎、山田簡易水道。
  昭和54年: 自給肥料センター。
  昭和55年: 新城小学校改称。
  昭和56年: 村長再選。
  昭和57年: 繁昌簡易水道。
  昭和58年: 県道バイパス。
  昭和59年: 議員定数削減。
  昭和60年: 磯山村長就任、科学万博「北浦村の日」、村民憲章制定。
  昭和61年: 農業委員定数削減、ふれあいの郷計画。
  昭和62年: 中学校サッカー全国大会。
  昭和63年: 南・北高岡水道。
  平成元年: 村長再選、ふれあいフェスティバル。
  平成2年: ふれあいの郷着工。
  平成3年: 都市計画区域、独ヴィルゲス市交流。
  平成4年: 残土条例、複合団地構想。
  平成5年: 村長3期目、公民館完成。
  平成6年: ふれあいの郷完成、ヴィルゲス交流、複合団地協定。
  平成7年: 霞ヶ浦聖苑、ふるさとステージ。
  平成8年: 議員定数削減、道106号開通、長期総合計画、津澄体育館。
  平成9年: 村長4期目、保健福祉センター着工、町制施行。
  平成10年: 保健福祉センター、「北浦ふれあい音頭」。
  平成11年: 新エネルギービジョン、介護保険、広域シルバーセンター、総合病院開院、完納宣言。
  平成12年: 都市計画マスタープラン。
  平成13年: 伊藤町長就任、道107号完成、町史編さん。
  平成14年: 道102号完成、給食センター。
  平成15年: 水道普及、北浦荘新装、中学校新校舎。
  平成16年: 合併協議会、ふるさと記念碑、みず菜銘柄指定、町長2期目。
- 沿革 (旧北浦町): (同様の年表形式で追加、詳細省略のため要約) 昭和30年合併から平成16年まで、村長交代、学校建設、水道、公民館、福祉施設、合併協議などの歴史。
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