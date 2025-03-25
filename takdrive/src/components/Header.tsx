import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
// import mockAuthService from '../services/mockAuthService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/giris');
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
              <>
                <span className="nav-link">Merhaba, {user?.firstName}</span>
                <button onClick={handleLogout} className="nav-link btn btn-outline">Çıkış Yap</button>
              </>
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