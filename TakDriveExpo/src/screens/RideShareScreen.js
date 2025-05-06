import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const RideShareScreen = () => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);

  const checkVerification = (targetScreen) => {
    // Kullanıcı doğrulama durumunu kontrol et
    const isVerified = userData && userData.isEmailVerified && userData.isPhoneVerified;
    
    if (!isVerified) {
      Alert.alert(
        "Doğrulama Gerekli",
        "Yolculuk paylaşım özelliklerini kullanmak için kimlik doğrulaması yapmanız gerekmektedir.",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          { 
            text: "Doğrulama Yap", 
            onPress: () => navigation.navigate('IdentityVerification')
          }
        ]
      );
    } else {
      // Kullanıcı doğrulanmışsa hedef ekrana yönlendir
      navigation.navigate(targetScreen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => checkVerification('RideShareList')}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
            <Icon name="search" size={30} color="#2196F3" />
          </View>
          <Text style={styles.optionTitle}>Yolculuk Ara</Text>
          <Text style={styles.optionDescription}>
            Mevcut yolculukları görüntüle ve katıl
          </Text>
          <View style={styles.optionButton}>
            <Text style={styles.optionButtonText}>Araştır</Text>
            <Icon name="arrow-right" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => checkVerification('CreateRide')}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
            <Icon name="car-alt" size={30} color="#4CAF50" />
          </View>
          <Text style={styles.optionTitle}>Yolculuk Oluştur</Text>
          <Text style={styles.optionDescription}>
            Kendi seyahat planını oluştur ve yolcu al
          </Text>
          <View style={[styles.optionButton, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.optionButtonText}>Oluştur</Text>
            <Icon name="arrow-right" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>Yolculuk Paylaşımı Hakkında</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Icon name="money-bill-wave" size={20} color="#FF4500" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Tasarruf Et</Text>
              <Text style={styles.infoItemDescription}>
                Seyahat masraflarını paylaş ve bütçeni koru
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="leaf" size={20} color="#FF4500" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Çevre Dostu</Text>
              <Text style={styles.infoItemDescription}>
                Karbon emisyonunu azaltarak çevreye katkıda bulun
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="users" size={20} color="#FF4500" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Sosyalleş</Text>
              <Text style={styles.infoItemDescription}>
                Yeni insanlarla tanış ve keyifli yolculuklar yap
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="shield-alt" size={20} color="#FF4500" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Güvenli Seyahat</Text>
              <Text style={styles.infoItemDescription}>
                Derecelendirme sistemi ve kullanıcı doğrulama ile güvenli seyahat
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  optionsContainer: {
    marginVertical: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 8,
  },
  infoContainer: {
    flex: 1,
  },
  infoHeader: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  infoItemDescription: {
    fontSize: 14,
    color: '#666666',
  },
});

export default RideShareScreen; 