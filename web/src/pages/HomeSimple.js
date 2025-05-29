import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomeSimple = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#1a1a1a', color: 'white', minHeight: '100vh', p: 4 }}>
      <Typography variant="h1" sx={{ mb: 4 }}>
        TakDrive
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/vehicles')}
        startIcon={<DirectionsCar />}
        sx={{ bgcolor: '#ff6b35' }}
      >
        Test Button
      </Button>
    </Box>
  );
};

export default HomeSimple; 