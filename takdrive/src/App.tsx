import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Sayfalar
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Bileşenler
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            {/* Diğer sayfalar daha sonra eklenecek */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
