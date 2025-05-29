import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

export default function MessagesStackNavigator() {
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
        name="MessagesMain" 
        component={MessagesScreen} 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{ 
          headerShown: false 
        }}
      />
    </Stack.Navigator>
  );
} 