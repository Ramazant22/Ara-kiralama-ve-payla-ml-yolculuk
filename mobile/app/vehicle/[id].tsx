import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../_layout';

// Araç detayı veri modeli
interface VehicleDetail {
  id: string;
  brand: string;
  model: string;
  year: number;
  images: string[];
  price: number;
  location: string;
  owner: {
    id: string;
    name: string;
    rating: number;
    photo: string;
  };
  features: string[];
  description: string;
}

// Kullanıcı doğrulama bilgisi
interface UserVerification {
  isIdentityVerified: boolean;
  isDrivingLicenseVerified: boolean;
}

export default function VehicleDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userVerification, setUserVerification] = useState<UserVerification>({
    isIdentityVerified: false,
    isDrivingLicenseVerified: false
  });

  // Araç ve kullanıcı doğrulama bilgilerini getirme
  useEffect(() => {
    // Gerçek uygulamada API'den veri çekme işlemi burada yapılır
    
    // Örnek araç verisi
    setTimeout(() => {
      setVehicle({
        id: vehicleId,
        brand: 'BMW',
        model: '3.20i',
        year: 2021,
        images: [
          'https://via.placeholder.com/800x450',
          'https://via.placeholder.com/800x450',
          'https://via.placeholder.com/800x450'
        ],
        price: 750,
        location: 'İstanbul, Kadıköy',
        owner: {
          id: 'owner1',
          name: 'Ahmet Yılmaz',
          rating: 4.8,
          photo: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        features: [
          'Otomatik Vites',
          'Dizel',
          'Klima',
          'Bluetooth',
          'Navigasyon',
          'Deri Koltuk'
        ],
        description: 'Düzenli bakımları yapılmış, temiz ve ekonomik bir araç. İş seyahatleri ve günlük kullanım için idealdir. Geniş bagaj hacmi ile tatil için de uygun.'
      });
      
      // Örnek kullanıcı doğrulama bilgisi
      // Gerçek uygulamada API'den alınır
      setUserVerification({
        isIdentityVerified: true,
        isDrivingLicenseVerified: false // Ehliyet doğrulama durumu
      });
      
      setLoading(false);
    }, 1000);
  }, [vehicleId]);

  // Date picker state
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [totalDays, setTotalDays] = useState(3);

  // Show date picker
  const showStartDatepicker = () => {
    setShowStartDate(true);
  };

  const showEndDatepicker = () => {
    setShowEndDate(true);
  };

  // Handle date changes
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDate(Platform.OS === 'ios');
    setStartDate(currentDate);
    calculateTotalDays(currentDate, endDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDate(Platform.OS === 'ios');
    setEndDate(currentDate);
    calculateTotalDays(startDate, currentDate);
  };

  // Calculate total days
  const calculateTotalDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setTotalDays(diffDays);
  };

  // Handle booking
  const handleBooking = () => {
    const totalPrice = totalDays * (vehicle?.price || 0);

    Alert.alert(
      "Rezervasyon Onayı",
      `${vehicle?.brand} ${vehicle?.model} aracını ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} tarihleri arasında kiralamak istediğinize emin misiniz? Toplam tutar: ${totalPrice} TL`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Onayla", 
          onPress: () => {
            Alert.alert("Başarılı", "Rezervasyonunuz başarıyla alınmıştır.");
            router.back();
          } 
        }
      ]
    );
  };

  // Get icon for feature
  const getFeatureIcon = (feature: string) => {
    const iconMap: {[key: string]: string} = {
      'Klima': 'snowflake',
      'Bluetooth': 'bluetooth',
      'Deri Koltuk': 'couch',
      'Navigasyon': 'map-marked-alt',
      'Geri Görüş Kamerası': 'camera',
      'Sunroof': 'sun',
      'ABS': 'car-crash',
      'Çocuk Koltuğu': 'baby',
      'USB': 'usb'
    };
    return iconMap[feature] || 'check-circle';
  };

  // Favorilere ekleme/çıkarma işlemi
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
    // Gerçek uygulamada API çağrısı burada yapılır
    if (!isFavorite) {
      Alert.alert('Bilgi', 'Araç favorilerinize eklendi.');
    }
  };
  
  // Kiralama işlemi
  const handleRent = () => {
    // Kullanıcı doğrulama kontrolü
    if (!userVerification.isIdentityVerified || !userVerification.isDrivingLicenseVerified) {
      Alert.alert(
        'Doğrulama Gerekli',
        'Araç kiralayabilmek için kimlik ve ehliyet bilgilerinizi doğrulamanız gerekmektedir.',
        [
          {
            text: 'Vazgeç',
            style: 'cancel'
          },
          {
            text: 'Doğrulama Yap',
            onPress: () => router.push('/identity-verification' as any)
          }
        ]
      );
      return;
    }
    
    // Doğrulama tamamlanmışsa kiralama sayfasına yönlendir
    router.push(`/rent/${vehicleId}` as any);
  };
  
  // Araba sahibiyle iletişim
  const contactOwner = () => {
    // Gerçek uygulamada mesajlaşma veya iletişim sayfasına yönlendirilir
    Alert.alert('Bilgi', 'Mesajlaşma özelliği yakında eklenecektir.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Araç bilgileri yükleniyor...</Text>
      </View>
    );
  }
  
  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color={colors.primary} />
        <Text style={styles.errorText}>Araç bilgileri bulunamadı.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${vehicle.brand} ${vehicle.model}`,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView>
        {/* Araç Görselleri */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: vehicle.images[selectedImage] }} 
            style={styles.mainImage} 
          />
          
          <View style={styles.thumbnailsContainer}>
            {vehicle.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnailButton,
                  selectedImage === index && styles.selectedThumbnail
                ]}
              >
                <Image 
                  source={{ uri: image }} 
                  style={styles.thumbnailImage} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <FontAwesome5 
              name="heart" 
              size={24} 
              color={isFavorite ? '#FF6B6B' : 'rgba(255,255,255,0.8)'} 
              solid={isFavorite}
            />
          </TouchableOpacity>
        </View>
        
        {/* Araç Bilgileri */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{vehicle.brand} {vehicle.model}</Text>
              <Text style={styles.year}>{vehicle.year}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Günlük</Text>
              <Text style={styles.price}>{vehicle.price} TL</Text>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.locationContainer}>
            <FontAwesome5 name="map-marker-alt" size={16} color={colors.primary} />
            <Text style={styles.location}>{vehicle.location}</Text>
          </View>
          
          {/* Owner Info */}
          <View style={styles.ownerContainer}>
            <Image 
              source={{ uri: vehicle.owner.photo }} 
              style={styles.ownerPhoto}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{vehicle.owner.name}</Text>
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" solid size={14} color="#FFD700" />
                <Text style={styles.rating}>{vehicle.owner.rating}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={contactOwner}
            >
              <FontAwesome5 name="comment" size={14} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>İletişim</Text>
            </TouchableOpacity>
          </View>
          
          {/* Vehicle Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Araç Özellikleri</Text>
            <View style={styles.featuresContainer}>
              {vehicle.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <FontAwesome5 name={getFeatureIcon(feature)} size={16} color={colors.primary} solid />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Vehicle Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Araç Hakkında</Text>
            <Text style={styles.description}>{vehicle.description}</Text>
          </View>
          
          {/* Doğrulama Bilgisi */}
          {(!userVerification.isIdentityVerified || !userVerification.isDrivingLicenseVerified) && (
            <View style={styles.verificationWarning}>
              <FontAwesome5 name="exclamation-triangle" size={20} color="#FF9800" />
              <Text style={styles.verificationText}>
                Araç kiralayabilmek için kimlik ve ehliyet bilgilerinizi doğrulamanız gerekmektedir.
              </Text>
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => router.push('/identity-verification' as any)}
              >
                <Text style={styles.verifyButtonText}>Doğrulama Yap</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Booking Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rezervasyon</Text>
            
            <View style={styles.dateSelectContainer}>
              <TouchableOpacity 
                style={styles.dateSelect} 
                onPress={showStartDatepicker}
              >
                <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} />
                <View>
                  <Text style={styles.dateLabel}>Alış Tarihi</Text>
                  <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateSelect} 
                onPress={showEndDatepicker}
              >
                <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} />
                <View>
                  <Text style={styles.dateLabel}>Teslim Tarihi</Text>
                  <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.totalContainer}>
              <View>
                <Text style={styles.totalLabel}>Toplam</Text>
                <Text style={styles.totalDays}>{totalDays} gün</Text>
              </View>
              <Text style={styles.totalPrice}>{totalDays * vehicle.price} TL</Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.bookButton,
                (!userVerification.isIdentityVerified || !userVerification.isDrivingLicenseVerified) && styles.disabledButton
              ]}
              onPress={handleRent}
            >
              <FontAwesome5 name="car" size={18} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>Hemen Kirala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showStartDate && (
        <DateTimePicker
          value={startDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showEndDate && (
        <DateTimePicker
          value={endDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onEndDateChange}
          minimumDate={new Date(startDate.getTime() + 86400000)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    color: colors.text,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  thumbnailButton: {
    width: 60,
    height: 40,
    marginHorizontal: 5,
    borderRadius: 4,
    opacity: 0.7,
  },
  selectedThumbnail: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  year: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  ownerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  dateSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 10,
    width: '48%',
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
  },
  dateValue: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  totalDays: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  verificationText: {
    textAlign: 'center',
    color: colors.text,
    marginVertical: 10,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,69,0,0.5)',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 