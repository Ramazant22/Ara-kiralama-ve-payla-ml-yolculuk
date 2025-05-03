import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../services/ThemeContext';

// Custom Input Props
interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  isPassword?: boolean;
  type?: string;
  error?: string | null;
  icon?: string;
  autoCapitalize?: string;
  disabled?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

// Styled components
const InputContainer = styled.div<{ fullWidth?: boolean; customStyle?: React.CSSProperties }>`
  margin-bottom: 12px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
`;

const InputWrapper = styled.div<{
  isFocused: boolean;
  hasError: boolean;
  isDisabled: boolean;
}>`
  display: flex;
  align-items: center;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => {
    if (props.hasError) return '#EF4444';
    if (props.isFocused) return '#FFFFFF';
    return '#333333';
  }};
  border-radius: 10px;
  padding: 0 12px;
  background-color: ${props => props.isDisabled ? '#1A1A1A' : '#121212'};
  transition: all 0.2s ease;
  
  ${props => props.isFocused && 'border-width: 1.5px;'}
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 0;
  font-size: 16px;
  color: ${props => props.theme.text?.primary || '#FFFFFF'};
  background: transparent;
  border: none;
  outline: none;
  
  &::placeholder {
    color: #999999;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const InputIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: #CCCCCC;
`;

const TogglePasswordButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #CCCCCC;
  display: flex;
  align-items: center;
  padding: 0;
`;

const ErrorText = styled.p`
  color: #EF4444;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
`;

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isPassword = false,
  type = 'text',
  error = null,
  icon,
  disabled = false,
  maxLength,
  onBlur,
  style,
  fullWidth = false
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <InputContainer fullWidth={fullWidth} customStyle={style}>
      {label && <InputLabel>{label}</InputLabel>}
      
      <InputWrapper
        isFocused={isFocused}
        hasError={!!error}
        isDisabled={disabled}
      >
        {icon && (
          <InputIcon>
            <i className="material-icons">{icon}</i>
          </InputIcon>
        )}
        
        <StyledInput
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {isPassword && (
          <TogglePasswordButton
            type="button"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            <i className="material-icons">
              {showPassword ? 'visibility_off' : 'visibility'}
            </i>
          </TogglePasswordButton>
        )}
      </InputWrapper>
      
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
};

export default CustomInput; 