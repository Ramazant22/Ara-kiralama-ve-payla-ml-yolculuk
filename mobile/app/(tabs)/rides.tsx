import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../_layout';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Interface tanımlamaları
interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  driver: string;
}

// Örnek yolculuk verileri
const RIDES: Ride[] = [
  { 
    id: '1', 
    startLocation: 'İstanbul', 
    endLocation: 'Ankara', 
    date: '10 Mayıs 2025',
    time: '09:00',
    price: 150,
    seats: 3,
    driver: 'Ahmet Y.'
  },
  { 
    id: '2', 
    startLocation: 'İzmir', 
    endLocation: 'Antalya', 
    date: '12 Mayıs 2025',
    time: '10:30',
    price: 200,
    seats: 2,
    driver: 'Mehmet K.'
  },
  { 
    id: '3', 
    startLocation: 'Ankara', 
    endLocation: 'Konya', 
    date: '15 Mayıs 2025',
    time: '14:00',
    price: 100,
    seats: 4,
    driver: 'Ayşe S.'
  },
  { 
    id: '4', 
    startLocation: 'Bursa', 
    endLocation: 'İstanbul', 
    date: '20 Mayıs 2025',
    time: '17:30',
    price: 120,
    seats: 1,
    driver: 'Ali R.'
  },
];

// Yolculuk kartı bileşeni
const RideCard: React.FC<{ride: Ride}> = ({ ride }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/ride/${ride.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <Text style={styles.cardRoute}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#FFF" /> {ride.startLocation}
          </Text>
          <FontAwesome5 name="arrow-right" size={14} color="rgba(255,255,255,0.6)" style={styles.arrowIcon} />
          <Text style={styles.cardRoute}>
            <FontAwesome5 name="map-pin" size={14} color="#FFF" /> {ride.endLocation}
          </Text>
        </View>
        <Text style={styles.cardDate}>{ride.date} | {ride.time}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="user" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Sürücü:</Text>
            <Text style={styles.infoValue}>{ride.driver}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome5 name="users" size={14} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Boş koltuk:</Text>
            <Text style={styles.infoValue}>{ride.seats}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Fiyat:</Text>
            <Text style={styles.cardPrice}>{ride.price} TL</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => router.push(`/ride/${ride.id}`)}
          >
            <Text style={styles.detailButtonText}>Detaylar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function RidesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Yolculuklar</Text>
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <FontAwesome5 name="filter" size={16} color={colors.text} />
          <Text style={styles.filterButtonText}>Filtrele</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={RIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideCard ride={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: colors.primary,
    padding: 15,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardRoute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
  cardDate: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 5,
  },
  cardContent: {
    padding: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 16,
    color: '#757575',
    marginRight: 8,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  detailButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 