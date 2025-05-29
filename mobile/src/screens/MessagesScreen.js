import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Title, 
  Paragraph, 
  Badge,
  Searchbar,
  ActivityIndicator,
  Surface,
  IconButton,
  FAB
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function MessagesScreen({ navigation }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchConversations();
      } else {
        setIsLoading(false);
        Alert.alert(
          'Giriş Gerekli',
          'Mesajlarınızı görmek için giriş yapmanız gerekiyor.',
          [
            { text: 'Tamam', onPress: () => navigation.goBack() }
          ]
        );
      }
    }
  }, [authLoading, isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getConversations();
      
      // AI Chatbot'u listeye ekle
      const aiBot = {
        _id: 'ai-bot',
        isBot: true,
        title: 'TakDrive AI Asistanı',
        lastMessage: {
          content: 'Size nasıl yardımcı olabilirim?',
          sentAt: new Date()
        },
        unreadCount: 0,
        participants: [],
        otherParticipant: {
          firstName: 'TakDrive',
          lastName: 'AI',
          avatar: null
        }
      };

      setConversations([aiBot, ...(response.conversations || [])]);
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error);
      Alert.alert('Hata', 'Konuşmalar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getAvatarText = (participant) => {
    if (!participant) return 'AI';
    return `${participant.firstName?.[0] || ''}${participant.lastName?.[0] || ''}`.toUpperCase();
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }) => (
    <Card 
      style={styles.conversationCard}
      onPress={() => {
        if (item.isBot) {
          navigation.navigate('Chatbot');
        } else {
          navigation.navigate('Chat', { 
            conversationId: item._id,
            otherUser: item.otherParticipant,
            conversationTitle: item.title 
          });
        }
      }}
    >
      <Card.Content style={styles.conversationContent}>
        <View style={styles.avatarContainer}>
          {item.isBot ? (
            <Avatar.Icon 
              size={50} 
              icon="robot" 
              style={[styles.avatar, styles.botAvatar]}
            />
          ) : (
            <Avatar.Text 
              size={50} 
              label={getAvatarText(item.otherParticipant)} 
              style={styles.avatar}
            />
          )}
          {item.otherParticipant?.isOnline && !item.isBot && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.headerRow}>
            <Title style={styles.conversationName}>
              {item.isBot ? item.title : 
                `${item.otherParticipant?.firstName || ''} ${item.otherParticipant?.lastName || ''}`.trim() ||
                item.title
              }
            </Title>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage?.sentAt)}
            </Text>
          </View>
          
          <View style={styles.messageRow}>
            <Paragraph style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content || 'Henüz mesaj yok'}
            </Paragraph>
            {item.unreadCount > 0 && (
              <Badge style={styles.unreadBadge}>{item.unreadCount}</Badge>
            )}
          </View>

          {/* Conversation type indicator */}
          {item.type && !item.isBot && (
            <View style={styles.typeIndicator}>
              <MaterialIcons 
                name={item.type === 'vehicle_rental' ? 'directions-car' : 'directions'} 
                size={12} 
                color={colors.text.secondary} 
              />
              <Text style={styles.typeText}>
                {item.type === 'vehicle_rental' ? 'Araç Kiralama' : 'Yolculuk Paylaşımı'}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.text.primary}
            onPress={() => navigation.goBack()}
          />
          <Title style={styles.headerTitle}>Mesajlar</Title>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Konuşmalar yükleniyor...</Text>
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
        <Title style={styles.headerTitle}>Mesajlar</Title>
        <IconButton
          icon="chat-plus"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => {
            // Yeni konuşma başlatma modal'ı açılabilir
            Alert.alert('Bilgi', 'Yeni konuşma başlatmak için araç kiralama veya yolculuk rezervasyonu yapın.');
          }}
        />
      </View>

      <View style={styles.content}>
        <Searchbar
          placeholder="Konuşma ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={colors.text.secondary}
          placeholderTextColor={colors.text.disabled}
        />

        {filteredConversations.length === 0 ? (
          <Surface style={styles.emptyState}>
            <MaterialIcons name="chat" size={64} color={colors.text.disabled} />
            <Title style={styles.emptyTitle}>
              {searchQuery ? 'Konuşma bulunamadı' : 'Henüz mesaj yok'}
            </Title>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Arama kriterlerinizle eşleşen konuşma bulunamadı'
                : 'AI asistanımızla sohbet etmek için yukarıdaki botla konuşmaya başlayın'
              }
            </Text>
          </Surface>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            style={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* AI Chatbot FAB */}
      <FAB
        icon="robot"
        label="AI Yardım"
        style={styles.fab}
        onPress={() => navigation.navigate('Chatbot')}
      />
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
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
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
  searchBar: {
    margin: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    color: colors.text.primary,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  conversationCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  botAvatar: {
    backgroundColor: colors.secondary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  conversationInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontSize: 11,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    elevation: 1,
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
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    backgroundColor: colors.primary,
  },
});