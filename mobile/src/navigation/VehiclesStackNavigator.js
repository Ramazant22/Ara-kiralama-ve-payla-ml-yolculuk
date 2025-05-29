import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VehiclesScreen from '../screens/VehiclesScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

export default function VehiclesStackNavigator() {
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
        name="VehiclesList" 
        component={VehiclesScreen} 
        options={{ 
          title: 'Araçlar',
        }}
      />
      <Stack.Screen 
        name="VehicleDetail" 
        component={VehicleDetailScreen} 
        options={{ 
          title: 'Araç Detayı',
          headerShown: false, // VehicleDetailScreen'de kendi header'ı var
        }}
      />
    </Stack.Navigator>
  );
} 