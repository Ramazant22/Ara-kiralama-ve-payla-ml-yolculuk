import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Button, 
  Title,
  TextInput,
  Surface,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rideService } from '../services/rideService';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function JoinRideScreen({ route, navigation }) {
  const { ride } = route.params;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    seatsRequested: 1,
    pickupLocation: '',
    dropoffLocation: '',
    message: ''
  });

  // Kendi yolculuğuna katılma kontrolü
  useEffect(() => {
    if (ride.driver._id === user._id) {
      Alert.alert(
        'Uyarı', 
        'Kendi oluşturduğunuz yolculuğa katılamazsınız.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [ride.driver._id, user._id, navigation]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (formData.seatsRequested < 1 || formData.seatsRequested > ride.remainingSeats) {
      Alert.alert('Hata', `1 ile ${ride.remainingSeats} arasında koltuk seçmelisiniz`);
      return false;
    }

    if (!formData.pickupLocation.trim()) {
      Alert.alert('Hata', 'Binme noktası zorunludur');
      return false;
    }

    if (!formData.dropoffLocation.trim()) {
      Alert.alert('Hata', 'İnme noktası zorunludur');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Kendi yolculuğuna katılamaz - ek kontrol
    if (ride.driver._id === user._id) {
      Alert.alert('Uyarı', 'Kendi oluşturduğunuz yolculuğa katılamazsınız.');
      return;
    }

    try {
      setIsLoading(true);

      const bookingData = {
        seatsRequested: parseInt(formData.seatsRequested),
        pickupAddress: formData.pickupLocation.trim(),
        dropoffAddress: formData.dropoffLocation.trim(),
        notes: formData.message.trim() || undefined
      };

      await rideService.joinRide(ride._id, bookingData);
      
      Alert.alert(
        'Başarılı!', 
        'Yolculuğa katılma talebiniz gönderildi. Sürücü talebinizi onayladığında bildirim alacaksınız.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('RidesMain')
          }
        ]
      );

    } catch (error) {
      console.error('Yolculuğa katılma hatası:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Talep gönderilirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = formData.seatsRequested * ride.pricePerSeat;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.text.primary}
          onPress={() => navigation.goBack()}
        />
        <Title style={styles.headerTitle}>Yolculuğa Katıl</Title>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Yolculuk Özeti */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Yolculuk Özeti</Title>
          
          {/* Rota */}
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <MaterialIcons name="my-location" size={20} color={colors.primary} />
              <Text style={styles.routeText}>{ride.from.city}</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={16} color={colors.text.secondary} />
            <View style={styles.routePoint}>
              <MaterialIcons name="location-on" size={20} color={colors.error} />
              <Text style={styles.routeText}>{ride.to.city}</Text>
            </View>
          </View>

          {/* Tarih ve Saat */}
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {formatDate(ride.departureDate)} - {ride.departureTime}
            </Text>
          </View>

          {/* Sürücü */}
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {ride.driver.firstName} {ride.driver.lastName}
            </Text>
          </View>

          {/* Müsait Koltuk */}
          <View style={styles.infoRow}>
            <MaterialIcons name="event-seat" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {ride.remainingSeats} koltuk müsait
            </Text>
          </View>
        </Surface>

        {/* Rezervasyon Detayları */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Rezervasyon Detayları</Title>
          
          {/* Koltuk Sayısı */}
          <Text style={styles.inputLabel}>Kaç koltuk istiyorsunuz?</Text>
          <View style={styles.seatsContainer}>
            {Array.from({ length: ride.remainingSeats }, (_, i) => i + 1).map((num) => (
              <Surface
                key={num}
                style={[
                  styles.seatButton,
                  formData.seatsRequested === num && styles.seatButtonSelected
                ]}
                onTouchEnd={() => handleInputChange('seatsRequested', num)}
              >
                <Text style={[
                  styles.seatButtonText,
                  formData.seatsRequested === num && styles.seatButtonTextSelected
                ]}>
                  {num}
                </Text>
              </Surface>
            ))}
          </View>

          {/* Binme Noktası */}
          <TextInput
            label="Binme Noktası *"
            value={formData.pickupLocation}
            onChangeText={(text) => handleInputChange('pickupLocation', text)}
            style={styles.input}
            mode="outlined"
            placeholder="Örn: Metrobüs Mecidiyeköy durağı"
            outlineColor={colors.text.disabled}
            activeOutlineColor={colors.primary}
            multiline
            numberOfLines={2}
          />

          {/* İnme Noktası */}
          <TextInput
            label="İnme Noktası *"
            value={formData.dropoffLocation}
            onChangeText={(text) => handleInputChange('dropoffLocation', text)}
            style={styles.input}
            mode="outlined"
            placeholder="Örn: Ankara Otogarı"
            outlineColor={colors.text.disabled}
            activeOutlineColor={colors.primary}
            multiline
            numberOfLines={2}
          />

          {/* Mesaj */}
          <TextInput
            label="Sürücüye Mesaj (İsteğe Bağlı)"
            value={formData.message}
            onChangeText={(text) => handleInputChange('message', text)}
            style={styles.input}
            mode="outlined"
            placeholder="Kendinizi tanıtın veya özel isteklerinizi belirtin..."
            outlineColor={colors.text.disabled}
            activeOutlineColor={colors.primary}
            multiline
            numberOfLines={3}
          />
        </Surface>

        {/* Fiyat Özeti */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Fiyat Özeti</Title>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {formData.seatsRequested} koltuk × {formatPrice(ride.pricePerSeat)}
            </Text>
            <Text style={styles.priceValue}>{formatPrice(totalPrice)}</Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>

          <Text style={styles.priceNote}>
            * Ödeme, sürücü talebinizi onayladıktan sonra yapılacaktır.
          </Text>
        </Surface>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Alt Buton */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.actionButton}
          buttonColor={colors.primary}
          contentStyle={styles.actionButtonContent}
        >
          {isLoading ? 'Gönderiliyor...' : 'Katılma Talebini Gönder'}
        </Button>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryOverlay,
    borderRadius: borderRadius.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  seatsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  seatButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  seatButtonSelected: {
    backgroundColor: colors.primary,
  },
  seatButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  seatButtonTextSelected: {
    color: colors.onPrimary,
  },
  input: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  priceNote: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
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
  actionButton: {
    borderRadius: borderRadius.md,
  },
  actionButtonContent: {
    height: 48,
  },
}); 