import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

/**
 * Alt sayfa bileşeni
 * @param {Object} props Component props
 * @param {boolean} props.visible Görünürlük durumu
 * @param {function} props.onClose Kapatma işlevi
 * @param {string} props.title Başlık (opsiyonel)
 * @param {React.ReactNode} props.children İçerik
 * @param {number} props.height Yükseklik (varsayılan ekran yüksekliğinin %50'si)
 */
const BottomSheet = ({ 
  visible, 
  onClose, 
  title,
  children, 
  height: customHeight = height * 0.5 
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Alt sayfayı göster
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Alt sayfayı gizle
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.container, 
          { 
            height: customHeight,
            transform: [{ translateY }] 
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171A1F',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  }
});

export default BottomSheet;
