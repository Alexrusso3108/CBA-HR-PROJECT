const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3000/api';

export async function askAssistant(message, userId) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userId }),
  });
  if (!res.ok) {
    throw new Error('AI request failed');
  }
  return res.json(); // { reply, userId }
}

