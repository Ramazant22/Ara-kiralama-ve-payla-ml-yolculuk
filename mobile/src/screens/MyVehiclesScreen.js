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
  Title,
  ActivityIndicator,
  Chip,
  Surface,
  IconButton,
  Menu
} from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function MyVehiclesScreen({ navigation }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMyVehicles();
      } else {
        // Kullanıcı giriş yapmamış
        setIsLoading(false);
        Alert.alert(
          'Giriş Gerekli',
          'Araçlarınızı görmek için giriş yapmanız gerekiyor.',
          [
            { text: 'Tamam', onPress: () => navigation.goBack() }
          ]
        );
      }
    }
  }, [authLoading, isAuthenticated]);

  const fetchMyVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await vehicleService.getMyVehicles();
      console.log('MyVehicles API response:', response);
      console.log('Vehicles array:', response.vehicles);
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Araçlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyVehicles();
    setRefreshing(false);
  };

  const toggleMenu = (vehicleId) => {
    setMenuVisible(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
  };

  const handleEditVehicle = (vehicle) => {
    setMenuVisible({});
    navigation.navigate('EditVehicle', { vehicle });
  };

  const handleDeleteVehicle = (vehicleId) => {
    setMenuVisible({});
    
    Alert.alert(
      'Aracı Sil',
      'Bu aracı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => deleteVehicle(vehicleId)
        }
      ]
    );
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      Alert.alert('Başarılı', 'Araç başarıyla silindi');
      fetchMyVehicles();
    } catch (error) {
      console.error('Araç silinirken hata:', error);
      Alert.alert('Hata', 'Araç silinirken hata oluştu');
    }
  };

  const handleChangeStatus = async (vehicleId, newStatus) => {
    try {
      setMenuVisible({});
      await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      Alert.alert('Başarılı', 'Araç durumu güncellendi');
      fetchMyVehicles();
    } catch (error) {
      console.error('Araç durumu güncellenirken hata:', error);
      Alert.alert('Hata', 'Araç durumu güncellenirken hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return colors.success;
      case 'rented': return colors.warning;
      case 'maintenance': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'rented': return 'Kiralandı';
      case 'maintenance': return 'Bakımda';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderVehicleCard = ({ item }) => (
    <Card style={styles.vehicleCard}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>{item.make} {item.model}</Text>
          <Text style={styles.vehicleSubtitle}>{item.year} • {item.licensePlate}</Text>
        </View>
        
        <View style={styles.cardActions}>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(item.status)}
          </Chip>
          
          <Menu
            visible={menuVisible[item._id]}
            onDismiss={() => toggleMenu(item._id)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => toggleMenu(item._id)}
              />
            }
          >
            <Menu.Item 
              onPress={() => handleEditVehicle(item)} 
              title="Düzenle" 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => handleChangeStatus(item._id, 'available')} 
              title="Müsait Yap" 
              leadingIcon="check-circle"
              disabled={item.status === 'available'}
            />
            <Menu.Item 
              onPress={() => handleChangeStatus(item._id, 'maintenance')} 
              title="Bakıma Al" 
              leadingIcon="wrench"
              disabled={item.status === 'maintenance'}
            />
            <Menu.Item 
              onPress={() => handleDeleteVehicle(item._id)} 
              title="Sil" 
              leadingIcon="delete"
            />
          </Menu>
        </View>
      </View>

      <View style={styles.cardContent}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: `http://192.168.119.21:5000${item.images[0]}` }}
            style={styles.vehicleImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="directions-car" size={40} color={colors.text.disabled} />
          </View>
        )}

        <View style={styles.vehicleDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{item.location?.city}, {item.location?.district}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="local-gas-station" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{item.fuelType}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="settings" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{item.transmission}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="people" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{item.seats} kişi</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatPrice(item.pricePerDay)}/gün</Text>
          {item.pricePerHour && (
            <Text style={styles.hourlyPriceText}>{formatPrice(item.pricePerHour)}/saat</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Kiralama</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {item.rating?.average ? item.rating.average.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Puan</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <MaterialIcons name="directions-car" size={64} color={colors.text.disabled} />
      <Title style={styles.emptyTitle}>Henüz araç eklenmemiş</Title>
      <Text style={styles.emptyText}>
        İlk aracınızı ekleyerek kazanmaya başlayın
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddVehicle')}
        style={styles.emptyButton}
        buttonColor={colors.primary}
      >
        Araç Ekle
      </Button>
    </Surface>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.text.primary}
            onPress={() => navigation.goBack()}
          />
          <Title style={styles.headerTitle}>Araçlarım</Title>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Araçlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>Araçlarım</Title>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
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
        onPress={() => navigation.navigate('AddVehicle')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    color: colors.onPrimary,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  vehicleImage: {
    width: 100,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  placeholderImage: {
    width: 100,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  hourlyPriceText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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