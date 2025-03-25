import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
// import mockAuthService from '../services/mockAuthService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Giriş için gönderilen veri:', { email, password });
      
      // Gerçek API servisi kullanımı
      const response = await authService.login({ email, password });
      console.log('Giriş başarılı:', response);
      navigate('/'); // Başarılı girişten sonra ana sayfaya yönlendir
    } catch (err: any) {
      console.error('Giriş hatası (detaylı):', err);
      if (err.response) {
        console.error('Sunucu yanıtı:', err.response.data);
        console.error('Durum kodu:', err.response.status);
        setError(`Hata: ${err.response.status} - ${err.response.data?.message || 'Bilinmeyen hata'}`);
      } else if (err.request) {
        console.error('İstek yapıldı ancak yanıt yok:', err.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata mesajı:', err.message);
        setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <h1 style={{ fontSize: '1.75rem', textAlign: 'center' }}>Giriş Yap</h1>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Demo Giriş:</strong> Email: deneme56@gmail.com | Şifre: 89562374
            </div>
          </div>
          
          <div className="card-body">
            {error && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#f8d7da', 
                color: '#721c24',
                borderRadius: '4px', 
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">E-posta Adresi</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="ornek@email.com"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Şifre</label>
                <input 
                  type="password" 
                  id="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Şifreniz"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    style={{ marginRight: '8px' }}
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe">Beni hatırla</label>
                </div>
                <Link to="/sifremi-unuttum" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                  Şifremi Unuttum
                </Link>
              </div>
              
              <div className="form-group" style={{ marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
              </div>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p>veya sosyal medya ile giriş yap</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn" style={{ backgroundColor: '#3b5998', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>f</button>
                <button className="btn" style={{ backgroundColor: '#dd4b39', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>G</button>
                <button className="btn" style={{ backgroundColor: '#00acee', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>t</button>
              </div>
            </div>
          </div>
          
          <div className="card-footer" style={{ textAlign: 'center' }}>
            <p>Henüz üye değil misiniz? <Link to="/kayit" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Kayıt Ol</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 