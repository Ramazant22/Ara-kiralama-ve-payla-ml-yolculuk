import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  Switch, 
  Button,
  Divider,
  Title,
  Portal,
  Modal,
  RadioButton,
  ActivityIndicator
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Bildirim ayarları
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false,
    newMessages: true,
    rideUpdates: true,
    systemAlerts: true
  });

  // Gizlilik ayarları
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareLocation: true,
    shareContactInfo: false,
    allowFriendRequests: true
  });

  // Görünüm ayarları
  const [appearance, setAppearance] = useState({
    language: 'tr',
    theme: 'dark',
    currency: 'TRY',
    distanceUnit: 'km'
  });

  // Modal states
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications || notifications);
        setPrivacy(settings.privacy || privacy);
        setAppearance(settings.appearance || appearance);
      }
    } catch (error) {
      console.log('Ayarlar yüklenirken hata:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notifications,
        privacy,
        appearance
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Ayarlar kaydedilirken hata:', error);
    }
  };

  const updateNotification = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    saveSettings();
  };

  const updatePrivacy = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    saveSettings();
  };

  const updateAppearance = (key, value) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
    saveSettings();
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await logout();
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sıfırla', 
          style: 'destructive',
          onPress: async () => {
            setNotifications({
              push: true,
              email: true,
              sms: false,
              marketing: false,
              newMessages: true,
              rideUpdates: true,
              systemAlerts: true
            });
            setPrivacy({
              profileVisible: true,
              shareLocation: true,
              shareContactInfo: false,
              allowFriendRequests: true
            });
            setAppearance({
              language: 'tr',
              theme: 'dark',
              currency: 'TRY',
              distanceUnit: 'km'
            });
            await AsyncStorage.removeItem('userSettings');
            Alert.alert('Başarılı', 'Ayarlar sıfırlandı.');
          }
        }
      ]
    );
  };

  const clearCache = () => {
    Alert.alert(
      'Önbellek Temizle',
      'Uygulama önbelleğini temizlemek istediğinizden emin misiniz? Bu işlem uygulamayı yeniden başlatabilir.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          onPress: () => {
            Alert.alert('Başarılı', 'Önbellek temizlendi.');
          }
        }
      ]
    );
  };

  const languages = [
    { label: 'Türkçe', value: 'tr' },
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Français', value: 'fr' }
  ];

  const themes = [
    { label: 'Koyu Tema', value: 'dark' },
    { label: 'Açık Tema', value: 'light' },
    { label: 'Sistem', value: 'system' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        
        {/* Bildirim Ayarları */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Bildirim Ayarları</Title>
            
            <List.Item
              title="Push Bildirimleri"
              description="Mobil push bildirimleri"
              right={() => (
                <Switch
                  value={notifications.push}
                  onValueChange={(value) => updateNotification('push', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="E-posta Bildirimleri"
              description="E-posta ile bildirimler"
              right={() => (
                <Switch
                  value={notifications.email}
                  onValueChange={(value) => updateNotification('email', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="SMS Bildirimleri"
              description="SMS ile bildirimler"
              right={() => (
                <Switch
                  value={notifications.sms}
                  onValueChange={(value) => updateNotification('sms', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Yeni Mesajlar"
              description="Yeni mesaj bildirileri"
              right={() => (
                <Switch
                  value={notifications.newMessages}
                  onValueChange={(value) => updateNotification('newMessages', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Yolculuk Güncellemeleri"
              description="Yolculuk durumu değişiklikleri"
              right={() => (
                <Switch
                  value={notifications.rideUpdates}
                  onValueChange={(value) => updateNotification('rideUpdates', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Pazarlama"
              description="Kampanya ve özel teklifler"
              right={() => (
                <Switch
                  value={notifications.marketing}
                  onValueChange={(value) => updateNotification('marketing', value)}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Gizlilik Ayarları */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Gizlilik Ayarları</Title>
            
            <List.Item
              title="Profilim Görünür"
              description="Diğer kullanıcılar profilimi görebilsin"
              right={() => (
                <Switch
                  value={privacy.profileVisible}
                  onValueChange={(value) => updatePrivacy('profileVisible', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Konum Paylaş"
              description="Anlık konumu paylaş"
              right={() => (
                <Switch
                  value={privacy.shareLocation}
                  onValueChange={(value) => updatePrivacy('shareLocation', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="İletişim Bilgilerini Paylaş"
              description="Telefon numaranı diğer kullanıcılarla paylaş"
              right={() => (
                <Switch
                  value={privacy.shareContactInfo}
                  onValueChange={(value) => updatePrivacy('shareContactInfo', value)}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Arkadaşlık İstekleri"
              description="Arkadaşlık isteklerini kabul et"
              right={() => (
                <Switch
                  value={privacy.allowFriendRequests}
                  onValueChange={(value) => updatePrivacy('allowFriendRequests', value)}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Görünüm Ayarları */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Görünüm Ayarları</Title>
            
            <List.Item
              title="Dil"
              description={languages.find(lang => lang.value === appearance.language)?.label}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setLanguageModalVisible(true)}
            />
            <Divider />
            
            <List.Item
              title="Tema"
              description={themes.find(theme => theme.value === appearance.theme)?.label}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setThemeModalVisible(true)}
            />
            <Divider />
            
            <List.Item
              title="Para Birimi"
              description="Türk Lirası (₺)"
              right={() => <List.Icon icon="chevron-right" />}
            />
            <Divider />
            
            <List.Item
              title="Mesafe Birimi"
              description="Kilometre (km)"
              right={() => <List.Icon icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Uygulama Ayarları */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Uygulama</Title>
            
            <List.Item
              title="Önbellek Temizle"
              description="Geçici dosyaları temizle"
              left={() => <List.Icon icon="delete-sweep" />}
              onPress={clearCache}
            />
            <Divider />
            
            <List.Item
              title="Ayarları Sıfırla"
              description="Tüm ayarları varsayılana döndür"
              left={() => <List.Icon icon="restore" />}
              onPress={resetSettings}
            />
            <Divider />
            
            <List.Item
              title="Uygulama Sürümü"
              description="v1.0.0"
              left={() => <List.Icon icon="information" />}
            />
          </Card.Content>
        </Card>

        {/* Çıkış Butonu */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={colors.error}
          textColor={colors.onPrimary}
          disabled={isLoading}
          icon="logout"
        >
          {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : 'Hesabdan Çıkış Yap'}
        </Button>
      </View>

      {/* Dil Seçim Modalı */}
      <Portal>
        <Modal
          visible={languageModalVisible}
          onDismiss={() => setLanguageModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Dil Seçin</Title>
          <RadioButton.Group
            onValueChange={(value) => {
              updateAppearance('language', value);
              setLanguageModalVisible(false);
            }}
            value={appearance.language}
          >
            {languages.map((lang) => (
              <RadioButton.Item
                key={lang.value}
                label={lang.label}
                value={lang.value}
                color={colors.primary}
              />
            ))}
          </RadioButton.Group>
        </Modal>
      </Portal>

      {/* Tema Seçim Modalı */}
      <Portal>
        <Modal
          visible={themeModalVisible}
          onDismiss={() => setThemeModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Tema Seçin</Title>
          <RadioButton.Group
            onValueChange={(value) => {
              updateAppearance('theme', value);
              setThemeModalVisible(false);
            }}
            value={appearance.theme}
          >
            {themes.map((theme) => (
              <RadioButton.Item
                key={theme.value}
                label={theme.label}
                value={theme.value}
                color={colors.primary}
              />
            ))}
          </RadioButton.Group>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: spacing.sm,
    fontSize: 18,
  },
  logoutButton: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.sm,
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  modalTitle: {
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
}); 