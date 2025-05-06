import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const VehicleCard = ({ vehicle, onPress }) => {
  // Fallback image URL (araç resmi yoksa)
  const fallbackImageUrl = 'https://via.placeholder.com/300x200?text=Araç+Resmi';
  
  // Yıldız puanını render et
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={14} color="#FFD700" style={styles.starIcon} />);
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={14} color="#FFD700" style={styles.starIcon} />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={14} color="#FFD700" style={styles.starIcon} />);
      }
    }
    
    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>({vehicle.reviewCount || 0})</Text>
      </View>
    );
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: vehicle.imageUrl || fallbackImageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {vehicle.isAvailable && (
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>Müsait</Text>
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.brandModel}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.year}>{vehicle.year}</Text>
        </View>
        
        {renderRating(vehicle.rating || 0)}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="gas-pump" size={14} color="#666666" />
            <Text style={styles.detailText}>{vehicle.fuelType}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome5 name="cog" size={14} color="#666666" />
            <Text style={styles.detailText}>{vehicle.transmission}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome5 name="users" size={14} color="#666666" />
            <Text style={styles.detailText}>{vehicle.seats} kişilik</Text>
          </View>
        </View>
        
        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#2196F3" />
            <Text style={styles.locationText}>{vehicle.location}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{vehicle.price}₺</Text>
            <Text style={styles.priceUnit}>/gün</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  year: {
    fontSize: 14,
    color: '#757575',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  priceUnit: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 2,
    marginBottom: 2,
  },
});

export default VehicleCard; 