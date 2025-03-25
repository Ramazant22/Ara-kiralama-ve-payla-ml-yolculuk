import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Bölümü */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Araç Kiralama ve Yolculuk Paylaşımında Yeni Nesil Çözüm</h1>
            <p className="hero-subtitle">İhtiyacınıza uygun aracı kiralayın veya yolculuğunuzu paylaşarak hem tasarruf edin hem de çevreye katkıda bulunun.</p>
            <div className="hero-buttons">
              <Link to="/arac-kiralama" className="btn btn-outline" style={{ marginRight: '15px', backgroundColor: 'white', color: 'var(--primary-color)' }}>Araç Kirala</Link>
              <Link to="/yolculuk" className="btn btn-outline" style={{ backgroundColor: 'white', color: 'var(--primary-color)' }}>Yolculuk Bul</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Bölümü */}
      <section className="features">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Neden TakDrive?</h2>
          <div className="feature-grid">
            <div className="feature-item card">
              <div className="feature-icon">🚗</div>
              <h3 className="feature-title">Geniş Araç Filosu</h3>
              <p>Ekonomikten lükse, her ihtiyaca uygun araçlarla hizmetinizdeyiz. 100+ araç modeliyle size en uygun seçeneği sunuyoruz.</p>
            </div>
            
            <div className="feature-item card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Güvenilir Yolculuklar</h3>
              <p>Doğrulanmış sürücü ve yolcularla güvenli yolculuklar yapın. Değerlendirme sistemiyle kaliteyi sürekli denetliyoruz.</p>
            </div>
            
            <div className="feature-item card">
              <div className="feature-icon">💸</div>
              <h3 className="feature-title">Ekonomik Seçenekler</h3>
              <p>Araç kiralama ve yolculuk paylaşımı ile ulaşım maliyetlerinizi düşürün. Rekabetçi fiyatlarla bütçenizi koruyun.</p>
            </div>
            
            <div className="feature-item card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Hızlı ve Kolay</h3>
              <p>Saniyeler içinde rezervasyon yapın, dakikalar içinde yola çıkın. Karmaşık süreçleri ortadan kaldırdık.</p>
            </div>
            
            <div className="feature-item card">
              <div className="feature-icon">🌱</div>
              <h3 className="feature-title">Çevre Dostu</h3>
              <p>Yolculuk paylaşımı ile karbon ayak izinizi azaltın. Daha az araç, daha temiz bir çevre için katkıda bulunun.</p>
            </div>
            
            <div className="feature-item card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">7/24 Destek</h3>
              <p>Her an yanınızdayız. Yol yardımı, teknik destek ve müşteri hizmetleri ile kesintisiz hizmet veriyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Bölümü */}
      <section className="features" style={{ backgroundColor: '#f0f7ff' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nasıl Çalışır?</h2>
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="feature-item">
              <div className="feature-icon">1️⃣</div>
              <h3 className="feature-title">Üye Olun</h3>
              <p>Basit kayıt formunu doldurun ve hemen TakDrive ailesine katılın.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">2️⃣</div>
              <h3 className="feature-title">Seçim Yapın</h3>
              <p>Araç kiralamak veya yolculuk paylaşmak istediğiniz ilanları inceleyin.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">3️⃣</div>
              <h3 className="feature-title">Yola Çıkın</h3>
              <p>Rezervasyonunuzu yapın ve özgürce yolculuğunuza başlayın.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/kayit" className="btn btn-primary">Hemen Başlayın</Link>
          </div>
        </div>
      </section>

      {/* Müşteri Yorumları */}
      <section className="features">
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Kullanıcılarımız Ne Diyor?</h2>
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"TakDrive ile İstanbul-Ankara arası yolculuklarımı artık çok daha ekonomik yapıyorum. Hem yeni insanlarla tanışıyor hem de masraflarımı yarıya indiriyorum."</p>
              <p style={{ fontWeight: 'bold' }}>- Ahmet Y.</p>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"Hafta sonu kaçamakları için araç kiralamak artık çok kolay. Uygun fiyatlı ve kaliteli araçlarla tatillerimiz daha keyifli geçiyor."</p>
              <p style={{ fontWeight: 'bold' }}>- Ayşe K.</p>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"Şirket olarak tüm araç kiralama işlemlerimizi TakDrive üzerinden yapıyoruz. Kurumsal hesap özelliği ve faturalama kolaylığı işimizi çok kolaylaştırıyor."</p>
              <p style={{ fontWeight: 'bold' }}>- Mehmet S. (ABC Şirketi)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobil Uygulama Bölümü */}
      <section className="features" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2>TakDrive Mobil Uygulaması ile Her Şey Elinizin Altında!</h2>
              <p style={{ marginBottom: '2rem' }}>Araç kiralama ve yolculuk paylaşımı artık cebinizde. Hemen indirin ve yola çıkın!</p>
              <div>
                <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary-color)', marginRight: '10px' }}>App Store'dan İndir</button>
                <button className="btn" style={{ backgroundColor: 'white', color: 'var(--primary-color)' }}>Google Play'den İndir</button>
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '300px', textAlign: 'center', marginTop: '2rem' }}>
              <div style={{ fontSize: '10rem' }}>📱</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 