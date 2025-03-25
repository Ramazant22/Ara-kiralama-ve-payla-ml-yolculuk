import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4982F3" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken === null ? (
        // Kimlik doğrulama ekranları
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ 
              title: 'Giriş', 
              animation: 'slide_from_right'
            }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
              title: 'Kayıt Ol', 
              animation: 'slide_from_right'
            }} 
          />
        </>
      ) : (
        // Uygulama ekranları
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Anasayfa' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 