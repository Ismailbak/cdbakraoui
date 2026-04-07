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
      const history = res.data.flatMap(msg => [
        {
          id: `${msg.id}-user`,
          role: 'user',
          content: msg.message,
          timestamp: new Date(msg.created_at)
        },
        {
          id: `${msg.id}-assistant`,
          role: 'assistant',
          content: msg.response,
          tokens: msg.tokens_used,
          model: msg.model,
          timestamp: new Date(msg.created_at)
        }
      ]).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(history);
      setError('');
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDateSeparator = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupMessagesByDate = (msgs) => {
    const grouped = [];
    let lastDate = null;
    
    msgs.forEach(msg => {
      const msgDate = msg.timestamp.toDateString();
      if (lastDate !== msgDate) {
        grouped.push({ type: 'date-separator', date: msg.timestamp });
        lastDate = msgDate;
      }
      grouped.push(msg);
    });
    
    return grouped;
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const handleRegenerateMessage = (messageId) => {
    // Find the last user message and regenerate response
    console.log('Regenerate:', messageId);
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
                  <div>
                    <span className="tokens">🔹 {msg.tokens} tokens</span>
                    <span className="model" style={{marginLeft: '0.5rem'}}>{msg.model}</span>
                  </div>
                  <span className="message-time">{msg.timestamp ? `${msg.timestamp.getHours().toString().padStart(2, '0')}:${msg.timestamp.getMinutes().toString().padStart(2, '0')}` : ''}</span>
                </div>
              )}
              {msg.role === 'user' && (
                <span className="message-time">{msg.timestamp ? `${msg.timestamp.getHours().toString().padStart(2, '0')}:${msg.timestamp.getMinutes().toString().padStart(2, '0')}` : ''}</span>
              )}
              {msg.role === 'assistant' && (
                <div className="message-actions">
                  <button className="message-action-btn" title="Copy" onClick={() => handleCopyMessage(msg.content)}>
                    📋
                  </button>
                  <button className="message-action-btn" title="Regenerate" onClick={() => handleRegenerateMessage(msg.id)}>
                    🔄
                  </button>
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
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre question... (Shift+Entrée pour nouvelle ligne)"
            disabled={loading}
            rows="3"
          />
          <div className="input-footer">
            <span className="char-count">{input.length} caractères</span>
          </div>
        </div>
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

