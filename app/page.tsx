'use client';

import React, { useState } from 'react';

export default function Home() {
  // --- 音声認識用ユーティリティ ------------------------------
const SpeechRecognition =
  (typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((window as any).SpeechRecognition ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition)) || null;

function startListening() {
  if (!SpeechRecognition) {
    alert('このブラウザは音声認識に対応していません');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (e: any) => {
    const transcript = e.results[0][0].transcript;
    setInput(transcript);                        // 入力欄に反映
    (document.getElementById('askForm') as HTMLFormElement)?.requestSubmit();
  };

  recognition.onerror = () => alert('音声認識に失敗しました');
  recognition.start();
}
// ------------------------------------------------------------

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([]); // チャットログ管理

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setMessages([...messages, { type: 'user', text: input }]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    setMessages([...messages, { type: 'bot', text: data.text }]);
// ブラウザ TTS で読み上げ
// ── 音声読み上げ（iOS 対応版）ここから ──
// ===== シンプル多言語 TTS =====
const utterance = new SpeechSynthesisUtterance(data.text);

// 1行だけの超ざっくり判定
utterance.lang = /[\u3040-\u30ff\u4e00-\u9fff]/.test(data.text)
  ? 'ja-JP'   // 日本語 or 漢字を含む → 日本語
  : 'en-US';  // それ以外 → 英語

speechSynthesis.cancel();      // キューをクリア（iOS対策）
speechSynthesis.speak(utterance);
// ===== ここまで =====


// 日本語ボイスがロードされるのを待ってから再生
const setVoiceAndSpeak = () => {
  const jpVoice = speechSynthesis.getVoices().find(v => v.lang === 'ja-JP');
  if (jpVoice) utterance.voice = jpVoice;   // Kyoko / Otoya など
  speechSynthesis.speak(utterance);
};

if (speechSynthesis.getVoices().length === 0) {
  // iOS は voices() が遅延ロード。イベントを一度だけ待つ
  speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
} else {
  setVoiceAndSpeak();
}
// ── 音声読み上げここまで ──


    const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
    audio.play();

    setInput('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>自治体チャットボット</h1>
      <div style={{ height: '200px', overflowY: 'auto', border: '1px solid gray' }}>
        {messages.map((m, i) => (
          <p key={i} style={{ color: m.type === 'bot' ? 'blue' : 'green' }}>
            {m.text}
          </p>
        ))}
      </div>
      <form id="askForm"  onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力（例: ごみの出し方？）"
          style={{ width: '100%' }}
        />
        <button type="submit">送信</button>
      </form>
      <button type="button" onClick={startListening} style={{ marginTop: 8 }}>
  🎤 話す
</button>

    </div>
  );
}