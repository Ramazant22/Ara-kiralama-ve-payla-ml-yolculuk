import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';

// Card Props
interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
  elevation?: number;
  className?: string;
}

// Styled components
const CardContainer = styled.div<{
  customStyle?: React.CSSProperties;
  elevation?: number;
  clickable?: boolean;
}>`
  background-color: ${props => props.theme.card || '#1A1A1A'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 ${props => props.elevation || 2}px ${props => (props.elevation || 2) * 3}px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => props.clickable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 ${(props.elevation || 2) + 2}px ${(props.elevation || 2) * 4}px rgba(0, 0, 0, 0.25);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 ${props.elevation || 2}px ${(props.elevation || 2) * 3}px rgba(0, 0, 0, 0.2);
    }
  `}
`;

const CardTitle = styled.h3`
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.divider || '#2C2C2C'};
`;

const Card: React.FC<CardProps> = ({
  children,
  title,
  style = {},
  onPress,
  elevation = 2,
  className
}) => {
  const { theme } = useTheme();
  
  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <CardContainer 
      customStyle={style} 
      elevation={elevation}
      clickable={!!onPress}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {title && <CardTitle>{title}</CardTitle>}
      {children}
    </CardContainer>
  );
};

export default Card; 