import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const RideCard = ({ ride, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.locationInfo}>
          <View style={styles.locationContainer}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{ride.from}</Text>
          </View>
          <View style={styles.locationLine} />
          <View style={styles.locationContainer}>
            <View style={[styles.locationDot, styles.destinationDot]} />
            <Text style={styles.locationText}>{ride.to}</Text>
          </View>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.date}>{ride.date}</Text>
          <Text style={styles.time}>{ride.time}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Icon name="car" size={14} color="#666" />
          <Text style={styles.infoText}>{ride.vehicleName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="user" size={14} color="#666" />
          <Text style={styles.infoText}>{ride.availableSeats} koltuk</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="money-bill-wave" size={14} color="#666" />
          <Text style={styles.infoText}>{ride.price}₺</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.driver}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>{ride.driverName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.driverName}>{ride.driverName}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={10} color="#FFD700" solid />
              <Text style={styles.rating}>{ride.driverRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Rezerve Et</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  destinationDot: {
    backgroundColor: '#F44336',
  },
  locationLine: {
    width: 1,
    height: 16,
    backgroundColor: '#DDD',
    marginLeft: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#000000',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  time: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  driverInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  driverName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 2,
    fontSize: 10,
    color: '#666666',
  },
  button: {
    backgroundColor: '#FF4500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RideCard; 