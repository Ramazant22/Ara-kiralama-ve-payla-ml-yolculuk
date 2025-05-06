import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Internet bağlantı durumunu takip eden hook
 * @returns {Object} Bağlantı durumu bilgileri
 */
const useConnectivity = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isFirstCheck, setIsFirstCheck] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // İlk bağlantı durumunu kontrol et
    const checkInitialConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
        setConnectionType(state.type);
        setIsFirstCheck(false);
      } catch (error) {
        console.error('İlk bağlantı kontrolü hatası:', error);
        setIsFirstCheck(false);
      }
    };

    checkInitialConnection();

    // Bağlantı değişikliklerini dinle
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected && state.isInternetReachable;
      
      // Eğer önceden bağlantı yok idiyse ve şimdi bağlantı varsa
      if (!isConnected && currentlyConnected) {
        setWasOffline(true);
      } else {
        setWasOffline(false);
      }
      
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    // Temizleme fonksiyonu
    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    isFirstCheck,
    wasOffline,
    isOnline: isConnected && isInternetReachable
  };
};

export default useConnectivity; 