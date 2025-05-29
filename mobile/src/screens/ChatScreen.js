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
  Surface, 
  Avatar, 
  ActivityIndicator,
  IconButton,
  Title,
  Menu,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUser, conversationTitle } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Mesajları okundu olarak işaretle
    chatService.markMessagesAsRead(conversationId).catch(console.error);
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getMessages(conversationId);
      
      // Mesajları ters çevir (en yeniler en alta)
      setMessages(response.messages.reverse() || []);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Optimistic update
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      content: text,
      sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      createdAt: new Date().toISOString(),
      messageType: 'text',
      isTemp: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await chatService.sendMessage(conversationId, text);
      
      // Replace temp message with real message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id).concat(response.message));
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Bugün';
    } else if (diffInDays === 1) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  const getAvatarText = (user) => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  const MessageBubble = ({ message, isMe }) => (
    <View style={[
      styles.messageBubble,
      isMe ? styles.myMessage : styles.otherMessage
    ]}>
      {!isMe && (
        <Avatar.Text
          size={32}
          label={getAvatarText(message.sender)}
          style={styles.messageAvatar}
        />
      )}
      
      <Surface style={[
        styles.messageContent,
        isMe ? styles.myMessageContent : styles.otherMessageContent,
        message.isTemp && styles.tempMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </Text>
        <Text style={[
          styles.messageTime,
          isMe ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(message.createdAt)}
          {message.isTemp && ' ⏳'}
        </Text>
      </Surface>
      
      {isMe && (
        <Avatar.Text
          size={32}
          label={getAvatarText(user)}
          style={styles.messageAvatar}
        />
      )}
    </View>
  );

  const DateSeparator = ({ date }) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateSeparatorLine} />
      <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
      <View style={styles.dateSeparatorLine} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Avatar.Text
            size={40}
            label={getAvatarText(otherUser)}
            style={styles.headerAvatar}
          />
          <View>
            <Title style={styles.headerTitle}>
              {`${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || conversationTitle}
            </Title>
            <Text style={styles.headerSubtitle}>
              {otherUser?.isOnline ? 'Çevrimiçi' : 'Son görülme bilinmiyor'}
            </Text>
          </View>
        </View>

        <Menu
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              iconColor={colors.text.primary}
              onPress={() => setIsMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setIsMenuVisible(false);
              Alert.alert('Bilgi', 'Bu özellik yakında eklenecek');
            }} 
            title="Konuşma Bilgileri" 
            leadingIcon="information"
          />
          <Menu.Item 
            onPress={() => {
              setIsMenuVisible(false);
              Alert.alert('Bilgi', 'Bu özellik yakında eklenecek');
            }} 
            title="Bildirimleri Kapat" 
            leadingIcon="bell-off"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setIsMenuVisible(false);
              Alert.alert('Uyarı', 'Bu özellik yakında eklenecek');
            }} 
            title="Konuşmayı Sil" 
            leadingIcon="delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
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
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="chat" size={64} color={colors.text.disabled} />
              <Title style={styles.emptyTitle}>Konuşma başlıyor</Title>
              <Text style={styles.emptyText}>
                {`${otherUser?.firstName || 'Kullanıcı'} ile konuşmanızı başlatmak için bir mesaj gönderin`}
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const isMe = message.sender._id === user._id;
              const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
              
              return (
                <View key={message._id}>
                  {showDateSeparator && (
                    <DateSeparator date={message.createdAt} />
                  )}
                  <MessageBubble message={message} isMe={isMe} />
                </View>
              );
            })
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
            maxLength={1000}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor="transparent"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <IconButton
            icon="send"
            size={24}
            iconColor={inputText.trim() ? colors.primary : colors.text.disabled}
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 16,
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
    flex: 1,
  },
  headerAvatar: {
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateSeparatorText: {
    paddingHorizontal: spacing.md,
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.background,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  myMessageContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  otherMessageContent: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.xs,
  },
  tempMessage: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.onPrimary,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  myMessageTime: {
    color: colors.onPrimary,
    opacity: 0.8,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.text.secondary,
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