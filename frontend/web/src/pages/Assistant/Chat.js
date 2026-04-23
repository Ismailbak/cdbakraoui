import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, getChatHistory } from '../../api/api';
import { FiSend, FiLoader, FiAlertCircle, FiCheckCircle, FiEdit3, FiTrash2, FiChevronDown, FiCopy, FiRefreshCw, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import './Chat.css';

// Utility formatters extracted out of component to avoid re-creations
const formatTimeAgo = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
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

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

// Robust timestamp validation
const isValidDate = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  return d && !isNaN(d.getTime());
};

const parseTimestamp = (dateString) => {
  return isValidDate(dateString) ? new Date(dateString) : new Date();
};

// Granular error message parsing
const parseErrorMessage = (error) => {
  // Network or timeout errors
  if (!error.response) {
    if (error.name === 'AbortError') {
      return 'Requête annulée. Veuillez réessayer.';
    }
    return 'Erreur réseau. Vérifiez votre connexion et réessayez.';
  }

  // 4xx client errors
  if (error.response.status >= 400 && error.response.status < 500) {
    if (error.response.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (error.response.status === 403) return 'Accès refusé.';
    if (error.response.status === 404) return 'Ressource non trouvée.';
    if (error.response.status === 422) return 'Données invalides. Vérifiez votre saisie.';
    return error.response.data?.detail || 'Erreur client. Réessayez.';
  }

  // 5xx server errors
  if (error.response.status >= 500) {
    return 'Serveur temporairement indisponible. Réessayez dans quelques instants.';
  }

  return error.response.data?.detail || 'Erreur lors de la communication avec l\'IA.';
};

// Exponential backoff retry strategy
const getRetryDelay = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s delay
};

const shouldRetry = (error, attempt, maxRetries = 3) => {
  if (attempt >= maxRetries) return false;
  
  // Retry on network errors (no response) or server errors (5xx)
  if (!error.response) return true;
  if (error.response.status >= 500) return true;
  
  // Don't retry client errors (4xx)
  return false;
};

