import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Fab,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Search,
  LocationOn,
  LocalGasStation,
  Settings,
  People,
  Add,
  FilterList,
  DirectionsCar,
  Euro,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    priceRange: '',
    transmission: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/vehicles');
      const vehiclesData = response.data.vehicles || response.data || [];
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Araçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      category: '',
      priceRange: '',
      transmission: '',
    });
    setSearchTerm('');
  };

  const handleVehicleClick = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleAddVehicle = () => {
    navigate('/add-vehicle');
  };

  const filteredVehicles = Array.isArray(vehicles) ? vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || vehicle.category === filters.category;
    const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;
    const matchesCity = !filters.city || vehicle.location?.city?.toLowerCase().includes(filters.city.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesTransmission && matchesCity;
  }) : [];

  const VehicleCard = ({ vehicle }) => (
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#2a2a2a',
        color: 'white',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
        }
      }}
      onClick={() => handleVehicleClick(vehicle._id)}
    >
      {/* Vehicle Image */}
      <CardMedia
        component="img"
        height="240"
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

      {/* Price Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: '#ff6b35',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
        }}
      >
        {vehicle.pricePerDay}₺/gün
      </Box>

      {/* Vehicle Category */}
      <Chip
        label={vehicle.category}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          textTransform: 'capitalize',
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Vehicle Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            color: 'white',
          }}
        >
          {vehicle.make} {vehicle.model}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
          }}
        >
          {vehicle.year} • {vehicle.licensePlate}
        </Typography>

        {/* Vehicle Features */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<People />}
            label={`${vehicle.seats} kişi`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          />
          <Chip
            icon={<LocalGasStation />}
            label={vehicle.fuelType}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          />
          <Chip
            icon={<Settings />}
            label={vehicle.transmission}
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          />
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: '#ff6b35', mr: 1, fontSize: '1.2rem' }} />
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {vehicle.location?.city}
          </Typography>
        </Box>

        {/* Owner Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={vehicle.owner?.avatar}
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#ff6b35',
            }}
          >
            {vehicle.owner?.firstName?.[0]}{vehicle.owner?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 'medium',
              }}
            >
              {vehicle.owner?.firstName} {vehicle.owner?.lastName}
            </Typography>
            <Rating
              value={vehicle.owner?.rating || 4.5}
              size="small"
              precision={0.1}
              readOnly
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#ff6b35',
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            handleVehicleClick(vehicle._id);
          }}
          sx={{ 
            bgcolor: '#ff6b35',
            py: 1.2,
            fontWeight: 'bold',
            '&:hover': { 
              bgcolor: '#e55a2b',
            },
          }}
        >
          Detayları Gör
        </Button>
      </CardActions>
    </Card>
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
            <DirectionsCar sx={{ fontSize: '2.5rem', mr: 2, color: '#ff6b35' }} />
            Araç Kiralama
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Binlerce araç seçeneği arasından size en uygun olanı bulun
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box
          sx={{
            backgroundColor: '#2a2a2a',
            borderRadius: '20px',
            p: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 4,
          }}
        >
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Araç modeli veya konum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#ff6b35' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Kategori"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="ekonomi">Ekonomi</MenuItem>
                  <MenuItem value="kompakt">Kompakt</MenuItem>
                  <MenuItem value="orta">Orta Sınıf</MenuItem>
                  <MenuItem value="büyük">Büyük</MenuItem>
                  <MenuItem value="lüks">Lüks</MenuItem>
                  <MenuItem value="suv">SUV</MenuItem>
                  <MenuItem value="minivan">Minivan</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Şanzıman</InputLabel>
                <Select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  label="Şanzıman"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="manuel">Manuel</MenuItem>
                  <MenuItem value="otomatik">Otomatik</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Şehir"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#ff6b35' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  height: '56px',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                  },
                }}
              >
                <FilterList sx={{ mr: 1 }} />
                Filtreleri Temizle
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {filteredVehicles.length} araç bulundu
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 1 }} />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              bgcolor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff5252',
              border: '1px solid rgba(211, 47, 47, 0.3)',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#ff6b35' }} />
          </Box>
        )}

        {/* Vehicle Grid */}
        {!loading && filteredVehicles.length > 0 && (
          <Grid container spacing={3}>
            {filteredVehicles.map((vehicle) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={vehicle._id}>
                <VehicleCard vehicle={vehicle} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && filteredVehicles.length === 0 && !error && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: '#2a2a2a',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <DirectionsCar
              sx={{
                fontSize: '4rem',
                color: 'rgba(255, 255, 255, 0.3)',
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 2,
              }}
            >
              Aradığınız kriterlere uygun araç bulunamadı
            </Typography>
            <Button 
              variant="contained"
              onClick={handleClearFilters}
              sx={{
                bgcolor: '#ff6b35',
                '&:hover': {
                  bgcolor: '#e55a2b',
                },
              }}
            >
              Filtreleri Temizle
            </Button>
          </Box>
        )}

        {/* Floating Add Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddVehicle}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#ff6b35',
            color: 'white',
            width: 64,
            height: 64,
            '&:hover': {
              bgcolor: '#e55a2b',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
          }}
        >
          <Add sx={{ fontSize: '2rem' }} />
        </Fab>
      </Container>
    </Box>
  );
};

export default Vehicles; 