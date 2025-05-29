import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  InputAdornment,
  Stack
} from '@mui/material';
import {
  Search,
  LocationOn,
  CalendarToday,
  Person,
  DirectionsCar,
  AccessTime,
  Add,
  Group,
  Phone,
  SmokingRooms,
  Pets,
  MusicNote,
  Chat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [selectedRide, setSelectedRide] = useState(null);
  const [joinDialog, setJoinDialog] = useState({
    open: false,
    rideId: null,
    seatsRequested: 1,
    pickupAddress: '',
    dropoffAddress: '',
    notes: ''
  });

  const statusLabels = {
    active: { label: 'Aktif', color: 'success' },
    full: { label: 'Dolu', color: 'warning' },
    completed: { label: 'Tamamlandı', color: 'default' },
    cancelled: { label: 'İptal Edildi', color: 'error' }
  };

  const conversationLevels = {
    quiet: { label: 'Sessiz', icon: '🤫' },
    moderate: { label: 'Normal', icon: '💬' },
    chatty: { label: 'Konuşkan', icon: '🗣️' }
  };

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

  useEffect(() => {
    fetchRides();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser(null);
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchParams.from) params.append('from', searchParams.from);
      if (searchParams.to) params.append('to', searchParams.to);
      if (searchParams.date) params.append('date', searchParams.date);
      if (searchParams.passengers > 1) params.append('passengers', searchParams.passengers);

      const response = await axios.get(`http://localhost:5000/api/rides?${params}`);
      
      // Kalan koltuk sayısını hesapla
      const ridesWithSeats = response.data.rides.map(ride => ({
        ...ride,
        remainingSeats: getRemainingSeats(ride)
      }));
      
      setRides(ridesWithSeats);
      setError('');
    } catch (error) {
      console.error('Error fetching rides:', error);
      setError('Yolculuklar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRides();
  };

  const handleJoinRide = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:5000/api/ride-bookings', {
        rideId: joinDialog.rideId,
        seatsRequested: joinDialog.seatsRequested,
        pickupAddress: joinDialog.pickupAddress,
        dropoffAddress: joinDialog.dropoffAddress,
        notes: joinDialog.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setJoinDialog({ 
        open: false, 
        rideId: null, 
        seatsRequested: 1, 
        pickupAddress: '', 
        dropoffAddress: '',
        notes: ''
      });
      
      fetchRides();
      alert('Katılım talebiniz gönderildi! Sürücünün onayını bekleyiniz.');
    } catch (error) {
      console.error('Error joining ride:', error);
      setError(error.response?.data?.message || 'Katılım talebi gönderilirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getRemainingSeats = (ride) => {
    if (ride.remainingSeats !== undefined) {
      return ride.remainingSeats;
    }
    
    // Fallback hesaplama
    const acceptedPassengers = ride.passengers?.filter(p => p.status === 'accepted') || [];
    const occupiedSeats = acceptedPassengers.reduce((total, passenger) => 
      total + passenger.seatsRequested, 0
    );
    return ride.availableSeats - occupiedSeats;
  };

  const canJoinRide = (ride) => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return false;

    // Kendi yolculuğuna katılamaz
    if (ride.driver._id === currentUser._id) {
      return false;
    }

    const remainingSeats = getRemainingSeats(ride);
    return ride.status === 'active' && remainingSeats > 0;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ color: 'white', fontWeight: 'bold' }}
          >
            <Group sx={{ fontSize: '2rem', mr: 2, color: '#ff6b35' }} />
            Yolculuk Ara
          </Typography>
          
          <Fab 
            color="primary" 
            onClick={() => navigate('/create-ride')}
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
          >
            <Add />
          </Fab>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search Form */}
        <Card sx={{ bgcolor: '#2a2a2a', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              Yolculuk Ara
            </Typography>
            
            <Box component="form" onSubmit={handleSearch}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    label="Nereden"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#ff6b35' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {turkishCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    label="Nereye"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#ff6b35' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {turkishCities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Tarih"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#ff6b35' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    select
                    label="Yolcu Sayısı"
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#ff6b35' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} Kişi
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    size="large"
                    startIcon={<Search />}
                    sx={{ 
                      bgcolor: '#ff6b35', 
                      '&:hover': { bgcolor: '#e55a2b' },
                      height: '56px'
                    }}
                  >
                    Ara
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: 'white' }}>Yükleniyor...</Typography>
          </Box>
        ) : rides.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DirectionsCar sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Arama kriterlerinize uygun yolculuk bulunamadı
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/create-ride')}
              sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
            >
              Yolculuk Oluştur
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {rides.map((ride) => {
              const remainingSeats = getRemainingSeats(ride);
              const statusConfig = statusLabels[ride.status];

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={ride._id}>
                  <Card 
                    sx={{ 
                      bgcolor: '#2a2a2a', 
                      color: 'white',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: remainingSeats === 0 ? '1px solid #ff9800' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            size="small"
                          />
                          {currentUser && ride.driver._id === currentUser._id && (
                            <Chip
                              label="Sizin Yolculuğunuz"
                              size="small"
                              sx={{ 
                                bgcolor: '#4caf50', 
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                          {formatCurrency(ride.pricePerSeat)}/kişi
                        </Typography>
                      </Box>

                      {/* Route */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {ride.from.city} → {ride.to.city}
                        </Typography>
                        {ride.from.district && (
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {ride.from.district} → {ride.to.district}
                          </Typography>
                        )}
                      </Box>

                      {/* Date & Time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                        <Typography variant="body2">
                          {formatDate(ride.departureDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTime sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                        <Typography variant="body2">
                          Kalkış: {ride.departureTime}
                        </Typography>
                      </Box>

                      {/* Driver */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={ride.driver.avatar} 
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {ride.driver.firstName} {ride.driver.lastName}
                        </Typography>
                      </Box>

                      {/* Vehicle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DirectionsCar sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                        <Typography variant="body2">
                          {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.year})
                        </Typography>
                      </Box>

                      {/* Seats */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                        <Typography variant="body2">
                          {remainingSeats} / {ride.availableSeats} koltuk müsait
                        </Typography>
                      </Box>

                      {/* Preferences */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                        {ride.preferences.smokingAllowed && (
                          <Chip 
                            icon={<SmokingRooms />} 
                            label="Sigara" 
                            size="small" 
                            color="warning" 
                          />
                        )}
                        {ride.preferences.petsAllowed && (
                          <Chip 
                            icon={<Pets />} 
                            label="Evcil Hayvan" 
                            size="small" 
                            color="info" 
                          />
                        )}
                        {ride.preferences.musicAllowed && (
                          <Chip 
                            icon={<MusicNote />} 
                            label="Müzik" 
                            size="small" 
                            color="success" 
                          />
                        )}
                        <Chip 
                          icon={<Chat />} 
                          label={conversationLevels[ride.preferences.conversationLevel]?.label} 
                          size="small" 
                          variant="outlined"
                        />
                      </Stack>

                      {/* Description */}
                      {ride.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {ride.description}
                        </Typography>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        {currentUser && ride.driver._id === currentUser._id ? (
                          // Kendi yolculuğu - yönetim butonları
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate('/my-trips')}
                            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                          >
                            Yolculuğumu Yönet
                          </Button>
                        ) : canJoinRide(ride) ? (
                          // Katılabileceği yolculuk
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setJoinDialog({ 
                              open: true, 
                              rideId: ride._id,
                              seatsRequested: 1,
                              pickupAddress: '',
                              dropoffAddress: '',
                              notes: ''
                            })}
                            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                          >
                            Katılım Talebi Gönder
                          </Button>
                        ) : currentUser && ride.driver._id !== currentUser._id && remainingSeats === 0 ? (
                          // Dolu yolculuk
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ color: '#ff9800', borderColor: '#ff9800' }}
                          >
                            Yolculuk Dolu
                          </Button>
                        ) : !currentUser ? (
                          // Giriş yapmamış
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/login')}
                            sx={{ color: '#ff6b35', borderColor: '#ff6b35' }}
                          >
                            Giriş Yapın
                          </Button>
                        ) : null}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedRide(ride)}
                        >
                          Detaylar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Join Ride Dialog */}
        <Dialog 
          open={joinDialog.open} 
          onClose={() => setJoinDialog({ 
            open: false, 
            rideId: null, 
            seatsRequested: 1, 
            pickupAddress: '', 
            dropoffAddress: '',
            notes: ''
          })}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Yolculuğa Katılım Talebi</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Koltuk Sayısı"
                value={joinDialog.seatsRequested}
                onChange={(e) => setJoinDialog(prev => ({ ...prev, seatsRequested: parseInt(e.target.value) }))}
                sx={{ mb: 3 }}
              >
                {[1, 2, 3, 4].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} Kişi
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                placeholder="Binme noktası (isteğe bağlı)"
                value={joinDialog.pickupAddress}
                onChange={(e) => setJoinDialog(prev => ({ ...prev, pickupAddress: e.target.value }))}
                sx={{ mb: 3 }}
                helperText="Sürücüye nerede size yolda çıkacağınızı belirtebilirsiniz"
              />

              <TextField
                fullWidth
                placeholder="İnme noktası (isteğe bağlı)"
                value={joinDialog.dropoffAddress}
                onChange={(e) => setJoinDialog(prev => ({ ...prev, dropoffAddress: e.target.value }))}
                sx={{ mb: 3 }}
                helperText="Sürücüye nerede ineceğinizi belirtebilirsiniz"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ek notlar (isteğe bağlı)"
                value={joinDialog.notes}
                onChange={(e) => setJoinDialog(prev => ({ ...prev, notes: e.target.value }))}
                helperText="Sürücüye iletmek istediğiniz ek bilgiler"
                inputProps={{ maxLength: 200 }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => setJoinDialog({ 
                open: false, 
                rideId: null, 
                seatsRequested: 1, 
                pickupAddress: '', 
                dropoffAddress: '',
                notes: ''
              })}
            >
              İptal
            </Button>
            <Button 
              onClick={handleJoinRide} 
              color="primary"
              variant="contained"
            >
              Katılım Talebi Gönder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ride Detail Dialog */}
        <Dialog 
          open={!!selectedRide} 
          onClose={() => setSelectedRide(null)}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
          maxWidth="md"
          fullWidth
        >
          {selectedRide && (
            <>
              <DialogTitle>
                Yolculuk Detayları
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Güzergah
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        <strong>Başlangıç:</strong> {selectedRide.from.city}
                        {selectedRide.from.district && `, ${selectedRide.from.district}`}
                      </Typography>
                      {selectedRide.from.address && (
                        <Typography variant="body2" sx={{ color: '#bbb' }}>
                          {selectedRide.from.address}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        <strong>Varış:</strong> {selectedRide.to.city}
                        {selectedRide.to.district && `, ${selectedRide.to.district}`}
                      </Typography>
                      {selectedRide.to.address && (
                        <Typography variant="body2" sx={{ color: '#bbb' }}>
                          {selectedRide.to.address}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body1">
                      <strong>Tarih:</strong> {formatDate(selectedRide.departureDate)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Saat:</strong> {selectedRide.departureTime}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Sürücü ve Araç
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        src={selectedRide.driver?.avatar} 
                        sx={{ width: 50, height: 50 }}
                      >
                        {selectedRide.driver?.firstName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {selectedRide.driver?.firstName} {selectedRide.driver?.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ffc107' }}>
                          ⭐ {
                            selectedRide.driver?.rating?.average 
                              ? `${selectedRide.driver.rating.average.toFixed(1)} (${selectedRide.driver.rating.count} değerlendirme)`
                              : 'Yeni Kullanıcı'
                          }
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1">
                      <strong>Araç:</strong> {selectedRide.vehicle?.make} {selectedRide.vehicle?.model}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Yıl:</strong> {selectedRide.vehicle?.year}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Renk:</strong> {selectedRide.vehicle?.color}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Plaka:</strong> {selectedRide.vehicle?.licensePlate}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Fiyat ve Koltuk Bilgisi
                    </Typography>
                    <Typography variant="body1">
                      <strong>Kişi Başı Fiyat:</strong> {formatCurrency(selectedRide.pricePerSeat)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Toplam Koltuk:</strong> {selectedRide.availableSeats}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Kalan Koltuk:</strong> {getRemainingSeats(selectedRide)}
                    </Typography>
                  </Grid>

                  {selectedRide.description && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Açıklama
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        {selectedRide.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              
              <DialogActions>
                <Button 
                  onClick={() => setSelectedRide(null)}
                >
                  Kapat
                </Button>
                {canJoinRide(selectedRide) && (
                  <Button 
                    onClick={() => {
                      setSelectedRide(null);
                      setJoinDialog({ 
                        open: true, 
                        rideId: selectedRide._id, 
                        seatsRequested: 1, 
                        pickupAddress: '', 
                        dropoffAddress: '',
                        notes: ''
                      });
                    }}
                    color="primary"
                    variant="contained"
                  >
                    Katılım Talebi Gönder
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default Rides; 