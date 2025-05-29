import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  FAB,
  Searchbar,
  Chip,
  IconButton,
  ActivityIndicator,
  Title,
  Paragraph,
  Avatar
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { vehicleService } from '../services/vehicleService';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function VehiclesScreen({ navigation }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchQuery, selectedFilter]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await vehicleService.getUserVehicles();
      setVehicles(response || []);
      
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
      setError('Araçlar yüklenirken hata oluştu');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(vehicle => 
        vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Durum filtresi
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === selectedFilter);
    }

    setFilteredVehicles(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return colors.success;
      case 'rented':
        return colors.primary;
      case 'maintenance':
        return colors.warning;
      case 'inactive':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Müsait';
      case 'rented':
        return 'Kiralandı';
      case 'maintenance':
        return 'Bakımda';
      case 'inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  const handleEditVehicle = (vehicleId) => {
    Alert.alert('Bilgi', 'Araç detayları yakında eklenecek');
  };

  const handleDeleteVehicle = async (vehicleId) => {
    Alert.alert('Bilgi', 'Bu özellik sadece araç sahipleri için mevcuttur');
  };

  const handleAddVehicle = () => {
    Alert.alert('Bilgi', 'Kendi aracınızı eklemek için profil sayfasını ziyaret edin');
  };

  const handleVehiclePress = (vehicle) => {
    navigation.navigate('VehicleDetail', { vehicleId: vehicle._id || vehicle.id });
  };

  const VehicleCard = ({ vehicle }) => (
    <Card style={styles.vehicleCard} onPress={() => handleVehiclePress(vehicle)}>
      <View style={styles.cardHeader}>
        <Image 
          source={{ 
            uri: vehicle.images?.[0]?.url 
              ? `http://192.168.119.21:5000${vehicle.images[0].url}` 
              : 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Araç+Fotoğrafı'
          }} 
          style={styles.vehicleImage}
          defaultSource={{ uri: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Yükleniyor' }}
          onError={() => console.log('Image load error for vehicle:', vehicle.make, vehicle.model)}
        />
        {/* Kendi aracı işareti */}
        {vehicle.owner?._id === user?._id && (
          <View style={styles.ownerBadge}>
            <MaterialIcons name="person" size={16} color={colors.onPrimary} />
            <Text style={styles.ownerBadgeText}>Benim</Text>
          </View>
        )}
        <View style={styles.cardActions}>
          <IconButton
            icon="heart-outline"
            size={20}
            iconColor={colors.error}
            onPress={() => Alert.alert('Bilgi', 'Favoriler özelliği yakında eklenecek')}
          />
          <IconButton
            icon="eye"
            size={20}
            iconColor={colors.primary}
            onPress={() => handleVehiclePress(vehicle)}
          />
        </View>
      </View>
      
      <Card.Content style={styles.cardContent}>
        <View style={styles.vehicleHeader}>
          <Title style={styles.vehicleTitle}>
            {vehicle.make} {vehicle.model}
          </Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(vehicle.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(vehicle.status)}
          </Chip>
        </View>
        
        <View style={styles.vehicleDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{vehicle.year} Model</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="color-lens" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{vehicle.color}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="directions-car" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{vehicle.licensePlate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {vehicle.location?.district}, {vehicle.location?.city}
            </Text>
          </View>
        </View>

        <View style={styles.vehicleStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₺{vehicle.pricePerDay}</Text>
            <Text style={styles.statLabel}>Günlük</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₺{vehicle.pricePerKm}</Text>
            <Text style={styles.statLabel}>Km/₺</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color={colors.star} />
              <Text style={styles.statValue}>
                {typeof vehicle.rating === 'object' ? vehicle.rating?.average || 0 : vehicle.rating || 0}
              </Text>
            </View>
            <Text style={styles.statLabel}>{vehicle.totalBookings || 0} yolculuk</Text>
          </View>
        </View>

        {vehicle.features && vehicle.features.length > 0 && (
          <View style={styles.featuresContainer}>
            {vehicle.features.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Text style={styles.featureChipText}>
                  {feature}
                </Text>
              </View>
            ))}
            {vehicle.features.length > 4 && (
              <View style={styles.featureChip}>
                <Text style={styles.featureChipText}>
                  +{vehicle.features.length - 4} daha
                </Text>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const filters = [
    { key: 'all', label: 'Tümü', count: vehicles.length },
    { key: 'available', label: 'Müsait', count: vehicles.filter(v => v.status === 'available').length },
    { key: 'rented', label: 'Kiralı', count: vehicles.filter(v => v.status === 'rented').length },
    { key: 'maintenance', label: 'Bakım', count: vehicles.filter(v => v.status === 'maintenance').length },
  ];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Araçlar yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Hata Oluştu</Text>
        <Text style={styles.errorDescription}>{error}</Text>
        <Button
          mode="contained"
          onPress={loadVehicles}
          style={styles.retryButton}
          buttonColor={colors.primary}
        >
          Tekrar Dene
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Araç ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={colors.primary}
        />
      </View>

      {/* Filtreler */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>

      {/* Araç Listesi */}
      <ScrollView
        style={styles.vehiclesList}
        contentContainerStyle={styles.vehiclesListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="directions-car" size={64} color={colors.text.disabled} />
            <Text style={styles.emptyTitle}>
              {vehicles.length === 0 ? 'Henüz kiralık araç bulunmuyor' : 'Araç bulunamadı'}
            </Text>
            <Text style={styles.emptyDescription}>
              {vehicles.length === 0 
                ? 'Yakında araç sahipleri araçlarını sisteme ekleyecek'
                : 'Arama kriterlerinizi değiştirmeyi deneyin'
              }
            </Text>
            {vehicles.length === 0 && (
              <Button
                mode="contained"
                onPress={() => Alert.alert('Bilgi', 'Araç sahipleri sisteme araç eklerken beklemeye geçin')}
                style={styles.emptyButton}
                buttonColor={colors.primary}
              >
                Araçlar Yakında
              </Button>
            )}
          </View>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
          ))
        )}
      </ScrollView>

      {/* Filtre FAB */}
      <FAB
        icon="filter-variant"
        style={styles.fab}
        onPress={() => Alert.alert('Filtreler', 'Gelişmiş filtreleme yakında eklenecek')}
        color={colors.onPrimary}
        customSize={56}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
  },
  filtersContainer: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  filterChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.text.disabled,
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    height: 32,
  },
  filterChipText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '500',
  },
  selectedFilterChipText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  vehiclesList: {
    flex: 1,
    backgroundColor: colors.background,
  },
  vehiclesListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100, // FAB için daha fazla alan
    paddingTop: spacing.sm,
  },
  vehicleCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    position: 'relative',
    height: 220,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceLight,
  },
  cardActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.xs,
  },
  cardContent: {
    padding: spacing.lg,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    marginLeft: spacing.sm,
    borderRadius: borderRadius.small,
  },
  statusChipText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  vehicleDetails: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.md,
    color: colors.text.secondary,
    fontSize: 15,
    flex: 1,
  },
  vehicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.medium,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    backgroundColor: colors.primaryOverlay,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  featureChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  ownerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  ownerBadgeText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 