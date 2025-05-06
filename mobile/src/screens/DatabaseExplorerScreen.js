import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import databaseService from '../api/services/databaseService';

const DatabaseExplorerScreen = () => {
  const navigation = useNavigation();
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  // Tema renkleri
  const backgroundColor = darkMode ? '#121212' : '#F7F7F7';
  const cardColor = darkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const secondaryTextColor = darkMode ? '#BBBBBB' : '#666666';
  const borderColor = darkMode ? '#333333' : '#E0E0E0';

  // State
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentDetailVisible, setDocumentDetailVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin kontrolü
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      Alert.alert(
        "Yetkisiz Erişim",
        "Bu sayfaya erişim için admin yetkisi gereklidir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    }
  }, [user]);
  
  // Koleksiyonları yükle
  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await databaseService.getAllCollections();
      setCollections(response.collections || []);
    } catch (error) {
      console.error('Koleksiyonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Koleksiyonlar yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    if (isAdmin) {
      loadCollections();
    }
  }, [isAdmin]);
  
  // Belirli bir koleksiyondaki belgeleri yükle
  const loadDocuments = async (collectionName) => {
    try {
      setDocumentsLoading(true);
      const response = await databaseService.getDocuments(collectionName);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Belgeler yüklenirken hata:', error);
      Alert.alert('Hata', 'Belgeler yüklenirken bir sorun oluştu');
    } finally {
      setDocumentsLoading(false);
    }
  };
  
  // Koleksiyon seçimi
  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    loadDocuments(collection.name);
  };
  
  // Belge detayını göster
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setDocumentDetailVisible(true);
  };
  
  // JSON formatında görüntüleme
  const renderJsonValue = (value, key = null, indent = 0) => {
    const indentSpace = ' '.repeat(indent * 2);
    
    if (value === null) {
      return <Text style={[styles.jsonNull, { color: '#E91E63' }]}>null</Text>;
    }
    
    if (typeof value === 'boolean') {
      return <Text style={[styles.jsonBoolean, { color: '#9C27B0' }]}>{value.toString()}</Text>;
    }
    
    if (typeof value === 'number') {
      return <Text style={[styles.jsonNumber, { color: '#FF9800' }]}>{value}</Text>;
    }
    
    if (typeof value === 'string') {
      // Tarih kontrolü
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return <Text style={[styles.jsonString, { color: '#4CAF50' }]}>"{new Date(value).toLocaleString()}"</Text>;
      }
      return <Text style={[styles.jsonString, { color: '#4CAF50' }]}>"{value}"</Text>;
    }
    
    if (Array.isArray(value)) {
      return (
        <View style={{ marginLeft: indent * 2 }}>
          <Text style={{ color: textColor }}>[ </Text>
          {value.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row' }}>
              <Text style={{ color: textColor }}>{indentSpace}  </Text>
              {renderJsonValue(item, null, indent + 1)}
              {index < value.length - 1 && <Text style={{ color: textColor }}>,</Text>}
            </View>
          ))}
          <Text style={{ color: textColor }}>{indentSpace}]</Text>
        </View>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <View style={{ marginLeft: indent * 2 }}>
          <Text style={{ color: textColor }}>{'{'} </Text>
          {Object.keys(value).map((objKey, index) => (
            <View key={objKey} style={{ flexDirection: 'row' }}>
              <Text style={{ color: textColor }}>{indentSpace}  </Text>
              <Text style={[styles.jsonKey, { color: '#2196F3' }]}>"{objKey}"</Text>
              <Text style={{ color: textColor }}>: </Text>
              {renderJsonValue(value[objKey], objKey, indent + 1)}
              {index < Object.keys(value).length - 1 && <Text style={{ color: textColor }}>,</Text>}
            </View>
          ))}
          <Text style={{ color: textColor }}>{indentSpace}{'}'}</Text>
        </View>
      );
    }
    
    return <Text style={{ color: textColor }}>{String(value)}</Text>;
  };
  
  // Koleksiyon öğesi görünümü
  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.collectionItem,
        { backgroundColor: cardColor, borderColor },
        selectedCollection?.name === item.name && styles.selectedCollectionItem
      ]}
      onPress={() => handleCollectionSelect(item)}
    >
      <Icon name="database" size={16} color="#4CAF50" style={styles.collectionIcon} />
      <View style={styles.collectionInfo}>
        <Text style={[styles.collectionName, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.collectionCount, { color: secondaryTextColor }]}>
          {item.count} belge
        </Text>
      </View>
      <Icon name="chevron-right" size={14} color={secondaryTextColor} />
    </TouchableOpacity>
  );
  
  // Belge öğesi görünümü
  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.documentItem, { backgroundColor: cardColor, borderColor }]}
      onPress={() => handleDocumentSelect(item)}
    >
      <View style={styles.documentHeader}>
        <Text style={[styles.documentId, { color: textColor }]}>
          ID: {item._id.substring(0, 8)}...
        </Text>
        <Text style={[styles.documentDate, { color: secondaryTextColor }]}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      
      <View style={styles.documentPreview}>
        {Object.keys(item).slice(0, 3).map(key => (
          <Text key={key} style={[styles.documentField, { color: secondaryTextColor }]} numberOfLines={1}>
            <Text style={[styles.fieldName, { color: '#2196F3' }]}>{key}: </Text>
            {typeof item[key] === 'object' ? (
              item[key] === null ? 'null' : (Array.isArray(item[key]) ? `Array(${item[key].length})` : 'Object')
            ) : String(item[key]).substring(0, 30) + (String(item[key]).length > 30 ? '...' : '')}
          </Text>
        ))}
        {Object.keys(item).length > 3 && (
          <Text style={[styles.moreFields, { color: secondaryTextColor }]}>
            +{Object.keys(item).length - 3} daha fazla alan
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
  
  // Belge detay modalı
  const renderDocumentDetailModal = () => (
    <Modal
      visible={documentDetailVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDocumentDetailVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Belge Detayı
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDocumentDetailVisible(false)}
            >
              <Icon name="times" size={18} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={true}
          >
            {selectedDocument && renderJsonValue(selectedDocument)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  // Yükleme durumu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Veritabanı yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Veritabanı Explorer</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Database Status */}
      <View style={[styles.statusCard, { backgroundColor: cardColor }]}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Koleksiyon Sayısı:</Text>
          <Text style={[styles.statusValue, { color: textColor }]}>{collections.length}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Durum:</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Collections Panel */}
        <View style={[styles.collectionsPanel, { backgroundColor: cardColor }]}>
          <View style={[styles.panelHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.panelTitle, { color: textColor }]}>Koleksiyonlar</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadCollections}
            >
              <Icon name="sync-alt" size={14} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.collectionList}
          />
        </View>
        
        {/* Documents Panel */}
        <View style={[styles.documentsPanel, { backgroundColor: cardColor }]}>
          <View style={[styles.panelHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.panelTitle, { color: textColor }]}>
              {selectedCollection ? `${selectedCollection.name} Belgeleri` : 'Belgeler'}
            </Text>
            {selectedCollection && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadDocuments(selectedCollection.name)}
              >
                <Icon name="sync-alt" size={14} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
          
          {selectedCollection ? (
            documentsLoading ? (
              <View style={styles.documentsLoading}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={[styles.documentsLoadingText, { color: secondaryTextColor }]}>
                  Belgeler yükleniyor...
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.searchBar, { backgroundColor: darkMode ? '#333333' : '#F0F0F0' }]}>
                  <Icon name="search" size={16} color={secondaryTextColor} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Belgelerde ara..."
                    placeholderTextColor={secondaryTextColor}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                
                <FlatList
                  data={documents.filter(doc => {
                    if (!searchQuery) return true;
                    return JSON.stringify(doc).toLowerCase().includes(searchQuery.toLowerCase());
                  })}
                  renderItem={renderDocumentItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.documentList}
                  ListEmptyComponent={
                    <View style={styles.emptyDocuments}>
                      <Icon name="file-alt" size={40} color={secondaryTextColor} />
                      <Text style={[styles.emptyDocumentsText, { color: secondaryTextColor }]}>
                        {searchQuery ? 'Arama sonucu bulunamadı' : 'Bu koleksiyonda belge yok'}
                      </Text>
                    </View>
                  }
                />
              </>
            )
          ) : (
            <View style={styles.noCollectionSelected}>
              <Icon name="hand-point-left" size={40} color={secondaryTextColor} />
              <Text style={[styles.noCollectionText, { color: secondaryTextColor }]}>
                Lütfen bir koleksiyon seçin
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {renderDocumentDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  collectionsPanel: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  documentsPanel: {
    flex: 2,
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 6,
  },
  collectionList: {
    padding: 8,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  selectedCollectionItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  collectionIcon: {
    marginRight: 10,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  collectionCount: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 8,
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  documentList: {
    padding: 8,
  },
  documentItem: {
    marginVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#00000010',
  },
  documentId: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 12,
  },
  documentPreview: {
    padding: 10,
  },
  documentField: {
    fontSize: 12,
    marginVertical: 2,
  },
  fieldName: {
    fontWeight: '500',
  },
  moreFields: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  noCollectionSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCollectionText: {
    marginTop: 12,
    fontSize: 14,
  },
  documentsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentsLoadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyDocuments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDocumentsText: {
    marginTop: 12,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  jsonKey: {
    fontWeight: '500',
  },
  jsonString: {
    fontStyle: 'normal',
  },
  jsonNumber: {
    fontWeight: 'normal',
  },
  jsonBoolean: {
    fontWeight: 'bold',
  },
  jsonNull: {
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default DatabaseExplorerScreen; 