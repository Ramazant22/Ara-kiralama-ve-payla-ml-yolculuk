import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RidesScreen from '../screens/RidesScreen';
import CreateRideScreen from '../screens/CreateRideScreen';
import RideDetailScreen from '../screens/RideDetailScreen';
import JoinRideScreen from '../screens/JoinRideScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

export default function RidesStackNavigator() {
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
      }}
    >
      <Stack.Screen 
        name="RidesMain" 
        component={RidesScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateRide" 
        component={CreateRideScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RideDetail" 
        component={RideDetailScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="JoinRide" 
        component={JoinRideScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
} 