import { useState } from 'react';
import { askAssistant } from '../api/aiClient';
import { useAuth } from '../context/AuthContext';

export default function AiAssistantPanel() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const mine = { from: 'you', text };
    setMessages((prev) => [...prev, mine]);
    setInput('');
    setLoading(true);
    try {
      const { reply } = await askAssistant(text, user?.id ?? null);
      setMessages((prev) => [...prev, { from: 'ai', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: 'ai', text: 'Sorry, AI service is unavailable right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, height: 420, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>AI Assistant</div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#94a3b8' }}>
            Ask anything about HR policies, leave rules, performance reviews, or how to use this portal.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              textAlign: m.from === 'you' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '6px 10px',
                borderRadius: 12,
                background: m.from === 'you' ? '#4f46e5' : '#f1f5f9',
                color: m.from === 'you' ? '#fff' : '#0f172a',
                maxWidth: '90%',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          style={{
            flex: 1,
            borderRadius: 999,
            border: '1px solid #cbd5e1',
            padding: '6px 10px',
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            borderRadius: 999,
            border: 'none',
            padding: '6px 14px',
            background: '#4f46e5',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

