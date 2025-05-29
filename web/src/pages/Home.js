import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  DirectionsCar,
  Chat,
  Person,
  TrendingUp,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const stats = [
    { number: '50K+', label: 'Aktif Kullanıcı', icon: <Person /> },
    { number: '15K+', label: 'Kayıtlı Araç', icon: <DirectionsCar /> },
    { number: '100K+', label: 'Tamamlanan Yolculuk', icon: <TrendingUp /> },
    { number: '4.8★', label: 'Ortalama Puan', icon: <Star /> },
  ];

  return (
    <Box sx={{ bgcolor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#ff6b35',
              mx: 'auto',
              mb: 4,
              fontSize: '2.5rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
            }}
          >
            TD
          </Avatar>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 'bold',
              mb: 2,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(45deg, #ff6b35, #ff8a65)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TakDrive
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              letterSpacing: '-0.02em',
            }}
          >
            Akıllı Araç Paylaşım Platformu
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Türkiye'nin en güvenilir araç paylaşım platformu
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            AI destekli asistan ile ekonomik, güvenli ve çevre dostu seyahat deneyimi
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6, flexWrap: 'wrap', gap: 1 }}>
            <Chip label="🔒 %100 Güvenli" sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: 'white' }} />
            <Chip label="💰 %70 Tasarruf" sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: 'white' }} />
            <Chip label="🌱 Çevre Dostu" sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: 'white' }} />
            <Chip label="🤖 AI Asistan" sx={{ bgcolor: 'rgba(255, 107, 53, 0.2)', color: 'white' }} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/vehicles')}
              startIcon={<DirectionsCar />}
              sx={{
                bgcolor: '#ff6b35',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '16px',
                textTransform: 'none',
                minWidth: '220px',
                boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
                '&:hover': {
                  bgcolor: '#e55a2b',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 48px rgba(255, 107, 53, 0.6)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Hemen Başla
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/ai-chat')}
              startIcon={<Chat />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '16px',
                textTransform: 'none',
                minWidth: '220px',
                '&:hover': {
                  borderColor: '#ff6b35',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  transform: 'translateY(-4px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              AI Asistan
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* İstatistikler */}
      <Box sx={{ py: 8, bgcolor: '#2d2d2d' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 6,
              color: '#ff6b35',
            }}
          >
            Rakamlarla TakDrive
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#1a1a1a',
                    border: '1px solid rgba(255, 107, 53, 0.2)',
                    borderRadius: '16px',
                    height: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                      border: '1px solid rgba(255, 107, 53, 0.5)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ color: '#ff6b35', mb: 2, fontSize: '2rem' }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: '500',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* AI Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate('/ai-chat')}
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#ff6b35',
            color: 'white',
            fontSize: '1.5rem',
            minWidth: 'auto',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
            '&:hover': {
              bgcolor: '#e55a2b',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 48px rgba(255, 107, 53, 0.6)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          🤖
        </Button>
      </Box>
    </Box>
  );
};

export default Home; 