import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyVehiclesScreen from '../screens/MyVehiclesScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import BookingsScreen from '../screens/BookingsScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
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
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Profil Düzenle' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ayarlar' }}
      />
      <Stack.Screen 
        name="MyVehicles" 
        component={MyVehiclesScreen} 
        options={{ 
          title: 'Araçlarım',
          headerShown: false // MyVehiclesScreen kendi header'ını kullanıyor
        }}
      />
      <Stack.Screen 
        name="AddVehicle" 
        component={AddVehicleScreen} 
        options={{ 
          title: 'Araç Ekle',
          headerShown: false // AddVehicleScreen kendi header'ını kullanıyor
        }}
      />
      <Stack.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ 
          title: 'Rezervasyonlar',
          headerShown: false // BookingsScreen kendi header'ını kullanıyor
        }}
      />
    </Stack.Navigator>
  );
} 