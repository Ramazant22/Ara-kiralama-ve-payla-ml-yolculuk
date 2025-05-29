import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: '', type: 'error' });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      setAlert({
        show: true,
        message: 'Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz...',
        type: 'success'
      });

      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authStateChange'));

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/vehicles');
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Giriş işlemi sırasında bir hata oluştu';
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: 'rgba(255,255,255,0.2)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255,255,255,0.3)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ff6b35',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.7)',
    },
    '& .MuiOutlinedInput-input': {
      color: 'white',
    },
    '& .MuiFormHelperText-root': {
      color: '#ff6b35',
      marginLeft: 0,
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        {/* Logo ve Başlık */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#ff6b35',
              mx: 'auto',
              mb: 3,
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            TD
          </Avatar>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Hoş Geldiniz
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 1,
            }}
          >
            TakDrive hesabınıza giriş yapın
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '400px',
              mx: 'auto',
            }}
          >
            Binlerce araç seçeneği ve güvenli yolculuklar sizi bekliyor
          </Typography>
        </Box>

        {/* Alert */}
        {alert.show && (
          <Alert 
            severity={alert.type} 
            sx={{ 
              mb: 4,
              borderRadius: '12px',
              '& .MuiAlert-message': {
                color: alert.type === 'success' ? '#2e7d32' : '#d32f2f',
              }
            }}
            onClose={() => setAlert({ show: false, message: '', type: 'error' })}
          >
            {alert.message}
          </Alert>
        )}

        {/* Form */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            p: 4,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* E-posta */}
          <TextField
            fullWidth
            name="email"
            label="E-posta Adresi"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 3, ...textFieldStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Şifre */}
          <TextField
            fullWidth
            name="password"
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 4, ...textFieldStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#ff6b35',
              color: 'white',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              textTransform: 'none',
              mb: 3,
              '&:hover': {
                bgcolor: '#e55a2b',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 107, 53, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Giriş Yap →'
            )}
          </Button>

          {/* Şifremi Unuttum Link */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              sx={{
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'none',
                fontSize: '0.9rem',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#ff6b35',
                  textDecoration: 'underline',
                },
              }}
            >
              Şifremi Unuttum
            </Button>
          </Box>

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Henüz hesabınız yok mu?{' '}
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  color: '#ff6b35',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Kayıt Ol
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 