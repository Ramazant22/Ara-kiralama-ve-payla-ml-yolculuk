import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useConnectivity from '../hooks/useConnectivity';
import cacheService from '../api/config/cacheService';

// Import all services that handle pending operations
import vehicleService from '../api/services/vehicleService';
import rentalService from '../api/services/rentalService';
import rideShareService from '../api/services/rideShareService';
import userService from '../api/services/userService';
import paymentService from '../api/services/paymentService';

// Offline işlemler için saklama anahtarları
export const PENDING_KEYS = {
  RIDES: 'pending_rides',
  RENTALS: 'pending_rentals',
  PAYMENTS: 'pending_payments',
  PROFILE_UPDATES: 'pending_profile_updates',
  VEHICLE_UPDATES: 'pending_vehicle_updates'
};

// Context oluştur
const ConnectivityContext = createContext();

export const ConnectivityProvider = ({ children }) => {
  const connectivity = useConnectivity();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPendingOperations, setHasPendingOperations] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResults, setSyncResults] = useState({
    success: 0,
    failed: 0,
    total: 0
  });

  // Bekleyen operasyon varlığını kontrol et
  const checkPendingOperations = async () => {
    try {
      const keys = Object.values(PENDING_KEYS);
      const results = await Promise.all(
        keys.map(key => AsyncStorage.getItem(key))
      );
      
      const hasPending = results.some(data => data !== null && JSON.parse(data).length > 0);
      setHasPendingOperations(hasPending);
      
      // Toplam bekleyen işlem sayısını hesapla
      if (hasPending) {
        const totalPending = results.reduce((sum, data) => {
          if (data !== null) {
            return sum + JSON.parse(data).length;
          }
          return sum;
        }, 0);
        
        setSyncResults(prev => ({
          ...prev,
          total: totalPending
        }));
      }
      
      return hasPending;
    } catch (error) {
      console.error('Bekleyen işlemler kontrol hatası:', error);
      return false;
    }
  };

  // Uygulamaya ilk giriş veya bağlantı geldiğinde
  useEffect(() => {
    const initAndSync = async () => {
      if (isInitializing) {
        await checkPendingOperations();
        setIsInitializing(false);
      } else if (connectivity.wasOffline && connectivity.isOnline) {
        // Offline'dan online'a geçildiyse senkronizasyon yap
        syncOfflineData();
      }
    };

    initAndSync();
  }, [connectivity.isOnline, connectivity.wasOffline, isInitializing]);

  // Offline verileri senkronize et
  const syncOfflineData = async () => {
    if (isSyncing || !connectivity.isOnline) return;
    
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      setSyncResults({
        success: 0,
        failed: 0,
        total: 0
      });
      
      // Bekleyen operasyonları kontrol et
      const hasPending = await checkPendingOperations();
      
      if (!hasPending) {
        setIsSyncing(false);
        return;
      }
      
      // Tüm bekleyen işlemleri senkronize et
      const syncOperations = [
        // Araç işlemlerini senkronize et
        vehicleService.processPendingVehicleOperations().then(() => {
          setSyncResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }).catch(error => {
          console.error('Araç senkronizasyon hatası:', error);
          setSyncResults(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }),
        
        // Kiralama işlemlerini senkronize et
        rentalService.processPendingRentalOperations().then(() => {
          setSyncResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }).catch(error => {
          console.error('Kiralama senkronizasyon hatası:', error);
          setSyncResults(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }),
        
        // Yolculuk işlemlerini senkronize et
        rideShareService.processPendingRideOperations().then(() => {
          setSyncResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }).catch(error => {
          console.error('Yolculuk senkronizasyon hatası:', error);
          setSyncResults(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }),
        
        // Ödeme işlemlerini senkronize et
        paymentService.processPendingPaymentOperations().then(() => {
          setSyncResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }).catch(error => {
          console.error('Ödeme senkronizasyon hatası:', error);
          setSyncResults(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }),
        
        // Profil güncelleme işlemlerini senkronize et
        userService.processPendingProfileUpdates().then(() => {
          setSyncResults(prev => ({
            ...prev,
            success: prev.success + 1
          }));
          setSyncProgress((prev) => prev + 20);
        }).catch(error => {
          console.error('Profil senkronizasyon hatası:', error);
          setSyncResults(prev => ({
            ...prev,
            failed: prev.failed + 1
          }));
          setSyncProgress((prev) => prev + 20);
        })
      ];
      
      // Tüm senkronizasyon işlemlerini tamamlanmasını bekle
      await Promise.allSettled(syncOperations);
      
      // Senkronizasyon sonrası bekleyen işlemleri tekrar kontrol et
      await checkPendingOperations();
      
    } catch (error) {
      console.error('Veri senkronizasyon hatası:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(100);
    }
  };

  // Senkronizasyon durumunu temizle
  const resetSyncState = () => {
    setSyncProgress(0);
    setSyncResults({
      success: 0,
      failed: 0,
      total: 0
    });
  };

  // Context değerlerini hazırla
  const value = {
    ...connectivity,
    hasPendingOperations,
    isSyncing,
    syncProgress,
    syncResults,
    syncOfflineData,
    checkPendingOperations,
    resetSyncState
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
};

// Hook oluştur
export const useConnectivityContext = () => {
  const context = useContext(ConnectivityContext);
  if (context === undefined) {
    throw new Error('useConnectivityContext must be used within a ConnectivityProvider');
  }
  return context;
};

export default ConnectivityContext; 