import React, { useState, useEffect } from 'react';
import {
  listPatientChatSessions,
  createChatSession,
  deleteChatSession,
} from '../../../api/api';
import './ChatSessions.css';

const ChatSessions = ({ patientId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [patientId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await listPatientChatSessions(patientId);
      setSessions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load chat sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await createChatSession(patientId, newTitle || undefined);
      setNewTitle('');
      setShowCreateForm(false);
      fetchSessions();
    } catch (err) {
      setError('Failed to create session');
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Delete this chat session?')) {
      try {
        await deleteChatSession(sessionId);
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }
        fetchSessions();
      } catch (err) {
        setError('Failed to delete session');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="chat-sessions-container">Loading sessions...</div>;

  return (
    <div className="chat-sessions-container">
      <div className="sessions-header">
        <h2>Chat Sessions</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateSession} className="create-session-form">
          <input
            type="text"
            placeholder="Session title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Create
          </button>
        </form>
      )}

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No chat sessions yet</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${
                selectedSession?.id === session.id ? 'active' : ''
              }`}
              onClick={() => setSelectedSession(session)}
            >
              <div className="session-info">
                <h3>{session.title}</h3>
                <p className="session-date">
                  {new Date(session.created_at).toLocaleString()}
                </p>
              </div>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.id);
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {selectedSession && (
        <ChatSessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

const ChatSessionDetail = ({ session, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [session.id]);

  const fetchMessages = async () => {
    try {
      const { getSessionMessages } = await import('../../../api/api');
      const response = await getSessionMessages(session.id);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const { addMessageToSession } = await import('../../../api/api');
      await addMessageToSession(session.id, 'user', newMessage);
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-session-detail">
      <div className="detail-header">
        <h3>{session.title}</h3>
        <button onClick={onClose} className="btn-close">
          ✕
        </button>
      </div>

      <div className="messages-container">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-role">{msg.role}</div>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn-send" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatSessions;
