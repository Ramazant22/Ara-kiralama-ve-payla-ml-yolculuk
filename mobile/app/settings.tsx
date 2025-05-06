import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function SettingsPage() {
  const router = useRouter();
  
  // Ayarlar state'i
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Çıkış yap
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            // Gerçek uygulamada oturum kapatma işlemi yapılır
            router.replace('/login');
          }
        }
      ]
    );
  };
  
  // Hesabı sil
  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: () => {
            // Gerçek uygulamada hesap silme API çağrısı yapılır
            Alert.alert(
              'İşlem Başarılı',
              'Hesabınız silindi. Umarız tekrar görüşürüz.',
              [
                {
                  text: 'Tamam',
                  onPress: () => router.replace('/login')
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ayarlar',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hesap Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="user-alt" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Profil Bilgileri</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="lock" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Şifre Değiştir</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="credit-card" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Ödeme Yöntemleri</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* Bildirim Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          
          <View style={styles.switchItem}>
            <View style={styles.switchItemLeft}>
              <FontAwesome5 name="bell" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Tüm Bildirimler</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
              onValueChange={() => setNotificationsEnabled(prev => !prev)}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchItemLeft}>
              <FontAwesome5 name="envelope" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>E-posta Bildirimleri</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={emailNotifications ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
              onValueChange={() => setEmailNotifications(prev => !prev)}
              value={emailNotifications}
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchItemLeft}>
              <FontAwesome5 name="mobile-alt" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Push Bildirimleri</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={pushNotifications ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
              onValueChange={() => setPushNotifications(prev => !prev)}
              value={pushNotifications}
            />
          </View>
        </View>
        
        {/* Uygulama Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          
          <View style={styles.switchItem}>
            <View style={styles.switchItemLeft}>
              <FontAwesome5 name="moon" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Karanlık Mod</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
              onValueChange={() => setDarkMode(prev => !prev)}
              value={darkMode}
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchItemLeft}>
              <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Konum Servisleri</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
              onValueChange={() => setLocationEnabled(prev => !prev)}
              value={locationEnabled}
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="language" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Dil</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>Türkçe</Text>
              <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Destek Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="question-circle" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Yardım</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/contact')}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="headset" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>İletişim</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about')}>
            <View style={styles.menuItemLeft}>
              <FontAwesome5 name="info-circle" size={18} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Hakkında</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* Çıkış ve Hesap Silme */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={18} color="#FFFFFF" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: colors.secondary,
    marginRight: 8,
  },
  menuIcon: {
    width: 25,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.textDark,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  switchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    alignItems: 'center',
    padding: 14,
  },
  deleteAccountText: {
    color: '#FF3B30',
    fontSize: 16,
  },
}); 