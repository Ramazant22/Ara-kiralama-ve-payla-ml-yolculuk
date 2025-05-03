import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-links">
          <div className="footer-column">
            <h3>TakDrive</h3>
            <Link to="/" className="footer-link">Ana Sayfa</Link>
            <Link to="/hakkimizda" className="footer-link">Hakkımızda</Link>
            <Link to="/iletisim" className="footer-link">İletişim</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
          </div>
          
          <div className="footer-column">
            <h3>Hizmetlerimiz</h3>
            <Link to="/arac-kiralama" className="footer-link">Araç Kiralama</Link>
            <Link to="/yolculuk" className="footer-link">Yolculuk Paylaşımı</Link>
            <Link to="/kurumsal" className="footer-link">Kurumsal Hizmetler</Link>
            <Link to="/suruculu-arac" className="footer-link">Şoförlü Araç</Link>
          </div>
          
          <div className="footer-column">
            <h3>Yardım</h3>
            <Link to="/nasil-calisir" className="footer-link">Nasıl Çalışır?</Link>
            <Link to="/sss" className="footer-link">Sık Sorulan Sorular</Link>
            <Link to="/gizlilik" className="footer-link">Gizlilik Politikası</Link>
            <Link to="/kullanim-kosullari" className="footer-link">Kullanım Koşulları</Link>
          </div>
          
          <div className="footer-column">
            <h3>İletişim</h3>
            <p className="footer-link">Email: info@takdrive.com</p>
            <p className="footer-link">Telefon: +90 555 123 45 67</p>
            <p className="footer-link">Adres: TakDrive Merkez, İstanbul, Türkiye</p>
          </div>
        </div>
        
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} TakDrive. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 