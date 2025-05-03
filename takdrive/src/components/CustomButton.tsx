import React from 'react';
import { useTheme } from '../services/ThemeContext';
import styled from 'styled-components';

// Button props
interface CustomButtonProps {
  title: string;
  onClick: () => void;
  type?: 'primary' | 'secondary' | 'tertiary';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  fullWidth?: boolean;
}

// Styled components for CustomButton
const ButtonContainer = styled.button<{
  buttonType: string;
  buttonColor: string;
  isDisabled: boolean;
  isFullWidth: boolean;
  customStyle: React.CSSProperties;
}>`
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  width: ${props => props.isFullWidth ? '100%' : 'auto'};
  
  ${props => {
    if (props.isDisabled) {
      return `
        background-color: #CCCCCC;
        border: 1px solid #CCCCCC;
      `;
    }
    
    if (props.buttonType === 'primary') {
      return `
        background-color: ${props.buttonColor};
        border: none;
        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        &:active {
          opacity: 0.8;
          transform: translateY(0);
        }
      `;
    }
    
    if (props.buttonType === 'secondary') {
      return `
        background-color: transparent;
        border: 1px solid ${props.buttonColor};
        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        &:active {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `;
    }
    
    if (props.buttonType === 'tertiary') {
      return `
        background-color: transparent;
        border: none;
        padding: 8px;
        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `;
    }
  }}
`;

const ButtonText = styled.span<{
  buttonType: string;
  buttonColor: string;
  isDisabled: boolean;
  customStyle: React.CSSProperties;
}>`
  font-weight: 600;
  font-size: 16px;
  
  ${props => {
    if (props.isDisabled) {
      return 'color: #888888;';
    }
    
    if (props.buttonType === 'primary') {
      return 'color: #000000;';
    }
    
    if (props.buttonType === 'secondary' || props.buttonType === 'tertiary') {
      return `color: ${props.buttonColor};`;
    }
  }}
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid ${props => props.color || '#000000'};
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onClick,
  type = 'primary',
  color,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  fullWidth = false
}) => {
  const { theme } = useTheme();
  
  // Buton rengi belirleme
  const buttonColor = color || theme.primary;
  
  // Buton tıklama işlemi
  const handleClick = () => {
    if (!disabled && !loading) {
      console.log('CustomButton tıklandı:', title);
      onClick();
    }
  };

  return (
    <ButtonContainer
      onClick={handleClick}
      buttonType={type}
      buttonColor={buttonColor}
      isDisabled={disabled}
      isFullWidth={fullWidth}
      customStyle={style}
      disabled={disabled || loading}
    >
      {loading ? (
        <LoadingSpinner color={type === 'primary' ? '#000000' : buttonColor} />
      ) : (
        <ButtonText
          buttonType={type}
          buttonColor={buttonColor}
          isDisabled={disabled}
          customStyle={textStyle}
        >
          {title}
        </ButtonText>
      )}
    </ButtonContainer>
  );
};

export default CustomButton; 