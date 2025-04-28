import React, { useContext, useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VerificationScreen from '../screens/VerificationScreen';
import VerificationCodeScreen from '../screens/VerificationCodeScreen';
import TwoFactorAuthScreen from '../screens/TwoFactorAuthScreen';
import UserRatingScreen from '../screens/UserRatingScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ContactScreen from '../screens/ContactScreen';
import VehicleScreen from '../screens/VehicleScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import TripsScreen from '../screens/TripsScreen';

// Tab Navigator yerine doğrudan ekranları kullanıyoruz
// import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isLoading, user } = useContext(AuthContext);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const theme = useTheme();

  // Onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingStatus = await SecureStore.getItemAsync('hasSeenOnboarding');
        console.log('hasSeenOnboarding değeri:', onboardingStatus);
        
        setHasSeenOnboarding(onboardingStatus === 'true');
        setInitialCheckDone(true);
        
        // Splash ekranı için kısa bir gecikme
        setTimeout(() => {
          setIsSplashLoading(false);
        }, 1500);
      } catch (error) {
        console.log('Onboarding kontrolü hatası:', error);
        setHasSeenOnboarding(false);
        setInitialCheckDone(true);
        setIsSplashLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Yükleme durumunda loading ekranı
  if (isLoading || !initialCheckDone || isSplashLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme?.background || '#000000' }}>
        <ActivityIndicator size="large" color={theme?.primary || '#FFFFFF'} />
      </View>
    );
  }

  // Ana navigasyon yapısı
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {!hasSeenOnboarding && (
          <Stack.Screen name="Splash" component={SplashScreen} />
        )}
        
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {/* Ana ekranlar */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Vehicle" component={VehicleScreen} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
            <Stack.Screen name="Trips" component={TripsScreen} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
            <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
            <Stack.Screen name="UserRating" component={UserRatingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;