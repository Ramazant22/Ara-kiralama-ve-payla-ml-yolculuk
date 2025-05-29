import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { paperTheme, colors } from './src/styles/theme';

// Navigation theme'i web renkleriyle uyarla
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text.primary,
    border: colors.surface,
    notification: colors.primary,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <NavigationContainer theme={MyDarkTheme}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
