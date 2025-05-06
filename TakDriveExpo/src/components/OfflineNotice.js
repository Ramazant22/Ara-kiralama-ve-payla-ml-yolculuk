import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useConnectivityContext } from '../context/ConnectivityContext';
import { Ionicons } from '@expo/vector-icons';

const OfflineNotice = () => {
  const { 
    isOnline, 
    wasOffline, 
    hasPendingOperations, 
    isSyncing, 
    syncOfflineData,
    syncProgress,
    syncResults
  } = useConnectivityContext();
  
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (!isOnline || wasOffline || hasPendingOperations) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, wasOffline, hasPendingOperations]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  if (isOnline && !wasOffline && !hasPendingOperations && !isSyncing) {
    return null;
  }

  // İlerleme çubuğunu render et
  const renderProgressBar = () => {
    if (!isSyncing) return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${syncProgress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{`${syncProgress}%`}</Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        isOnline ? styles.online : styles.offline,
        isSyncing ? styles.syncing : null,
      ]}
    >
      <View style={styles.content}>
        {!isOnline ? (
          <>
            <Ionicons name="cloud-offline" size={18} color="white" />
            <Text style={styles.text}>İnternet bağlantısı yok</Text>
          </>
        ) : isSyncing ? (
          <>
            <ActivityIndicator size="small" color="white" style={styles.loader} />
            <Text style={styles.text}>
              Veriler senkronize ediliyor ({syncProgress}%)
            </Text>
          </>
        ) : wasOffline && hasPendingOperations ? (
          <>
            <Ionicons name="sync" size={18} color="white" />
            <Text style={styles.text}>
              {syncResults.total > 0 
                ? `${syncResults.total} bekleyen işlem var` 
                : 'Bekleyen işlemler var'}
            </Text>
            <TouchableOpacity onPress={syncOfflineData} style={styles.syncButton}>
              <Text style={styles.syncText}>Şimdi Senkronize Et</Text>
            </TouchableOpacity>
          </>
        ) : wasOffline ? (
          <>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.text}>Bağlantı sağlandı</Text>
          </>
        ) : null}
      </View>
      
      {renderProgressBar()}
      
      {isSyncing && syncResults.total > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Başarılı: {syncResults.success} / Başarısız: {syncResults.failed} / Toplam: {syncResults.total}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 30, // Status bar için boşluk
    paddingBottom: 10,
    zIndex: 999,
  },
  offline: {
    backgroundColor: '#FF3B30',
  },
  online: {
    backgroundColor: '#34C759',
  },
  syncing: {
    backgroundColor: '#007AFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
  syncButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  statsText: {
    color: 'white',
    fontSize: 12,
  },
});

export default OfflineNotice; 