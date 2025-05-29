import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface, 
  Avatar, 
  ActivityIndicator,
  IconButton,
  Title,
  Chip,
  Card
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatService } from '../services/chatService';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [popularTopics, setPopularTopics] = useState([]);
  const scrollViewRef = useRef(null);

  const quickActions = [
    { key: 'vehicle_rental', label: 'Araç Kiralama', icon: 'directions-car' },
    { key: 'ride_sharing', label: 'Yolculuk Paylaşımı', icon: 'directions' },
    { key: 'pricing', label: 'Fiyatlar', icon: 'payment' },
    { key: 'security', label: 'Güvenlik', icon: 'security' },
    { key: 'how_to_use', label: 'Nasıl Kullanılır', icon: 'help' }
  ];

  useEffect(() => {
    initializeChatbot();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const initializeChatbot = async () => {
    try {
      // Hoş geldin mesajı
      const welcomeMessage = {
        id: Date.now(),
        content: 'Merhaba! Ben TakDrive AI asistanıyım. Size nasıl yardımcı olabilirim?',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: []
      };
      setMessages([welcomeMessage]);

      // Popüler konuları getir
      const topics = await chatService.getPopularTopics();
      setPopularTopics(topics || []);
    } catch (error) {
      console.error('Chatbot initialization error:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputText.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessageToAI(text, {});
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          content: response.message,
          sender: 'ai',
          timestamp: new Date(),
          suggestions: response.suggestions || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || 'AI yanıt vermedi');
      }
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Üzgünüm, şu anda size yardımcı olamıyorum. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionKey) => {
    const quickMessages = {
      'vehicle_rental': 'Araç kiralama konusunda yardım istiyorum',
      'ride_sharing': 'Yolculuk paylaşımı hakkında bilgi alabilir miyim?',
      'pricing': 'Fiyatlar hakkında bilgi verebilir misiniz?',
      'security': 'Güvenlik konusunda nelere dikkat etmeliyim?',
      'how_to_use': 'Platform nasıl kullanılır?'
    };

    if (quickMessages[actionKey]) {
      sendMessage(quickMessages[actionKey]);
    }
  };

  const handleTopicClick = (topic) => {
    sendMessage(topic.description || topic.title || topic);
  };

  const formatMessageContent = (content) => {
    // Temizlik işlemleri
    let cleanContent = content
      .replace(/VEHICLE_ID:[a-f0-9]{24}/g, '')
      .replace(/RIDE_ID:[a-f0-9]{24}/g, '')
      .replace(/\*\s*\*\*VEHICLE_ID:\*\*[^*]*\*/g, '')
      .replace(/\*\s*\*\*RIDE_ID:\*\*[^*]*\*/g, '')
      .trim();

    return cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  };

  const MessageBubble = ({ message }) => (
    <View style={[
      styles.messageBubble,
      message.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={styles.messageHeader}>
        <Avatar.Icon
          size={36}
          icon={message.sender === 'user' ? 'account' : 'robot'}
          style={[
            styles.messageAvatar,
            message.sender === 'user' ? styles.userAvatar : styles.aiAvatar
          ]}
        />
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      <Surface style={[
        styles.messageContent,
        message.sender === 'user' ? styles.userMessageContent : styles.aiMessageContent
      ]}>
        <Text style={[
          styles.messageText,
          message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}>
          {formatMessageContent(message.content)}
        </Text>
      </Surface>

      {/* AI suggestions */}
      {message.sender === 'ai' && message.suggestions && message.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {message.suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              mode="outlined"
              onPress={() => sendMessage(suggestion)}
              style={styles.suggestionChip}
              textStyle={styles.suggestionText}
            >
              {suggestion}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerInfo}>
          <Avatar.Icon
            size={40}
            icon="robot"
            style={styles.botAvatar}
          />
          <View>
            <Title style={styles.headerTitle}>TakDrive AI</Title>
            <Text style={styles.headerSubtitle}>Asistan</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <Card style={styles.quickActionsCard}>
              <Card.Content>
                <Title style={styles.quickActionsTitle}>Hızlı Erişim</Title>
                <Text style={styles.quickActionsSubtitle}>
                  Size nasıl yardımcı olabilirim?
                </Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <Surface
                      key={action.key}
                      style={styles.quickActionButton}
                      onTouchEnd={() => handleQuickAction(action.key)}
                    >
                      <MaterialIcons 
                        name={action.icon} 
                        size={24} 
                        color={colors.primary} 
                      />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </Surface>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Surface style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>AI yanıt yazıyor...</Text>
              </Surface>
            </View>
          )}

          {/* Popular Topics */}
          {popularTopics.length > 0 && messages.length <= 1 && (
            <Card style={styles.topicsCard}>
              <Card.Content>
                <Title style={styles.topicsTitle}>Popüler Konular</Title>
                <View style={styles.topicsContainer}>
                  {popularTopics.slice(0, 5).map((topic, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      onPress={() => handleTopicClick(topic)}
                      style={styles.topicChip}
                    >
                      {topic.title || topic}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        {/* Input Area */}
        <Surface style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={colors.text.disabled}
            multiline
            maxLength={500}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />
          <IconButton
            icon="send"
            size={24}
            iconColor={inputText.trim() ? colors.primary : colors.text.disabled}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={styles.sendButton}
          />
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  botAvatar: {
    backgroundColor: colors.primary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  quickActionsCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  quickActionsSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: '45%',
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text.primary,
    textAlign: 'center',
  },
  messageBubble: {
    marginBottom: spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  messageAvatar: {
    width: 32,
    height: 32,
  },
  userAvatar: {
    backgroundColor: colors.primary,
  },
  aiAvatar: {
    backgroundColor: colors.secondary,
  },
  messageTime: {
    fontSize: 11,
    color: colors.text.disabled,
  },
  messageContent: {
    maxWidth: '85%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  userMessageContent: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  aiMessageContent: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.onPrimary,
  },
  aiMessageText: {
    color: colors.text.primary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    maxWidth: '85%',
  },
  suggestionChip: {
    backgroundColor: colors.surface,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  topicsCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topicChip: {
    backgroundColor: colors.primaryOverlay,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.background,
  },
  sendButton: {
    margin: 0,
  },
}); 