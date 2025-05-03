import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Card from '../components/Card';
import authService from '../services/authService';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.background || '#000000'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LogoContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Logo = styled.i`
  font-size: 80px;
  color: ${props => props.theme.primary || '#FFFFFF'};
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.text?.secondary || '#CCCCCC'};
  text-align: center;
  margin-bottom: 20px;
`;

const FormCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  background-color: ${props => props.theme.card || '#1A1A1A'};
`;

const FormContainer = styled.div`
  width: 100%;
`;

const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

const ForgotPasswordLink = styled(Link)`
  color: ${props => props.theme.primary || '#FFFFFF'};
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SignupContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 8px;
`;

const SignupText = styled.span`
  color: ${props => props.theme.text?.secondary || '#CCCCCC'};
`;

const SignupLink = styled(Link)`
  color: ${props => props.theme.primary || '#FFFFFF'};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.danger || '#EF4444'};
  background-color: rgba(239, 68, 68, 0.1);
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border-left: 3px solid ${props => props.theme.danger || '#EF4444'};
`;

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form doğrulama
  const validate = () => {
    let isValid = true;
    
    // E-posta doğrulama
    if (!email) {
      setEmailError('E-posta adresinizi giriniz');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      isValid = false;
    } else {
      setEmailError(null);
    }
    
    // Şifre doğrulama
    if (!password) {
      setPasswordError('Şifrenizi giriniz');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    return isValid;
  };
  
  // Giriş işlemi
  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Login isteği gönderiliyor:', { email, password });
        
        // API'ye giriş isteği gönderme
        const response = await authService.login({ email, password });
        
        // Başarılı giriş
        console.log('Giriş başarılı, tüm yanıt:', response);
        console.log('Kullanıcı bilgileri:', response.user);
        console.log('Token:', response.token);
        
        navigate('/');
      } catch (error: any) {
        console.error('Giriş hatası tüm bilgiler:', error);
        
        if (error.response) {
          console.error('Hata yanıtı:', error.response);
          console.error('Hata durumu:', error.response.status);
          console.error('Hata veri:', error.response.data);
        }
        
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('E-posta adresi veya şifre hatalı. Lütfen admin@takdrive.com / admin123 ile deneyiniz.');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <PageContainer>
      <LogoContainer>
        <Logo className="material-icons">directions_car</Logo>
      </LogoContainer>
      
      <Title>TakDrive'a Hoş Geldiniz</Title>
      <Subtitle>Araç paylaşım ve kiralama platformuna giriş yapın</Subtitle>
      
      <FormCard>
        <FormContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <CustomInput
            label="E-posta"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={setEmail}
            type="email"
            error={emailError}
            icon="email"
            fullWidth
          />
          
          <CustomInput
            label="Şifre"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={setPassword}
            isPassword
            error={passwordError}
            icon="lock"
            fullWidth
          />
          
          <ForgotPasswordContainer>
            <ForgotPasswordLink to="/forgot-password">Şifremi Unuttum</ForgotPasswordLink>
          </ForgotPasswordContainer>
          
          <CustomButton
            title={loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            onClick={handleLogin}
            loading={loading}
            disabled={loading}
            color={theme.primary}
            fullWidth
          />
          
          <SignupContainer>
            <SignupText>Hesabınız yok mu?</SignupText>
            <SignupLink to="/register">Kayıt Ol</SignupLink>
          </SignupContainer>
        </FormContainer>
      </FormCard>
    </PageContainer>
  );
};

export default LoginPage; 