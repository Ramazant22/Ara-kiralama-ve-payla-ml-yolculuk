import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

// Favori araç veri tipi
interface FavoriteVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  image: string;
  location: string;
  ownerName: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export default function FavoritesScreen() {
  const router = useRouter();
  
  // Örnek favori araç listesi
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([
    {
      id: '1',
      brand: 'BMW',
      model: '3.20i',
      year: 2021,
      image: 'https://via.placeholder.com/400x200',
      location: 'İstanbul, Kadıköy',
      ownerName: 'Ahmet Yılmaz',
      pricePerDay: 750,
      rating: 4.8,
      reviewCount: 24,
      isAvailable: true
    },
    {
      id: '2',
      brand: 'Mercedes',
      model: 'C180',
      year: 2020,
      image: 'https://via.placeholder.com/400x200',
      location: 'İstanbul, Beşiktaş',
      ownerName: 'Fatma Demir',
      pricePerDay: 800,
      rating: 4.6,
      reviewCount: 18,
      isAvailable: false
    },
    {
      id: '3',
      brand: 'Audi',
      model: 'A3',
      year: 2022,
      image: 'https://via.placeholder.com/400x200',
      location: 'İzmir, Karşıyaka',
      ownerName: 'Zeynep Şahin',
      pricePerDay: 650,
      rating: 4.9,
      reviewCount: 32,
      isAvailable: true
    },
    {
      id: '4',
      brand: 'Volkswagen',
      model: 'Passat',
      year: 2021,
      image: 'https://via.placeholder.com/400x200',
      location: 'Ankara, Çankaya',
      ownerName: 'Mehmet Öz',
      pricePerDay: 600,
      rating: 4.7,
      reviewCount: 15,
      isAvailable: true
    }
  ]);
  
  // Favorilerden kaldırma işlemi
  const removeFromFavorites = (id: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== id));
  };
  
  // Araç detayına gitme
  const goToVehicleDetails = (id: string) => {
    router.push(`/vehicle/${id}` as any);
  };
  
  // Favorileri filtreleme (tümü, müsait olanlar)
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  const getFilteredFavorites = () => {
    if (filterActive === null) {
      return favorites;
    }
    return favorites.filter(fav => fav.isAvailable === filterActive);
  };
  
  // Favori araç kartı render fonksiyonu
  const renderFavoriteItem = ({ item }: { item: FavoriteVehicle }) => {
    return (
      <View style={styles.favoriteCard}>
        {/* Araç Görseli ve Favorilerden Kaldır Butonu */}
        <TouchableOpacity
          onPress={() => goToVehicleDetails(item.id)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.image }} style={styles.vehicleImage} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => removeFromFavorites(item.id)}
        >
          <FontAwesome5 name="heart" size={16} color="#FF6B6B" solid />
        </TouchableOpacity>
        
        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Müsait Değil</Text>
          </View>
        )}
        
        {/* Araç Bilgileri */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.vehicleName}>
              {item.brand} {item.model} <Text style={styles.year}>({item.year})</Text>
            </Text>
            <Text style={styles.price}>{item.pricePerDay} ₺<Text style={styles.priceUnit}>/gün</Text></Text>
          </View>
          
          <View style={styles.locationRow}>
            <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <FontAwesome5 name="star" size={14} color="#FFD700" solid />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount} değerlendirme)</Text>
            </View>
            <Text style={styles.ownerText}>
              <FontAwesome5 name="user" size={14} color={colors.primary} /> {item.ownerName}
            </Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => goToVehicleDetails(item.id)}
            >
              <FontAwesome5 name="eye" size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>İncele</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                item.isAvailable ? styles.rentButton : styles.disabledButton
              ]}
              onPress={() => item.isAvailable && router.push(`/rent/${item.id}` as any)}
              disabled={!item.isAvailable}
            >
              <FontAwesome5 name="car" size={14} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {item.isAvailable ? 'Kirala' : 'Müsait Değil'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Favorilerim',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      {/* Filtreler */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterActive === null && styles.activeFilter]}
          onPress={() => setFilterActive(null)}
        >
          <Text style={[styles.filterText, filterActive === null && styles.activeFilterText]}>
            Tümü
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterActive === true && styles.activeFilter]}
          onPress={() => setFilterActive(true)}
        >
          <Text style={[styles.filterText, filterActive === true && styles.activeFilterText]}>
            Müsait Olanlar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterActive === false && styles.activeFilter]}
          onPress={() => setFilterActive(false)}
        >
          <Text style={[styles.filterText, filterActive === false && styles.activeFilterText]}>
            Müsait Olmayanlar
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Favoriler Listesi */}
      <FlatList
        data={getFilteredFavorites()}
        renderItem={renderFavoriteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="heart-broken" size={50} color={colors.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Henüz favori araç eklemediniz.</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/vehicles' as any)}
            >
              <Text style={styles.exploreButtonText}>Araçları Keşfedin</Text>
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
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  favoriteCard: {
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
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  year: {
    fontSize: 16,
    color: '#757575',
    fontWeight: 'normal',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#757575',
  },
  ownerText: {
    fontSize: 14,
    color: colors.textDark,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  viewButton: {
    backgroundColor: colors.secondary,
  },
  rentButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 