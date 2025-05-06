import { Tabs } from 'expo-router/tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../_layout';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { 
          backgroundColor: '#121212', // Tab barın arka plan rengi siyah tonunda
          borderTopColor: 'rgba(255, 255, 255, 0.1)', // Üst çizgi hafif beyaz
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index" // Ana sayfa
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles" // Araç listesi
        options={{
          tabBarLabel: 'Araçlar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="car" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides" // Yolculuk listesi
        options={{
          tabBarLabel: 'Yolculuklar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="route" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Profil
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
