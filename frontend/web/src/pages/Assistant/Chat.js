import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory } from '../../api/api';
import { FiSend, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './Chat.css';

function Chat({ patientId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('fr');
  const messageEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, [patientId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const res = await getChatHistory(patientId);
      const history = res.data.map(msg => ({
        id: msg.id,
        role: 'user',
        content: msg.message,
        timestamp: new Date(msg.created_at)
      })).concat(res.data.map(msg => ({
        id: msg.id,
        role: 'assistant',
        content: msg.response,
        tokens: msg.tokens_used,
        timestamp: new Date(msg.created_at)
      }))).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(history);
      setError('');
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to UI immediately
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await sendChatMessage(
        input,
        currentUser?.id,
        patientId,
        language
      );

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        tokens: res.data.tokens,
        model: res.data.model,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error getting response from AI';
      setError(errorMsg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'error',
        content: errorMsg,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Assistat Médical IA</h2>
        <div className="language-selector">
          <label>Langue:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Posez une question à l'assistant médical IA</p>
            <div className="quick-tips">
              <p className="tips-title">Exemples:</p>
              <ul>
                <li>"Quel est le traitement pour la polyarthrite rhumatoïde?"</li>
                <li>"Quand devrais-je revoir ce patient?"</li>
                <li>"Quels examens recommander?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : msg.role === 'error' ? '⚠️' : '🤖'}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
              {msg.role === 'assistant' && msg.tokens > 0 && (
                <div className="message-meta">
                  <span className="tokens">🔹 {msg.tokens} tokens</span>
                  <span className="model">{msg.model}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-loading">
            <div className="message-avatar">⏳</div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {error && (
        <div className="error-banner">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre question... (Shift+Entrée pour nouvelle ligne)"
          disabled={loading}
          rows="3"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          {loading ? <FiLoader className="spinning" /> : <FiSend />}
        </button>
      </div>

      <div className="chat-footer">
        <p>⚕️ Assisté par BioMistral · Cette IA fournie des suggestions, pas des diagnostics définitifs</p>
      </div>
    </div>
  );
}

export default Chat;

