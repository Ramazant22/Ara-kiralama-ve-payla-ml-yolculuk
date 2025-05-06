import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Örnek veri modeli
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  image: string;
  status: 'active' | 'pending' | 'maintenance';
  rentalCount: number;
  avgRating: number;
  pricePerDay: number;
}

export default function MyVehiclesScreen() {
  const router = useRouter();
  
  // Örnek araç verileri
  const myVehicles: Vehicle[] = [
    {
      id: '1',
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      licensePlate: '34 ABC 123',
      image: 'https://via.placeholder.com/150',
      status: 'active',
      rentalCount: 15,
      avgRating: 4.8,
      pricePerDay: 350
    },
    {
      id: '2',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      licensePlate: '34 XYZ 456',
      image: 'https://via.placeholder.com/150',
      status: 'active',
      rentalCount: 8,
      avgRating: 4.5,
      pricePerDay: 320
    },
    {
      id: '3',
      brand: 'Volkswagen',
      model: 'Passat',
      year: 2019,
      licensePlate: '34 DEF 789',
      image: 'https://via.placeholder.com/150',
      status: 'maintenance',
      rentalCount: 12,
      avgRating: 4.6,
      pricePerDay: 400
    }
  ];
  
  // Durum bilgisine göre stil ve metin döndüren yardımcı fonksiyon
  const getStatusInfo = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return {
          text: 'Aktif',
          color: '#4CAF50',
          icon: 'check-circle'
        };
      case 'pending':
        return {
          text: 'Onay Bekliyor',
          color: '#FF9800',
          icon: 'clock'
        };
      case 'maintenance':
        return {
          text: 'Bakımda',
          color: '#F44336',
          icon: 'tools'
        };
    }
  };
  
  // Araç düzenleme fonksiyonu
  const handleEditVehicle = (vehicleId: string) => {
    router.push(`/edit-vehicle/${vehicleId}` as any);
  };
  
  // Bakım durumu değiştirme 
  const toggleMaintenance = (vehicleId: string, currentStatus: Vehicle['status']) => {
    const newStatus = currentStatus === 'maintenance' ? 'active' : 'maintenance';
    const statusInfo = getStatusInfo(newStatus);
    
    Alert.alert(
      'Durum Değiştir',
      `Aracınızın durumunu "${statusInfo.text}" olarak değiştirmek istiyor musunuz?`,
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Değiştir',
          onPress: () => {
            // Gerçek uygulamada API çağrısı yapılır
            Alert.alert('Başarılı', `Aracınızın durumu "${statusInfo.text}" olarak güncellendi.`);
          }
        }
      ]
    );
  };
  
  // Araç kartı bileşeni
  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <View style={styles.vehicleCard}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.vehicleImage}
        />
        
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.vehicleName}>{item.brand} {item.model}</Text>
            <Text style={styles.licensePlate}>{item.licensePlate}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <FontAwesome5 name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <FontAwesome5 name="calendar-check" size={14} color={colors.primary} />
            <Text style={styles.statText}>{item.rentalCount} Kiralama</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.avgRating.toFixed(1)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome5 name="money-bill-wave" size={14} color={colors.primary} />
            <Text style={styles.statText}>{item.pricePerDay} ₺/gün</Text>
          </View>
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditVehicle(item.id)}
          >
            <FontAwesome5 name="edit" size={14} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              item.status === 'maintenance' ? styles.activateButton : styles.maintenanceButton
            ]}
            onPress={() => toggleMaintenance(item.id, item.status)}
          >
            <FontAwesome5 
              name={item.status === 'maintenance' ? 'check' : 'tools'} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.actionButtonText}>
              {item.status === 'maintenance' ? 'Aktifleştir' : 'Bakıma Al'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Araçlarım',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <FlatList
        data={myVehicles}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity 
            style={styles.addVehicleButton}
            onPress={() => router.push('/add-vehicle' as any)}
          >
            <FontAwesome5 name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addVehicleButtonText}>Yeni Araç Ekle</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="car" size={50} color={colors.secondary} />
            <Text style={styles.emptyText}>Henüz bir aracınız bulunmuyor</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-vehicle' as any)}
            >
              <Text style={styles.emptyButtonText}>Araç Ekle</Text>
            </TouchableOpacity>
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
  },
  listContent: {
    padding: 16,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addVehicleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 10,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    color: '#757575',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  maintenanceButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 