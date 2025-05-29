import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Title,
  ActivityIndicator,
  Chip,
  Surface,
  IconButton,
  SegmentedButtons,
  Dialog,
  Portal,
  Paragraph
} from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function BookingsScreen({ navigation }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('myBookings');
  const [bookings, setBookings] = useState({
    myBookings: [], // Kiraladığım araçlar
    vehicleRequests: [], // Araçlarıma gelen talepler
    myRideBookings: [], // Katıldığım yolculuklar
    rideRequests: [] // Yolculuklarıma gelen talepler
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { value: 'myBookings', label: 'Kiralamalarım' },
    { value: 'vehicleRequests', label: 'Araç Talepleri' },
    { value: 'myRideBookings', label: 'Yolculuklarım' },
    { value: 'rideRequests', label: 'Yolculuk Talepleri' }
  ];

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchBookingsData();
      } else {
        setIsLoading(false);
        Alert.alert(
          'Giriş Gerekli',
          'Rezervasyonlarınızı görmek için giriş yapmanız gerekiyor.',
          [
            { text: 'Tamam', onPress: () => navigation.goBack() }
          ]
        );
      }
    }
  }, [authLoading, isAuthenticated]);

  const fetchBookingsData = async () => {
    try {
      setIsLoading(true);
      
      // Paralel olarak tüm rezervasyon tiplerini getir
      const [myBookingsRes, vehicleRequestsRes, myRideBookingsRes, rideRequestsRes] = await Promise.all([
        bookingService.getMyBookings('renter'),
        bookingService.getMyBookings('owner'), 
        bookingService.getMyRideBookings('passenger'),
        bookingService.getMyRideBookings('driver')
      ]);

      setBookings({
        myBookings: myBookingsRes.bookings || [],
        vehicleRequests: vehicleRequestsRes.bookings || [],
        myRideBookings: myRideBookingsRes.bookings || [],
        rideRequests: rideRequestsRes.bookings || []
      });

    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyonlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookingsData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'awaiting_payment': return colors.secondary;
      case 'payment_expired': return colors.error;
      case 'ongoing': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      case 'rejected': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'awaiting_payment': return 'Ödeme Bekliyor';
      case 'payment_expired': return 'Ödeme Süresi Doldu';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      
      // Booking tipini kontrol et
      const isRideBooking = currentTab === 'rideRequests';
      
      if (isRideBooking) {
        await bookingService.approveRideBooking(bookingId);
        Alert.alert('Başarılı', 'Katılım talebi onaylandı!');
      } else {
        await bookingService.approveBooking(bookingId);
        Alert.alert('Başarılı', 'Rezervasyon onaylandı!');
      }
      
      fetchBookingsData();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Onaylama hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Onaylama sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      
      // Booking tipini kontrol et
      const isRideBooking = currentTab === 'rideRequests';
      
      if (isRideBooking) {
        await bookingService.rejectRideBooking(bookingId, 'Uygun değil');
        Alert.alert('Başarılı', 'Katılım talebi reddedildi!');
      } else {
        await bookingService.rejectBooking(bookingId, 'Araç uygun değil');
        Alert.alert('Başarılı', 'Rezervasyon reddedildi!');
      }
      
      fetchBookingsData();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Reddetme hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Reddetme sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setActionLoading(true);
      
      // Booking tipini kontrol et
      const isRideBooking = currentTab === 'myRideBookings';
      
      if (isRideBooking) {
        await bookingService.makeRidePayment(bookingId);
        Alert.alert('Başarılı', 'Yolculuk ödemesi tamamlandı!');
      } else {
        await bookingService.makePayment(bookingId);
        Alert.alert('Başarılı', 'Ödeme tamamlandı!');
      }
      
      fetchBookingsData();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Ödeme hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Ödeme sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPickup = async (bookingId) => {
    try {
      setActionLoading(true);
      await bookingService.confirmPickup(bookingId);
      Alert.alert('Başarılı', 'Araç teslim alındı!');
      fetchBookingsData();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Teslim alınırken hata:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Teslim alınırken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const getRemainingTime = (expiryDate) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Süresi doldu';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const BookingCard = ({ booking, isOwner = false }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.vehicleTitle}>
            {booking.vehicle?.make} {booking.vehicle?.model}
          </Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </Text>
        </View>
        
        <Chip 
          style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
          textStyle={styles.statusChipText}
        >
          {getStatusText(booking.status)}
        </Chip>
      </View>

      <View style={styles.cardContent}>
        {booking.vehicle?.images?.[0] ? (
          <Image
            source={{ uri: `http://192.168.119.21:5000${booking.vehicle.images[0]}` }}
            style={styles.vehicleImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="directions-car" size={40} color={colors.text.disabled} />
          </View>
        )}

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {isOwner ? booking.renter?.firstName : booking.vehicle?.owner?.firstName} 
              {isOwner ? ` ${booking.renter?.lastName}` : ` ${booking.vehicle?.owner?.lastName}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {booking.vehicle?.location?.city}, {booking.vehicle?.location?.district}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{formatPrice(booking.totalPrice)}</Text>
          </View>

          {booking.status === 'awaiting_payment' && booking.paymentExpiry && (
            <View style={styles.detailRow}>
              <MaterialIcons name="timer" size={16} color={colors.error} />
              <Text style={[styles.detailText, { color: colors.error }]}>
                Kalan süre: {getRemainingTime(booking.paymentExpiry)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Button
          mode="outlined"
          onPress={() => {
            setSelectedBooking(booking);
            setDetailDialogOpen(true);
          }}
          style={styles.detailButton}
        >
          Detaylar
        </Button>

        {/* Owner için onay/red butonları */}
        {isOwner && booking.status === 'pending' && (
          <>
            <Button
              mode="contained"
              onPress={() => handleApproveBooking(booking._id)}
              style={styles.approveButton}
              buttonColor={colors.success}
              loading={actionLoading}
            >
              Onayla
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleRejectBooking(booking._id)}
              style={styles.rejectButton}
              textColor={colors.error}
              loading={actionLoading}
            >
              Reddet
            </Button>
          </>
        )}

        {/* Renter için ödeme butonu */}
        {!isOwner && booking.status === 'awaiting_payment' && (
          <Button
            mode="contained"
            onPress={() => handlePayment(booking._id)}
            style={styles.paymentButton}
            buttonColor={colors.primary}
            loading={actionLoading}
          >
            Ödeme Yap
          </Button>
        )}

        {/* Renter için teslim alma butonu */}
        {!isOwner && booking.status === 'confirmed' && (
          <Button
            mode="contained"
            onPress={() => handleConfirmPickup(booking._id)}
            style={styles.confirmButton}
            buttonColor={colors.success}
            loading={actionLoading}
          >
            Teslim Al
          </Button>
        )}
      </View>
    </Card>
  );

  const RideBookingCard = ({ booking, isOwner = false }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.vehicleTitle}>
            {booking.ride?.from?.city} → {booking.ride?.to?.city}
          </Text>
          <Text style={styles.bookingDate}>
            {formatDate(booking.ride?.departureDate)} - {booking.ride?.departureTime}
          </Text>
        </View>
        
        <Chip 
          style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
          textStyle={styles.statusChipText}
        >
          {getStatusText(booking.status)}
        </Chip>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.rideIcon}>
          <MaterialIcons name="directions" size={40} color={colors.primary} />
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {isOwner ? booking.passenger?.firstName : booking.ride?.driver?.firstName} 
              {isOwner ? ` ${booking.passenger?.lastName}` : ` ${booking.ride?.driver?.lastName}`}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="event-seat" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {booking.seatsRequested} koltuk
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {formatPrice(booking.seatsRequested * (booking.ride?.pricePerSeat || 0))}
            </Text>
          </View>

          {booking.status === 'awaiting_payment' && booking.paymentDetails?.paymentExpiryDate && (
            <View style={styles.detailRow}>
              <MaterialIcons name="timer" size={16} color={colors.error} />
              <Text style={[styles.detailText, { color: colors.error }]}>
                Kalan süre: {getRemainingTime(booking.paymentDetails.paymentExpiryDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Button
          mode="outlined"
          onPress={() => {
            setSelectedBooking(booking);
            setDetailDialogOpen(true);
          }}
          style={styles.detailButton}
        >
          Detaylar
        </Button>

        {/* Driver için onay/red butonları */}
        {isOwner && booking.status === 'pending' && (
          <>
            <Button
              mode="contained"
              onPress={() => handleApproveBooking(booking._id)}
              style={styles.approveButton}
              buttonColor={colors.success}
              loading={actionLoading}
            >
              Onayla
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleRejectBooking(booking._id)}
              style={styles.rejectButton}
              textColor={colors.error}
              loading={actionLoading}
            >
              Reddet
            </Button>
          </>
        )}

        {/* Passenger için ödeme butonu */}
        {!isOwner && booking.status === 'awaiting_payment' && (
          <Button
            mode="contained"
            onPress={() => handlePayment(booking._id)}
            style={styles.paymentButton}
            buttonColor={colors.primary}
            loading={actionLoading}
          >
            Ödeme Yap
          </Button>
        )}
      </View>
    </Card>
  );

  const renderContent = () => {
    const currentBookings = bookings[currentTab] || [];
    
    if (currentBookings.length === 0) {
      return (
        <Surface style={styles.emptyState}>
          <MaterialIcons name="event-note" size={64} color={colors.text.disabled} />
          <Title style={styles.emptyTitle}>Henüz rezervasyon yok</Title>
          <Text style={styles.emptyText}>
            {currentTab === 'myBookings' && 'Henüz araç kiralamanız bulunmuyor'}
            {currentTab === 'vehicleRequests' && 'Araçlarınıza henüz kiralama talebi gelmemiş'}
            {currentTab === 'myRideBookings' && 'Henüz katıldığınız yolculuk bulunmuyor'}
            {currentTab === 'rideRequests' && 'Yolculuklarınıza henüz katılım talebi gelmemiş'}
          </Text>
        </Surface>
      );
    }

    const isOwnerTab = currentTab === 'vehicleRequests' || currentTab === 'rideRequests';
    const isRideBooking = currentTab === 'myRideBookings' || currentTab === 'rideRequests';

    return (
      <ScrollView 
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentBookings.map((booking) => (
          isRideBooking ? (
            <RideBookingCard 
              key={booking._id} 
              booking={booking} 
              isOwner={isOwnerTab}
            />
          ) : (
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              isOwner={isOwnerTab}
            />
          )
        ))}
      </ScrollView>
    );
  };

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
          <Title style={styles.headerTitle}>Rezervasyonlar</Title>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Rezervasyonlar yükleniyor...</Text>
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
        <Title style={styles.headerTitle}>Rezervasyonlar</Title>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SegmentedButtons
            value={currentTab}
            onValueChange={setCurrentTab}
            buttons={tabs}
            style={styles.segmentedButtons}
          />
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Booking Detail Dialog */}
      <Portal>
        <Dialog visible={detailDialogOpen} onDismiss={() => setDetailDialogOpen(false)}>
          <Dialog.Title>Rezervasyon Detayları</Dialog.Title>
          <Dialog.Content>
            {selectedBooking && (
              <View>
                <Paragraph style={styles.dialogText}>
                  <Text style={styles.dialogLabel}>Araç: </Text>
                  {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                </Paragraph>
                <Paragraph style={styles.dialogText}>
                  <Text style={styles.dialogLabel}>Başlangıç: </Text>
                  {formatDate(selectedBooking.startDate)}
                </Paragraph>
                <Paragraph style={styles.dialogText}>
                  <Text style={styles.dialogLabel}>Bitiş: </Text>
                  {formatDate(selectedBooking.endDate)}
                </Paragraph>
                <Paragraph style={styles.dialogText}>
                  <Text style={styles.dialogLabel}>Toplam Fiyat: </Text>
                  {formatPrice(selectedBooking.totalPrice)}
                </Paragraph>
                <Paragraph style={styles.dialogText}>
                  <Text style={styles.dialogLabel}>Durum: </Text>
                  {getStatusText(selectedBooking.status)}
                </Paragraph>
                {selectedBooking.notes && (
                  <Paragraph style={styles.dialogText}>
                    <Text style={styles.dialogLabel}>Notlar: </Text>
                    {selectedBooking.notes}
                  </Paragraph>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDetailDialogOpen(false)}>Kapat</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  tabContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segmentedButtons: {
    minWidth: '100%',
  },
  content: {
    flex: 1,
  },
  bookingsList: {
    flex: 1,
    padding: spacing.md,
  },
  bookingCard: {
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
  bookingInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bookingDate: {
    fontSize: 13,
    color: colors.text.secondary,
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
    width: 80,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  placeholderImage: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailButton: {
    borderRadius: borderRadius.sm,
  },
  approveButton: {
    borderRadius: borderRadius.sm,
  },
  rejectButton: {
    borderRadius: borderRadius.sm,
    borderColor: colors.error,
  },
  paymentButton: {
    borderRadius: borderRadius.sm,
  },
  confirmButton: {
    borderRadius: borderRadius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    margin: spacing.md,
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
  },
  dialogText: {
    marginBottom: spacing.sm,
  },
  dialogLabel: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  rideIcon: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
}); 