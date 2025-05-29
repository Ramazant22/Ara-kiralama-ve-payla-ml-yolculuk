import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  Fab,
  Badge
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  CalendarToday,
  Person,
  Star,
  MoreVert,
  CheckCircle,
  Cancel,
  Pending,
  PlayArrow,
  Add,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: Tümü, 1: Kiralayan, 2: Araç Sahibi
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: '', tripId: null });
  const [ratingDialog, setRatingDialog] = useState({ open: false, tripId: null, score: 5, comment: '' });

  const statusLabels = {
    pending: { label: 'Onay Bekliyor', color: 'warning', icon: <Pending /> },
    confirmed: { label: 'Onaylandı', color: 'info', icon: <CheckCircle /> },
    active: { label: 'Devam Ediyor', color: 'success', icon: <PlayArrow /> },
    completed: { label: 'Tamamlandı', color: 'default', icon: <CheckCircle /> },
    cancelled: { label: 'İptal Edildi', color: 'error', icon: <Cancel /> },
    rejected: { label: 'Reddedildi', color: 'error', icon: <Cancel /> }
  };

  const tabLabels = ['Tüm Yolculuklar', 'Kiraladıklarım', 'Araç Sahipliğim'];

  useEffect(() => {
    fetchTrips();
  }, [tabValue, statusFilter]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let roleParam = 'all';
      if (tabValue === 1) roleParam = 'renter';
      if (tabValue === 2) roleParam = 'owner';

      const params = new URLSearchParams({
        role: roleParam,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await axios.get(`http://localhost:5000/api/trips?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Yolculuklar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tripId, newStatus, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/trips/${tripId}/status`, {
        status: newStatus,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActionDialog({ open: false, action: '', tripId: null });
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip status:', error);
      setError('Durum güncellenirken hata oluştu');
    }
  };

  const handleRating = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/trips/${ratingDialog.tripId}/rating`, {
        score: ratingDialog.score,
        comment: ratingDialog.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRatingDialog({ open: false, tripId: null, score: 5, comment: '' });
      fetchTrips();
    } catch (error) {
      console.error('Error adding rating:', error);
      setError('Değerlendirme eklenirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const isUserRenter = (trip, currentUserId) => {
    return trip.renter._id === currentUserId;
  };

  const getCurrentUserId = () => {
    // JWT token'dan user ID'sini çıkar (basit implementasyon)
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload._id || payload.id;
    } catch {
      return null;
    }
  };

  const getAvailableActions = (trip) => {
    const currentUserId = getCurrentUserId();
    const isRenter = isUserRenter(trip, currentUserId);
    const actions = [];

    switch (trip.status) {
      case 'pending':
        if (!isRenter) {
          actions.push({ action: 'confirmed', label: 'Onayla', color: 'success' });
          actions.push({ action: 'rejected', label: 'Reddet', color: 'error' });
        }
        actions.push({ action: 'cancelled', label: 'İptal Et', color: 'warning' });
        break;
      case 'confirmed':
        if (!isRenter) {
          actions.push({ action: 'active', label: 'Başlat', color: 'primary' });
        }
        actions.push({ action: 'cancelled', label: 'İptal Et', color: 'warning' });
        break;
      case 'active':
        if (!isRenter) {
          actions.push({ action: 'completed', label: 'Tamamla', color: 'success' });
        }
        break;
      case 'completed':
        const userRating = isRenter ? trip.rating.renterRating : trip.rating.ownerRating;
        if (!userRating.score) {
          actions.push({ action: 'rate', label: 'Değerlendir', color: 'primary' });
        }
        break;
      default:
        break;
    }

    return actions;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

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
            <DirectionsCar sx={{ fontSize: '2rem', mr: 2, color: '#ff6b35' }} />
            Yolculuklarım
          </Typography>
          
          <Fab 
            color="primary" 
            onClick={() => navigate('/vehicles')}
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
          >
            <Add />
          </Fab>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .Mui-selected': { color: '#ff6b35 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#ff6b35' }
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Status Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Tümü"
            onClick={() => setStatusFilter('all')}
            color={statusFilter === 'all' ? 'primary' : 'default'}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          />
          {Object.entries(statusLabels).map(([status, config]) => (
            <Chip
              key={status}
              label={config.label}
              onClick={() => setStatusFilter(status)}
              color={statusFilter === status ? 'primary' : 'default'}
              variant={statusFilter === status ? 'filled' : 'outlined'}
              icon={config.icon}
            />
          ))}
        </Box>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DirectionsCar sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Henüz yolculuğunuz bulunmuyor
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/vehicles')}
              sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
            >
              Araç Kirala
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {trips.map((trip) => {
              const currentUserId = getCurrentUserId();
              const isRenter = isUserRenter(trip, currentUserId);
              const otherUser = isRenter ? trip.owner : trip.renter;
              const statusConfig = statusLabels[trip.status];
              const actions = getAvailableActions(trip);

              return (
                <Grid item xs={12} md={6} lg={4} key={trip._id}>
                  <Card 
                    sx={{ 
                      bgcolor: '#2a2a2a', 
                      color: 'white',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Vehicle Image */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={trip.vehicle.images?.[0]?.url ? 
                        `http://localhost:5000${trip.vehicle.images[0].url}` : 
                        '/placeholder-car.jpg'
                      }
                      alt={`${trip.vehicle.make} ${trip.vehicle.model}`}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          icon={statusConfig.icon}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {isRenter ? 'Kiralayan' : 'Araç Sahibi'}
                        </Typography>
                      </Box>

                      {/* Vehicle Info */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {trip.vehicle.make} {trip.vehicle.model}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        {trip.vehicle.year} • {trip.vehicle.licensePlate}
                      </Typography>

                      {/* Other User */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={otherUser.avatar} 
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {otherUser.firstName} {otherUser.lastName}
                        </Typography>
                      </Box>

                      {/* Dates */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                          <Typography variant="body2">
                            {formatDate(trip.startDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                          <Typography variant="body2">
                            {formatDate(trip.endDate)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#ff6b35' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {trip.pickupLocation.address}
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 2 }}>
                        {formatCurrency(trip.pricing.totalAmount)}
                      </Typography>

                      {/* Rating */}
                      {trip.status === 'completed' && (
                        <Box sx={{ mb: 2 }}>
                          {isRenter && trip.rating.ownerRating.score && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ color: '#ffd700', mr: 1 }} />
                              <Rating value={trip.rating.ownerRating.score} readOnly size="small" />
                            </Box>
                          )}
                          {!isRenter && trip.rating.renterRating.score && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ color: '#ffd700', mr: 1 }} />
                              <Rating value={trip.rating.renterRating.score} readOnly size="small" />
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {actions.map((actionConfig) => (
                          <Button
                            key={actionConfig.action}
                            size="small"
                            variant="outlined"
                            color={actionConfig.color}
                            onClick={() => {
                              if (actionConfig.action === 'rate') {
                                setRatingDialog({ open: true, tripId: trip._id, score: 5, comment: '' });
                              } else {
                                setActionDialog({ open: true, action: actionConfig.action, tripId: trip._id });
                              }
                            }}
                          >
                            {actionConfig.label}
                          </Button>
                        ))}
                        
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate(`/trips/${trip._id}`)}
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
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

        {/* Action Confirmation Dialog */}
        <Dialog 
          open={actionDialog.open} 
          onClose={() => setActionDialog({ open: false, action: '', tripId: null })}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
        >
          <DialogTitle>İşlemi Onayla</DialogTitle>
          <DialogContent>
            <Typography>
              Bu yolculuğun durumunu "{statusLabels[actionDialog.action]?.label}" olarak değiştirmek istediğinizden emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, action: '', tripId: null })}>
              İptal
            </Button>
            <Button 
              onClick={() => handleStatusChange(actionDialog.tripId, actionDialog.action)}
              color="primary"
            >
              Onayla
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog 
          open={ratingDialog.open} 
          onClose={() => setRatingDialog({ open: false, tripId: null, score: 5, comment: '' })}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Yolculuğu Değerlendir</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Puanınız</Typography>
              <Rating
                value={ratingDialog.score}
                onChange={(event, newValue) => {
                  setRatingDialog(prev => ({ ...prev, score: newValue || 5 }));
                }}
                size="large"
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Yorumunuz (isteğe bağlı)"
              value={ratingDialog.comment}
              onChange={(e) => setRatingDialog(prev => ({ ...prev, comment: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialog({ open: false, tripId: null, score: 5, comment: '' })}>
              İptal
            </Button>
            <Button onClick={handleRating} color="primary">
              Değerlendir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Trips; 