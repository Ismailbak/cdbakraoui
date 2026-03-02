import React, { useState, useRef, useEffect } from 'react';
import {
  FiSend, FiMic, FiPaperclip, FiUser, FiCpu, FiMessageSquare,
  FiFileText, FiCalendar, FiActivity, FiHelpCircle, FiRefreshCw,
  FiThumbsUp, FiThumbsDown, FiCopy, FiMoreVertical, FiTrash2
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import './AssistantPage.css';

// Move initialMessages inside the component so it can use dynamic data

// Suggested prompts
const suggestedPrompts = [
  {
    icon: <FiFileText />,
    title: 'Résumer un dossier',
    prompt: 'Résume le dossier médical de Mohamed Alami'
  },
  {
    icon: <FiActivity />,
    title: 'Suggérer un traitement',
    prompt: 'Quels traitements recommandes-tu pour une polyarthrite rhumatoïde modérée ?'
  },
  {
    icon: <FiCalendar />,
    title: 'Planifier un suivi',
    prompt: 'Quand devrais-je revoir un patient sous Méthotrexate ?'
  },
  {
    icon: <FiHelpCircle />,
    title: 'Aide au diagnostic',
    prompt: 'Patient avec douleurs articulaires symétriques et raideur matinale, quels examens ?'
  }
];

// Sample AI responses
const sampleResponses = {
  'résumer': `📋 **Résumé du dossier - Mohamed Alami**

**Informations générales:**
- Âge: 45 ans, Homme
- Suivi depuis: Mars 2024

**Diagnostic principal:**
Polyarthrite rhumatoïde séropositive (FR+, Anti-CCP+)

**Traitement actuel:**
- Méthotrexate 15mg/semaine
- Acide folique 5mg/semaine
- Prednisone 5mg/jour (en sevrage)

**Dernière consultation (03/02/2026):**
- DAS28: 3.2 (activité modérée)
- VS: 28 mm/h, CRP: 12 mg/L
- Amélioration des douleurs articulaires

**Prochaines étapes recommandées:**
1. Contrôle biologique dans 4 semaines
2. Envisager ajout d'un biologique si pas d'amélioration
3. Radiographies des mains à 6 mois`,

  'traitement': `💊 **Recommandations thérapeutiques - Polyarthrite rhumatoïde modérée**

**Première ligne:**
- **Méthotrexate** : 15-25 mg/semaine (voie orale ou SC)
- Associer acide folique 5-10 mg/semaine

**En cas d'intolérance au MTX:**
- Leflunomide 20 mg/jour
- Sulfasalazine 2-3 g/jour

**Si réponse insuffisante après 3-6 mois:**
- Ajouter une biothérapie :
  - Anti-TNF (Adalimumab, Etanercept)
  - Tocilizumab (anti-IL6)
  - Abatacept

**Surveillance recommandée:**
- NFS, bilan hépatique, créatinine : tous les 3 mois
- Radiographies annuelles
- DAS28 à chaque consultation

⚠️ *Ces recommandations sont indicatives. Adapter selon le profil du patient.*`,

  'suivi': `📅 **Planning de suivi - Patient sous Méthotrexate**

**Surveillance biologique:**
- **Mois 1-3**: NFS + bilan hépatique tous les 15 jours
- **Mois 3-6**: Contrôle mensuel
- **Après 6 mois**: Tous les 2-3 mois si stable

**Consultations recommandées:**
- Première réévaluation: **4-6 semaines** après initiation
- Évaluation d'efficacité: **3 mois**
- Si bonne réponse: Suivi **trimestriel**

**Points de vigilance:**
- ⚠️ Cytolyse hépatique > 3N → Suspendre
- ⚠️ Leucopénie < 3000 → Avis spécialisé
- ⚠️ Toux sèche → Évoquer pneumopathie

**Vaccinations:**
- Grippe annuelle
- Pneumocoque tous les 5 ans
- Éviter vaccins vivants`,

  'diagnostic': `🔍 **Aide au diagnostic - Douleurs articulaires symétriques**

**Éléments en faveur d'une polyarthrite rhumatoïde:**
- Atteinte symétrique
- Raideur matinale > 30 min
- Atteinte des MCP, IPP, poignets

**Bilan recommandé:**

**Biologie:**
- VS, CRP (syndrome inflammatoire)
- Facteur rhumatoïde (FR)
- Anticorps anti-CCP (spécificité ++)
- NFS, bilan rénal et hépatique

**Imagerie:**
- Radiographies mains + pieds (face)
- Échographie articulaire si disponible
- IRM si doute diagnostique

**Critères ACR/EULAR 2010:**
Score ≥ 6 = PR définie

| Critère | Points |
|---------|--------|
| ≥1 articulation moyenne/grosse | 0-5 |
| Sérologie (FR/CCP) | 0-3 |
| Durée ≥ 6 semaines | 1 |
| Inflammation biologique | 1 |

*Souhaitez-vous que je calcule le score pour un patient ?*`
};

function AssistantPage() {
  // Retrieve user info from localStorage to personalize greeting
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName =
    user.specialty === 'medecine-interne' && (user.last_name || user.lastName)
      ? `Dr. ${user.last_name || user.lastName}`
      : user.username || user.name || user.email || 'Docteur';

  const initialMessages = [
    {
      id: 1,
      type: 'assistant',
      content: `Bonjour ${userName} ! 👋 Je suis votre assistant IA médical. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognitionError, setRecognitionError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        // If we want to append to existing text, we could do prev + currentTranscript
        // but for a clean dictation, we'll just set it to the current spoken phrase.
        setInputValue((prev) => {
          // Append only final results to avoid replacing user's manually typed text completely
          if (event.results[event.results.length - 1].isFinal) {
            return prev.trim() + (prev.trim() ? ' ' : '') + currentTranscript;
          }
          // For interim, we'll just show it. A more robust implementation would separate interim and final.
          return currentTranscript;
        });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError('Accès au microphone refusé.');
        } else {
          setRecognitionError(`Erreur audio: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionError('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Recording Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('résume') || lowerMessage.includes('dossier')) {
      return sampleResponses['résumer'];
    } else if (lowerMessage.includes('traitement') || lowerMessage.includes('recommand')) {
      return sampleResponses['traitement'];
    } else if (lowerMessage.includes('suivi') || lowerMessage.includes('revoir') || lowerMessage.includes('méthotrexate')) {
      return sampleResponses['suivi'];
    } else if (lowerMessage.includes('diagnostic') || lowerMessage.includes('examen') || lowerMessage.includes('douleur')) {
      return sampleResponses['diagnostic'];
    } else {
      return `Je comprends votre question concernant "${userMessage.substring(0, 50)}...". 

Pour vous aider au mieux, pourriez-vous préciser :
- S'agit-il d'un patient spécifique ?
- Avez-vous besoin d'une recommandation thérapeutique ?
- Cherchez-vous des informations sur un diagnostic ?

Je suis là pour vous assister dans vos décisions cliniques. 🩺`;
    }
  };

  const handleSend = (messageText = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: getAIResponse(messageText),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt) => {
    handleSend(prompt);
  };

  const clearChat = () => {
    setMessages(initialMessages);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate sending a file analysis request
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `📁 Document joint : ${file.name}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // AI Response for file
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: `J'ai bien reçu le document "${file.name}". Je l'ai analysé virtuellement. Avez-vous une question spécifique concernant ces résultats ?`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleRecording = () => {
    if (recognitionError && !recognitionRef.current) {
      alert(recognitionError);
      return;
    }

    if (isRecording) {
      // Stop recognition
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recognition
      try {
        setInputValue(''); // Clear input for new dictation
        setRecognitionError('');
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    }
  };

  return (
    <Layout>
      <div className="assistant-page">
        {/* Sidebar with suggestions */}
        <div className="assistant-sidebar">
          <div className="sidebar-header">
            <FiCpu className="ai-icon" />
            <div>
              <h3>RhumatoAI</h3>
              <span className="status">● En ligne</span>
            </div>
          </div>

          <div className="suggestions-section">
            <h4>Suggestions</h4>
            <div className="suggestions-list">
              {suggestedPrompts.map((item, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handlePromptClick(item.prompt)}
                >
                  <span className="suggestion-icon">{item.icon}</span>
                  <span className="suggestion-title">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="clear-chat-btn" onClick={clearChat}>
              <FiTrash2 />
              <span>Effacer la conversation</span>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-title">
              <FiMessageSquare />
              <div>
                <h2>Assistant IA</h2>
                <p>Posez vos questions médicales</p>
              </div>
            </div>
            <div className="chat-actions">
              <button className="refresh-btn" onClick={clearChat} title="Nouvelle conversation">
                <FiRefreshCw />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-container">
            {messages.length === 1 && (
              <div className="welcome-prompts">
                <p className="welcome-text">Essayez une de ces suggestions :</p>
                <div className="prompt-cards">
                  {suggestedPrompts.map((item, index) => (
                    <button
                      key={index}
                      className="prompt-card"
                      onClick={() => handlePromptClick(item.prompt)}
                    >
                      <span className="prompt-icon">{item.icon}</span>
                      <span className="prompt-title">{item.title}</span>
                      <span className="prompt-text">{item.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.type}`}
              >
                <div className="message-avatar">
                  {message.type === 'user' ? <FiUser /> : <FiCpu />}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.type === 'user' ? 'Vous' : 'RhumatoAI'}
                    </span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                  <div className="message-text">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  {message.type === 'assistant' && message.id !== 1 && (
                    <div className="message-actions">
                      <button className="action-btn" onClick={() => copyMessage(message.content)} title="Copier">
                        <FiCopy />
                      </button>
                      <button className="action-btn" title="Utile">
                        <FiThumbsUp />
                      </button>
                      <button className="action-btn" title="Pas utile">
                        <FiThumbsDown />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">
                  <FiCpu />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className={`input-wrapper ${isRecording ? 'recording' : ''}`}>
              {!isRecording && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    className="input-action-btn"
                    title="Joindre un fichier"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiPaperclip />
                  </button>
                </>
              )}

              {isRecording ? (
                <div className="recording-status">
                  <span className="recording-dot"></span>
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                  <span className="recording-text">Écoute en cours...</span>
                </div>
              ) : (
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={recognitionError ? recognitionError : "Posez votre question médicale..."}
                  rows={1}
                />
              )}

              <button
                className={`input-action-btn ${isRecording ? 'is-recording-btn' : ''}`}
                title={isRecording ? "Arrêter l'enregistrement" : "Message vocal"}
                onClick={toggleRecording}
              >
                <FiMic />
              </button>

              {!isRecording && (
                <button
                  className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                >
                  <FiSend />
                </button>
              )}
            </div>
            <p className="input-hint">
              💡 RhumatoAI peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AssistantPage;
