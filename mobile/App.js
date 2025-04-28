import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Navigasyon
import AppNavigator from './src/navigation/AppNavigator';

const AppWithTheme = () => {
  const theme = useTheme();
  
  return (
    <NavigationContainer theme={{
      dark: theme.mode === 'dark',
      colors: {
        primary: theme?.primary || '#FFFFFF',
        background: theme?.background || '#000000',
        card: theme?.card || '#1A1A1A',
        text: theme?.text?.primary || '#FFFFFF',
        border: theme?.border || '#333333',
        notification: theme?.primary || '#FFFFFF',
      },
    }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}