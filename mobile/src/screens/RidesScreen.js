import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Alert,
  RefreshControl
} from 'react-native';
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
  Surface
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideService } from '../services/rideService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function RidesScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRides();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchRides = async () => {
    try {
      setIsLoading(true);
      const response = await rideService.getRides({
        from: searchQuery,
        to: searchQuery
      });
      setRides(response.rides || []);
    } catch (error) {
      console.error('Yolculuklar yüklenirken hata:', error);
      Alert.alert('Hata', 'Yolculuklar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleRidePress = (ride) => {
    navigation.navigate('RideDetail', { rideId: ride._id });
  };

  const handleJoinRide = (ride) => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Yolculuğa katılmak için giriş yapmanız gerekiyor.');
      return;
    }

    // Kullanıcı kendi yolculuğuna katılamaz
    if (ride.driver._id === user._id) {
      Alert.alert('Uyarı', 'Kendi oluşturduğunuz yolculuğa katılamazsınız.');
      return;
    }

    if (ride.remainingSeats <= 0) {
      Alert.alert('Uyarı', 'Bu yolculukta boş koltuk kalmamış');
      return;
    }

    navigation.navigate('JoinRide', { ride });
  };

  const RideCard = ({ item: ride }) => (
    <Card style={styles.rideCard} onPress={() => handleRidePress(ride)}>
      <Card.Content>
        {/* Kendi yolculuğu badge'i */}
        {ride.driver._id === user?._id && (
          <View style={styles.ownerBadge}>
            <MaterialIcons name="person" size={16} color={colors.onPrimary} />
            <Text style={styles.ownerBadgeText}>Benim Yolculuğum</Text>
          </View>
        )}

        {/* Header - Rota */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <MaterialIcons name="my-location" size={20} color={colors.primary} />
            <View style={styles.routeText}>
              <Text style={styles.cityText}>{ride.from.city}</Text>
              {ride.from.district && (
                <Text style={styles.districtText}>{ride.from.district}</Text>
              )}
            </View>
          </View>

          <View style={styles.routeArrow}>
            <MaterialIcons name="arrow-forward" size={20} color={colors.text.secondary} />
          </View>

          <View style={styles.routePoint}>
            <MaterialIcons name="location-on" size={20} color={colors.error} />
            <View style={styles.routeText}>
              <Text style={styles.cityText}>{ride.to.city}</Text>
              {ride.to.district && (
                <Text style={styles.districtText}>{ride.to.district}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tarih ve Saat */}
        <View style={styles.timeContainer}>
          <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.timeText}>
            {formatDate(ride.departureDate)} - {ride.departureTime}
          </Text>
        </View>

        {/* Sürücü Bilgisi */}
        <View style={styles.driverContainer}>
          <MaterialIcons name="person" size={16} color={colors.text.secondary} />
          <Text style={styles.driverText}>
            {ride.driver.firstName} {ride.driver.lastName}
          </Text>
          {ride.driver.rating && typeof ride.driver.rating === 'number' && ride.driver.rating > 0 && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color={colors.star} />
              <Text style={styles.ratingText}>{ride.driver.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Araç Bilgisi */}
        <View style={styles.vehicleContainer}>
          <MaterialIcons name="directions-car" size={16} color={colors.text.secondary} />
          <Text style={styles.vehicleText}>
            {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.year})
          </Text>
        </View>

        {/* Alt kısım - Fiyat ve Durum */}
        <View style={styles.bottomContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatPrice(ride.pricePerSeat)}</Text>
            <Text style={styles.priceLabel}>kişi</Text>
          </View>

          <View style={styles.seatsContainer}>
            <MaterialIcons 
              name="event-seat" 
              size={16} 
              color={ride.remainingSeats > 0 ? colors.success : colors.error} 
            />
            <Text style={[
              styles.seatsText,
              { color: ride.remainingSeats > 0 ? colors.success : colors.error }
            ]}>
              {ride.remainingSeats} koltuk
            </Text>
          </View>

          {ride.driver._id !== user?._id && (
            <Button
              mode="contained"
              compact
              onPress={() => handleJoinRide(ride)}
              disabled={ride.remainingSeats <= 0}
              buttonColor={ride.remainingSeats > 0 ? colors.primary : colors.text.disabled}
              textColor={colors.onPrimary}
            >
              {ride.remainingSeats > 0 ? 'Katıl' : 'Dolu'}
            </Button>
          )}
        </View>

        {/* Tercihler */}
        {(ride.preferences?.smokingAllowed || ride.preferences?.petsAllowed || !ride.preferences?.musicAllowed) && (
          <View style={styles.preferencesContainer}>
            {ride.preferences?.smokingAllowed && (
              <Chip style={styles.preferenceChip} textStyle={styles.preferenceChipText}>
                Sigara OK
              </Chip>
            )}
            {ride.preferences?.petsAllowed && (
              <Chip style={styles.preferenceChip} textStyle={styles.preferenceChipText}>
                Evcil Hayvan OK
              </Chip>
            )}
            {!ride.preferences?.musicAllowed && (
              <Chip style={styles.preferenceChip} textStyle={styles.preferenceChipText}>
                Sessiz
              </Chip>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <MaterialIcons name="directions-car" size={64} color={colors.text.disabled} />
      <Title style={styles.emptyTitle}>Henüz yolculuk bulunmuyor</Title>
      <Text style={styles.emptyText}>
        Yeni yolculuklar oluşturuldukça burada görünecek
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateRide')}
        style={styles.emptyButton}
        buttonColor={colors.primary}
      >
        Yolculuk Oluştur
      </Button>
    </Surface>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Yolculuklar</Title>
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="login" size={64} color={colors.text.disabled} />
          <Title style={styles.emptyTitle}>Giriş Gerekli</Title>
          <Text style={styles.emptyText}>
            Yolculukları görmek için giriş yapmanız gerekiyor
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.emptyButton}
            buttonColor={colors.primary}
          >
            Giriş Yap
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Yolculuklar</Title>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yolculuklar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Yolculuklar</Title>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Şehir ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={colors.primary}
          onSubmitEditing={fetchRides}
        />
      </View>

      <FlatList
        data={rides}
        renderItem={({ item }) => <RideCard item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateRide')}
        color={colors.onPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  rideCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
    position: 'relative',
  },
  ownerBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
  },
  ownerBadgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    marginLeft: spacing.sm,
  },
  cityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  districtText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  routeArrow: {
    paddingHorizontal: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  driverText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seatsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferencesContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  preferenceChip: {
    backgroundColor: colors.primaryOverlay,
    height: 24,
  },
  preferenceChipText: {
    fontSize: 11,
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
}); 