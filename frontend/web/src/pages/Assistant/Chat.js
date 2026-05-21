import React, { useState, useRef, useEffect } from 'react';
import { deleteChatHistoryItem, getChatHistory, sendChatMessage } from '../../api/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiCopy,
  FiFileText,
  FiLoader,
  FiMessageSquare,
  FiMic,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTarget,
  FiTrash2,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import './Chat.css';

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

const parseErrorMessage = (error) => {
  if (!error.response) {
    if (error.name === 'AbortError') return 'Requête annulée. Veuillez réessayer.';
    return 'Erreur réseau. Vérifiez votre connexion et réessayez.';
  }
  if (error.response.status >= 400 && error.response.status < 500) {
    if (error.response.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (error.response.status === 403) return 'Accès refusé.';
    if (error.response.status === 404) return 'Ressource non trouvée.';
    if (error.response.status === 422) return 'Données invalides. Vérifiez votre saisie.';
    return error.response.data?.detail || 'Erreur client. Réessayez.';
  }

  if (error.response.status >= 500) return 'Serveur temporairement indisponible. Réessayez dans quelques instants.';
  return error.response.data?.detail || 'Erreur lors de la communication avec l\'IA.';
};

const suggestions = [
  {
    icon: FiFileText,
    title: 'Résumer un dossier',
    description: 'Résume le dossier médical de Mohamed Alami',
    prompt: 'Résume le dossier médical de Mohamed Alami',
  },
  {
    icon: FiActivity,
    title: 'Suggérer un traitement',
    description: 'Quels traitements recommanderais-tu pour une polyarthrite rhumatoïde modérée ?',
    prompt: 'Quels traitements recommanderais-tu pour une polyarthrite rhumatoïde modérée ?',
  },
  {
    icon: FiCalendar,
    title: 'Planifier un suivi',
    description: 'Quand devrais-je revoir un patient sous Méthotrexate ?',
    prompt: 'Quand devrais-je revoir un patient sous Méthotrexate ?',
  },
  {
    icon: FiTarget,
    title: 'Aide au diagnostic',
    description: 'Patient avec douleurs articulaires symétriques et raideur matinale, quels examens ?',
    prompt: 'Patient avec douleurs articulaires symétriques et raideur matinale, quels examens ?',
  },
];

function Chat({ patientId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const messageEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError('');
        const res = await getChatHistory(patientId, 30);
        if (isMounted) setHistoryItems(res.data || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        if (isMounted) setHistoryError("Impossible de charger l'historique.");
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleCopyMessage = async (messageId, content) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        setCopiedMessageId(messageId);
        copyTimeoutRef.current = setTimeout(() => setCopiedMessageId(null), 2000);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const internalHandleSend = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

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
        patientId,
        'fr',
        { signal: abortControllerRef.current.signal }
      );

      const aiMsg = {
        id: generateId(),
        role: 'assistant',
        content: res?.data?.response || "Le serveur n'a pas renvoyé de réponse valide.",
        tokens: res?.data?.tokens || res?.data?.metadata?.tokens || 0,
        model: res?.data?.model || res?.data?.metadata?.model || 'RhumatoAI',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      setHistoryItems(prev => [{
        id: currentMsgId,
        message: textToSend,
        response: aiMsg.content,
        tokens_used: aiMsg.tokens,
        model_name: aiMsg.model,
        created_at: userMsg.timestamp.toISOString(),
      }, ...prev.filter(item => item.message !== textToSend).slice(0, 29)]);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log("Request aborted.");
        return; 
      }

      const errorMsg = parseErrorMessage(err);
      setError(errorMsg);
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

  const handleRetryFailed = (promptText, msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    internalHandleSend(promptText);
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setMessages([]);
    setInput('');
    setError('');
    setLoading(false);
    setSelectedHistoryId(null);
  };

  const handleSelectHistory = (item) => {
    const timestamp = new Date(item.created_at);
    const safeTimestamp = isNaN(timestamp.getTime()) ? new Date() : timestamp;

    setMessages([
      {
        id: `${item.id}-user`,
        role: 'user',
        content: item.message,
        timestamp: safeTimestamp,
      },
      {
        id: `${item.id}-assistant`,
        role: 'assistant',
        content: item.response,
        tokens: item.tokens_used,
        model: item.model_name || 'RhumatoAI',
        timestamp: safeTimestamp,
      },
    ]);
    setSelectedHistoryId(item.id);
    setInput('');
    setError('');
  };

  const requestDeleteHistory = (event, item) => {
    event.stopPropagation();
    setDeleteTarget(item);
  };

  const handleConfirmDeleteHistory = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    const previousItems = historyItems;
    setDeleteTarget(null);
    setHistoryItems(prev => prev.filter(historyItem => historyItem.id !== target.id));

    if (selectedHistoryId === target.id) {
      handleNewChat();
    }

    if (typeof target.id === 'number') {
      try {
        await deleteChatHistoryItem(target.id);
      } catch (err) {
        console.error('Failed to delete chat history item:', err);
        setHistoryItems(previousItems);
        setHistoryError('Impossible de supprimer cette conversation.');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp || isNaN(timestamp.getTime())) return '';
    return `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatHistoryDate = (dateValue) => {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const doctorLabel = ((currentUser?.last_name || currentUser?.username) || 'En ligne');

  return (
    <div className="assistant-shell">
      <aside className="assistant-rail">
        <div className="assistant-status-card">
          <div className="assistant-status-icon">
            <FiActivity />
          </div>
          <div>
            <strong>RhumatoAI</strong>
            <span>En ligne</span>
          </div>
          <span className="assistant-status-dot" aria-label="Assistant en ligne" />
        </div>

        <button className="assistant-new-chat-btn" onClick={handleNewChat} disabled={loading}>
          <FiPlus />
          Nouvelle conversation
        </button>

        <div className="assistant-history-header">
          <div>
            <p className="assistant-rail-label">Mes conversations</p>
            <span><FiUser /> {doctorLabel}</span>
          </div>
        </div>

        <div className="assistant-history-list">
          {historyLoading && (
            <div className="assistant-history-state">
              <FiLoader className="spinning" />
              <span>Chargement...</span>
            </div>
          )}

          {!historyLoading && historyError && (
            <div className="assistant-history-state assistant-history-error">
              <FiAlertCircle />
              <span>{historyError}</span>
            </div>
          )}

          {!historyLoading && !historyError && historyItems.length === 0 && (
            <div className="assistant-history-empty">
              <FiMessageSquare />
              <span>Aucune conversation récente</span>
            </div>
          )}

          {!historyLoading && !historyError && historyItems.map((item) => (
            <div
              key={item.id}
              className={`assistant-history-row ${selectedHistoryId === item.id ? 'active' : ''}`}
            >
              <button
                className="assistant-history-item"
                onClick={() => handleSelectHistory(item)}
                title={item.message}
              >
                <span className="assistant-history-title">{item.message}</span>
                <span className="assistant-history-meta">
                  <FiClock />
                  {formatHistoryDate(item.created_at)}
                </span>
              </button>
              <button
                className="assistant-history-delete"
                onClick={(event) => requestDeleteHistory(event, item)}
                aria-label="Supprimer la conversation"
                title="Supprimer"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="assistant-panel">
        <header className="assistant-header">
          <div className="assistant-title-block">
            <h1>Assistant IA</h1>
            <p>Posez vos questions médicales</p>
          </div>
          <div className="assistant-header-actions">
            <span>{doctorLabel}</span>
            <button onClick={handleNewChat} aria-label="Nouvelle conversation">
              <FiRefreshCw />
            </button>
          </div>
        </header>

        <main className="assistant-conversation">
          {messages.length === 0 && !loading && (
            <div className="assistant-welcome">
              <p className="assistant-suggestion-kicker">Essayez une de ces suggestions :</p>
              <div className="assistant-suggestion-grid">
                {suggestions.map(({ icon: Icon, title, description, prompt }) => (
                  <button key={title} onClick={() => internalHandleSend(prompt)}>
                    <span className="suggestion-icon"><Icon /></span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="assistant-message-list">
            {messages.length === 0 && !loading && (
              <div className="assistant-message assistant-message-bot assistant-intro-message">
                <div className="assistant-avatar"><FiActivity /></div>
                <div className="assistant-bubble">
                  <div className="assistant-message-heading">
                    <strong>RhumatoAI</strong>
                    <span>{formatMessageTime(new Date())}</span>
                  </div>
                  <p>Bonjour Dr. {doctorLabel} ! Je suis votre assistant IA médical. Comment puis-je vous aider aujourd'hui ?</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`assistant-message assistant-message-${msg.role}`}>
                <div className="assistant-avatar">
                  {msg.role === 'user' ? 'DR' : msg.role === 'error' ? <FiAlertCircle /> : <FiActivity />}
                </div>
                <div className="assistant-bubble">
                  <div className="assistant-message-heading">
                    <strong>{msg.role === 'user' ? 'Vous' : msg.role === 'error' ? 'Erreur' : 'RhumatoAI'}</strong>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                  </div>
                  <p>{msg.content}</p>
                  {msg.role === 'error' && msg.failedPrompt && (
                    <button className="assistant-retry-btn" onClick={() => handleRetryFailed(msg.failedPrompt, msg.id)}>
                      <FiRefreshCw /> Réessayer
                    </button>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="assistant-message-tools">
                      <span>{msg.model || 'RhumatoAI'}</span>
                      {msg.tokens ? <span>{msg.tokens} tokens</span> : null}
                      <button onClick={() => handleCopyMessage(msg.id, msg.content)}>
                        <FiCopy /> {copiedMessageId === msg.id ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="assistant-message assistant-message-bot" aria-live="polite">
                <div className="assistant-avatar"><FiLoader className="spinning" /></div>
                <div className="assistant-bubble assistant-loading-bubble">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </main>

        {error && (
          <div className="assistant-error-banner" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <footer className="assistant-composer-wrap">
          <div className="assistant-composer">
            <button type="button" className="composer-icon-btn" aria-label="Joindre un fichier">
              <FiPaperclip />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question médicale..."
              disabled={loading}
              maxLength={2000}
              rows="1"
              aria-label="Zone de saisie de message"
            />
            <button type="button" className="composer-icon-btn" aria-label="Dictée vocale">
              <FiMic />
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="composer-send-btn"
              aria-label="Envoyer le message"
            >
              {loading ? <FiLoader className="spinning" aria-hidden="true" /> : <FiSend aria-hidden="true" />}
            </button>
          </div>
          <p><FiZap /> RhumatoAI peut faire des erreurs. Vérifiez les informations importantes.</p>
        </footer>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la conversation"
        message="Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible."
        onConfirm={handleConfirmDeleteHistory}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Chat;
