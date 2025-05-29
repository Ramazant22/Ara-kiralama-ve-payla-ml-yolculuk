import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  List,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profil Bilgileri */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.firstName?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {user?.firstName || 'Kullanıcı'} {user?.lastName || ''}
          </Title>
          <Paragraph style={styles.email}>{user?.email || 'email@example.com'}</Paragraph>
        </Card.Content>
      </Card>

      {/* Menü Seçenekleri */}
      <Card style={styles.menuCard}>
        <List.Item
          title="Profil Düzenle"
          description="Kişisel bilgilerinizi güncelleyin"
          left={(props) => <List.Icon {...props} icon="account-edit" color={colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Divider style={styles.divider} />
        
        <List.Item
          title="Araçlarım"
          description="Sahip olduğunuz araçları yönetin"
          left={(props) => <List.Icon {...props} icon="car" color={colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => navigation.navigate('MyVehicles')}
        />
        <Divider style={styles.divider} />
        
        <List.Item
          title="Rezervasyonlarım"
          description="Aktif ve geçmiş rezervasyonlar"
          left={(props) => <List.Icon {...props} icon="calendar-clock" color={colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => navigation.navigate('Bookings')}
        />
        <Divider style={styles.divider} />
        
        <List.Item
          title="Değerlendirmeler"
          description="Aldığınız puanlar ve yorumlar"
          left={(props) => <List.Icon {...props} icon="star" color={colors.star} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => {
            // Değerlendirmeler ekranına git
          }}
        />
        <Divider style={styles.divider} />
        
        <List.Item
          title="Ayarlar"
          description="Uygulama ayarları"
          left={(props) => <List.Icon {...props} icon="cog" color={colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => navigation.navigate('Settings')}
        />
        <Divider style={styles.divider} />
        
        <List.Item
          title="Yardım ve Destek"
          description="SSS ve iletişim bilgileri"
          left={(props) => <List.Icon {...props} icon="help-circle" color={colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.text.secondary} />}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDescription}
          onPress={() => {
            // Yardım ekranına git
          }}
        />
      </Card>

      {/* Çıkış Butonu */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        textColor={colors.error}
        buttonColor="transparent"
      >
        Çıkış Yap
      </Button>

      {/* App Versiyonu */}
      <Paragraph style={styles.version}>Versiyon 1.0.0</Paragraph>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: spacing.md,
    elevation: elevation.medium,
    backgroundColor: colors.surface,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    marginBottom: 4,
    color: colors.text.primary,
  },
  email: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  menuCard: {
    margin: spacing.md,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  listTitle: {
    color: colors.text.primary,
  },
  listDescription: {
    color: colors.text.secondary,
  },
  divider: {
    backgroundColor: colors.surfaceLight,
  },
  logoutButton: {
    margin: spacing.md,
    borderColor: colors.error,
  },
  version: {
    textAlign: 'center',
    color: colors.text.disabled,
    fontSize: 12,
    marginBottom: spacing.xl,
  },
}); 