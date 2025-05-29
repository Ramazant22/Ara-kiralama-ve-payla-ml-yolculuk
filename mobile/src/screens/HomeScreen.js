import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  Surface
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, borderRadius, elevation } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Araç Kirala',
      icon: 'directions-car',
      description: 'Yakındaki araçları keşfet',
      onPress: () => navigation.navigate('Vehicles'),
      color: colors.primary
    },
    {
      title: 'Yolculuk Bul',
      icon: 'group',
      description: 'Paylaşımlı yolculuk ara',
      onPress: () => navigation.navigate('Rides'),
      color: colors.success
    },
    {
      title: 'Mesajlarım',
      icon: 'message',
      description: 'Sohbetlerinizi görüntüle',
      onPress: () => navigation.navigate('Messages'),
      color: colors.warning
    },
    {
      title: 'Chatbot',
      icon: 'smart-toy',
      description: 'AI asistanı ile konuş',
      onPress: () => navigation.navigate('Chatbot'),
      color: colors.info
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hoş geldin kartı */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <Avatar.Text 
              size={50} 
              label={user?.firstName?.charAt(0) || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Title style={styles.welcomeTitle}>
                Hoş geldin, {user?.firstName || 'Kullanıcı'}!
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Bugün nasıl yardımcı olabiliriz?
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Hızlı Eylemler */}
      <Title style={styles.sectionTitle}>Hızlı İşlemler</Title>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <Surface key={index} style={styles.actionCard}>
            <Button
              mode="text"
              onPress={action.onPress}
              contentStyle={styles.actionContent}
              labelStyle={styles.actionLabel}
            >
              <View style={styles.actionInner}>
                <MaterialIcons 
                  name={action.icon} 
                  size={32} 
                  color={action.color} 
                  style={styles.actionIcon}
                />
                <Title style={[styles.actionTitle, { color: action.color }]}>
                  {action.title}
                </Title>
                <Paragraph style={styles.actionDescription}>
                  {action.description}
                </Paragraph>
              </View>
            </Button>
          </Surface>
        ))}
      </View>

      {/* Son Aktiviteler */}
      <Title style={styles.sectionTitle}>Son Aktiviteler</Title>
      <Card style={styles.activityCard}>
        <Card.Content>
          <Paragraph style={styles.noActivity}>
            Henüz aktiviteniz bulunmuyor. Yukarıdaki seçeneklerden birini seçerek başlayın!
          </Paragraph>
        </Card.Content>
      </Card>

      {/* İstatistikler */}
      <Title style={styles.sectionTitle}>İstatistiklerim</Title>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Title style={styles.statNumber}>0</Title>
          <Paragraph style={styles.statLabel}>Tamamlanan Kiralar</Paragraph>
        </View>
        <View style={styles.statCard}>
          <Title style={styles.statNumber}>0</Title>
          <Paragraph style={styles.statLabel}>Yolculuklar</Paragraph>
        </View>
        <View style={styles.statCard}>
          <Title style={styles.statNumber}>5.0</Title>
          <Paragraph style={styles.statLabel}>Puan</Paragraph>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    margin: spacing.md,
    elevation: elevation.medium,
    backgroundColor: colors.surface,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  welcomeText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    marginBottom: 4,
    color: colors.text.primary,
  },
  welcomeSubtitle: {
    color: colors.text.secondary,
  },
  sectionTitle: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  actionCard: {
    width: '45%',
    margin: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  actionContent: {
    height: 120,
  },
  actionLabel: {
    height: 120,
  },
  actionInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  actionIcon: {
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  activityCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: elevation.low,
    backgroundColor: colors.surface,
  },
  noActivity: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 4,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    elevation: elevation.low,
  },
  statNumber: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.text.secondary,
  },
}); 