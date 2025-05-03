import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './services/ThemeContext';

// Sayfalar
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Bileşenler
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/giris" element={<LoginPage />} />
              <Route path="/kayit" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/car-rental" element={<HomePage />} />
              <Route path="/ride-sharing" element={<HomePage />} />
              <Route path="/history" element={<HomePage />} />
              <Route path="/settings" element={<HomePage />} />
              <Route path="/help" element={<HomePage />} />
              <Route path="/forgot-password" element={<LoginPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
