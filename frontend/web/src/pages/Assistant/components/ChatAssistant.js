import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, addMessageToSession, getSessionMessages } from '../../../api/api';
import './ChatAssistant.css';

const ChatAssistant = ({ patientId, sessionId = null, onSessionCreated = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const language = 'fr'; // Default language
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages();
    }
  }, [currentSessionId]);

  const loadSessionMessages = async () => {
    try {
      const response = await getSessionMessages(currentSessionId);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to display
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      temp: true,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      setLoading(true);

      let response;

      if (currentSessionId) {
        // Add to existing session
        await addMessageToSession(currentSessionId, 'user', userMessage);

        // Get AI response
        const aiResponse = await sendChatMessage(
          userMessage,
          localStorage.getItem('userId'),
          patientId,
          language
        );

        // Add AI response to session
        await addMessageToSession(
          currentSessionId,
          'assistant',
          aiResponse.data.response
        );

        // Reload messages
        await loadSessionMessages();
      } else {
        // Regular chat without session
        const aiResponse = await sendChatMessage(
          userMessage,
          localStorage.getItem('userId'),
          patientId,
          language
        );

        const tempAssistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: aiResponse.data.response,
          created_at: new Date().toISOString(),
          temp: true,
        };

        setMessages((prev) => [...prev, tempAssistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        created_at: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-assistant">
      <div className="chat-header-mini">
        <h3>Medical Assistant</h3>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation with the medical assistant</p>
            <p className="hint">Ask about patient conditions, treatments, or general medical information</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.role}`}>
              <div className="message-text">{msg.content}</div>
              {msg.error && <div className="message-error">⚠️ Error</div>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="message-input"
        />
        <button type="submit" disabled={loading} className="send-button">
          {loading ? '⏳' : '→'}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
