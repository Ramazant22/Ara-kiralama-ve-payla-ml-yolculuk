import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth, AuthContext } from './src/context/AuthContext';
import { ConnectivityProvider, ConnectivityContext } from './src/context/ConnectivityContext';
import OfflineNotice from './src/components/OfflineNotice';

// Context Providers
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import VehicleListScreen from './src/screens/VehicleListScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import RideShareListScreen from './src/screens/RideShareListScreen';
import RideDetailScreen from './src/screens/RideDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreenComponent from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CreateRideScreen from './src/screens/CreateRideScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import MainScreen from './src/screens/MainScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import IdentityVerificationScreen from './src/screens/IdentityVerificationScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import ReservationListScreen from './src/screens/ReservationListScreen';
import ReservationDetailScreen from './src/screens/ReservationDetailScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';
import CreateReservationScreen from './src/screens/CreateReservationScreen';
import DatabaseExplorerScreen from './src/screens/DatabaseExplorerScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ana sekme navigasyonu
const HomeTabs = () => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
          borderTopColor: darkMode ? '#333333' : '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehicleListScreen}
        options={{
          tabBarLabel: 'Araçlar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RideShare"
        component={RideShareListScreen}
        options={{
          tabBarLabel: 'Yolculuklar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="route" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationListScreen}
        options={{
          tabBarLabel: 'Rezervasyonlar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profilim',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Ana navigasyon yapısı
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: { backgroundColor: '#ffffff' }
      }}
    >
      {isLoading ? (
        <Stack.Screen name="Splash" component={LoadingScreen} />
      ) : isAuthenticated ? (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={HomeTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VehicleDetail" 
            component={VehicleDetailScreen} 
            options={{ title: 'Araç Detayı', headerShown: false }}
          />
          <Stack.Screen 
            name="RideDetail" 
            component={RideDetailScreen} 
            options={{ title: 'Yolculuk Detayı', headerShown: false }}
          />
          <Stack.Screen 
            name="CreateRide" 
            component={CreateRideScreen} 
            options={{ title: 'Yolculuk Oluştur', headerShown: false }}
          />
          <Stack.Screen 
            name="ReservationDetail" 
            component={ReservationDetailScreen} 
            options={{ title: 'Rezervasyon Detayı', headerShown: false }}
          />
          <Stack.Screen 
            name="CreateReservation" 
            component={CreateReservationScreen} 
            options={{ title: 'Rezervasyon Oluştur', headerShown: false }}
          />
          <Stack.Screen 
            name="AddReview" 
            component={AddReviewScreen} 
            options={{ title: 'Değerlendirme Ekle', headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        </>
      )}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payments" component={PaymentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// Ana uygulama bileşeni
const App = () => {
  return (
    <ConnectivityProvider>
      <AuthProvider>
        <ThemeProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle={Platform.OS === 'ios' ? 'light' : 'auto'} backgroundColor="#ffffff" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <OfflineNotice />
          </SafeAreaView>
        </ThemeProvider>
      </AuthProvider>
    </ConnectivityProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App; 