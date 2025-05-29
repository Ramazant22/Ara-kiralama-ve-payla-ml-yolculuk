import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  LocationOn,
  CarRental,
  Settings,
  LocalOffer,
  Place,
  AutoFixHigh as AIIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [aiCorrecting, setAiCorrecting] = useState({});
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    fuelType: '',
    transmission: '',
    seats: 5,
    category: '',
    features: [],
    pricePerHour: '',
    pricePerDay: '',
    city: '',
    district: '',
    neighborhood: '',
    address: ''
  });

  const fuelTypes = [
    { value: 'benzin', label: 'Benzin' },
    { value: 'dizel', label: 'Dizel' },
    { value: 'elektrik', label: 'Elektrik' },
    { value: 'hibrit', label: 'Hibrit' },
    { value: 'lpg', label: 'LPG' }
  ];

  const transmissionTypes = [
    { value: 'manuel', label: 'Manuel' },
    { value: 'otomatik', label: 'Otomatik' }
  ];

  const categories = [
    { value: 'ekonomi', label: 'Ekonomi' },
    { value: 'kompakt', label: 'Kompakt' },
    { value: 'orta', label: 'Orta Sınıf' },
    { value: 'büyük', label: 'Büyük' },
    { value: 'lüks', label: 'Lüks' },
    { value: 'suv', label: 'SUV' },
    { value: 'minivan', label: 'Minivan' }
  ];

  const availableFeatures = [
    { display: 'Klima', value: 'klima' },
    { display: 'GPS Navigasyon', value: 'gps' },
    { display: 'Bluetooth', value: 'bluetooth' },
    { display: 'USB Bağlantısı', value: 'usb' },
    { display: 'WiFi', value: 'wifi' },
    { display: 'Geri Görüş Kamerası', value: 'geri_vites_kamerasi' },
    { display: 'Park Sensörü', value: 'park_sensoru' },
    { display: 'Sunroof', value: 'sunroof' },
    { display: 'Deri Koltuk', value: 'deri_koltuk' },
    { display: 'Elektrikli Cam', value: 'elektrikli_cam' },
    { display: 'Merkezi Kilit', value: 'merkezi_kilit' }
  ];

  const turkishCities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
    'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
    'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
    'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
    'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
    'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // AI düzeltme fonksiyonu
  const handleAICorrection = async (fieldName, fieldType) => {
    const fieldValue = formData[fieldName];
    if (!fieldValue || fieldValue.trim() === '') return;

    setAiCorrecting(prev => ({ ...prev, [fieldName]: true }));

    try {
      const response = await api.post('/ai/correct-text', {
        text: fieldValue,
        type: fieldType
      });

      if (response.data.success && response.data.changed) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: response.data.corrected
        }));
        
        // Düzeltme yapıldığını kullanıcıya göster
        setSuccess(`${fieldName === 'make' ? 'Marka' : fieldName === 'model' ? 'Model' : 'Alan'} AI ile düzeltildi: "${response.data.corrected}"`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('AI correction error:', error);
    } finally {
      setAiCorrecting(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      setError('En fazla 6 resim yükleyebilirsiniz');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Her resim en fazla 5MB olabilir');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          file,
          preview: event.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Form verilerini ekle
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          formData[key].forEach(feature => {
            submitData.append('features', feature);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Resimleri ekle
      images.forEach(image => {
        submitData.append('vehicleImages', image.file);
      });

      // Plakadaki boşlukları temizle
      if (formData.licensePlate) {
        submitData.set('licensePlate', formData.licensePlate.replace(/\s+/g, ''));
      }

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/vehicles', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess('Araç başarıyla eklendi!');
        setTimeout(() => {
          navigate('/vehicles');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      console.error('Error response data:', error.response?.data);
      
      if (error.response && error.response.data) {
        const data = error.response.data;
        let errorMessage = '';
        
        // Handle validation errors from mongoose
        if (data.message && data.message.includes('validation failed')) {
          const validationErrors = Object.values(data.errors || {});
          errorMessage = validationErrors.map(err => err.message).join(', ');
        } 
        // Handle custom error messages
        else if (data.message) {
          errorMessage = data.message;
        }
        // Handle array of validation errors
        else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map(err => err.msg || err.message).join(', ');
        }
        else {
          errorMessage = 'Araç eklenirken hata oluştu';
        }
        
        setError(errorMessage);
      } else {
        setError('Sunucu bağlantı hatası oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            <CarRental sx={{ fontSize: '2rem', mr: 2, color: '#ff6b35' }} />
            Yeni Araç Ekle
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Aracınızı platformumuzda paylaşın ve ek gelir elde edin
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff5252',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(46, 125, 50, 0.1)',
              color: '#4caf50',
              border: '1px solid rgba(46, 125, 50, 0.3)'
            }}
          >
            {success}
          </Alert>
        )}

        <Paper 
          sx={{ 
            p: 4,
            bgcolor: '#2a2a2a',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Temel Bilgiler */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CarRental sx={{ color: '#ff6b35', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#ff6b35',
                      fontWeight: 'bold'
                    }}
                  >
                    Temel Bilgiler
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="make"
                  label="Marka"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="Örn: Toyota, BMW, Ford"
                  InputProps={{
                    endAdornment: formData.make && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleAICorrection('make', 'vehicle_brand')}
                          disabled={aiCorrecting.make}
                          color="primary"
                          title="AI ile düzelt"
                        >
                          {aiCorrecting.make ? <CircularProgress size={20} /> : <AIIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="model"
                  label="Model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Örn: Corolla, 3 Serisi, Focus"
                  InputProps={{
                    endAdornment: formData.model && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleAICorrection('model', 'vehicle_model')}
                          disabled={aiCorrecting.model}
                          color="primary"
                          title="AI ile düzelt"
                        >
                          {aiCorrecting.model ? <CircularProgress size={20} /> : <AIIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  name="year"
                  label="Yıl"
                  value={formData.year}
                  onChange={handleInputChange}
                  inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="licensePlate"
                  label="Plaka"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="34ABC123"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="color"
                  label="Renk"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Örn: Beyaz, Siyah, Kırmızı"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  name="seats"
                  label="Koltuk Sayısı"
                  value={formData.seats}
                  onChange={handleInputChange}
                  inputProps={{ min: 2, max: 9 }}
                />
              </Grid>

              {/* Teknik Özellikler */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
                  <Settings sx={{ color: '#ff6b35', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#ff6b35',
                      fontWeight: 'bold'
                    }}
                  >
                    Teknik Özellikler
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Yakıt Türü</InputLabel>
                  <Select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    label="Yakıt Türü"
                  >
                    {fuelTypes.map(fuel => (
                      <MenuItem key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Şanzıman</InputLabel>
                  <Select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    label="Şanzıman"
                  >
                    {transmissionTypes.map(trans => (
                      <MenuItem key={trans.value} value={trans.value}>
                        {trans.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Kategori"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Özellikler */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    mt: 2,
                    mb: 3
                  }}
                >
                  Araç Özellikleri
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableFeatures.map(feature => (
                    <Chip
                      key={feature.value}
                      label={feature.display}
                      onClick={() => handleFeatureChange(feature.value)}
                      color={formData.features.includes(feature.value) ? 'primary' : 'default'}
                      variant={formData.features.includes(feature.value) ? 'filled' : 'outlined'}
                      sx={{
                        '&.MuiChip-colorDefault': {
                          backgroundColor: 'transparent',
                          color: 'rgba(255, 255, 255, 0.7)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            borderColor: '#ff6b35',
                            color: '#ff6b35',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Fiyatlandırma */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
                  <LocalOffer sx={{ color: '#ff6b35', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#ff6b35',
                      fontWeight: 'bold'
                    }}
                  >
                    Fiyatlandırma
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  name="pricePerHour"
                  label="Saatlik Ücret"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    inputProps: { min: 10, step: 0.01 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  name="pricePerDay"
                  label="Günlük Ücret"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    inputProps: { min: 100, step: 0.01 }
                  }}
                />
              </Grid>

              {/* Konum */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
                  <Place sx={{ color: '#ff6b35', mr: 2 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#ff6b35',
                      fontWeight: 'bold'
                    }}
                  >
                    Konum Bilgileri
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="address"
                  label="Adres"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  placeholder="Detaylı adres bilgisi"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>İl</InputLabel>
                  <Select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    label="İl"
                  >
                    {turkishCities.sort().map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  required
                  name="district"
                  label="İlçe"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Örn: Kadıköy, Çankaya"
                  InputProps={{
                    endAdornment: formData.district && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleAICorrection('district', 'city')}
                          disabled={aiCorrecting.district}
                          color="primary"
                          title="AI ile düzelt"
                        >
                          {aiCorrecting.district ? <CircularProgress size={20} /> : <AIIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  name="neighborhood"
                  label="Mahalle"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Mahalle adı (isteğe bağlı)"
                />
              </Grid>

              {/* Resim Yükleme */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    mt: 2,
                    mb: 2
                  }}
                >
                  Araç Resimleri (En fazla 6 adet)
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    disabled={images.length >= 6}
                    sx={{
                      borderColor: '#ff6b35',
                      color: '#ff6b35',
                      '&:hover': {
                        borderColor: '#e55a2b',
                        bgcolor: 'rgba(255, 107, 53, 0.1)'
                      }
                    }}
                  >
                    Resim Seç
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
                
                {images.length > 0 && (
                  <Grid container spacing={2}>
                    {images.map((image) => (
                      <Grid item xs={12} sm={6} md={4} key={image.id}>
                        <Card sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={image.preview}
                            alt="Araç resmi"
                          />
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                              borderRadius: '50%'
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => removeImage(image.id)}
                              sx={{ 
                                color: '#ff6b35',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 107, 53, 0.2)'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      minWidth: 200,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Araç Ekle'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/vehicles')}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddVehicle; 