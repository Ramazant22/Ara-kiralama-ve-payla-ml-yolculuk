import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TripsScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.container, { backgroundColor: theme?.background || '#000000' }]}>
        <Text style={[styles.title, { color: theme?.text?.primary || '#FFFFFF' }]}>Yolculuklar</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: StatusBar.currentHeight + 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TripsScreen; 