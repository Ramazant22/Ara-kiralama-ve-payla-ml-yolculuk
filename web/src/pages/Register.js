import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!/^(\+90|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
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
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: '2000-01-01', // Default date since it's required by backend
      });

      setAlert({
        show: true,
        message: 'Hesabınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...',
        type: 'success'
      });

      // Store token if needed
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authStateChange'));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu';
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
            Hesap Oluştur
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 1,
            }}
          >
            TakDrive ailesine katılın
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '400px',
              mx: 'auto',
            }}
          >
            Türkiye'nin en güvenilir araç paylaşım platformunda yerinizi alın
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
          {/* Ad */}
          <TextField
            fullWidth
            name="firstName"
            label="Ad"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            sx={{ mb: 3, ...textFieldStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'rgba(255,255,255,0.5)' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Soyad */}
          <TextField
            fullWidth
            name="lastName"
            label="Soyad"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            sx={{ mb: 3, ...textFieldStyles }}
          />

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

          {/* Telefon */}
          <TextField
            fullWidth
            name="phone"
            label="Telefon Numarası"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="0555 123 45 67"
            sx={{ mb: 3, ...textFieldStyles }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone sx={{ color: 'rgba(255,255,255,0.5)' }} />
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
            sx={{ mb: 3, ...textFieldStyles }}
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

          {/* Şifre Tekrar */}
          <TextField
            fullWidth
            name="confirmPassword"
            label="Şifre Tekrar"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              'Hesap Oluştur →'
            )}
          </Button>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Zaten hesabınız var mı?{' '}
              <Button
                onClick={() => navigate('/login')}
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
                Giriş Yap
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;