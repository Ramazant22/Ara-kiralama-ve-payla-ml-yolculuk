import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import AddVehicle from './pages/AddVehicle';
import MyVehicles from './pages/MyVehicles';
import Rides from './pages/Rides';
import CreateRide from './pages/CreateRide';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import ConversationDetail from './pages/ConversationDetail';
import AIChat from './pages/AIChat';
import AIModelAdmin from './pages/AIModelAdmin';

// Create a client
const queryClient = new QueryClient();

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35',
      light: '#ff8a5b',
      dark: '#e55a2b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(255, 107, 53, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6b35',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            borderColor: 'rgba(255, 107, 53, 0.3)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#1a1a1a' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/:id" element={<VehicleDetail />} />
                  <Route path="/add-vehicle" element={<AddVehicle />} />
                  <Route path="/my-vehicles" element={<MyVehicles />} />
                  <Route path="/rides" element={<Rides />} />
                  <Route path="/create-ride" element={<CreateRide />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:conversationId" element={<ConversationDetail />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/ai-admin" element={<AIModelAdmin />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