function Chat({ patientId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null); // Per-message copy feedback
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(null);
  
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  const loadChatHistory = useCallback(async (filterByDate = null) => {
    try {
      const res = await getChatHistory(patientId);
      if (!res?.data) return;

      let filteredData = res.data;
      if (filterByDate) {
        filteredData = res.data.filter(msg => {
          if (!isValidDate(msg.created_at)) return false;
          const msgDate = new Date(msg.created_at).toLocaleDateString('fr-FR');
          return msgDate === filterByDate;
        });
      }

      const history = filteredData.flatMap(msg => [
        {
          id: msg.id ? `${msg.id}-user` : generateId(),
          role: 'user',
          content: msg.message || '',
          timestamp: parseTimestamp(msg.created_at),
          feedback: null
        },
        {
          id: msg.id ? `${msg.id}-assistant` : generateId(),
          role: 'assistant',
          content: msg.response || 'No response available.',
          tokens: msg.tokens_used || 0,
          model: msg.model || 'Unknown',
          timestamp: parseTimestamp(msg.created_at),
          feedback: null
        }
      ]).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(history);
      
      // Extract unique sessions (group by date)
      const sessions = [];
      const dateGroups = {};
      res.data.forEach(msg => {
        if (!isValidDate(msg.created_at)) return;
        const date = new Date(msg.created_at).toLocaleDateString('fr-FR');
        if (!dateGroups[date]) {
          dateGroups[date] = msg;
          sessions.push({
            date,
            timestamp: parseTimestamp(msg.created_at),
            preview: msg.message ? msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : '') : 'Empty message'
          });
        }
      });
      setChatSessions(sessions.reverse().slice(0, 10));
      setError('');
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // We don't overwhelm UX with global error for history fail, just log it.
    }
  }, [patientId]);

  // Load chat history on component mount / patient change
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Cleanup pending requests and timeouts on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Smart Auto-scroll: Only scroll to bottom if user is already near bottom
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // If we're within 100px of the bottom, or just started (few messages), scroll down automatically.
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isNearBottom || messages.length <= 2) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Manage scroll locking on mobile when sidebar is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  const handleCopyMessage = async (messageId, content) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        // Clear any previous timeout and set copied state for this specific message
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        setCopiedMessageId(messageId);
        copyTimeoutRef.current = setTimeout(() => setCopiedMessageId(null), 2000);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fails silently for user to avoid annoying pop-up if they lack permissions
    }
  };

  const internalHandleSend = async (textToSend, retryCount = 0, maxRetries = 3) => {
    if (!textToSend.trim() || loading) return;

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const currentMsgId = generateId();
    
    const userMsg = {
      id: currentMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await sendChatMessage(
        textToSend,
        currentUser?.id,
        patientId,
        'fr', // Message is resolved by AI language detection
        { signal: abortControllerRef.current.signal }
      );

      const aiMsg = {
        id: generateId(),
        role: 'assistant',
        content: res?.data?.response || "Le serveur n'a pas renvoyé de réponse valide.",
        tokens: res?.data?.tokens || 0,
        model: res?.data?.model || 'Unknown',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log("Request aborted.");
        return; 
      }

      // Check if we should retry with exponential backoff
      if (shouldRetry(err, retryCount, maxRetries)) {
         const delay = getRetryDelay(retryCount);
         console.warn(`Retrying request in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
         // Remove the optimistic user message to re-insert it cleanly
         setMessages(prev => prev.filter(m => m.id !== currentMsgId));
         setLoading(false);
         // Wait before retrying
         await new Promise(resolve => setTimeout(resolve, delay));
         return internalHandleSend(textToSend, retryCount + 1, maxRetries);
      }

      const errorMsg = parseErrorMessage(err);
      setError(errorMsg);
      // Provide an actionable button in the message to retry it instead of just pure error
      const errorChatMsg = {
        id: generateId(),
        role: 'error',
        content: errorMsg,
        timestamp: new Date(),
        failedPrompt: textToSend
      };
      setMessages(prev => [...prev, errorChatMsg]);
      
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
         setLoading(false);
         abortControllerRef.current = null;
      }
    }
  };

  const handleSend = () => internalHandleSend(input);

  const handleRegenerateMessage = (messageId) => {
    // Find the nearest preceding user message
    const msgIndex = messages.findIndex(m => m.id === messageId);
    let targetPrompt = null;
    
    for (let i = msgIndex; i >= 0; i--) {
      if (messages[i].role === 'user') {
        targetPrompt = messages[i].content;
        break;
      }
    }

    if (targetPrompt) {
      if (loading) return; // Prevent concurrent requests
      internalHandleSend(targetPrompt);
    }
  };

  const handleRetryFailed = (promptText, msgId) => {
    // Remove error message and retry
    setMessages(prev => prev.filter(m => m.id !== msgId));
    internalHandleSend(promptText);
  };

  const handleFeedback = (messageId, feedbackType) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    );
    // TODO: Wire to backend when feedback endpoint is ready
    // await submitFeedback(messageId, feedbackType);
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setMessages([]);
    setInput('');
    setError('');
    setShowNewChatConfirm(false);
    setLoading(false);
  };

  const handleLoadChat = (session) => {
    setShowHistoryDropdown(false);
    setSidebarOpen(false); // Close sidebar after selection
    setLoadingSession(session.date);
    // Filter and load messages for the selected session date
    loadChatHistory(session.date).then(() => {
      setLoadingSession(null);
    }).catch(err => {
      console.error('Failed to load chat session:', err);
      setLoadingSession(null);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="chat-container"
    >
      {/* Sidebar Overlay - Mobile only */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="presentation"
      />

      {/* Sidebar with History */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <button 
            className="sidebar-toggle-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer la barre latérale"
          >
            ✕
          </button>
        </div>
        
        <button 
          className="new-chat-btn-sidebar"
          onClick={() => setShowNewChatConfirm(true)}
          aria-label="Démarrer un nouveau chat"
        >
          <FiEdit3 size={16} aria-hidden="true" /> Nouveau Chat
        </button>

        <div className="history-list-sidebar">
          {chatSessions.length > 0 ? (
            chatSessions.map((session, idx) => (
              <button 
                key={idx}
                className="history-item-sidebar"
                onClick={() => handleLoadChat(session)}
                title={session.preview}
                aria-label={`Charger la session du ${session.date}`}
              >
                <span className="history-date-sidebar">{session.date}</span>
                <span className="history-preview-sidebar">{session.preview}</span>
              </button>
            ))
          ) : (
            <div className="history-empty-sidebar">Aucune conversation</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-toolbar">
          <button 
            className="sidebar-toggle-open"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir l'historique"
            title="Ouvrir l'historique"
          >
            ☰
          </button>
          
          <div className="toolbar-center">
             <span className="assistant-badge">ASSISTANT IA</span>
          </div>
          
          <div className="doctor-context">
            <span className="context-label">DR.</span>
            <span className="doctor-name">{((currentUser?.last_name || currentUser?.username) || 'DOCTEUR').toUpperCase()}</span>
          </div>
        </div>

      <div className="messages-area" ref={scrollContainerRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">💬</div>
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
            <div className="message-avatar" aria-hidden="true">
              {msg.role === 'user' ? '👤' : msg.role === 'error' ? '⚠️' : '🤖'}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
              
              {msg.role === 'error' && msg.failedPrompt && (
                <button 
                  className="retry-btn"
                  onClick={() => handleRetryFailed(msg.failedPrompt, msg.id)}
                >
                  <FiRefreshCw className="retry-icon"/> Réessayer
                </button>
              )}

              {msg.role === 'assistant' && (
                <div className="message-meta">
                  <div>
                    {msg.tokens ? (
                      <>
                        <span className="tokens">🔹 {msg.tokens} tokens</span>
                        <span className="model" style={{marginLeft: '0.5rem'}}>{msg.model}</span>
                      </>
                    ) : (
                      <span className="tokens">Métadonnées indisponibles</span>
                    )}
                  </div>
                  <span className="message-time">
                    {msg.timestamp && !isNaN(msg.timestamp.getTime()) ? `${msg.timestamp.getHours().toString().padStart(2, '0')}:${msg.timestamp.getMinutes().toString().padStart(2, '0')}` : ''}
                  </span>
                </div>
              )}
              
              {msg.role === 'user' && (
                <span className="message-time">
                  {msg.timestamp && !isNaN(msg.timestamp.getTime()) ? `${msg.timestamp.getHours().toString().padStart(2, '0')}:${msg.timestamp.getMinutes().toString().padStart(2, '0')}` : ''}
                </span>
              )}
              
              {msg.role === 'assistant' && (
                <div className="message-actions">
                  <button 
                    className={`message-action-btn copy-btn ${copiedMessageId === msg.id ? 'copied' : ''}`}
                    title="Copier le message" 
                    aria-label="Copier le message"
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                  >
                    {copiedMessageId === msg.id ? <FiCheckCircle /> : <FiCopy />}
                  </button>
                  <button 
                    className="message-action-btn regenerate-btn" 
                    title="Regénérer la réponse" 
                    aria-label="Regénérer la réponse"
                    onClick={() => handleRegenerateMessage(msg.id)}
                    disabled={loading}
                  >
                    <FiRefreshCw />
                  </button>
                  <div className="message-feedback">
                    <button 
                      className={`feedback-btn ${msg.feedback === 'like' ? 'active' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'like')}
                      title="Réponse utile"
                      aria-label="Marquer comme utile"
                    >
                      <FiThumbsUp size={14} />
                    </button>
                    <button 
                      className={`feedback-btn ${msg.feedback === 'dislike' ? 'active' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'dislike')}
                      title="Réponse non utile"
                      aria-label="Marquer comme non utile"
                    >
                      <FiThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-loading" aria-live="polite">
            <div className="message-avatar" aria-hidden="true">⏳</div>
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
        <div className="error-banner" role="alert">
          <FiAlertCircle /> 
          <span>{error}</span>
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
            maxLength={2000}
            rows="3"
            aria-label="Zone de saisie de message"
          />
          <div className="input-footer">
            <span className={`char-count ${input.length >= 2000 ? 'char-count-limit' : ''}`}>
              {input.length} / 2000 caractères
            </span>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="send-btn"
          aria-label="Envoyer le message"
        >
          {loading ? <FiLoader className="spinning" aria-hidden="true" /> : <FiSend aria-hidden="true" />}
        </button>
      </div>

      <div className="chat-footer">
        <p>⚕️ Assisté par BioMistral · Cette IA fournie des suggestions, pas des diagnostics définitifs</p>
      </div>

      {showNewChatConfirm && (
        <div className="modal-backdrop" onClick={() => setShowNewChatConfirm(false)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="new-chat-title">
            <h3 id="new-chat-title">Démarrer une nouvelle conversation?</h3>
            <p>Les messages actuels seront effacés de la vue.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowNewChatConfirm(false)}>
                Annuler
              </button>
              <button className="btn-confirm" onClick={handleNewChat}>
                Nouveau Chat
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Chat;
