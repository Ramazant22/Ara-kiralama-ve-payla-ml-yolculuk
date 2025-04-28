import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Avatar from './Avatar';

const Header: React.FC = () => {
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/giris');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="nav-logo">TakDrive</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Ana Sayfa</Link>
            <Link to="/arac-kiralama" className="nav-link">Araç Kiralama</Link>
            <Link to="/yolculuk" className="nav-link">Yolculuk</Link>
            <Link to="/hakkimizda" className="nav-link">Hakkımızda</Link>
            <Link to="/iletisim" className="nav-link">İletişim</Link>
            
            {isLoggedIn ? (
              <div className="nav-dropdown">
                <span onClick={toggleMenu} className="nav-link nav-user">
                  <Avatar size={32} name={user?.firstName || "Kullanıcı"} style={{ marginRight: '8px' }} />
                  {user?.firstName} <i className={`fas fa-chevron-${isMenuOpen ? 'up' : 'down'}`}></i>
                </span>
                {isMenuOpen && (
                  <div className="nav-dropdown-content">
                    <Link to="/profil" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <i className="fas fa-user"></i> Profilim
                    </Link>
                    <Link to="/kiralama-gecmisi" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <i className="fas fa-car"></i> Kiralama Geçmişim
                    </Link>
                    <Link to="/yolculuk-gecmisi" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <i className="fas fa-road"></i> Yolculuklarım
                    </Link>
                    <Link to="/ayarlar" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <i className="fas fa-cog"></i> Ayarlar
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }} 
                      className="dropdown-item logout-btn"
                    >
                      <i className="fas fa-sign-out-alt"></i> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/giris" className="nav-link btn btn-outline">Giriş Yap</Link>
                <Link to="/kayit" className="nav-link btn btn-primary" style={{ marginLeft: '10px' }}>Kayıt Ol</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;