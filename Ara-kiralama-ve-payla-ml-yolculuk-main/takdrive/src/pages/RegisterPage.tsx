import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
// import mockAuthService from '../services/mockAuthService';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }
    
    // En az 8 karakter kontrolü
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      setLoading(false);
      return;
    }
    
    try {
      // Kayıt için gerekli verileri hazırlama (confirmPassword ve agreeTerms hariç)
      const { confirmPassword, agreeTerms, ...registerData } = formData;
      
      console.log('Kayıt için gönderilen veri:', registerData);
      const response = await authService.register(registerData);
      console.log('Kayıt başarılı:', response);
      
      // Kayıt başarılı, giriş sayfasına yönlendir
      navigate('/giris');
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      if (err.response) {
        console.error('Sunucu yanıtı:', err.response.data);
        console.error('Durum kodu:', err.response.status);
        setError(`Hata: ${err.response.status} - ${err.response.data?.message || 'Bilinmeyen hata'}`);
      } else if (err.request) {
        console.error('İstek yapıldı ancak yanıt yok:', err.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata mesajı:', err.message);
        setError(err.message || 'Kayıt olurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <h1 style={{ fontSize: '1.75rem', textAlign: 'center' }}>Hesap Oluştur</h1>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Not:</strong> Kayıt olduktan sonra giriş sayfasına yönlendirileceksiniz.
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">Ad</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName"
                    className="form-control" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                    placeholder="Adınız"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Soyad</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName"
                    className="form-control" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    placeholder="Soyadınız"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">E-posta Adresi</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="form-control" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="ornek@email.com"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">Telefon Numarası</label>
                <input 
                  type="tel" 
                  id="phoneNumber" 
                  name="phoneNumber"
                  className="form-control" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  required 
                  placeholder="05XX XXX XX XX"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Şifre</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  className="form-control" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="En az 8 karakter"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  className="form-control" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  placeholder="Şifrenizi tekrar girin"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="agreeTerms" 
                    name="agreeTerms"
                    checked={formData.agreeTerms} 
                    onChange={handleChange} 
                    required
                    style={{ marginRight: '8px' }}
                    disabled={loading}
                  />
                  <label htmlFor="agreeTerms">
                    <Link to="/kullanim-kosullari" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      Kullanım Koşulları
                    </Link>
                    'nı ve 
                    <Link to="/gizlilik" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      Gizlilik Politikası
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </label>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                </button>
              </div>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p>veya sosyal medya ile kayıt ol</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn" style={{ backgroundColor: '#3b5998', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>f</button>
                <button className="btn" style={{ backgroundColor: '#dd4b39', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>G</button>
                <button className="btn" style={{ backgroundColor: '#00acee', color: 'white', width: '50px', height: '50px', borderRadius: '50%', padding: '0' }} disabled={loading}>t</button>
              </div>
            </div>
          </div>
          
          <div className="card-footer" style={{ textAlign: 'center' }}>
            <p>Zaten bir hesabınız var mı? <Link to="/giris" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Giriş Yap</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 