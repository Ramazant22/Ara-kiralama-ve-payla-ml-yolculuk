import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const VehicleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { userData } = useContext(AuthContext);
  const { vehicleId } = route.params || { vehicleId: null };
  
  // Mock data for development - will be replaced with API data in production
  const vehicle = {
    id: vehicleId || 1,
    name: "Honda Civic",
    model: "2022",
    image: require('../assets/vehicle1.jpg'),
    price: 350,
    rating: 4.8,
    reviewCount: 24,
    location: "İstanbul",
    owner: {
      name: "Ali Yılmaz",
      image: require('../assets/user1.jpg'),
      rating: 4.9
    },
    features: ["Otomatik", "Benzin", "5 Koltuk", "Klima", "Bluetooth", "USB", "GPS"],
    description: "Honda Civic 2022 model, ekonomik yakıt tüketimi, konforlu sürüş deneyimi sunuyor. Şehir içi ve şehirlerarası seyahatler için idealdir."
  };

  const handleBookNow = () => {
    navigation.navigate('CreateReservation', { 
      vehicleId: vehicle.id 
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.imageContainer}>
        <Image source={vehicle.image} style={styles.vehicleImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₺{vehicle.price}</Text>
          <Text style={styles.priceUnit}>/gün</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.vehicleName, { color: theme.textColor }]}>{vehicle.name}</Text>
            <Text style={[styles.vehicleModel, { color: theme.textSecondaryColor }]}>{vehicle.model}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Icon name="star" solid size={16} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.textColor }]}>{vehicle.rating}</Text>
            <Text style={[styles.reviewCount, { color: theme.textSecondaryColor }]}>
              ({vehicle.reviewCount} değerlendirme)
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Icon name="map-marker-alt" size={16} color="#FF5A5F" />
          <Text style={[styles.locationText, { color: theme.textSecondaryColor }]}>
            {vehicle.location}
          </Text>
        </View>

        <View style={styles.ownerContainer}>
          <Image source={vehicle.owner.image} style={styles.ownerImage} />
          <View style={styles.ownerInfo}>
            <Text style={[styles.ownerTitle, { color: theme.textSecondaryColor }]}>Araç Sahibi</Text>
            <Text style={[styles.ownerName, { color: theme.textColor }]}>{vehicle.owner.name}</Text>
          </View>
          <View style={styles.ownerRating}>
            <Icon name="star" solid size={14} color="#FFD700" />
            <Text style={[styles.ownerRatingText, { color: theme.textColor }]}>
              {vehicle.owner.rating}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Araç Özellikleri</Text>
        <View style={styles.featuresContainer}>
          {vehicle.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name={getFeatureIcon(feature)} size={16} color="#4A90E2" />
              <Text style={[styles.featureText, { color: theme.textSecondaryColor }]}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Açıklama</Text>
        <Text style={[styles.descriptionText, { color: theme.textSecondaryColor }]}>
          {vehicle.description}
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Rezervasyon Yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getFeatureIcon = (feature) => {
  const featureIcons = {
    'Otomatik': 'cogs',
    'Benzin': 'gas-pump',
    'Dizel': 'gas-pump',
    'Klima': 'snowflake',
    'Bluetooth': 'bluetooth',
    'USB': 'usb',
    'GPS': 'map-marked',
    '5 Koltuk': 'chair',
    '7 Koltuk': 'chair',
  };

  return featureIcons[feature] || 'check-circle';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  vehicleModel: {
    fontSize: 16,
    color: '#888888',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 6,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  ownerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ownerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  ownerTitle: {
    fontSize: 12,
    color: '#888888',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
  },
  bookButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VehicleDetailScreen; 