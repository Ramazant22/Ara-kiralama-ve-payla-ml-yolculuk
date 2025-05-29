import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  DirectionsCar,
  Group,
  CalendarToday,
  Message as MessageIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (when login happens in same tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };

    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogin = () => {
    navigate('/login');
    handleMenuClose();
  };

  const handleRegister = () => {
    navigate('/register');
    handleMenuClose();
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    
    // Dispatch custom event for auth state change
    window.dispatchEvent(new Event('authStateChange'));
    
    navigate('/');
    handleMenuClose();
  };

  const menuItems = [
    { label: 'Araç Kiralama', path: '/vehicles', icon: <DirectionsCar /> },
    { label: 'Yolculuklar', path: '/rides', icon: <Group /> },
    { label: 'AI Asistanı', path: '/ai-chat', icon: <AIIcon /> },
    { label: 'Mesajlarım', path: '/messages', icon: <MessageIcon /> },
    { label: 'Rezervasyonlarım', path: '/bookings', icon: <CalendarToday /> },
  ];

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#2a2a2a',
          color: 'white',
          borderRadius: '12px',
          mt: 1,
        },
      }}
    >
      <MenuItem 
        onClick={() => { navigate('/profile'); handleMenuClose(); }}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
        }}
      >
        Profilim
      </MenuItem>
      <MenuItem 
        onClick={() => { navigate('/my-vehicles'); handleMenuClose(); }}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
        }}
      >
        Araçlarım
      </MenuItem>
      <MenuItem 
        onClick={() => { navigate('/add-vehicle'); handleMenuClose(); }}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
        }}
      >
        Araç Ekle
      </MenuItem>
      <MenuItem 
        onClick={() => { navigate('/create-ride'); handleMenuClose(); }}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
        }}
      >
        Yolculuk Oluştur
      </MenuItem>
      <MenuItem 
        onClick={() => { navigate('/ai-admin'); handleMenuClose(); }}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
        }}
      >
        AI Model Yönetici
      </MenuItem>
      <MenuItem 
        onClick={handleLogout}
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
          borderRadius: '8px',
          mx: 1,
          my: 0.5,
          color: '#ff6b35',
        }}
      >
        Çıkış Yap
      </MenuItem>
    </Menu>
  );

  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#2a2a2a',
          color: 'white',
          borderRadius: '12px',
          mt: 1,
        },
      }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.path}
          onClick={() => {
            navigate(item.path);
            handleMenuClose();
          }}
          sx={{ 
            '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
          }}
        >
          {item.icon}
          <Typography sx={{ ml: 1 }}>{item.label}</Typography>
        </MenuItem>
      ))}
      {isAuthenticated ? (
        [
          <MenuItem 
            key="profile" 
            onClick={() => { navigate('/profile'); handleMenuClose(); }}
            sx={{ 
              '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
            }}
          >
            <AccountCircle />
            <Typography sx={{ ml: 1 }}>Profilim</Typography>
          </MenuItem>,
          <MenuItem 
            key="logout" 
            onClick={handleLogout}
            sx={{ 
              '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
              color: '#ff6b35',
            }}
          >
            <Typography sx={{ ml: 1 }}>Çıkış Yap</Typography>
          </MenuItem>
        ]
      ) : (
        [
          <MenuItem 
            key="login" 
            onClick={handleLogin}
            sx={{ 
              '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
            }}
          >
            <Typography sx={{ ml: 1 }}>Giriş Yap</Typography>
          </MenuItem>,
          <MenuItem 
            key="register" 
            onClick={handleRegister}
            sx={{ 
              '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.1)' },
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
            }}
          >
            <Typography sx={{ ml: 1 }}>Kayıt Ol</Typography>
          </MenuItem>
        ]
      )}
    </Menu>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#1a1a1a',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}
    >
      <Toolbar>
        {/* Logo ve Başlık */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/')}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#ff6b35',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            TD
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            TakDrive
          </Typography>
        </Box>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ 
                mx: 1,
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  color: '#ff6b35',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Button>
          ))}

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  mr: 1,
                  display: { xs: 'none', lg: 'block' }
                }}
              >
                Hoş geldin, {user?.firstName || 'Kullanıcı'}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  },
                }}
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.firstName}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: '#ff6b35',
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.firstName?.charAt(0) || <AccountCircle />}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                onClick={handleLogin}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="contained"
                onClick={handleRegister}
                sx={{ 
                  ml: 1,
                  bgcolor: '#ff6b35',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#e55a2b',
                  },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                }}
              >
                Kayıt Ol
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls="mobile-menu"
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {profileMenu}
      {mobileMenu}
    </AppBar>
  );
};

export default Navbar; 