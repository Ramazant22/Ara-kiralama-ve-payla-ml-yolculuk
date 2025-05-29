import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Rating,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tab,
  Tabs,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  LocalGasStation,
  Settings,
  People,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  DirectionsCar,
  CalendarToday,
  AccessTime,
  Phone,
  Email,
  CheckCircle,
  Speed,
  AcUnit,
  Bluetooth,
  Navigation,
  Security,
  LocalParking,
  ChevronLeft,
  ChevronRight,
  Close,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const VehicleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingDialog, setBookingDialog] = useState({ open: false });
  const [activeTab, setActiveTab] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    pickupLocation: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicleDetail();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchVehicleDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
      setVehicle(response.data.vehicle || response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Araç detayları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Kendi aracını kiralama kontrolü
      if (currentUser && vehicle.owner && currentUser._id === vehicle.owner._id) {
        alert('Kendi aracınızı kiralayamazsınız!');
        return;
      }

      if (!bookingData.startDate || !bookingData.endDate || !bookingData.pickupLocation) {
        alert('Lütfen tüm gerekli alanları doldurun');
        return;
      }

      const bookingRequest = {
        vehicleId: vehicle._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        pickupAddress: bookingData.pickupLocation,
        returnAddress: bookingData.pickupLocation, // Şimdilik aynı yer
        pickupLatitude: 0, // Gerçek uygulamada harita entegrasyonu
        pickupLongitude: 0,
        returnLatitude: 0,
        returnLongitude: 0,
        notes: bookingData.notes
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingRequest, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingDialog({ open: false });
      alert('Rezervasyon talebiniz gönderildi! Araç sahibinin onayını bekleyiniz.');
      
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Rezervasyon sırasında hata oluştu');
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Kendisiyle mesajlaşma kontrolü
      if (currentUser && vehicle.owner && currentUser._id === vehicle.owner._id) {
        alert('Kendinizle mesajlaşamazsınız!');
        return;
      }

      // Konuşma başlat
      const conversationData = {
        participantId: vehicle.owner._id,
        type: 'vehicle_rental',
        title: `${vehicle.make} ${vehicle.model} - Araç Kiralama`,
        relatedTo: vehicle._id,
        relatedModel: 'Vehicle'
      };

      const response = await axios.post('http://localhost:5000/api/conversations/start', conversationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Konuşma sayfasına yönlendir
      navigate(`/messages/${response.data.conversation._id}`);
      
    } catch (error) {
      console.error('Message error:', error);
      alert(error.response?.data?.message || 'Mesaj gönderilirken hata oluştu');
    }
  };

  const handleImageNavigation = (direction) => {
    const images = vehicle?.images || [];
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDays = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      return diffDays;
    }
    return 1;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ color: '#ff6b35' }} size={60} />
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Araç bulunamadı'}
          </Alert>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/vehicles')}
            sx={{ color: '#ff6b35' }}
          >
            Araçlara Geri Dön
          </Button>
        </Container>
      </Box>
    );
  }

  const images = vehicle.images || [];
  const features = [
    { icon: <AcUnit />, label: 'Klima', available: true },
    { icon: <Bluetooth />, label: 'Bluetooth', available: true },
    { icon: <Navigation />, label: 'GPS Navigasyon', available: true },
    { icon: <Security />, label: 'Güvenlik Sistemi', available: true },
    { icon: <LocalParking />, label: 'Park Sensörü', available: false },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', color: 'white' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate('/vehicles')}
            sx={{ mr: 2, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {vehicle.make} {vehicle.model}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{ color: isFavorite ? '#ff6b35' : 'white' }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
              <Share />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Images and Info */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Main Image */}
            <Card sx={{ bgcolor: '#2a2a2a', mb: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', height: '400px' }}>
                <img
                  src={
                    images.length > 0
                      ? `http://localhost:5000${images[currentImageIndex]?.url}`
                      : '/placeholder-car.jpg'
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsImageDialogOpen(true)}
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                      }}
                      onClick={() => handleImageNavigation('prev')}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                      }}
                      onClick={() => handleImageNavigation('next')}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: '20px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {currentImageIndex + 1} / {images.length}
                  </Box>
                )}

                {/* Status Badge */}
                <Chip
                  label={vehicle.status === 'available' ? 'Müsait' : 'Kiralanmış'}
                  color={vehicle.status === 'available' ? 'success' : 'error'}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Card>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <Box sx={{ mb: 3, overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 1, pb: 1 }}>
                  {images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        minWidth: '80px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: currentImageIndex === index ? '2px solid #ff6b35' : '2px solid transparent',
                        opacity: currentImageIndex === index ? 1 : 0.7,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={`http://localhost:5000${image.url}`}
                        alt={`${vehicle.make} ${vehicle.model} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Tabs */}
            <Card sx={{ bgcolor: '#2a2a2a' }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': { color: '#ff6b35' }
                  },
                  '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
                }}
              >
                <Tab label="Özellikler" />
                <Tab label="Konum" />
                <Tab label="Değerlendirmeler" />
              </Tabs>

              <CardContent>
                {activeTab === 0 && (
                  <Box>
                    {/* Vehicle Details */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <People sx={{ fontSize: '2rem', color: '#ff6b35', mb: 1 }} />
                          <Typography variant="h6">{vehicle.seats}</Typography>
                          <Typography variant="body2" color="text.secondary">Koltuk</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <LocalGasStation sx={{ fontSize: '2rem', color: '#ff6b35', mb: 1 }} />
                          <Typography variant="h6">{vehicle.fuelType}</Typography>
                          <Typography variant="body2" color="text.secondary">Yakıt</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Settings sx={{ fontSize: '2rem', color: '#ff6b35', mb: 1 }} />
                          <Typography variant="h6">{vehicle.transmission}</Typography>
                          <Typography variant="body2" color="text.secondary">Şanzıman</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <CalendarToday sx={{ fontSize: '2rem', color: '#ff6b35', mb: 1 }} />
                          <Typography variant="h6">{vehicle.year}</Typography>
                          <Typography variant="body2" color="text.secondary">Model Yılı</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                    {/* Features */}
                    <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35' }}>
                      Araç Özellikleri
                    </Typography>
                    <List>
                      {features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ color: feature.available ? '#4caf50' : 'rgba(255,255,255,0.3)' }}>
                            {feature.available ? <CheckCircle /> : feature.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature.label}
                            sx={{ 
                              color: feature.available ? 'white' : 'rgba(255,255,255,0.5)',
                              textDecoration: feature.available ? 'none' : 'line-through'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {vehicle.description && (
                      <>
                        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35' }}>
                          Açıklama
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {vehicle.description}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35' }}>
                      Araç Konumu
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ color: '#ff6b35', mr: 1 }} />
                      <Typography>
                        {vehicle.location?.city}
                        {vehicle.location?.district && `, ${vehicle.location.district}`}
                      </Typography>
                    </Box>
                    {vehicle.location?.address && (
                      <Typography color="text.secondary">
                        {vehicle.location.address}
                      </Typography>
                    )}
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35' }}>
                      Değerlendirmeler
                    </Typography>
                    <Typography color="text.secondary">
                      Henüz değerlendirme bulunmuyor.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Booking */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Owner Info */}
            <Card sx={{ bgcolor: '#2a2a2a', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#ff6b35' }}>
                  Araç Sahibi
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={vehicle.owner?.avatar}
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: '#ff6b35' }}
                  >
                    {vehicle.owner?.firstName?.[0]}{vehicle.owner?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Rating 
                        value={vehicle.owner?.rating || 4.5} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                        sx={{ '& .MuiRating-iconFilled': { color: '#ff6b35' } }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({vehicle.owner?.reviewCount || 12} değerlendirme)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Phone />}
                    size="small"
                    sx={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                  >
                    Ara
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<MessageIcon />}
                    size="small"
                    onClick={handleSendMessage}
                    disabled={currentUser && vehicle.owner && currentUser._id === vehicle.owner._id}
                    sx={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                  >
                    Mesaj
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card sx={{ bgcolor: '#2a2a2a', position: 'sticky', top: 20 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                    {formatPrice(vehicle.pricePerDay)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / günlük
                  </Typography>
                  {vehicle.pricePerHour && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Saatlik: {formatPrice(vehicle.pricePerHour)}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Quick Booking */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Hızlı Rezervasyon
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Başlangıç"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Bitiş"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {bookingData.startDate && bookingData.endDate && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255, 107, 53, 0.1)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>{calculateDays()} gün</strong> kiralama
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ff6b35' }}>
                        Toplam: {formatPrice(vehicle.pricePerDay * calculateDays())}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setBookingDialog({ open: true })}
                  disabled={
                    vehicle.status !== 'available' || 
                    (currentUser && vehicle.owner && currentUser._id === vehicle.owner._id)
                  }
                  sx={{
                    bgcolor: '#ff6b35',
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#e55a2b' },
                    '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  {
                    currentUser && vehicle.owner && currentUser._id === vehicle.owner._id
                      ? 'Bu Sizin Aracınız'
                      : vehicle.status === 'available' 
                        ? 'Rezervasyon Yap' 
                        : 'Şu An Müsait Değil'
                  }
                </Button>

                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                  Rezervasyon ücretsizdir. Ödeme araç tesliminde yapılır.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Image Dialog */}
        <Dialog 
          open={isImageDialogOpen} 
          onClose={() => setIsImageDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ '& .MuiDialog-paper': { bgcolor: '#1a1a1a' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{vehicle.make} {vehicle.model}</Typography>
            <IconButton onClick={() => setIsImageDialogOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ImageList cols={2} gap={8}>
              {images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={`http://localhost:5000${image.url}`}
                    alt={`${vehicle.make} ${vehicle.model} ${index + 1}`}
                    style={{ borderRadius: '8px' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DialogContent>
        </Dialog>

        {/* Booking Dialog */}
        <Dialog 
          open={bookingDialog.open} 
          onClose={() => setBookingDialog({ open: false })}
          maxWidth="sm"
          fullWidth
          sx={{ '& .MuiDialog-paper': { bgcolor: '#2a2a2a', color: 'white' } }}
        >
          <DialogTitle>Rezervasyon Detayları</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Başlangıç Tarihi"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Bitiş Tarihi"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Teslim Alma Saati"
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="İade Saati"
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Teslim Alma Konumu"
                  value={bookingData.pickupLocation}
                  onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                  placeholder="Araç nerede teslim alınacak?"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ek Notlar"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  placeholder="Araç sahibine iletmek istediğiniz notlar..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setBookingDialog({ open: false })}>
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleBooking}
              sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
            >
              Rezervasyon Yap
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VehicleDetail; 