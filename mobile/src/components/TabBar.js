import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * Özel alt navigasyon çubuğu
 * @param {Object} props Component props
 * @param {Object} props.state Navigation state
 * @param {Object} props.descriptors Navigation descriptors
 * @param {Object} props.navigation Navigation nesnesi
 */
const TabBar = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme?.card || '#1A1A1A',
        borderTopColor: theme?.border || 'rgba(255,255,255,0.1)' 
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        // Icon for each tab
        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'Search') {
          iconName = isFocused ? 'search' : 'search-outline';
        } else if (route.name === 'Trips') {
          iconName = isFocused ? 'car' : 'car-outline';
        } else if (route.name === 'Contact') {
          iconName = isFocused ? 'mail' : 'mail-outline';
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'person' : 'person-outline';
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? theme?.primary || '#FFFFFF' : theme?.text?.secondary || '#999999'}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? theme?.primary || '#FFFFFF' : theme?.text?.secondary || '#999999',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    paddingBottom: 6,
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 8,
    shadowOpacity: 0.05,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default TabBar;
