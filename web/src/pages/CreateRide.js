import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  DirectionsCar,
  Person,
  Euro,
  Description,
  SmokingRooms,
  Pets,
  MusicNote,
  Chat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Rota bilgileri
    fromCity: '',
    fromDistrict: '',
    fromAddress: '',
    toCity: '',
    toDistrict: '',
    toAddress: '',
    
    // Tarih ve saat
    departureDate: '',
    departureTime: '',
    
    // Kapasite ve fiyat
    availableSeats: 1,
    pricePerSeat: '',
    
    // Araç bilgileri
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    licensePlate: '',
    
    // Tercihler
    smokingAllowed: false,
    petsAllowed: false,
    musicAllowed: true,
    conversationLevel: 'moderate',
    
    // Açıklama
    description: '',
    notes: ''
  });

  const turkishCities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
    'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
    'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
    'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
    'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
    'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
  ];

  const conversationLevels = [
    { value: 'quiet', label: 'Sessiz Yolculuk', description: 'Sessiz ve huzurlu bir yolculuk tercih ediyorum' },
    { value: 'moderate', label: 'Normal Sohbet', description: 'Ara sıra sohbet etmekten hoşlanırım' },
    { value: 'chatty', label: 'Sohbet Severim', description: 'Yolculuk boyunca sohbet etmeyi seviyorum' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'fromCity', 'toCity', 'departureDate', 'departureTime',
      'availableSeats', 'pricePerSeat', 'vehicleMake', 'vehicleModel',
      'vehicleYear', 'licensePlate'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return `${field} alanı gereklidir`;
      }
    }

    // Tarih kontrolü
    const selectedDate = new Date(formData.departureDate);
    const now = new Date();
    if (selectedDate <= now) {
      return 'Kalkış tarihi gelecekte olmalıdır';
    }

    // Saat formatı kontrolü
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.departureTime)) {
      return 'Geçerli bir saat formatı giriniz (HH:MM)';
    }

    // Fiyat kontrolü
    if (parseFloat(formData.pricePerSeat) < 0) {
      return 'Fiyat 0\'dan küçük olamaz';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Transform flat form data to nested structure expected by backend
      const rideData = {
        from: {
          city: formData.fromCity,
          district: formData.fromDistrict || undefined,
          address: formData.fromAddress || undefined
        },
        to: {
          city: formData.toCity,
          district: formData.toDistrict || undefined,
          address: formData.toAddress || undefined
        },
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        availableSeats: parseInt(formData.availableSeats),
        pricePerSeat: parseFloat(formData.pricePerSeat),
        vehicle: {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: parseInt(formData.vehicleYear),
          color: formData.vehicleColor || undefined,
          licensePlate: formData.licensePlate
        },
        preferences: {
          smokingAllowed: formData.smokingAllowed,
          petsAllowed: formData.petsAllowed,
          musicAllowed: formData.musicAllowed,
          conversationLevel: formData.conversationLevel
        },
        description: formData.description || undefined,
        notes: formData.notes || undefined
      };

      await axios.post('http://localhost:5000/api/rides', rideData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/rides');
    } catch (error) {
      console.error('Error creating ride:', error);
      setError(error.response?.data?.message || 'Yolculuk oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Bugünün tarihini al (minimum tarih için)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
      <Container maxWidth="md">
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ color: 'white', fontWeight: 'bold', mb: 4, textAlign: 'center' }}
        >
          <DirectionsCar sx={{ fontSize: '2rem', mr: 2, color: '#ff6b35' }} />
          Yolculuk Oluştur
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ bgcolor: '#2a2a2a' }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              
              {/* Rota Bilgileri */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, color: '#ff6b35' }} />
                Rota Bilgileri
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Başlangıç Şehri"
                    value={formData.fromCity}
                    onChange={(e) => handleInputChange('fromCity', e.target.value)}
                    required
                  >
                    {turkishCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Varış Şehri"
                    value={formData.toCity}
                    onChange={(e) => handleInputChange('toCity', e.target.value)}
                    required
                  >
                    {turkishCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Başlangıç İlçesi"
                    value={formData.fromDistrict}
                    onChange={(e) => handleInputChange('fromDistrict', e.target.value)}
                    placeholder="Örn: Kadıköy"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Varış İlçesi"
                    value={formData.toDistrict}
                    onChange={(e) => handleInputChange('toDistrict', e.target.value)}
                    placeholder="Örn: Çankaya"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Başlangıç Adresi"
                    value={formData.fromAddress}
                    onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                    placeholder="Detaylı adres (isteğe bağlı)"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Varış Adresi"
                    value={formData.toAddress}
                    onChange={(e) => handleInputChange('toAddress', e.target.value)}
                    placeholder="Detaylı adres (isteğe bağlı)"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Tarih ve Saat */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: '#ff6b35' }} />
                Tarih ve Saat
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Kalkış Tarihi"
                    value={formData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: today }}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Kalkış Saati"
                    value={formData.departureTime}
                    onChange={(e) => handleInputChange('departureTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Kapasite ve Fiyat */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, color: '#ff6b35' }} />
                Kapasite ve Fiyat
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Müsait Koltuk Sayısı"
                    value={formData.availableSeats}
                    onChange={(e) => handleInputChange('availableSeats', parseInt(e.target.value))}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} Koltuk
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Koltuk Başına Fiyat"
                    value={formData.pricePerSeat}
                    onChange={(e) => handleInputChange('pricePerSeat', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Araç Bilgileri */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <DirectionsCar sx={{ mr: 1, color: '#ff6b35' }} />
                Araç Bilgileri
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Araç Markası"
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                    placeholder="Örn: Toyota, Volkswagen"
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Araç Modeli"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="Örn: Corolla, Golf"
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Model Yılı"
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange('vehicleYear', parseInt(e.target.value))}
                    inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Araç Rengi"
                    value={formData.vehicleColor}
                    onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                    placeholder="Örn: Beyaz, Gri"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Plaka"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                    placeholder="Örn: 34ABC123"
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Tercihler */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <Chat sx={{ mr: 1, color: '#ff6b35' }} />
                Yolculuk Tercihleri
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.smokingAllowed}
                          onChange={(e) => handleInputChange('smokingAllowed', e.target.checked)}
                          sx={{ color: '#ff6b35' }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SmokingRooms sx={{ mr: 1, color: '#ff6b35' }} />
                          <Typography sx={{ color: 'white' }}>Sigara İçilebilir</Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.petsAllowed}
                          onChange={(e) => handleInputChange('petsAllowed', e.target.checked)}
                          sx={{ color: '#ff6b35' }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Pets sx={{ mr: 1, color: '#ff6b35' }} />
                          <Typography sx={{ color: 'white' }}>Evcil Hayvan Kabul Edilir</Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.musicAllowed}
                          onChange={(e) => handleInputChange('musicAllowed', e.target.checked)}
                          sx={{ color: '#ff6b35' }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MusicNote sx={{ mr: 1, color: '#ff6b35' }} />
                          <Typography sx={{ color: 'white' }}>Müzik Çalınabilir</Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Sohbet Tercihi"
                    value={formData.conversationLevel}
                    onChange={(e) => handleInputChange('conversationLevel', e.target.value)}
                  >
                    {conversationLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        <Box>
                          <Typography>{level.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {level.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Açıklama */}
              <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1, color: '#ff6b35' }} />
                Ek Bilgiler
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Yolculuk Açıklaması"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Yolculuk hakkında bilgi vermek istediğiniz detaylar..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`${formData.description.length}/500 karakter`}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Ek Notlar"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Yolcular için önemli notlar..."
                    inputProps={{ maxLength: 200 }}
                    helperText={`${formData.notes.length}/200 karakter`}
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/rides')}
                  sx={{ minWidth: 120 }}
                >
                  İptal
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#ff6b35', 
                    '&:hover': { bgcolor: '#e55a2b' },
                    minWidth: 200
                  }}
                >
                  {loading ? 'Oluşturuluyor...' : 'Yolculuk Oluştur'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CreateRide; 