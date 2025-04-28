import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';

// Ekranlar
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import VerificationCodeScreen from './src/screens/VerificationCodeScreen';
import TwoFactorAuthScreen from './src/screens/TwoFactorAuthScreen';
import UserRatingScreen from './src/screens/UserRatingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Simüle edilmiş yükleme işlemi
    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>TakDrive</Text>
        <ActivityIndicator size="large" color="#4982F3" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              presentation: 'modal'
            }}
          >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
          <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
          <Stack.Screen name="UserRating" component={UserRatingScreen} />
        </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '80%',
  }
});