import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import authService from '../services/authService';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../services/ThemeContext';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Auth servisinden kullanıcı bilgilerini al
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          console.log("Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor");
          window.location.href = '/giris';
          return;
        }
        
        setUser(currentUser);
      } catch (err) {
        setError('Kullanıcı bilgileri alınamadı');
        console.error('Profil bilgileri yüklenirken hata oluştu:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Giriş durumunu kontrol et ve kullanıcıyı yönlendir
    if (!authService.isLoggedIn()) {
      window.location.href = '/giris';
      return;
    }
    
    fetchUserData();
  }, []);

  if (isLoading) {
    return <Container><h2>Yükleniyor...</h2></Container>;
  }

  if (error) {
    return <Container><h2>{error}</h2></Container>;
  }

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <Container>
      <ProfileCard>
        <h1>Profil Bilgilerim</h1>
        
        <ProfileSection>
          <ProfileImage src={user?.profileImage || 'https://via.placeholder.com/150'} alt="Profil Resmi" />
          
          <ProfileInfo>
            <InfoRow>
              <Label>Ad:</Label>
              <Value>{user?.firstName || 'Belirtilmemiş'}</Value>
            </InfoRow>
            
            <InfoRow>
              <Label>Soyad:</Label>
              <Value>{user?.lastName || 'Belirtilmemiş'}</Value>
            </InfoRow>
            
            <InfoRow>
              <Label>E-posta:</Label>
              <Value>{user?.email || 'Belirtilmemiş'}</Value>
            </InfoRow>
            
            <InfoRow>
              <Label>Telefon:</Label>
              <Value>{user?.phone || 'Belirtilmemiş'}</Value>
            </InfoRow>
          </ProfileInfo>
        </ProfileSection>
        
        <ButtonContainer>
          <CustomButton 
            title="Profili Düzenle" 
            onClick={() => navigateTo('/profil-duzenle')} 
            type="primary" 
          />
          
          <CustomButton 
            title="Şifre Değiştir" 
            onClick={() => navigateTo('/sifre-degistir')} 
            type="secondary" 
          />
        </ButtonContainer>
        
        <AdditionalSections>
          <SectionTitle>Hizmet Geçmişim</SectionTitle>
          <CardLink onClick={() => navigateTo('/kiralama-gecmisi')}>
            <i className="fas fa-car"></i> Kiraladığım Araçlar
          </CardLink>
          
          <CardLink onClick={() => navigateTo('/yolculuk-gecmisi')}>
            <i className="fas fa-road"></i> Yolculuklarım
          </CardLink>
        </AdditionalSections>
      </ProfileCard>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const ProfileCard = styled.div`
  background-color: #121212;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
  
  h1 {
    color: #ffffff;
    margin-bottom: 24px;
    font-size: 28px;
    border-bottom: 2px solid #FF4500;
    padding-bottom: 10px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid #FF4500;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const ProfileInfo = styled.div`
  margin-left: 30px;
  flex: 1;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333333;
`;

const Label = styled.span`
  width: 120px;
  font-weight: 600;
  color: #999999;
`;

const Value = styled.span`
  flex: 1;
  color: #ffffff;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const AdditionalSections = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 20px;
`;

const CardLink = styled.div`
  background-color: #1E1E1E;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  
  &:hover {
    background-color: #FF4500;
    color: white;
    transform: translateY(-3px);
  }
  
  i {
    margin-right: 10px;
  }
`;

export default ProfilePage;