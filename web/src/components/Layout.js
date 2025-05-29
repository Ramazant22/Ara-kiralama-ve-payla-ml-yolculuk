import React from 'react';
import { Box, Container } from '@mui/material';

const Layout = ({ children, maxWidth = 'lg', noPadding = false }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1a1a1a',
        color: 'white',
        py: noPadding ? 0 : 4,
      }}
    >
      <Container maxWidth={maxWidth} sx={{ py: noPadding ? 0 : 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 