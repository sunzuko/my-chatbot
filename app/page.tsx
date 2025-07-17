'use client';

import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]); // チャットログ管理

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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力（例: ごみの出し方？）"
          style={{ width: '100%' }}
        />
        <button type="submit">送信</button>
      </form>
    </div>
  );
}