import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from './_layout';

export default function HelpPage() {
  // FAQ verileri
  const faqData = [
    {
      question: 'TakDrive nasıl çalışır?',
      answer: 'TakDrive, araç sahiplerinin araçlarını kiraya vermesini ve yolculuk paylaşımı yapmasını sağlayan bir platformdur. Uygulama üzerinden araç kiralayabilir, kendi aracınızı kiraya verebilir veya yolculuk paylaşımına katılabilirsiniz.'
    },
    {
      question: 'Nasıl araç kiralayabilirim?',
      answer: 'Araç kiralamak için öncelikle üye olmanız gerekiyor. Ardından "Araçlar" sekmesinden size uygun bir araç seçebilir ve tarih belirterek kiralama talebinde bulunabilirsiniz. Araç sahibi onayladıktan sonra aracı kullanabilirsiniz.'
    },
    {
      question: 'Kendi aracımı nasıl kiraya verebilirim?',
      answer: 'Araç sahibi olmak için profil sayfasından "Araç Ekle" butonuna tıklayıp aracınızın bilgilerini girmeniz gerekiyor. Ardından araç listelenecek ve kiralamak isteyenler size talepte bulunabilecek.'
    },
    {
      question: 'Ödeme nasıl yapılır?',
      answer: 'Ödemeler uygulama üzerinden kredi kartı veya banka kartı ile güvenli bir şekilde yapılmaktadır. Kiralama talebi onaylandıktan sonra ödeme alınır ve araç sahibine kiralama sonrasında aktarılır.'
    },
    {
      question: 'İptal politikanız nedir?',
      answer: 'Kiralama başlangıç tarihinden 48 saat öncesine kadar yapılan iptallerde tam iade yapılır. 24-48 saat arasında %50 iade yapılır. 24 saatten az kala yapılan iptallerde iade yapılmaz.'
    },
    {
      question: 'Yolculuk paylaşımı nasıl çalışır?',
      answer: 'Yolculuk oluşturmak için "Yolculuk Oluştur" butonuna tıklayıp yolculuk detaylarını girmeniz gerekiyor. Yolcular, oluşturulan yolculuklara katılmak için talepte bulunabilir. Onaylandıktan sonra yolculuk paylaşımı gerçekleşir.'
    },
    {
      question: 'Bir sorun olursa kiminle iletişime geçebilirim?',
      answer: 'Herhangi bir sorun yaşamanız durumunda destek@takdrive.com e-posta adresi üzerinden veya uygulama içindeki "İletişim" sayfasından bize ulaşabilirsiniz. En kısa sürede size yardımcı olacağız.'
    }
  ];
  
  // Açık olan FAQ elemanını takip etmek için state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // FAQ toggle işlemi
  const toggleFAQ = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Yardım',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sıkça Sorulan Sorular</Text>
          <Text style={styles.subtitle}>
            TakDrive kullanımı hakkında en çok sorulan sorular ve cevapları burada bulabilirsiniz.
          </Text>
        </View>
        
        <View style={styles.faqContainer}>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <FontAwesome5 
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Diğer Sorularınız İçin</Text>
          <Text style={styles.supportText}>
            Burada yanıtını bulamadığınız sorular için bizimle iletişime geçebilirsiniz.
          </Text>
          
          <View style={styles.supportCard}>
            <View style={styles.supportItem}>
              <FontAwesome5 name="envelope" size={18} color={colors.primary} style={styles.supportIcon} />
              <Text style={styles.supportItemText}>destek@takdrive.com</Text>
            </View>
            
            <View style={styles.supportItem}>
              <FontAwesome5 name="phone-alt" size={18} color={colors.primary} style={styles.supportIcon} />
              <Text style={styles.supportItemText}>+90 (212) 555 44 33</Text>
            </View>
            
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>İletişim Sayfasına Git</Text>
              <FontAwesome5 name="arrow-right" size={14} color="#FFFFFF" style={styles.contactButtonIcon} />
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    lineHeight: 22,
  },
  faqContainer: {
    marginBottom: 30,
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  faqAnswerText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDark,
  },
  supportSection: {
    marginTop: 20,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  supportText: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  supportCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportIcon: {
    width: 30,
    marginRight: 10,
  },
  supportItemText: {
    fontSize: 16,
    color: colors.textDark,
  },
  contactButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButtonIcon: {
    marginLeft: 8,
  },
}); 