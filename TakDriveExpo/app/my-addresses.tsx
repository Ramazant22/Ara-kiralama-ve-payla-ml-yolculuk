import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Adres veri tipi
interface Address {
  id: string;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export default function MyAddressesScreen() {
  const router = useRouter();
  
  // Örnek adres verileri
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      title: 'Ev Adresim',
      fullAddress: 'Bahçelievler Mah. Adnan Kahveci Blv. No: 27 D: 5',
      city: 'İstanbul',
      district: 'Bahçelievler',
      isDefault: true,
      type: 'home'
    },
    {
      id: '2',
      title: 'İş Adresim',
      fullAddress: 'Levent Mah. Büyükdere Cad. No: 112 Plaza D Blok Kat: 8',
      city: 'İstanbul',
      district: 'Levent',
      isDefault: false,
      type: 'work'
    },
    {
      id: '3',
      title: 'Yazlık',
      fullAddress: 'Sahil Mah. Deniz Sok. No: 15',
      city: 'Muğla',
      district: 'Bodrum',
      isDefault: false,
      type: 'other'
    }
  ]);
  
  // Adres tipi ikonları
  const getAddressTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      case 'other':
        return 'map-marker-alt';
    }
  };
  
  // Varsayılan adres ayarlama
  const setAsDefault = (id: string) => {
    setAddresses(
      addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      }))
    );
    Alert.alert('Başarılı', 'Varsayılan adres değiştirildi.');
  };
  
  // Adres silme
  const deleteAddress = (id: string) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          onPress: () => {
            setAddresses(addresses.filter(address => address.id !== id));
            Alert.alert('Başarılı', 'Adres silindi.');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  // Adres düzenleme
  const editAddress = (id: string) => {
    router.push(`/edit-address/${id}` as any);
  };
  
  // Yeni adres ekleme
  const addNewAddress = () => {
    router.push('/add-address' as any);
  };
  
  // Adres kartı render fonksiyonu
  const renderAddressItem = ({ item }: { item: Address }) => {
    return (
      <View style={styles.addressCard}>
        {/* Adres Başlığı ve İşlemler */}
        <View style={styles.addressHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={getAddressTypeIcon(item.type)} 
                size={16} 
                color={colors.primary} 
              />
            </View>
            <Text style={styles.addressTitle}>{item.title}</Text>
          </View>
          
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
        </View>
        
        {/* Adres Detayları */}
        <View style={styles.addressDetails}>
          <Text style={styles.addressText}>{item.fullAddress}</Text>
          <Text style={styles.cityDistrict}>
            {item.district}, {item.city}
          </Text>
        </View>
        
        {/* İşlem Butonları */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => editAddress(item.id)}
          >
            <FontAwesome5 name="edit" size={14} color={colors.primary} />
            <Text style={styles.actionButtonText}>Düzenle</Text>
          </TouchableOpacity>
          
          {!item.isDefault && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setAsDefault(item.id)}
            >
              <FontAwesome5 name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.actionButtonText}>Varsayılan Yap</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteAddress(item.id)}
          >
            <FontAwesome5 name="trash" size={14} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Adreslerim',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Yeni Adres Ekleme Butonu */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={addNewAddress}
      >
        <FontAwesome5 name="plus" size={16} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Yeni Adres Ekle</Text>
      </TouchableOpacity>
      
      {/* Adres Listesi */}
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.addressList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="map-marker-alt" size={50} color={colors.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Henüz adres eklemediniz.</Text>
            <Text style={styles.emptySubText}>Yeni bir adres eklemek için yukarıdaki butonu kullanabilirsiniz.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  addressList: {
    paddingBottom: 16,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  defaultBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  addressDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  addressText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 6,
  },
  cityDistrict: {
    fontSize: 14,
    color: '#757575',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 