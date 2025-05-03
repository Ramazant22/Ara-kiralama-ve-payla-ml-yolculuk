import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import ServiceCard from '../components/ServiceCard';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.background || '#000000'};
`;

const MainContent = styled.main`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Hero Slider Bileşenleri
const HeroSliderContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  background-color: ${props => props.theme.card || '#1A1A1A'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const SliderWrapper = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  height: 300px;
`;

const Slide = styled.div<{ bg: string }>`
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background-color: ${props => props.bg};
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SlideBackgroundImage = styled.div<{ imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  z-index: -1;
`;

const SlideContent = styled.div`
  flex: 1;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const SlideTitle = styled.h1`
  font-size: 32px;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  margin-bottom: 12px;
`;

const SlideText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.text?.secondary || '#CCCCCC'};
  margin-bottom: 16px;
  max-width: 500px;
`;

const SlideImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 300px;
  z-index: 2;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SlideIcon = styled.i`
  font-size: 200px;
  color: ${props => props.theme.primary || '#FFFFFF'};
  opacity: 0.8;
`;

const SlideImage2 = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
`;

const SliderDots = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? props.theme.primary : 'rgba(255, 255, 255, 0.3)'};
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const SliderArrow = styled.div<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 16px;' : 'right: 16px;'}
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  margin-bottom: 16px;
  margin-top: 24px;
`;

const ServicesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 8px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.divider || '#2C2C2C'};
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

// Custom ServiceItem component
const ServiceItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.primary || '#FFFFFF'};
  border-radius: 12px;
  padding: 24px 16px;
  margin: 0;
  min-width: 140px;
  flex-shrink: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const IconElement = styled.i`
  font-size: 32px;
  color: ${props => props.theme.text?.inverse || '#000000'};
`;

const ServiceTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.text?.inverse || '#000000'};
  text-align: center;
  margin: 0;
`;

const TripsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TripCard = styled(Card)`
  padding: 0;
`;

const TripHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.divider || '#2C2C2C'};
`;

const TripTitle = styled.h3`
  font-size: 18px;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  margin: 0 0 8px 0;
`;

const TripInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const TripInfoText = styled.span`
  color: ${props => props.theme.text?.secondary || '#CCCCCC'};
  font-size: 14px;
`;

const TripBody = styled.div`
  padding: 16px;
`;

const TripDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TripDetailColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const TripDetailLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme.text?.secondary || '#CCCCCC'};
  margin-bottom: 4px;
`;

const TripDetailValue = styled.span`
  font-size: 16px;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  font-weight: 500;
`;

const TripStatus = styled.span<{ status: string }>`
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return props.theme.success + '20';
      case 'upcoming':
        return props.theme.primary + '20';
      case 'cancelled':
        return props.theme.danger + '20';
      default:
        return props.theme.accent + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return props.theme.success;
      case 'upcoming':
        return props.theme.primary;
      case 'cancelled':
        return props.theme.danger;
      default:
        return props.theme.accent;
    }
  }};
`;

const VehicleCardContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 8px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.divider || '#2C2C2C'};
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const VehicleCard = styled.div`
  position: relative;
  min-width: 280px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const VehicleImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VehicleOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const VehicleTitle = styled.h3`
  font-size: 18px;
  color: white;
  margin: 0 0 4px 0;
