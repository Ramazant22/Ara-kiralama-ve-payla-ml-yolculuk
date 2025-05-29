import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Surface,
  IconButton,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideService } from '../services/rideService';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function RideDetailScreen({ route, navigation }) {
  const { rideId } = route.params;
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRideDetail();
  }, [rideId]);

  const fetchRideDetail = async () => {
    try {
      setIsLoading(true);
      const response = await rideService.getRide(rideId);
      setRide(response.ride);
    } catch (error) {
      console.error('Yolculuk detayı yüklenirken hata:', error);
      Alert.alert('Hata', 'Yolculuk detayı yüklenirken hata oluştu');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
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

  const handleJoinRide = () => {
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

  const handleContactDriver = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Mesaj göndermek için giriş yapmanız gerekiyor.');
      return;
    }

    if (ride.driver._id === user._id) {
      Alert.alert('Bilgi', 'Bu sizin yolculuğunuz');
      return;
    }

    try {
      // Konuşma başlat veya mevcut konuşmayı getir
      const response = await chatService.startConversation(
        ride.driver._id,
        'ride_sharing',
        {
          title: `${ride.from.city} - ${ride.to.city} Yolculuğu`,
          relatedTo: ride._id,
          relatedModel: 'Ride'
        }
      );

      // Chat ekranına yönlendir
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: response.conversation._id,
          otherUser: ride.driver,
          conversationTitle: `${ride.from.city} - ${ride.to.city} Yolculuğu`
        }
      });

    } catch (error) {
      console.error('Konuşma başlatma hatası:', error);
      Alert.alert('Hata', 'Mesajlaşma başlatılırken hata oluştu');
    }
  };

  const conversationLevels = {
    quiet: 'Sessiz',
    moderate: 'Orta',
    chatty: 'Sohbet'
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
          <Title style={styles.headerTitle}>Yolculuk Detayı</Title>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yolculuk detayı yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.text.primary}
            onPress={() => navigation.goBack()}
          />
          <Title style={styles.headerTitle}>Yolculuk Detayı</Title>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="error" size={64} color={colors.error} />
          <Title style={styles.emptyTitle}>Yolculuk Bulunamadı</Title>
          <Text style={styles.emptyText}>Bu yolculuk silinmiş veya mevcut değil</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnRide = ride.driver._id === user._id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>Yolculuk Detayı</Title>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Rota Bilgileri */}
        <Surface style={styles.section}>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <MaterialIcons name="my-location" size={24} color={colors.primary} />
              <View style={styles.routeText}>
                <Text style={styles.cityText}>{ride.from.city}</Text>
                {ride.from.district && (
                  <Text style={styles.districtText}>{ride.from.district}</Text>
                )}
                {ride.from.address && (
                  <Text style={styles.addressText}>{ride.from.address}</Text>
                )}
              </View>
            </View>

            <View style={styles.routeArrow}>
              <MaterialIcons name="arrow-downward" size={24} color={colors.text.secondary} />
            </View>

            <View style={styles.routePoint}>
              <MaterialIcons name="location-on" size={24} color={colors.error} />
              <View style={styles.routeText}>
                <Text style={styles.cityText}>{ride.to.city}</Text>
                {ride.to.district && (
                  <Text style={styles.districtText}>{ride.to.district}</Text>
                )}
                {ride.to.address && (
                  <Text style={styles.addressText}>{ride.to.address}</Text>
                )}
              </View>
            </View>
          </View>
        </Surface>

        {/* Tarih ve Saat */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Tarih ve Saat</Title>
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(ride.departureDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{ride.departureTime}</Text>
          </View>
        </Surface>

        {/* Sürücü Bilgileri */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Sürücü</Title>
          <View style={styles.driverInfo}>
            <MaterialIcons name="person" size={40} color={colors.text.secondary} />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>
                {ride.driver.firstName} {ride.driver.lastName}
              </Text>
              {ride.driver.rating && typeof ride.driver.rating === 'number' && ride.driver.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color={colors.star} />
                  <Text style={styles.ratingText}>{ride.driver.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </Surface>

        {/* Araç Bilgileri */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Araç</Title>
          <View style={styles.infoRow}>
            <MaterialIcons name="directions-car" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.year})
            </Text>
          </View>
          {ride.vehicle.color && (
            <View style={styles.infoRow}>
              <MaterialIcons name="palette" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{ride.vehicle.color}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <MaterialIcons name="confirmation-number" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{ride.vehicle.licensePlate}</Text>
          </View>
        </Surface>

        {/* Kapasite ve Fiyat */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Kapasite ve Fiyat</Title>
          <View style={styles.capacityPriceContainer}>
            <View style={styles.capacityContainer}>
              <Text style={styles.capacityLabel}>Müsait Koltuk</Text>
              <Text style={[
                styles.capacityValue,
                { color: ride.remainingSeats > 0 ? colors.success : colors.error }
              ]}>
                {ride.remainingSeats} / {ride.availableSeats}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Koltuk Başına</Text>
              <Text style={styles.priceValue}>{formatPrice(ride.pricePerSeat)}</Text>
            </View>
          </View>
        </Surface>

        {/* Tercihler */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Yolculuk Tercihleri</Title>
          <View style={styles.preferencesGrid}>
            <View style={styles.preferenceItem}>
              <MaterialIcons 
                name={ride.preferences?.smokingAllowed ? "check-circle" : "cancel"} 
                size={20} 
                color={ride.preferences?.smokingAllowed ? colors.success : colors.error} 
              />
              <Text style={styles.preferenceText}>Sigara</Text>
            </View>
            <View style={styles.preferenceItem}>
              <MaterialIcons 
                name={ride.preferences?.petsAllowed ? "check-circle" : "cancel"} 
                size={20} 
                color={ride.preferences?.petsAllowed ? colors.success : colors.error} 
              />
              <Text style={styles.preferenceText}>Evcil Hayvan</Text>
            </View>
            <View style={styles.preferenceItem}>
              <MaterialIcons 
                name={ride.preferences?.musicAllowed ? "check-circle" : "cancel"} 
                size={20} 
                color={ride.preferences?.musicAllowed ? colors.success : colors.error} 
              />
              <Text style={styles.preferenceText}>Müzik</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="chat" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              Sohbet: {conversationLevels[ride.preferences?.conversationLevel] || 'Belirtilmemiş'}
            </Text>
          </View>
        </Surface>

        {/* Açıklama */}
        {(ride.description || ride.notes) && (
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Ek Bilgiler</Title>
            {ride.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Açıklama:</Text>
                <Text style={styles.descriptionText}>{ride.description}</Text>
              </View>
            )}
            {ride.notes && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Notlar:</Text>
                <Text style={styles.descriptionText}>{ride.notes}</Text>
              </View>
            )}
          </Surface>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Alt Butonlar */}
      {!isOwnRide && (
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleContactDriver}
              style={styles.contactButton}
              icon="message"
              textColor={colors.primary}
            >
              Mesaj Gönder
            </Button>
            <Button
              mode="contained"
              onPress={handleJoinRide}
              disabled={ride.remainingSeats <= 0}
              style={styles.joinButton}
              buttonColor={ride.remainingSeats > 0 ? colors.primary : colors.text.disabled}
            >
              {ride.remainingSeats > 0 ? 'Yolculuğa Katıl' : 'Dolu'}
            </Button>
          </View>
        </View>
      )}

      {isOwnRide && (
        <View style={styles.actionContainer}>
          <Text style={styles.ownRideText}>Bu sizin yolculuğunuz</Text>
        </View>
      )}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  routeContainer: {
    alignItems: 'center',
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.sm,
  },
  routeText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  cityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  districtText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  addressText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  routeArrow: {
    alignSelf: 'flex-start',
    marginLeft: spacing.xs,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text.secondary,
  },
  capacityPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  capacityContainer: {
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  capacityValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  preferencesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  preferenceItem: {
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomSpace: {
    height: spacing.lg,
  },
  actionContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactButton: {
    borderRadius: borderRadius.md,
    flex: 1,
  },
  joinButton: {
    borderRadius: borderRadius.md,
    flex: 2,
  },
  ownRideText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
}); 