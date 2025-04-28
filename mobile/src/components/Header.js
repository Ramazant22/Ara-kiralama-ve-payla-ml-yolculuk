import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Uygulama başlık çubuğu bileşeni
 * @param {Object} props Component props
 * @param {string} props.title Sayfa başlığı
 * @param {boolean} props.showBack Geri butonu göster (varsayılan true)
 * @param {function} props.onBackPress Geri butonuna tıklama işlevi (belirtilmezse defaultBack kullanılır)
 * @param {React.ReactNode} props.rightComponent Sağ tarafta gösterilecek bileşen
 * @param {boolean} props.transparent Arka planın şeffaf olması (varsayılan false)
 */
const Header = ({ 
  title, 
  showBack = true, 
  onBackPress, 
  rightComponent,
  transparent = false
}) => {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={transparent ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      <View 
        style={[
          styles.container, 
          transparent ? styles.transparentBg : styles.solidBg,
          Platform.OS === 'ios' ? styles.iosStatusBarPadding : styles.androidStatusBarPadding
        ]}
      >
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={transparent ? "#FFFFFF" : "#2E5BFF"} 
              />
            </TouchableOpacity>
          )}
        </View>

        <Text 
          style={[
            styles.title,
            transparent ? styles.lightText : styles.darkText
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  solidBg: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  iosStatusBarPadding: {
    paddingTop: 50,
    height: 106,
  },
  androidStatusBarPadding: {
    paddingTop: StatusBar.currentHeight,
    height: 56 + (StatusBar.currentHeight || 0),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  lightText: {
    color: '#FFFFFF',
  },
  darkText: {
    color: '#171A1F',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  }
});

export default Header;
