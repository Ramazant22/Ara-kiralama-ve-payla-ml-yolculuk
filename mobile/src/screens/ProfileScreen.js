import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import userService from '../api/services/userService';
import vehicleService from '../api/services/vehicleService';
import rideShareService from '../api/services/rideShareService';
import rentalService from '../api/services/rentalService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const { user, refreshUserData, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState({
    stats: {
      tripCount: 15,
      rentalCount: 8,
      balance: 350
    }
  });

  // Belleği temizleyip kullanıcı verilerini yeniden yükleyen fonksiyon
  const clearCacheAndRefreshData = async () => {
    try {
      setRefreshing(true);
      
      // AsyncStorage'dan userData'yı temizle
      await AsyncStorage.removeItem('userData');
      console.log('Kullanıcı önbelleği temizlendi');
      
      // Kullanıcı bilgilerini API'den yeniden yükle
      await refreshUserData();
      console.log('Kullanıcı bilgileri yenilendi:', user);
      
      // İstatistikler ve diğer verileri yükle
      const [tripsResponse, rentalsResponse] = await Promise.all([
        rideShareService.getUserRides(),
        rentalService.getUserRentals()
      ]);

      // Toplam istatistikleri hesapla
      const statsData = {
        tripCount: 15, // Örnek değer
        rentalCount: 8, // Örnek değer
        balance: 350   // Örnek değer
      };

      setProfileData({
        stats: statsData
      });
      
      console.log('Tüm veriler başarıyla yenilendi');
    } catch (error) {
      console.error('Veri yenileme hatası:', error);
      Alert.alert('Hata', 'Veriler yenilenirken bir sorun oluştu');
    } finally {
      setRefreshing(false);
    }
  };

  const loadProfileData = async () => {
    try {
      setRefreshing(true);
      // Kullanıcı profilini yenile
      await refreshUserData();

      // İstatistikler ve diğer verileri yükle
      const [tripsResponse, rentalsResponse] = await Promise.all([
        rideShareService.getUserRides(),
        rentalService.getUserRentals()
      ]);

      // Toplam istatistikleri hesapla (örnek değerler)
      const statsData = {
        tripCount: 15, // Örnek değer
        rentalCount: 8, // Örnek değer
        balance: 350   // Örnek değer
      };

      setProfileData({
        stats: statsData
      });
    } catch (error) {
      console.error('Profil verilerini yükleme hatası:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Component yüklendiğinde çalışır
    const loadUserData = async () => {
      try {
        setRefreshing(true);
        
        // API'den kullanıcı bilgilerini doğrudan çek
        const userData = await userService.getUserProfile();
        console.log('Doğrudan API\'den çekilen kullanıcı bilgileri:', userData);
        
        // Kullanıcı verilerini güncelle
        await refreshUserData();
        
        // İstatistikler
        const statsData = {
          tripCount: 15,
          rentalCount: 8,
          balance: 350
        };
        
        setProfileData({
          stats: statsData
        });
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleRefresh = () => {
    // Sayfayı yenilemek için önbelleği temizle ve verileri yenile
    clearCacheAndRefreshData();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Profil bilgilerini oluştur - tümüyle API'den
  console.log('Mevcut kullanıcı verisi:', user);
  const fullName = user && (user.firstName || user.lastName) 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : user && user.name 
      ? user.name 
      : 'Profil';
  const userEmail = user ? user.email : '';
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) 
    : 'Ocak 2023';
  const userRating = user?.rating || 4.8;
  const { tripCount, rentalCount, balance } = profileData.stats;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>(tabs)</Text>
          <Text style={styles.sectionTitle}>Profil</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarSection}>
              {user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.initialsText}>{getInitials(fullName)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
              <View style={styles.memberInfo}>
                <Text style={styles.memberText}>Üyelik: {memberSince}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#FFD700" solid />
                  <Text style={styles.ratingText}>{userRating}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Icon name="edit" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tripCount}</Text>
            <Text style={styles.statLabel}>Yolculuk</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rentalCount}</Text>
            <Text style={styles.statLabel}>Kiralama</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{balance} TL</Text>
            <Text style={styles.statLabel}>Bakiye</Text>
          </View>
        </View>
        
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ReservationList')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="calendar-check" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Rezervasyonlarım</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyVehicles')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="car" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Araçlarım</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('RentalHistory')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="history" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Kiralama Geçmişi</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('RideHistory')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="route" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Yolculuk Geçmişi</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Payments')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="credit-card" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Ödemelerim</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Addresses')}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="map-marker-alt" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.menuItemText}>Adreslerim</Text>
            <Icon name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileSection: {
    paddingHorizontal: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatarSection: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginTop: 16,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333333',
  },
  menuContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ProfileScreen; 