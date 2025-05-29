import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import VehiclesStackNavigator from './VehiclesStackNavigator';
import RidesStackNavigator from './RidesStackNavigator';
import MessagesStackNavigator from './MessagesStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Vehicles':
              iconName = 'directions-car';
              break;
            case 'Rides':
              iconName = 'group';
              break;
            case 'Messages':
              iconName = 'message';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Vehicles" 
        component={VehiclesStackNavigator} 
        options={{ 
          title: 'Araçlar',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Rides" 
        component={RidesStackNavigator} 
        options={{ 
          title: 'Yolculuklar',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStackNavigator} 
        options={{ 
          title: 'Mesajlar',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator} 
        options={{ 
          title: 'Profil',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
} 