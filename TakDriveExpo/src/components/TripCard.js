import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const TripCard = ({ trip, onPress }) => {
  const { theme } = useTheme();
  
  // Trip status renkleri
  const getStatusColor = () => {
    switch (trip.status) {
      case 'upcoming':
        return '#4CAF50'; // Yeşil
      case 'completed':
        return '#2196F3'; // Mavi
      case 'cancelled':
        return '#F44336'; // Kırmızı
      default:
        return '#9E9E9E'; // Gri
    }
  };

  const getStatusText = () => {
    switch (trip.status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        <Text style={[styles.price, { color: theme.primary }]}>{trip.price}</Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationContainer}>
          <Icon name="circle" size={12} color={theme.primary} style={styles.icon} />
          <Text style={[styles.locationText, { color: theme.text }]}>{trip.from}</Text>
        </View>
        
        <View style={styles.routeLine}>
          <View style={[styles.dashedLine, { borderColor: theme.textSecondaryColor }]} />
        </View>
        
        <View style={styles.locationContainer}>
          <Icon name="map-marker-alt" size={14} color={theme.primary} style={styles.icon} />
          <Text style={[styles.locationText, { color: theme.text }]}>{trip.to}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.dateTimeContainer}>
          <Icon name="calendar-alt" size={12} color={theme.textSecondaryColor} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: theme.textSecondaryColor }]}>{trip.date}</Text>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <Icon name="clock" size={12} color={theme.textSecondaryColor} style={styles.infoIcon} />
          <Text style={[styles.infoText, { color: theme.textSecondaryColor }]}>{trip.time}</Text>
        </View>
      </View>

      {trip.driver && (
        <View style={styles.driverContainer}>
          <Text style={[styles.driverText, { color: theme.textSecondaryColor }]}>
            Sürücü: {trip.driver}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    backgroundColor: '#222222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  routeLine: {
    marginLeft: 10,
    height: 20,
    justifyContent: 'center',
  },
  dashedLine: {
    height: 20,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#AAAAAA',
    marginLeft: 9,
  },
  footer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    width: 16,
    alignItems: 'center',
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  driverContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(170, 170, 170, 0.2)',
  },
  driverText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
});

export default TripCard; 