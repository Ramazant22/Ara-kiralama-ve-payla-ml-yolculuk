import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Alert,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip,
  IconButton,
  ActivityIndicator,
  Title,
  Paragraph,
  Surface,
  Divider,
  Modal,
  Portal,
  TextInput
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';
import { chatService } from '../services/chatService';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  vehicleImage: {
    width: screenWidth,
    height: 300,
    backgroundColor: colors.surfaceLight,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorDotActive: {
    backgroundColor: colors.primary,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  statusBadgeText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    elevation: 2,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vehicleTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceDaily: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  vehicleSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  statsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailLabel: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 15,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  featuresCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    elevation: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    backgroundColor: colors.primaryOverlay,
  },
  featureChipText: {
    color: colors.primary,
    fontSize: 12,
  },
  pricingCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    elevation: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pricingLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  actionBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  actionBarContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  rentButton: {
    flex: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  dateSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.text.disabled,
    borderRadius: borderRadius.small,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  dateValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  priceSection: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  notesInput: {
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButton: {
    flex: 1,
  },
});

export default function VehicleDetailScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Kiralama modal state'leri
  const [rentalModalVisible, setRentalModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Yarın
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadVehicleDetail();
  }, [vehicleId]);

  const loadVehicleDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await vehicleService.getVehicle(vehicleId);
      setVehicle(response.vehicle);
      
    } catch (error) {
      console.error('Araç detayı yüklenirken hata:', error);
      setError('Araç detayları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
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

  const handleRentVehicle = () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Araç kiralamak için giriş yapmanız gerekiyor.');
      return;
    }

    // Kullanıcı kendi aracını kiralayamaz
    if (vehicle.owner._id === user._id) {
      Alert.alert('Uyarı', 'Kendi aracınızı kiralayamazsınız.');
      return;
    }

    if (vehicle.status !== 'available') {
      Alert.alert('Uyarı', 'Bu araç şu anda kiralama için müsait değil');
      return;
    }
    setRentalModalVisible(true);
  };

  const calculateTotalPrice = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * vehicle.pricePerDay;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmitRental = async () => {
    try {
      setIsSubmitting(true);

      // Tarih validasyonu
      if (startDate >= endDate) {
        Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        return;
      }

      if (startDate < new Date()) {
        Alert.alert('Hata', 'Başlangıç tarihi bugünden önce olamaz');
        return;
      }

      const bookingData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: calculateTotalPrice(),
        notes: notes.trim()
      };

      await bookingService.createBooking(vehicle._id, bookingData);
      
      setRentalModalVisible(false);
      Alert.alert(
        'Başarılı', 
        'Kiralama talebiniz gönderildi! Araç sahibinin onayını bekleyiniz.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('Bookings')
          }
        ]
      );

    } catch (error) {
      console.error('Kiralama talebi gönderilirken hata:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Kiralama talebi gönderilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert('Favoriler', isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  };

  const handleContactOwner = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Mesaj göndermek için giriş yapmanız gerekiyor.');
      return;
    }

    if (vehicle.owner._id === user._id) {
      Alert.alert('Bilgi', 'Bu sizin aracınız');
      return;
    }

    try {
      // Konuşma başlat veya mevcut konuşmayı getir
      const response = await chatService.startConversation(
        vehicle.owner._id,
        'vehicle_rental',
        {
          title: `${vehicle.make} ${vehicle.model} - Araç Kiralama`,
          relatedTo: vehicle._id,
          relatedModel: 'Vehicle'
        }
      );

      // Chat ekranına yönlendir
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: response.conversation._id,
          otherUser: vehicle.owner,
          conversationTitle: `${vehicle.make} ${vehicle.model} - Araç Kiralama`
        }
      });

    } catch (error) {
      console.error('Konuşma başlatma hatası:', error);
      Alert.alert('Hata', 'Mesajlaşma başlatılırken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Araç detayları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !vehicle) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Hata Oluştu</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <Button
            mode="contained"
            onPress={loadVehicleDetail}
            style={styles.retryButton}
            buttonColor={colors.primary}
          >
            Tekrar Dene
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const images = vehicle.images || [];
  const hasImages = images.length > 0;

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <SafeAreaView style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          size={24}
          iconColor={colors.error}
          onPress={handleToggleFavorite}
          style={styles.favoriteButton}
        />
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {hasImages ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setCurrentImageIndex(index);
              }}
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ 
                    uri: `http://192.168.119.21:5000${image.url}`,
                  }}
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/400x250/ff6b35/ffffff?text=Araç+Fotoğrafı' }}
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          )}
          
          {/* Image Indicator */}
          {hasImages && images.length > 1 && (
            <View style={styles.imageIndicator}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentImageIndex && styles.indicatorDotActive
                  ]}
                />
              ))}
            </View>
          )}

          {/* Status Badge */}
          <Chip 
            style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}
            textStyle={styles.statusBadgeText}
          >
            {getStatusText(vehicle.status)}
          </Chip>
        </View>

        {/* Vehicle Info */}
        <View style={styles.content}>
          {/* Title and Price */}
          <Surface style={styles.infoCard}>
            <View style={styles.titleSection}>
              <Title style={styles.vehicleTitle}>
                {vehicle.make} {vehicle.model}
              </Title>
              <View style={styles.priceSection}>
                <Text style={styles.priceDaily}>₺{vehicle.pricePerDay}</Text>
                <Text style={styles.priceLabel}>günlük</Text>
              </View>
            </View>
            
            <Text style={styles.vehicleSubtitle}>
              {vehicle.year} Model • {vehicle.licensePlate}
            </Text>
          </Surface>

          {/* Quick Stats */}
          <Surface style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="people" size={20} color={colors.primary} />
                <Text style={styles.statText}>{vehicle.seats} Kişi</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="local-gas-station" size={20} color={colors.primary} />
                <Text style={styles.statText}>{vehicle.fuelType}</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="settings" size={20} color={colors.primary} />
                <Text style={styles.statText}>{vehicle.transmission}</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={20} color={colors.star} />
                <Text style={styles.statText}>
                  {typeof vehicle.rating === 'object' ? vehicle.rating?.average || 0 : vehicle.rating || 0}
                </Text>
              </View>
            </View>
          </Surface>

          {/* Vehicle Details */}
          <Surface style={styles.detailsCard}>
            <Title style={styles.sectionTitle}>Araç Detayları</Title>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="color-lens" size={20} color={colors.text.secondary} />
              <Text style={styles.detailLabel}>Renk</Text>
              <Text style={styles.detailValue}>{vehicle.color}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="category" size={20} color={colors.text.secondary} />
              <Text style={styles.detailLabel}>Kategori</Text>
              <Text style={styles.detailValue}>{vehicle.category}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color={colors.text.secondary} />
              <Text style={styles.detailLabel}>Konum</Text>
              <Text style={styles.detailValue}>
                {vehicle.location?.district}, {vehicle.location?.city}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="directions-car" size={20} color={colors.text.secondary} />
              <Text style={styles.detailLabel}>Toplam Kiralama</Text>
              <Text style={styles.detailValue}>{vehicle.totalBookings || 0} kez</Text>
            </View>
          </Surface>

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <Surface style={styles.featuresCard}>
              <Title style={styles.sectionTitle}>Özellikler</Title>
              <View style={styles.featuresContainer}>
                {vehicle.features.map((feature, index) => (
                  <Chip
                    key={index}
                    style={styles.featureChip}
                    textStyle={styles.featureChipText}
                  >
                    {feature}
                  </Chip>
                ))}
              </View>
            </Surface>
          )}

          {/* Pricing Details */}
          <Surface style={styles.pricingCard}>
            <Title style={styles.sectionTitle}>Fiyatlandırma</Title>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Günlük</Text>
              <Text style={styles.pricingValue}>₺{vehicle.pricePerDay}</Text>
            </View>
            {vehicle.pricePerHour && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Saatlik</Text>
                <Text style={styles.pricingValue}>₺{vehicle.pricePerHour}</Text>
              </View>
            )}
            {vehicle.pricePerKm && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Kilometre</Text>
                <Text style={styles.pricingValue}>₺{vehicle.pricePerKm}</Text>
              </View>
            )}
          </Surface>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Rental Modal */}
      <Portal>
        <Modal
          visible={rentalModalVisible}
          onDismiss={() => setRentalModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <Title style={styles.modalTitle}>Araç Kirala</Title>
            
            <Text style={styles.modalSubtitle}>
              {vehicle?.make} {vehicle?.model} - {formatPrice(vehicle?.pricePerDay)}/gün
            </Text>

            {/* Tarih Seçimi */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>Kiralama Tarihleri</Text>
              
              <View style={styles.dateRow}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>Başlangıç</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateLabel}>Bitiş</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Fiyat Hesaplama */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))} gün × {formatPrice(vehicle?.pricePerDay)}
                </Text>
                <Text style={styles.totalPrice}>{formatPrice(calculateTotalPrice())}</Text>
              </View>
            </View>

            {/* Notlar */}
            <TextInput
              label="Notlar (İsteğe bağlı)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.notesInput}
              outlineColor={colors.text.disabled}
              activeOutlineColor={colors.primary}
            />

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setRentalModalVisible(false)}
                style={styles.modalButton}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmitRental}
                style={styles.modalButton}
                buttonColor={colors.primary}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Talep Gönder
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
          minimumDate={startDate}
        />
      )}

      {/* Bottom Action Bar */}
      <SafeAreaView style={styles.actionBar}>
        <View style={styles.actionBarContent}>
          <Button
            mode="outlined"
            onPress={handleContactOwner}
            style={styles.contactButton}
            buttonColor="transparent"
            textColor={colors.primary}
          >
            İletişim
          </Button>
          
          {vehicle.owner._id === user?._id ? (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('MyVehicles')}
              style={styles.rentButton}
              buttonColor={colors.primary}
            >
              Araçlarım
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleRentVehicle}
              style={styles.rentButton}
              buttonColor={colors.primary}
              disabled={vehicle.status !== 'available'}
            >
              {vehicle.status === 'available' ? 'Kirala' : 'Müsait Değil'}
            </Button>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
} 