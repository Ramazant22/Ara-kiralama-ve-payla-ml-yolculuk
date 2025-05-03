import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';

// Avatar props
interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  online?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Styled components
const AvatarContainer = styled.div<{
  $size: number;
  $clickable: boolean;
}>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${props => props.theme.surface || '#121212'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  ${props => props.$clickable && `
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarText = styled.span<{ $size: number }>`
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  font-weight: 500;
  font-size: ${props => Math.max(props.$size / 2.5, 12)}px;
  text-transform: uppercase;
`;

const OnlineIndicator = styled.div<{ $size: number }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${props => props.$size / 4}px;
  height: ${props => props.$size / 4}px;
  border-radius: 50%;
  background-color: ${props => props.theme.indicator?.online || '#22C55E'};
  border: 2px solid ${props => props.theme.background || '#000000'};
`;

const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 40,
  online = false,
  style = {},
  onClick
}) => {
  const { theme } = useTheme();
  
  // İsim kısaltması (ilk harfler)
  const getInitials = (name: string) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2);
  };
  
  return (
    <AvatarContainer 
      $size={size} 
      $clickable={!!onClick}
      onClick={onClick}
      style={style}
    >
      {source ? (
        <AvatarImage src={source} alt={name || 'Avatar'} />
      ) : (
        <AvatarText $size={size}>{getInitials(name)}</AvatarText>
      )}
      
      {online && <OnlineIndicator $size={size} />}
    </AvatarContainer>
  );
};

export default Avatar; 