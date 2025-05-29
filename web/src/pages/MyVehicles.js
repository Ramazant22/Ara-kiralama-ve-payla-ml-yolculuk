import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Button,
  Fab,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import {
  LocationOn,
  LocalGasStation,
  Settings,
  People,
  Add,
  DirectionsCar,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  DriveEta
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehicleId: null });
  const [menuAnchor, setMenuAnchor] = useState({ element: null, vehicleId: null });

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/vehicles/user/my-vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const vehiclesData = response.data.vehicles || response.data || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Araçlarınız yüklenirken bir hata oluştu.');
      }
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/vehicles/${deleteDialog.vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVehicles(vehicles.filter(v => v._id !== deleteDialog.vehicleId));
      setDeleteDialog({ open: false, vehicleId: null });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setError('Araç silinirken hata oluştu.');
    }
  };

  const handleMenuOpen = (event, vehicleId) => {
    setMenuAnchor({ element: event.currentTarget, vehicleId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, vehicleId: null });
  };

  const VehicleCard = ({ vehicle }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#2a2a2a',
        color: 'white'
      }}
    >
      {/* Vehicle Image */}
      <CardMedia
        component="img"
        height="200"
        image={
          vehicle.images && vehicle.images.length > 0
            ? `http://localhost:5000${vehicle.images[0].url}`
            : '/placeholder-car.jpg'
        }
        alt={`${vehicle.make} ${vehicle.model}`}
        sx={{
          objectFit: 'cover',
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a5b 100%)',
        }}
      />

      {/* Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: vehicle.status === 'available' ? '#4caf50' : '#f44336',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        {vehicle.status === 'available' ? 'Aktif' : 'Pasif'}
      </Box>

      {/* Menu Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' }
        }}
        onClick={(e) => handleMenuOpen(e, vehicle._id)}
      >
        <MoreVert />
      </IconButton>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Vehicle Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {vehicle.make} {vehicle.model}
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
          {vehicle.year} • {vehicle.licensePlate}
        </Typography>

        {/* Price Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#ff6b35', fontWeight: 'bold' }}>
            {vehicle.pricePerDay}₺/gün • {vehicle.pricePerHour}₺/saat
          </Typography>
        </Box>

        {/* Vehicle Details */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<People />}
            label={`${vehicle.seats} kişi`}
            size="small"
            sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: '#ff6b35' }}
          />
          <Chip
            icon={<LocalGasStation />}
            label={vehicle.fuelType}
            size="small"
            sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: '#ff6b35' }}
          />
          <Chip
            icon={<Settings />}
            label={vehicle.transmission}
            size="small"
            sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: '#ff6b35' }}
          />
        </Box>

        {vehicle.color && (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            Renk: {vehicle.color}
          </Typography>
        )}

        {/* Location */}
        {vehicle.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationOn sx={{ fontSize: '1rem', mr: 0.5, color: '#ff6b35' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {vehicle.location.city}
              {vehicle.location.district && `, ${vehicle.location.district}`}
            </Typography>
          </Box>
        )}

        {/* Usage Stats */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 107, 53, 0.1)', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#ff6b35', fontWeight: 'bold', mb: 0.5 }}>
            İstatistikler
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            • Toplam kiralama: {vehicle.totalBookings || 0}
          </Typography>
          <br />
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            • Ortalama puan: {vehicle.averageRating || 'Henüz puanlanmamış'}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => navigate(`/vehicles/${vehicle._id}`)}
          sx={{ 
            borderColor: '#ff6b35', 
            color: '#ff6b35',
            '&:hover': { 
              borderColor: '#e55a2b', 
              bgcolor: 'rgba(255, 107, 53, 0.1)' 
            }
          }}
        >
          Detayları Görüntüle
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress sx={{ color: '#ff6b35' }} />
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
            Araçlarım
          </Typography>
          
          <Fab 
            color="primary" 
            onClick={() => navigate('/add-vehicle')}
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

        {/* Content */}
        {vehicles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DirectionsCar sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Henüz araç eklememişsiniz
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}>
              Araç kiraya vermek için önce araç bilgilerinizi ekleyin
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => navigate('/add-vehicle')}
              sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
            >
              İlk Aracınızı Ekleyin
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {vehicles.map((vehicle) => (
              <Grid key={vehicle._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <VehicleCard vehicle={vehicle} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Vehicle Menu */}
        <Menu
          anchorEl={menuAnchor.element}
          open={Boolean(menuAnchor.element)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
        >
          <MenuItem 
            onClick={() => {
              navigate(`/vehicles/${menuAnchor.vehicleId}`);
              handleMenuClose();
            }}
          >
            <Visibility sx={{ mr: 1 }} />
            Detayları Görüntüle
          </MenuItem>
          <MenuItem 
            onClick={() => {
              navigate(`/vehicles/${menuAnchor.vehicleId}/edit`);
              handleMenuClose();
            }}
          >
            <Edit sx={{ mr: 1 }} />
            Düzenle
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setDeleteDialog({ open: true, vehicleId: menuAnchor.vehicleId });
              handleMenuClose();
            }}
            sx={{ color: '#f44336' }}
          >
            <Delete sx={{ mr: 1 }} />
            Sil
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={() => setDeleteDialog({ open: false, vehicleId: null })}
          PaperProps={{ sx: { bgcolor: '#2a2a2a', color: 'white' } }}
        >
          <DialogTitle>Araç Silme Onayı</DialogTitle>
          <DialogContent>
            <Typography>
              Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, vehicleId: null })}
            >
              İptal
            </Button>
            <Button 
              onClick={handleDeleteVehicle} 
              color="error"
              variant="contained"
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MyVehicles; 