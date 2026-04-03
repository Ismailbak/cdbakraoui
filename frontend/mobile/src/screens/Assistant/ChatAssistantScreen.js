import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, KeyboardAvoidingView,
  Platform, TouchableOpacity, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendChatMessage } from '../../api/api';
import { colors, fonts, spacing, radius, shadows } from '../../styles/theme';
import Input from '../../components/common/Input';

const SUGGESTED_PROMPTS = [
  '🩺 Signes de la polyarthrite rhumatoïde ?',
  '💊 Traitement de l\'arthrose',
  '🔬 Interpréter un bilan inflammatoire',
  '📋 Protocole de suivi rhumatologique',
];

export default function ChatAssistantScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user', text: userMsg },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await sendChatMessage(userMsg);
      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: res.data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), role: 'error', text: "Erreur de connexion avec l'assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, messages]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'error';

    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : isError ? styles.errorBubble : styles.aiBubble,
      ]}>
        {!isUser && (
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>{isError ? '⚠️' : '🤖'}</Text>
            <Text style={styles.aiLabel}>{isError ? 'Erreur' : 'MedAI'}</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          isUser && styles.userText,
          isError && styles.errorText,
        ]}>
          {String(item.text)}
        </Text>
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeIcon}>{'🤖'}</Text>
      <Text style={styles.welcomeTitle}>{'Assistant MedAI'}</Text>
      <Text style={styles.welcomeSubtitle}>
        {'Posez vos questions médicales en rhumatologie. Je suis là pour vous aider.'}
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>{'Suggestions :'}</Text>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <TouchableOpacity
            key={String(i)}
            style={styles.suggestionChip}
            onPress={() => sendMessage(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 20 }}>{'🤖'}</Text>
        </View>
        <View>
          <Text style={[styles.headerTitle, isSmall && { fontSize: 18 }]}>{'Assistant IA'}</Text>
          <Text style={styles.headerSub}>
            {loading ? 'En train de répondre...' : 'En ligne · Rhumatologie'}
          </Text>
        </View>
        {loading && <ActivityIndicator style={{ marginLeft: 'auto' }} color={colors.primary} />}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? renderWelcome() : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="Posez votre question..."
              value={input}
              onChangeText={setInput}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>{'➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginRight: spacing.md,
  },
  headerTitle: { ...fonts.subheading, fontSize: 18 },
  headerSub: { ...fonts.caption, marginTop: 1 },
  // Chat
  chatContainer: { flex: 1 },
  messagesList: { padding: spacing.lg, paddingBottom: spacing.md },
  messageBubble: {
    maxWidth: '85%', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start', backgroundColor: colors.surface,
    borderBottomLeftRadius: 4, ...shadows.card,
  },
  errorBubble: {
    alignSelf: 'flex-start', backgroundColor: colors.error + '10',
    borderLeftWidth: 3, borderLeftColor: colors.error,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  aiIcon: { fontSize: 14, marginRight: spacing.xs },
  aiLabel: { ...fonts.label, fontSize: 10, color: colors.primary },
  messageText: { ...fonts.body, color: colors.textPrimary, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  errorText: { color: colors.error },
  // Welcome
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  welcomeIcon: { fontSize: 64, marginBottom: spacing.md },
  welcomeTitle: { ...fonts.heading, fontSize: 24, textAlign: 'center' },
  welcomeSubtitle: {
    ...fonts.body, textAlign: 'center', marginTop: spacing.sm,
    marginBottom: spacing.xl, lineHeight: 22,
  },
  suggestionsContainer: { width: '100%' },
  suggestionsLabel: { ...fonts.label, marginBottom: spacing.sm },
  suggestionChip: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  suggestionText: { ...fonts.body, color: colors.textPrimary },
  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  inputWrapper: { flex: 1, marginRight: spacing.sm },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, justifyContent: 'center',
    alignItems: 'center', marginBottom: 0,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: 20 },
});
