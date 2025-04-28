import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AvatarPlaceholder } from '../components/PlaceholderImages';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import { API_URL } from '../config/api';
import { COLORS, globalStyles } from '../styles/globalStyles';

const UserRatingScreen = ({ route, navigation }) => {
  const { userId, tripId, fromScreen } = route.params;
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/mobile/users/${userId}/profile`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );

      if (response.data.status === 'success') {
        setUserInfo(response.data.data.user);
      } else {
        Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alma hatası:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (value) => {
    setRating(value);
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Uyarı', 'Lütfen bir puan seçin.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/mobile/ratings`, 
        {
          userId,
          tripId,
          rating,
          comment
        },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );

      if (response.data.status === 'success') {
        Alert.alert(
          'Başarılı',
          'Değerlendirmeniz başarıyla kaydedildi.',
          [
            { text: 'Tamam', onPress: () => navigation.navigate(fromScreen || 'Home') }
          ]
        );
      }
    } catch (error) {
      console.error('Değerlendirme gönderme hatası:', error);
      Alert.alert('Hata', 'Değerlendirme kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => handleRating(i)}
          style={styles.starButton}
        >
          <Icon 
            name={i <= rating ? "star" : "star-border"} 
            size={40} 
            color={i <= rating ? "#FFD700" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4982F3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Üst Bar */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kullanıcıyı Değerlendir</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.userContainer}>
            {userInfo?.profilePicture ? (
              <Image 
                source={{ uri: userInfo.profilePicture }} 
                style={styles.userImage} 
              />
            ) : (
              <AvatarPlaceholder 
                size={80} 
                name={userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Kullanıcı'} 
              />
            )}
            
            <Text style={styles.userName}>
              {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Kullanıcı'}
            </Text>
            
            {userInfo?.rating > 0 && (
              <View style={styles.currentRatingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.currentRating}>
                  {userInfo.rating.toFixed(1)} ({userInfo.ratingCount || 0} değerlendirme)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>Puanınız</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={styles.ratingDescription}>
              {rating === 0 && 'Lütfen bir puan seçin'}
              {rating === 1 && 'Çok kötü'}
              {rating === 2 && 'Kötü'}
              {rating === 3 && 'Ortalama'}
              {rating === 4 && 'İyi'}
              {rating === 5 && 'Mükemmel'}
            </Text>
          </View>

          <View style={styles.commentContainer}>
            <Text style={styles.commentTitle}>Yorumunuz (İsteğe bağlı)</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={5}
              placeholder="Deneyiminizi paylaşın..."
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          <CustomButton
            title="Değerlendirmeyi Gönder"
            onPress={submitRating}
            loading={submitting}
            disabled={rating === 0 || submitting}
            type="primary"
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  userContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  currentRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  commentContainer: {
    marginBottom: 24,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default UserRatingScreen;
