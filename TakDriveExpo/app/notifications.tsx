import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Bildirim veri modeli
interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: 'reservation' | 'message' | 'system' | 'payment';
  isRead: boolean;
}

// Bildirim ayarları veri modeli
interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  
  // Sekme seçimi için state
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  
  // Örnek bildirim verileri
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Rezervasyon Onaylandı',
      message: 'BMW 3.20i kiralama talebiniz araç sahibi tarafından onaylandı.',
      createdAt: '1 saat önce',
      type: 'reservation',
      isRead: false
    },
    {
      id: '2',
      title: 'Yeni Mesaj',
      message: 'Ahmet Yılmaz: Aracı saat kaçta teslim almak istersiniz?',
      createdAt: '3 saat önce',
      type: 'message',
      isRead: false
    },
    {
      id: '3',
      title: 'Ödeme Başarılı',
      message: '750 TL tutarındaki ödemeniz başarıyla gerçekleşti.',
      createdAt: '1 gün önce',
      type: 'payment',
      isRead: true
    },
    {
      id: '4',
      title: 'Hoş Geldiniz',
      message: 'TakDrive\'a hoş geldiniz! Hemen yolculuğa başlayabilirsiniz.',
      createdAt: '2 gün önce',
      type: 'system',
      isRead: true
    },
    {
      id: '5',
      title: 'Kiralama Tamamlandı',
      message: 'Mercedes C180 kiralama işleminiz başarıyla tamamlandı.',
      createdAt: '1 hafta önce',
      type: 'reservation',
      isRead: true
    }
  ]);
  
  // Örnek bildirim ayarları
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Rezervasyon Bildirimleri',
      description: 'Rezervasyon onayları, iptaller ve hatırlatmalar',
      enabled: true
    },
    {
      id: '2',
      title: 'Mesaj Bildirimleri',
      description: 'Yeni mesajlar ve sohbet güncellemeleri',
      enabled: true
    },
    {
      id: '3',
      title: 'Ödeme Bildirimleri',
      description: 'Ödeme onayları ve bakiye güncellemeleri',
      enabled: true
    },
    {
      id: '4',
      title: 'Sistem Bildirimleri',
      description: 'Uygulama güncellemeleri ve duyurular',
      enabled: false
    },
    {
      id: '5',
      title: 'Promosyon Bildirimleri',
      description: 'Kampanyalar, indirimler ve özel teklifler',
      enabled: false
    },
    {
      id: '6',
      title: 'E-posta Bildirimleri',
      description: 'Tüm bildirimleri e-posta olarak da al',
      enabled: true
    }
  ]);
  
  // Bildirimlerin okunmuş olarak işaretlenmesi
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };
  
  // Tüm bildirimlerin okunmuş olarak işaretlenmesi
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  // Bildirim türüne göre ikon ve renk döndüren yardımcı fonksiyon
  const getNotificationTypeInfo = (type: Notification['type']) => {
    switch (type) {
      case 'reservation':
        return {
          icon: 'calendar-check',
          color: '#4CAF50'
        };
      case 'message':
        return {
          icon: 'comment',
          color: '#2196F3'
        };
      case 'payment':
        return {
          icon: 'credit-card',
          color: '#FF9800'
        };
      case 'system':
        return {
          icon: 'bell',
          color: '#9C27B0'
        };
    }
  };
  
  // Bildirim ayarının değiştirilmesi
  const toggleNotificationSetting = (id: string) => {
    setNotificationSettings(
      notificationSettings.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };
  
  // Bildirim öğesi render fonksiyonu
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const typeInfo = getNotificationTypeInfo(item.type);
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          !item.isRead && styles.unreadNotification
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${typeInfo.color}20` }]}>
          <FontAwesome5 name={typeInfo.icon} size={16} color={typeInfo.color} solid />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{item.createdAt}</Text>
          </View>
          
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          {!item.isRead && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Bildirim ayarı öğesi render fonksiyonu
  const renderSettingItem = ({ item }: { item: NotificationSetting }) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
        
        <Switch
          value={item.enabled}
          onValueChange={() => toggleNotificationSetting(item.id)}
          trackColor={{ false: '#767577', true: `${colors.primary}80` }}
          thumbColor={item.enabled ? colors.primary : '#f4f3f4'}
        />
      </View>
    );
  };
  
  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Bildirimler',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Bildirim Özeti */}
      {activeTab === 'all' && unreadCount > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {unreadCount} okunmamış bildiriminiz var
          </Text>
          
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Sekme Başlıkları */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Bildirimler
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Ayarlar
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Sekme İçerikleri */}
      {activeTab === 'all' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="bell-slash" size={50} color={colors.secondary} />
              <Text style={styles.emptyText}>Henüz bildiriminiz yok</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={notificationSettings}
          renderItem={renderSettingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.primary}20`,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 8,
    margin: 16,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textDark,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.card,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  unreadNotification: {
    backgroundColor: `${colors.card}`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 6,
    right: 0,
  },
  badgeContainer: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDark,
    marginTop: 16,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
}); 