import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import reviewService from '../api/services/reviewService';
import reservationService from '../api/services/reservationService';

const AddReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId } = route.params;
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [cleanliness, setCleanliness] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [comfort, setComfort] = useState(0);
  
  // Tema renkleri
  const backgroundColor = darkMode ? '#121212' : '#F7F7F7';
  const cardColor = darkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = darkMode ? '#BBBBBB' : '#666666';
  const inputBackground = darkMode ? '#333333' : '#F0F0F0';
  const inputTextColor = darkMode ? '#FFFFFF' : '#000000';
  const inputPlaceholderColor = darkMode ? '#888888' : '#AAAAAA';
  
  // Rezervasyon bilgilerini yükle
  const loadReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getReservationById(reservationId);
      setReservation(response.reservation);
    } catch (error) {
      console.error('Rezervasyon detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyon detayları yüklenirken bir sorun oluştu');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadReservationDetails();
  }, [reservationId]);
  
  // Yıldız değerlendirme bileşeni
  const RatingStars = ({ rating, setRating, label, size = 30 }) => {
    return (
      <View style={styles.ratingContainer}>
        {label && (
          <Text style={[styles.ratingLabel, { color: secondaryTextColor }]}>{label}</Text>
        )}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Icon
                name={rating >= star ? 'star' : 'star'}
                solid={rating >= star}
                size={size}
                color={rating >= star ? '#FFC107' : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Değerlendirme gönder
  const handleSubmitReview = async () => {
    // Değerlendirme kontrolü
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen genel bir değerlendirme puanı verin');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewData = {
        reservation: reservationId,
        vehicle: reservation.vehicle._id,
        user: user._id,
        rating,
        comment,
        details: {
          cleanliness,
          reliability,
          comfort
        }
      };
      
      await reviewService.createReview(reviewData);
      
      Alert.alert(
        'Başarılı',
        'Değerlendirmeniz başarıyla gönderildi. Katkınız için teşekkür ederiz!',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Değerlendirme gönderilirken hata:', error);
      Alert.alert('Hata', 'Değerlendirme gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Yükleme durumu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Bilgiler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Rezervasyon bulunamadı
  if (!reservation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.notFoundContainer}>
          <Icon name="exclamation-circle" size={50} color={secondaryTextColor} />
          <Text style={[styles.notFoundText, { color: textColor }]}>
            Değerlendirilecek rezervasyon bulunamadı
          </Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Değerlendirme Ekle</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Araç Bilgisi */}
          <View style={[styles.vehicleCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.vehicleTitle, { color: textColor }]}>
              {reservation.vehicle.brand} {reservation.vehicle.model}
            </Text>
            <Text style={[styles.vehicleInfo, { color: secondaryTextColor }]}>
              {reservation.vehicle.year} - {reservation.vehicle.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
            </Text>
          </View>
          
          {/* Genel Değerlendirme */}
          <View style={[styles.ratingCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.ratingCardTitle, { color: textColor }]}>
              Genel Değerlendirme
            </Text>
            <RatingStars rating={rating} setRating={setRating} size={40} />
          </View>
          
          {/* Alt Kategoriler */}
          <View style={[styles.detailsCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.detailsCardTitle, { color: textColor }]}>
              Detaylı Değerlendirme
            </Text>
            
            <RatingStars
              rating={cleanliness}
              setRating={setCleanliness}
              label="Temizlik"
              size={24}
            />
            
            <RatingStars
              rating={reliability}
              setRating={setReliability}
              label="Güvenilirlik"
              size={24}
            />
            
            <RatingStars
              rating={comfort}
              setRating={setComfort}
              label="Konfor"
              size={24}
            />
          </View>
          
          {/* Yorum */}
          <View style={[styles.commentCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.commentCardTitle, { color: textColor }]}>
              Yorumunuz
            </Text>
            
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: inputBackground,
                  color: inputTextColor,
                  borderColor: darkMode ? '#444444' : '#E0E0E0',
                },
              ]}
              placeholder="Aracı kullanma deneyiminizi paylaşın..."
              placeholderTextColor={inputPlaceholderColor}
              multiline
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />
          </View>
          
          {/* Gönder Butonu */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
              rating === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="paper-plane" size={16} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.disclaimer, { color: secondaryTextColor }]}>
            * Değerlendirmeniz, diğer kullanıcıların daha iyi seçimler yapmasına yardımcı olacaktır.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  vehicleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
  },
  ratingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  ratingCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  ratingContainer: {
    marginBottom: 16,
    width: '100%',
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commentCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  backToListButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToListButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AddReviewScreen; 