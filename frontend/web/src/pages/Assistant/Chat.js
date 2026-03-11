import React, { useState } from 'react';
import { sendChatMessage } from '../../api/api';

function Chat({ patientId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');

    try {
      const res = await sendChatMessage(input, patientId);
      const aiMsg = { role: 'ai', text: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error getting response' }]);
    }
  };

  return (
    <div>
      <h3>Chat</h3>
      <div>
        {messages.map((m, i) => (
          <div key={i}><b>{m.role}:</b> {m.text}</div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default Chat;
