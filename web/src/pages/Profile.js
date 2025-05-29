import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  Badge,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
} from '@mui/material';
import {
  DirectionsCar,
  CarRental,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Star,
  Add,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  WorkOutline,
  Person,
  Security,
  Schedule,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [myVehicles, setMyVehicles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [vehicleRequests, setVehicleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [licenseInfo, setLicenseInfo] = useState({
    licenseNumber: '',
    issueDate: '',
    expiryDate: '',
    category: 'B',
  });

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return 'Belirtilmemiş';
    if (typeof address === 'string') return address;
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Belirtilmemiş';
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user profile
      const profileResponse = await axios.get('http://localhost:5000/api/auth/me', config);
      setUserProfile(profileResponse.data.user);
      setEditedProfile(profileResponse.data.user);
      
      if (profileResponse.data.user.drivingLicense) {
        setLicenseInfo(profileResponse.data.user.drivingLicense);
      }

      // Fetch user's vehicles
      const vehiclesResponse = await axios.get('http://localhost:5000/api/vehicles', config);
      const allVehicles = vehiclesResponse.data.vehicles || vehiclesResponse.data || [];
      const userVehicles = allVehicles.filter(vehicle => 
        vehicle.owner?._id === profileResponse.data.user._id || 
        vehicle.owner === profileResponse.data.user._id
      );
      setMyVehicles(userVehicles);

      // Fetch user's bookings
      const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/my', config);
      const allBookings = bookingsResponse.data.bookings || bookingsResponse.data || [];
      setMyBookings(allBookings);

      // Fetch booking requests for user's vehicles (pending bookings for user's vehicles)
      const requests = allBookings.filter(booking => 
        userVehicles.some(vehicle => 
          (vehicle._id === booking.vehicle?._id || vehicle._id === booking.vehicle) &&
          booking.status === 'pending'
        )
      );
      setVehicleRequests(requests);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Profil bilgileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleProfileEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put('http://localhost:5000/api/users/profile', editedProfile, config);
      setUserProfile(editedProfile);
      setEditDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Profil güncelleme sırasında hata oluştu.');
    }
  };

  const handleLicenseUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put('http://localhost:5000/api/users/license', { drivingLicense: licenseInfo }, config);
      setUserProfile(prev => ({ ...prev, drivingLicense: licenseInfo }));
      setLicenseDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Error updating license:', error);
      setError('Ehliyet bilgileri güncelleme sırasında hata oluştu.');
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, 
        { status: action === 'approve' ? 'confirmed' : 'cancelled' }, 
        config
      );
      
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('İşlem sırasında hata oluştu.');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#1a1a1a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#ff6b35', mb: 2 }} />
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Profil yükleniyor...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#1a1a1a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Alert severity="error">Profil bilgileri yüklenemedi.</Alert>
      </Box>
    );
  }

  const ProfileInfo = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        {/* Profile Card */}
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Avatar
            src={userProfile.avatar}
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              bgcolor: '#ff6b35',
              fontSize: '3rem',
            }}
          >
            {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
          </Avatar>
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {userProfile.firstName} {userProfile.lastName}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            @{userProfile.username || userProfile.email?.split('@')[0]}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Rating
              value={userProfile.rating || 0}
              precision={0.1}
              readOnly
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#ff6b35',
                },
              }}
            />
            <Typography variant="body2" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
              ({userProfile.reviewCount || 0} değerlendirme)
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditDialogOpen(true)}
            sx={{ mb: 2 }}
          >
            Profili Düzenle
          </Button>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                {myVehicles.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Araç
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                {myBookings.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Kiralama
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                {vehicleRequests.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Talep
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* Contact Info */}
        <Card sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 2, color: '#ff6b35' }} />
            İletişim Bilgileri
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Email sx={{ color: '#ff6b35' }} />
              </ListItemIcon>
              <ListItemText 
                primary="E-posta" 
                secondary={userProfile.email}
                sx={{
                  '& .MuiListItemText-primary': { color: 'white' },
                  '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone sx={{ color: '#ff6b35' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Telefon" 
                secondary={userProfile.phone || 'Belirtilmemiş'}
                sx={{
                  '& .MuiListItemText-primary': { color: 'white' },
                  '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOn sx={{ color: '#ff6b35' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Adres" 
                secondary={formatAddress(userProfile.address)}
                sx={{
                  '& .MuiListItemText-primary': { color: 'white' },
                  '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CalendarToday sx={{ color: '#ff6b35' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Üyelik Tarihi" 
                secondary={new Date(userProfile.createdAt).toLocaleDateString('tr-TR')}
                sx={{
                  '& .MuiListItemText-primary': { color: 'white' },
                  '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </ListItem>
          </List>
        </Card>

        {/* Driving License */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Security sx={{ mr: 2, color: '#ff6b35' }} />
              Ehliyet Bilgileri
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setLicenseDialogOpen(true)}
              sx={{
                borderColor: '#ff6b35',
                color: '#ff6b35',
                '&:hover': {
                  borderColor: '#e55a2b',
                  bgcolor: 'rgba(255, 107, 53, 0.1)'
                }
              }}
            >
              {userProfile.drivingLicense ? 'Güncelle' : 'Ekle'}
            </Button>
          </Box>
          
          {userProfile.drivingLicense ? (
            <List>
              <ListItem>
                <ListItemIcon>
                  <Assignment sx={{ color: '#ff6b35' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Ehliyet No" 
                  secondary={userProfile.drivingLicense.licenseNumber}
                  sx={{
                    '& .MuiListItemText-primary': { color: 'white' },
                    '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarToday sx={{ color: '#ff6b35' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Geçerlilik" 
                  secondary={`${new Date(userProfile.drivingLicense.issueDate).toLocaleDateString('tr-TR')} - ${new Date(userProfile.drivingLicense.expiryDate).toLocaleDateString('tr-TR')}`}
                  sx={{
                    '& .MuiListItemText-primary': { color: 'white' },
                    '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WorkOutline sx={{ color: '#ff6b35' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Kategori" 
                  secondary={userProfile.drivingLicense.category}
                  sx={{
                    '& .MuiListItemText-primary': { color: 'white' },
                    '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
              </ListItem>
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Security sx={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                Ehliyet bilgileri eklenmemiş
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Araç kiralayabilmek için ehliyet bilgilerinizi eklemeniz gerekir
              </Typography>
            </Box>
          )}
        </Card>
      </Grid>
    </Grid>
  );

  const MyVehicles = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <DirectionsCar sx={{ mr: 2, color: '#ff6b35' }} />
          Araçlarım ({myVehicles.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/add-vehicle')}
        >
          Yeni Araç Ekle
        </Button>
      </Box>

      {myVehicles.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <DirectionsCar sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            Henüz araç eklememişsiniz
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
            İlk aracınızı ekleyerek ek gelir elde etmeye başlayın
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/add-vehicle')}
          >
            İlk Aracınızı Ekleyin
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {myVehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    vehicle.images && vehicle.images.length > 0
                      ? `http://localhost:5000${vehicle.images[0].url}`
                      : '/placeholder-car.jpg'
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                />
                
                <Chip
                  label={vehicle.availability ? 'Müsait' : 'Rezerve'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: vehicle.availability ? '#4caf50' : '#f44336',
                    color: 'white',
                  }}
                />

                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {vehicle.make} {vehicle.model}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {vehicle.year} • {vehicle.licensePlate}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
                      {vehicle.pricePerDay}₺/gün
                    </Typography>
                    <Rating
                      value={vehicle.rating || 0}
                      size="small"
                      readOnly
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#ff6b35',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          borderColor: '#ff6b35',
                          color: '#ff6b35',
                        }
                      }}
                    >
                      Detay
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          borderColor: '#ff6b35',
                          color: '#ff6b35',
                        }
                      }}
                    >
                      Düzenle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const MyBookings = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center' }}>
        <Schedule sx={{ mr: 2, color: '#ff6b35' }} />
        Kiralama Geçmişim ({myBookings.length})
      </Typography>

      {myBookings.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Schedule sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            Henüz kiralama yapılmamış
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
            Araç kiralayarak seyahatlerinize başlayın
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/vehicles')}
          >
            Araç Kirala
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {myBookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {booking.vehicle?.make} {booking.vehicle?.model}
                    </Typography>
                    <Chip
                      label={booking.status === 'confirmed' ? 'Onaylandı' : 
                             booking.status === 'pending' ? 'Bekliyor' : 'İptal'}
                      size="small"
                      sx={{
                        bgcolor: booking.status === 'confirmed' ? '#4caf50' : 
                                booking.status === 'pending' ? '#ff9800' : '#f44336',
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                  </Typography>

                  <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                    {booking.totalPrice}₺
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Araç Sahibi: {booking.vehicle?.owner?.firstName} {booking.vehicle?.owner?.lastName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const VehicleRequests = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, display: 'flex', alignItems: 'center' }}>
        <Assignment sx={{ mr: 2, color: '#ff6b35' }} />
        Araç Talepleri 
        {vehicleRequests.length > 0 && (
          <Badge badgeContent={vehicleRequests.length} color="primary" sx={{ ml: 2 }} />
        )}
      </Typography>

      {vehicleRequests.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Assignment sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            Yeni talep bulunmuyor
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Araçlarınız için gelen kiralama talepleri burada görünecek
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {vehicleRequests.map((request) => (
            <Grid item xs={12} md={6} key={request._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {request.vehicle?.make} {request.vehicle?.model}
                    </Typography>
                    <Chip
                      label="Bekliyor"
                      size="small"
                      sx={{
                        bgcolor: '#ff9800',
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {new Date(request.startDate).toLocaleDateString('tr-TR')} - {new Date(request.endDate).toLocaleDateString('tr-TR')}
                  </Typography>

                  <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                    {request.totalPrice}₺
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                    Kiralayan: {request.renter?.firstName} {request.renter?.lastName}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => handleBookingAction(request._id, 'approve')}
                      sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                    >
                      Onayla
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => handleBookingAction(request._id, 'reject')}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          bgcolor: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      Reddet
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1a1a1a',
        color: 'white',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, #ff6b35, #ff8a5b)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <Person sx={{ fontSize: '2.5rem', mr: 2, color: '#ff6b35' }} />
            Profilim
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Hesap bilgilerinizi yönetin ve aktivitelerinizi takip edin
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              bgcolor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff5252',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 'bold',
                '&.Mui-selected': {
                  color: '#ff6b35',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#ff6b35',
              },
            }}
          >
            <Tab 
              icon={<Person />} 
              label="Profil Bilgileri" 
              iconPosition="start"
            />
            <Tab 
              icon={<DirectionsCar />} 
              label="Araçlarım" 
              iconPosition="start"
            />
            <Tab 
              icon={<Schedule />} 
              label="Kiralama Geçmişi" 
              iconPosition="start"
            />
            <Tab 
              icon={
                <Badge badgeContent={vehicleRequests.length} color="primary">
                  <Assignment />
                </Badge>
              } 
              label="Araç Talepleri" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box>
          {currentTab === 0 && <ProfileInfo />}
          {currentTab === 1 && <MyVehicles />}
          {currentTab === 2 && <MyBookings />}
          {currentTab === 3 && <VehicleRequests />}
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Edit sx={{ mr: 2, color: '#ff6b35' }} />
            Profili Düzenle
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad"
                  value={editedProfile.firstName || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Soyad"
                  value={editedProfile.lastName || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={2}
                  value={typeof editedProfile.address === 'object' ? formatAddress(editedProfile.address) : (editedProfile.address || '')}
                  onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: 'white' }
              }}
            >
              İptal
            </Button>
            <Button onClick={handleProfileEdit} variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* License Dialog */}
        <Dialog 
          open={licenseDialogOpen} 
          onClose={() => setLicenseDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Security sx={{ mr: 2, color: '#ff6b35' }} />
            Ehliyet Bilgileri
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ehliyet Numarası"
                  value={licenseInfo.licenseNumber}
                  onChange={(e) => setLicenseInfo({...licenseInfo, licenseNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Verilme Tarihi"
                  type="date"
                  value={licenseInfo.issueDate?.split('T')[0] || ''}
                  onChange={(e) => setLicenseInfo({...licenseInfo, issueDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Geçerlilik Tarihi"
                  type="date"
                  value={licenseInfo.expiryDate?.split('T')[0] || ''}
                  onChange={(e) => setLicenseInfo({...licenseInfo, expiryDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={licenseInfo.category}
                    onChange={(e) => setLicenseInfo({...licenseInfo, category: e.target.value})}
                    label="Kategori"
                  >
                    <MenuItem value="A">A - Motosiklet</MenuItem>
                    <MenuItem value="B">B - Otomobil</MenuItem>
                    <MenuItem value="C">C - Kamyon</MenuItem>
                    <MenuItem value="D">D - Otobüs</MenuItem>
                    <MenuItem value="E">E - Çekici</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button 
              onClick={() => setLicenseDialogOpen(false)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: 'white' }
              }}
            >
              İptal
            </Button>
            <Button onClick={handleLicenseUpdate} variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
