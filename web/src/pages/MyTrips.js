import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const MyTrips = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', py: 4 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}
        >
          Seyahatlerim
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Bu sayfa yakında hazır olacak...
        </Typography>
      </Container>
    </Box>
  );
};

export default MyTrips; 