`;

const VehicleInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VehicleLocation = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const VehiclePrice = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: ${props => props.theme.primary || '#FF7700'};
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 2;
  display: inline-block;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Hero slider içeriği
  const heroSlides = [
    {
      title: "TakDrive ile Yolculuğa Çıkın",
      text: "Uygun fiyatlı araç kiralama ve yolculuk paylaşım hizmetlerimizle istediğiniz yere kolayca ulaşın.",
      icon: "directions_car",
      color: theme.card || "#1A1A1A",
      buttonText: "Araç Kirala",
      buttonLink: "/car-rental",
      backgroundImage: "https://images.pexels.com/photos/4064432/pexels-photo-4064432.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
      title: "Yolculuğunuzu Paylaşın",
      text: "Hem çevreye duyarlı olun hem de maliyetleri düşürün. Yolculuk paylaşımı ile aynı yöne giden kişilerle buluşun.",
      icon: "transfer_within_a_station",
      color: "#2C3E50",
      buttonText: "Yolculuk Paylaş",
      buttonLink: "/ride-sharing",
      backgroundImage: "https://images.pexels.com/photos/5834429/pexels-photo-5834429.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
      title: "Aracınızı Kiraya Verin",
      text: "Kullanmadığınız zamanlar için aracınızdan ek gelir elde edin. Güvenli ve kolay araç kiralama hizmeti.",
      icon: "local_taxi",
      color: "#34495E",
      buttonText: "Araç Ekle",
      buttonLink: "/rent-your-car",
      backgroundImage: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1260"
    }
  ];

  // Otomatik slider değişimi için
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const [services] = useState([
    { id: 1, icon: 'directions_car', title: 'Araç Kirala', to: '/car-rental' },
    { id: 2, icon: 'transfer_within_a_station', title: 'Yolculuk Paylaş', to: '/ride-sharing' },
    { id: 3, icon: 'local_taxi', title: 'Aracını Kiraya Ver', to: '/rent-your-car' },
    { id: 4, icon: 'history', title: 'Yolculuk Geçmişi', to: '/history' },
    { id: 5, icon: 'person', title: 'Profilim', to: '/profile' },
    { id: 6, icon: 'settings', title: 'Ayarlar', to: '/settings' },
    { id: 7, icon: 'help', title: 'Yardım', to: '/help' },
  ]);
  
  const [userTrips] = useState([
    {
      id: 1,
      title: 'İstanbul - Ankara',
      date: '15 Haziran 2023',
      time: '09:00',
      driver: 'Ahmet Y.',
      price: '350₺',
      status: 'completed',
      icon: 'directions_car'
    },
    {
      id: 2,
      title: 'İzmir - Antalya',
      date: '22 Haziran 2023',
      time: '14:30',
      driver: 'Mehmet K.',
      price: '280₺',
      status: 'upcoming',
      icon: 'transfer_within_a_station'
    },
    {
      id: 3,
      title: 'Bursa - Eskişehir',
      date: '10 Haziran 2023',
      time: '11:15',
      driver: 'Ayşe T.',
      price: '200₺',
      status: 'cancelled',
      icon: 'directions_car'
    }
  ]);

  const [featuredRides] = useState([
    {
      id: 1,
      title: 'Ankara - İzmir',
      date: '25 Haziran 2023',
      time: '08:30',
      driver: 'Kemal S.',
      price: '320₺',
      status: 'upcoming',
      icon: 'directions_car'
    },
    {
      id: 2,
      title: 'İstanbul - Bodrum',
      date: '30 Haziran 2023',
      time: '07:00',
      driver: 'Zeynep A.',
      price: '400₺',
      status: 'upcoming',
      icon: 'directions_car'
    },
    {
      id: 3,
      title: 'Antalya - Adana',
      date: '28 Haziran 2023',
      time: '10:15',
      driver: 'Murat B.',
      price: '270₺',
      status: 'upcoming',
      icon: 'directions_car'
    }
  ]);

  const [featuredVehicles] = useState([
    {
      id: 1,
      title: 'BMW 3 Serisi',
      location: 'İstanbul, Kadıköy',
      price: '850₺/gün',
      imageUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 2,
      title: 'Mercedes C Serisi',
      location: 'İstanbul, Beşiktaş',
      price: '950₺/gün',
      imageUrl: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 3,
      title: 'Audi A4',
      location: 'İstanbul, Şişli',
      price: '900₺/gün',
      imageUrl: 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 4,
      title: 'Volvo XC90',
      location: 'Ankara, Çankaya',
      price: '1200₺/gün',
      imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ]);
  
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'upcoming':
        return 'Yaklaşan';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };
  
  return (
    <PageContainer>
      <MainContent>
        {/* Hero Slider */}
        <HeroSliderContainer>
          <SliderWrapper style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
            {heroSlides.map((slide, index) => (
              <Slide key={index} bg={slide.color}>
                <SlideBackgroundImage imageUrl={slide.backgroundImage} />
                <SlideContent>
                  <SlideTitle>{slide.title}</SlideTitle>
                  <SlideText>{slide.text}</SlideText>
                  <CustomButton
                    title={slide.buttonText}
                    onClick={() => {}}
                    color={theme.primary}
                  />
                </SlideContent>
                <SlideImage>
                  <SlideIcon className="material-icons">{slide.icon}</SlideIcon>
                </SlideImage>
              </Slide>
            ))}
          </SliderWrapper>
          
          <SliderArrow direction="left" onClick={prevSlide}>
            <i className="material-icons" style={{ color: 'white' }}>chevron_left</i>
          </SliderArrow>
          
          <SliderArrow direction="right" onClick={nextSlide}>
            <i className="material-icons" style={{ color: 'white' }}>chevron_right</i>
          </SliderArrow>
          
          <SliderDots>
            {heroSlides.map((_, index) => (
              <Dot 
                key={index} 
                active={index === activeSlide} 
                onClick={() => goToSlide(index)}
              />
            ))}
          </SliderDots>
        </HeroSliderContainer>
        
        <SectionTitle>Hizmetlerimiz</SectionTitle>
        <ServicesContainer>
          {services.map(service => (
            <ServiceItem 
              key={service.id} 
              to={service.to}
              data-discover="true"
            >
              <IconContainer>
                <IconElement className="material-icons">{service.icon}</IconElement>
              </IconContainer>
              <ServiceTitle>{service.title}</ServiceTitle>
            </ServiceItem>
          ))}
        </ServicesContainer>
        
        {user ? (
          // Kullanıcı giriş yaptığında son yolculuklar
          <>
            <SectionTitle>Son Yolculuklarım</SectionTitle>
            <TripsContainer>
              {userTrips.map(trip => (
                <TripCard key={trip.id}>
                  <TripHeader>
                    <TripTitle>{trip.title}</TripTitle>
                    <TripInfo>
                      <i className="material-icons" style={{ fontSize: '16px', color: '#CCCCCC' }}>event</i>
                      <TripInfoText>{trip.date}, {trip.time}</TripInfoText>
                    </TripInfo>
                    <TripInfo>
                      <i className="material-icons" style={{ fontSize: '16px', color: '#CCCCCC' }}>person</i>
                      <TripInfoText>{trip.driver}</TripInfoText>
                    </TripInfo>
                  </TripHeader>
                  
                  <TripBody>
                    <TripDetails>
                      <TripDetailColumn>
                        <TripDetailLabel>Fiyat</TripDetailLabel>
                        <TripDetailValue>{trip.price}</TripDetailValue>
                      </TripDetailColumn>
                      
                      <TripDetailColumn>
                        <TripDetailLabel>Durum</TripDetailLabel>
                        <TripStatus status={trip.status}>
                          {getStatusText(trip.status)}
                        </TripStatus>
                      </TripDetailColumn>
                    </TripDetails>
                    
                    <CustomButton
                      title="Detayları Görüntüle"
                      onClick={() => {}}
                      type="secondary"
                      color={theme.primary}
                      fullWidth
                    />
                  </TripBody>
                </TripCard>
              ))}
            </TripsContainer>
          </>
        ) : (
          // Kullanıcı giriş yapmadığında önerilen yolculuklar ve araçlar
          <>
            <SectionTitle>Önerilen Yolculuklar</SectionTitle>
            <TripsContainer>
              {featuredRides.map(trip => (
                <TripCard key={trip.id}>
                  <TripHeader>
                    <TripTitle>{trip.title}</TripTitle>
                    <TripInfo>
                      <i className="material-icons" style={{ fontSize: '16px', color: '#CCCCCC' }}>event</i>
                      <TripInfoText>{trip.date}, {trip.time}</TripInfoText>
                    </TripInfo>
                    <TripInfo>
                      <i className="material-icons" style={{ fontSize: '16px', color: '#CCCCCC' }}>person</i>
                      <TripInfoText>{trip.driver}</TripInfoText>
                    </TripInfo>
                  </TripHeader>
                  
                  <TripBody>
                    <TripDetails>
                      <TripDetailColumn>
                        <TripDetailLabel>Fiyat</TripDetailLabel>
                        <TripDetailValue>{trip.price}</TripDetailValue>
                      </TripDetailColumn>
                      
                      <TripDetailColumn>
                        <TripDetailLabel>Durum</TripDetailLabel>
                        <TripStatus status={trip.status}>
                          {getStatusText(trip.status)}
                        </TripStatus>
                      </TripDetailColumn>
                    </TripDetails>
                    
                    <CustomButton
                      title="Detayları Görüntüle"
                      onClick={() => {}}
                      type="secondary"
                      color={theme.primary}
                      fullWidth
                    />
                  </TripBody>
                </TripCard>
              ))}
            </TripsContainer>

            <SectionTitle>Önerilen Kiralık Araçlar</SectionTitle>
            <VehicleCardContainer>
              {featuredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id}>
                  <VehicleImage src={vehicle.imageUrl} alt={vehicle.title} />
                  <VehicleOverlay>
                    <VehicleTitle>{vehicle.title}</VehicleTitle>
                    <VehicleInfo>
                      <VehicleLocation>{vehicle.location}</VehicleLocation>
                      <VehiclePrice>{vehicle.price}</VehiclePrice>
                    </VehicleInfo>
                  </VehicleOverlay>
                </VehicleCard>
              ))}
            </VehicleCardContainer>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default HomePage; 