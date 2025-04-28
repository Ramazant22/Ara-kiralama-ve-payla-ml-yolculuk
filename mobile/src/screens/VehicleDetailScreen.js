import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const VehicleDetailScreen = ({ route, navigation }) => {
  const { vehicle } = route.params;
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: theme?.background || '#000000' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme?.card || '#1A1A1A' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme?.text?.primary || '#FFFFFF'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme?.text?.primary || '#FFFFFF' }]}>
            Araç Detayı
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Araç Görseli */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: vehicle.image }} 
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          </View>

          {/* Araç Bilgileri */}
          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.brand, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={[styles.location, { color: theme?.text?.secondary || '#666666' }]}>
                  {vehicle.location}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  {vehicle.price}₺
                </Text>
                <Text style={[styles.priceUnit, { color: theme?.text?.secondary || '#666666' }]}>
                  /gün
                </Text>
              </View>
            </View>

            {/* Özellikler */}
            <View style={styles.featuresContainer}>
              {vehicle.features.map((feature, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.featureItem, 
                    { backgroundColor: theme?.surface || '#121212' }
                  ]}
                >
                  <Text style={[styles.featureText, { color: theme?.text?.primary || '#FFFFFF' }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Değerlendirme */}
            <View style={[styles.ratingContainer, { backgroundColor: theme?.surface || '#121212' }]}>
              <View style={styles.ratingHeader}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme?.text?.primary || '#FFFFFF' }]}>
                  {vehicle.rating}
                </Text>
              </View>
              <Text style={[styles.ratingLabel, { color: theme?.text?.secondary || '#666666' }]}>
                Değerlendirme
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Kiralama Butonu */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.rentButton, { backgroundColor: theme?.primary || '#FFFFFF' }]}
            onPress={() => {
              // Kiralama işlemi
              console.log('Araç kiralanıyor:', vehicle.id);
            }}
          >
            <Text style={[styles.rentButtonText, { color: theme?.text?.inverse || '#000000' }]}>
              Hemen Kirala
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: width,
    height: width * 0.7,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceUnit: {
    fontSize: 16,
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  featureItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ratingLabel: {
    fontSize: 14,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  rentButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VehicleDetailScreen; 