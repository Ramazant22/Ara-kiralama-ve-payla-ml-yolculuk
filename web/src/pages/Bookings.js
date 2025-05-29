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
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  EventNote,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  LocationOn,
  CalendarToday,
  Person,
  DirectionsCar,
  Euro,
  Phone,
  Message,
  Assignment,
  Payment,
  ThumbUp,
  ThumbDown,
  CarRental,
  AccessTime,
  Warning,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Bookings = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  
  // Vehicle bookings
  const [myBookings, setMyBookings] = useState([]);
  const [vehicleRequests, setVehicleRequests] = useState([]);
  
  // Ride bookings
  const [myRideBookings, setMyRideBookings] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Kullanıcının kiraladığı araçlar (Vehicle bookings)
      const myBookingsResponse = await axios.get('http://localhost:5000/api/bookings/my?type=renter', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kullanıcının araçlarına yapılan rezervasyonlar (Vehicle requests)
      const vehicleRequestsResponse = await axios.get('http://localhost:5000/api/bookings/my?type=owner', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kullanıcının katıldığı yolculuklar (Ride bookings as passenger)
      const myRideBookingsResponse = await axios.get('http://localhost:5000/api/ride-bookings/my?type=passenger', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kullanıcının yolculuklarına yapılan katılım talepleri (Ride requests as driver)
      const rideRequestsResponse = await axios.get('http://localhost:5000/api/ride-bookings/my?type=driver', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyBookings(myBookingsResponse.data.bookings || []);
      setVehicleRequests(vehicleRequestsResponse.data.bookings || []);
      setMyRideBookings(myRideBookingsResponse.data.bookings || []);
      setRideRequests(rideRequestsResponse.data.bookings || []);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Rezervasyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'awaiting_payment': return 'secondary';
      case 'payment_expired': return 'error';
      case 'ongoing': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'awaiting_payment': return 'Ödeme Bekliyor';
      case 'payment_expired': return 'Ödeme Süresi Doldu';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Rezervasyon onaylandı!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error approving booking:', error);
      alert(error.response?.data?.message || 'Rezervasyon onaylanırken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId, reason) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/reject`, 
        { reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Rezervasyon reddedildi!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert(error.response?.data?.message || 'Rezervasyon reddedilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Ödeme başarıyla tamamlandı!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Ödeme işlemi sırasında hata oluştu');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPickup = async (bookingId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/confirm-pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Araç teslim alımı onaylandı!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error confirming pickup:', error);
      alert(error.response?.data?.message || 'Teslim alım onayı sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const getRemainingTime = (expiryDate) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Süresi doldu';
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} dakika kaldı`;
  };

  // Ride booking handlers
  const handleApproveRideBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:5000/api/ride-bookings/${bookingId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Katılım talebi onaylandı!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error approving ride booking:', error);
      alert(error.response?.data?.message || 'Katılım talebi onaylanırken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRideBooking = async (bookingId, reason) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:5000/api/ride-bookings/${bookingId}/reject`, 
        { reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Katılım talebi reddedildi!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error rejecting ride booking:', error);
      alert(error.response?.data?.message || 'Katılım talebi reddedilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRidePayment = async (bookingId) => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/ride-bookings/${bookingId}/payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Yolculuk ödemesi başarıyla tamamlandı!');
      fetchBookingsData();
      setDetailDialogOpen(false);

    } catch (error) {
      console.error('Error processing ride payment:', error);
      alert(error.response?.data?.message || 'Yolculuk ödeme işlemi sırasında hata oluştu');
    } finally {
      setPaymentLoading(false);
    }
  };

  const BookingCard = ({ booking, isOwner = false }) => {
    const vehicle = booking.vehicle;
    const renter = booking.renter;
    const owner = vehicle?.owner;

    return (
      <Card sx={{ bgcolor: '#2a2a2a', mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <CardMedia
                component="img"
                height="120"
                image={
                  vehicle?.images?.length > 0 
                    ? `http://localhost:5000${vehicle.images[0].url}`
                    : '/placeholder-car.jpg'
                }
                alt={`${vehicle?.make} ${vehicle?.model}`}
                sx={{ borderRadius: 1, objectFit: 'cover' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                {vehicle?.make} {vehicle?.model} ({vehicle?.year})
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {booking.pickupLocation?.address}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {isOwner 
                    ? `Kiralayan: ${renter?.firstName} ${renter?.lastName}`
                    : `Araç Sahibi: ${owner?.firstName} ${owner?.lastName}`
                  }
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Euro sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  Toplam: {formatPrice(booking.pricing?.total || 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
                <Chip 
                  label={getStatusText(booking.status)}
                  color={getStatusColor(booking.status)}
                  sx={{ mb: 2 }}
                />

                {/* Ödeme süresi sayacı */}
                {booking.status === 'awaiting_payment' && booking.paymentDetails?.paymentExpiryDate && (
                  <Box sx={{ mb: 2, textAlign: 'right' }}>
                    <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                      {getRemainingTime(booking.paymentDetails.paymentExpiryDate)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.max(0, Math.min(100, (15 - (new Date() - new Date(booking.paymentDetails.paymentExpiryDate)) / (1000 * 60)) / 15 * 100))}
                      sx={{ mt: 0.5, height: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Kiralayan için butonlar */}
                  {!isOwner && (
                    <>
                      {booking.status === 'awaiting_payment' && (
                        <Button
                          variant="contained"
                          startIcon={<Payment />}
                          onClick={() => {
                            console.log('Payment button clicked for booking:', booking._id);
                            handlePayment(booking._id);
                          }}
                          disabled={paymentLoading}
                          sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                        >
                          {paymentLoading ? 'İşleniyor...' : 'Ödeme Yap'}
                        </Button>
                      )}
                      
                      {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                        <Button
                          variant="contained"
                          startIcon={<CarRental />}
                          onClick={() => {
                            console.log('Pickup button clicked for booking:', booking._id);
                            handleConfirmPickup(booking._id);
                          }}
                          disabled={actionLoading}
                          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                        >
                          {actionLoading ? 'İşleniyor...' : 'Aracı Teslim Aldım'}
                        </Button>
                      )}

                      {/* Debug: Show booking status */}
                      {process.env.NODE_ENV === 'development' && (
                        <Typography variant="caption" sx={{ color: 'yellow', fontSize: '0.7rem' }}>
                          Status: {booking.status} | Payment: {booking.paymentStatus}
                        </Typography>
                      )}
                    </>
                  )}

                  {/* Araç sahibi için butonlar */}
                  {isOwner && booking.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<ThumbUp />}
                        onClick={() => handleApproveBooking(booking._id)}
                        disabled={actionLoading}
                        sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ThumbDown />}
                        onClick={() => handleRejectBooking(booking._id, 'Araç sahibi tarafından reddedildi')}
                        disabled={actionLoading}
                        sx={{ borderColor: '#f44336', color: '#f44336', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' } }}
                      >
                        Reddet
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDetailDialogOpen(true);
                    }}
                    sx={{ borderColor: '#ff6b35', color: '#ff6b35', '&:hover': { bgcolor: 'rgba(255, 107, 53, 0.1)' } }}
                  >
                    Detaylar
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const RideBookingCard = ({ booking, isDriver = false }) => {
    const ride = booking.ride;
    const passenger = booking.passenger;
    const driver = ride?.driver;

    return (
      <Card sx={{ bgcolor: '#2a2a2a', mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ 
                height: 120, 
                bgcolor: '#3a3a3a', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <Group sx={{ fontSize: '3rem', color: '#ff6b35', mb: 1 }} />
                <Typography variant="caption" sx={{ color: '#bbb' }}>
                  Yolculuk
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                {ride?.from?.city} → {ride?.to?.city}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(ride?.departureDate)} - {ride?.departureTime}
                </Typography>
              </Box>

              {booking.pickupPoint?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                  <Typography variant="body2" color="text.secondary">
                    Binme: {booking.pickupPoint.address}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {isDriver 
                    ? `Yolcu: ${passenger?.firstName} ${passenger?.lastName}`
                    : `Sürücü: ${driver?.firstName} ${driver?.lastName}`
                  }
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Euro sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                <Typography variant="body2" color="text.secondary">
                  {booking.seatsRequested} koltuk - Toplam: {formatPrice(booking.paymentDetails?.amount || 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
                <Chip 
                  label={getStatusText(booking.status)}
                  color={getStatusColor(booking.status)}
                  sx={{ mb: 2 }}
                />

                {/* Ödeme süresi sayacı */}
                {booking.status === 'awaiting_payment' && booking.paymentDetails?.paymentExpiryDate && (
                  <Box sx={{ mb: 2, textAlign: 'right' }}>
                    <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                      {getRemainingTime(booking.paymentDetails.paymentExpiryDate)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.max(0, Math.min(100, (15 - (new Date() - new Date(booking.paymentDetails.paymentExpiryDate)) / (1000 * 60)) / 15 * 100))}
                      sx={{ mt: 0.5, height: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Yolcu için butonlar */}
                  {!isDriver && (
                    <>
                      {booking.status === 'awaiting_payment' && (
                        <Button
                          variant="contained"
                          startIcon={<Payment />}
                          onClick={() => handleRidePayment(booking._id)}
                          disabled={paymentLoading}
                          sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
                        >
                          {paymentLoading ? 'İşleniyor...' : 'Ödeme Yap'}
                        </Button>
                      )}
                    </>
                  )}

                  {/* Sürücü için butonlar */}
                  {isDriver && booking.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<ThumbUp />}
                        onClick={() => handleApproveRideBooking(booking._id)}
                        disabled={actionLoading}
                        sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ThumbDown />}
                        onClick={() => handleRejectRideBooking(booking._id, 'Sürücü tarafından reddedildi')}
                        disabled={actionLoading}
                        sx={{ borderColor: '#f44336', color: '#f44336', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' } }}
                      >
                        Reddet
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDetailDialogOpen(true);
                    }}
                  >
                    Detaylar
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#ff6b35' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ color: 'white', mb: 4, fontWeight: 'bold' }}>
          Rezervasyonlarım
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ bgcolor: '#2a2a2a' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': { color: '#ff6b35' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
            }}
          >
            <Tab 
              icon={<CarRental />} 
              label={`Kiraladıklarım (${myBookings.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<Assignment />} 
              label={`Araç Taleplerim (${vehicleRequests.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<Group />} 
              label={`Katıldığım Yolculuklar (${myRideBookings.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<DirectionsCar />} 
              label={`Yolculuk Taleplerim (${rideRequests.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {currentTab === 0 && (
            <Box>
              {myBookings.length === 0 ? (
                <Paper sx={{ bgcolor: '#2a2a2a', p: 4, textAlign: 'center' }}>
                  <EventNote sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Henüz hiç araç kiralamanız yok
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/vehicles')}
                    sx={{ bgcolor: '#ff6b35' }}
                  >
                    Araç Kirala
                  </Button>
                </Paper>
              ) : (
                myBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isOwner={false} />
                ))
              )}
            </Box>
          )}

          {currentTab === 1 && (
            <Box>
              {vehicleRequests.length === 0 ? (
                <Paper sx={{ bgcolor: '#2a2a2a', p: 4, textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Araçlarınız için henüz kiralama talebi yok
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/add-vehicle')}
                    sx={{ bgcolor: '#ff6b35' }}
                  >
                    Araç Ekle
                  </Button>
                </Paper>
              ) : (
                vehicleRequests.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} isOwner={true} />
                ))
              )}
            </Box>
          )}

          {currentTab === 2 && (
            <Box>
              {myRideBookings.length === 0 ? (
                <Paper sx={{ bgcolor: '#2a2a2a', p: 4, textAlign: 'center' }}>
                  <Group sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Henüz hiç yolculuk katılmıyorsunuz
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/rides')}
                    sx={{ bgcolor: '#ff6b35' }}
                  >
                    Yolculuk Katıl
                  </Button>
                </Paper>
              ) : (
                myRideBookings.map((booking) => (
                  <RideBookingCard key={booking._id} booking={booking} isDriver={false} />
                ))
              )}
            </Box>
          )}

          {currentTab === 3 && (
            <Box>
              {rideRequests.length === 0 ? (
                <Paper sx={{ bgcolor: '#2a2a2a', p: 4, textAlign: 'center' }}>
                  <DirectionsCar sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Yolculuklarınız için henüz katılım talebi yok
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/create-ride')}
                    sx={{ bgcolor: '#ff6b35' }}
                  >
                    Yolculuk Oluştur
                  </Button>
                </Paper>
              ) : (
                rideRequests.map((booking) => (
                  <RideBookingCard key={booking._id} booking={booking} isDriver={true} />
                ))
              )}
            </Box>
          )}
        </Box>

        {/* Booking Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{ '& .MuiDialog-paper': { bgcolor: '#2a2a2a', color: 'white' } }}
        >
          <DialogTitle>
            Rezervasyon Detayları
          </DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Başlangıç:</Typography>
                    <Typography>{formatDate(selectedBooking.startDate)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Bitiş:</Typography>
                    <Typography>{formatDate(selectedBooking.endDate)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">Teslim Alma Adresi:</Typography>
                    <Typography>{selectedBooking.pickupLocation?.address}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">Toplam Tutar:</Typography>
                    <Typography variant="h6" sx={{ color: '#ff6b35' }}>
                      {formatPrice(selectedBooking.pricing?.total || 0)}
                    </Typography>
                  </Grid>
                  {selectedBooking.notes?.renter && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Notlar:</Typography>
                      <Typography>{selectedBooking.notes.renter}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Bookings; 