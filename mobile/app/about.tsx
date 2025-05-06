import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function AboutPage() {
  const router = useRouter();
  const appVersion = '1.0.0'; // Uygulamanın versiyonu
  
  // Sosyal medya linkleri
  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/takdrive' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/takdrive' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/takdrive' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/takdrive' }
  ];
  
  // Dış linki aç
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Link açılamadı:', err));
  };
  
  // İletişim sayfasına git
  const goToContact = () => {
    // router.push('/contact');
    alert('İletişim sayfasına yönlendirileceksiniz');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Hakkımızda',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="car-side" size={60} color={colors.primary} />
          <Text style={styles.logoText}>TakDrive</Text>
        </View>
        
        <Text style={styles.versionText}>Versiyon {appVersion}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vizyonumuz</Text>
          <Text style={styles.sectionText}>
            TakDrive, kişiler arası araç paylaşımını kolay, güvenli ve erişilebilir hale getirerek, 
            daha sürdürülebilir bir ulaşım sistemi oluşturmak ve topluluğun kendi içinde yardımlaşmasını 
            sağlamak için oluşturulmuştur.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Misyonumuz</Text>
          <Text style={styles.sectionText}>
            Araç sahiplerinin araçlarını kolayca kiraya verebilmelerini ve araç kiralamak isteyenlerin 
            uygun fiyatlarla istedikleri araca ulaşabilmelerini sağlayan güvenilir bir platform olmaktır. 
            Aynı zamanda ortak yolculuklara olanak tanıyarak yakıt maliyetlerini düşürmeyi ve karbon 
            emisyonlarını azaltmayı hedefliyoruz.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarihçemiz</Text>
          <Text style={styles.sectionText}>
            TakDrive, 2022 yılında, araç kiralama ve yolculuk paylaşımı süreçlerindeki zorlukları 
            gözlemleyen bir grup girişimci tarafından kuruldu. İlk olarak İstanbul'da hizmet vermeye 
            başlayan platformumuz, kısa sürede Türkiye'nin birçok büyük şehrine yayıldı ve şimdi 
            tüm Türkiye'de aktif olarak kullanılmaktadır.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <FontAwesome5 name="users" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>100,000+</Text>
            <Text style={styles.featureText}>Aktif Kullanıcı</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <FontAwesome5 name="car" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>50,000+</Text>
            <Text style={styles.featureText}>Kayıtlı Araç</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <FontAwesome5 name="route" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>200,000+</Text>
            <Text style={styles.featureText}>Tamamlanan Yolculuk</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <FontAwesome5 name="city" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>81</Text>
            <Text style={styles.featureText}>Hizmet Verilen İl</Text>
          </View>
        </View>
        
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Bizi Takip Edin</Text>
          
          <View style={styles.socialIconsContainer}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.socialIcon}
                onPress={() => openLink(link.url)}
              >
                <FontAwesome5 name={link.icon} size={24} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={goToContact}
        >
          <FontAwesome5 name="envelope" size={16} color="#FFFFFF" style={styles.contactIcon} />
          <Text style={styles.contactButtonText}>Bizimle İletişime Geçin</Text>
        </TouchableOpacity>
        
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} TakDrive. Tüm hakları saklıdır.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
  },
  versionText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,69,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: colors.textDark,
    textAlign: 'center',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,69,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  contactButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 20,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  copyrightText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
  },
}); 