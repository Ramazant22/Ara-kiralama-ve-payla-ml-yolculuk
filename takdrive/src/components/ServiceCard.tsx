import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';
import { Link } from 'react-router-dom';

// ServiceCard Props
interface ServiceCardProps {
  icon: string;
  title: string;
  to: string;
  onClick?: () => void;
}

// Styled components
const CardContainer = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.primary || '#FFFFFF'};
  border-radius: 12px;
  padding: 24px 16px;
  margin: 8px;
  width: 140px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    width: calc(50% - 16px);
  }
  
  @media (max-width: 480px) {
    width: calc(33.333% - 16px);
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

const Icon = styled.i`
  font-size: 32px;
  color: ${props => props.theme.text?.inverse || '#000000'};
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.text?.inverse || '#000000'};
  text-align: center;
  margin: 0;
`;

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, to, onClick }) => {
  const { theme } = useTheme();
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <CardContainer to={to} onClick={handleClick}>
      <IconContainer>
        <Icon className="material-icons">{icon}</Icon>
      </IconContainer>
      <Title>{title}</Title>
    </CardContainer>
  );
};

export default ServiceCard; 