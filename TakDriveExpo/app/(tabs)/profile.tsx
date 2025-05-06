import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();

  // Mock user data
  const user = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@mail.com',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+90 555 123 4567',
    memberSince: 'Ocak 2023',
    rating: 4.8,
    completedRides: 15,
    completedRentals: 8,
    wallet: {
      balance: 350
    }
  };

  const menuItems = [
    {
      title: 'Rezervasyonlarım',
      icon: 'calendar-check',
      onPress: () => router.push('/reservations' as any)
    },
    {
      title: 'Araçlarım',
      icon: 'car',
      onPress: () => router.push('/my-vehicles' as any)
    },
    {
      title: 'Kiralama Geçmişi',
      icon: 'history',
      onPress: () => router.push('/rental-history' as any)
    },
    {
      title: 'Yolculuk Geçmişi',
      icon: 'route',
      onPress: () => router.push('/trip-history' as any)
    },
    {
      title: 'Ödemelerim',
      icon: 'credit-card',
      onPress: () => router.push('/payments' as any)
    },
    {
      title: 'Adreslerim',
      icon: 'map-marker-alt',
      onPress: () => router.push('/addresses' as any)
    },
    {
      title: 'Favorilerim',
      icon: 'heart',
      onPress: () => router.push('/favorites' as any)
    },
    {
      title: 'Ayarlar',
      icon: 'cog',
      onPress: () => router.push('/settings' as any)
    },
    {
      title: 'Yardım ve Destek',
      icon: 'question-circle',
      onPress: () => router.push('/help' as any)
    },
    {
      title: 'Hakkımızda',
      icon: 'info-circle',
      onPress: () => router.push('/about' as any)
    }
  ];
  
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Çıkış Yap", 
          onPress: () => router.replace("/login" as any)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profil',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.photo }} style={styles.profilePhoto} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.memberInfo}>
              <Text style={styles.memberSince}>Üyelik: {user.memberSince}</Text>
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" size={14} color="#FFD700" solid />
                <Text style={styles.rating}>{user.rating}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile' as any)}
          >
            <FontAwesome5 name="edit" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Ride Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.completedRides}</Text>
            <Text style={styles.statLabel}>Yolculuk</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.completedRentals}</Text>
            <Text style={styles.statLabel}>Kiralama</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.wallet.balance} TL</Text>
            <Text style={styles.statLabel}>Bakiye</Text>
          </View>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <FontAwesome5 name={item.icon} size={18} color={colors.primary} solid />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <FontAwesome5 name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={18} color="#FF6B6B" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
        
        {/* App Version */}
        <Text style={styles.versionText}>TakDrive v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: colors.text,
    marginLeft: 4,
    fontSize: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 20,
    marginBottom: 30,
  },
});