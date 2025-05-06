import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import React from 'react';

// Tema renkleri - web uygulaması ile aynı olacak şekilde
export const colors = {
  background: '#000000',
  card: '#FFFFFF',
  text: '#FFFFFF',
  textDark: '#000000',
  primary: '#FF4500', // Ana turuncu renk web ile uyumlu
  secondary: '#e63e00', // Koyu turuncu
  accent: '#ff6a33',  // Açık turuncu
  divider: '#2C2C2C'
};

// Burada kendi stil ve temalarımızı kullanabiliriz
export default function RootLayout() {
  const [loaded] = useFonts({
    // Projenizde ihtiyacınız olan fontları buraya ekleyebilirsiniz
  });

  // Auth durumunu kontrol et (AuthContext)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // false olarak değiştirildi
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Auth durumunu kontrol et
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (!loaded || loading) {
    // Yükleme ekranı
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            // Platform özel stil: iOS için gölgeleri kaldıralım
            ...(Platform.OS === 'ios' ? { shadowOpacity: 0 } : { elevation: 0 }),
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { 
            backgroundColor: colors.background 
          }
        }}
      >
        {/* Splash ekranı - Her iki durum için de erişilebilir */}
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {!isLoggedIn ? (
          // Auth ekranları
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen 
              name="register" 
              options={{ 
                title: 'Kayıt Ol',
                headerTransparent: true 
              }} 
            />
          </>
        ) : (
          // Ana uygulama ekranları
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="vehicle/[id]" options={{ title: 'Araç Detayı' }} />
            <Stack.Screen name="ride/[id]" options={{ title: 'Yolculuk Detayı' }} />
            <Stack.Screen name="createRide" options={{ title: 'Yolculuk Oluştur' }} />
            <Stack.Screen name="add-vehicle" options={{ title: 'Araç Ekle' }} />
            <Stack.Screen name="contact" options={{ title: 'İletişim' }} />
            <Stack.Screen name="help" options={{ title: 'Yardım' }} />
            <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
            <Stack.Screen name="email-verification" options={{ title: 'E-posta Doğrulama' }} />
            <Stack.Screen name="rental-history" options={{ title: 'Kiralama Geçmişim' }} />
            <Stack.Screen name="trip-history" options={{ title: 'Yolculuk Geçmişim' }} />
            <Stack.Screen name="two-factor-auth" options={{ title: 'İki Faktörlü Doğrulama' }} />
            <Stack.Screen name="unverified-email" options={{ title: 'E-posta Doğrulama Bekleniyor' }} />
            <Stack.Screen name="about" options={{ title: 'Hakkımızda' }} />
            <Stack.Screen name="my-addresses" options={{ title: 'Adreslerim' }} />
            <Stack.Screen name="favorites" options={{ title: 'Favorilerim' }} />
            <Stack.Screen name="notifications" options={{ title: 'Bildirimler' }} />
            <Stack.Screen name="identity-verification" options={{ title: 'Kimlik Doğrulama' }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Profil Düzenle' }} />
          </>
        )}
        <Stack.Screen name="+not-found" options={{ title: 'Sayfa Bulunamadı' }} />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
