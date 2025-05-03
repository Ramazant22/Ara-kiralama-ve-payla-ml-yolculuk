import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    black: string;
    white: string;
    transparent: string;
    background: string;
    card: string;
    surface: string;
    border: string;
    divider: string;
    text?: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
    states?: {
      active: string;
      hover: string;
      pressed: string;
    };
    shadow?: {
      color: string;
      opacity: number;
    };
    indicator?: {
      online: string;
      offline: string;
      busy: string;
    };
    typography?: any;
    spacing?: any;
    borderRadius?: any;
    themeType?: string;
    toggleTheme?: () => void;
    setTheme?: (theme: string) => void;
  }
} 