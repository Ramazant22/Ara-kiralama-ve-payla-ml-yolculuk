import { ScrollViewStyleReset } from 'expo-router/html';
import { colors } from './_layout';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this file are not used in the native runtime.

// This file is imported during static rendering
export const unstable_settings = {
  // Used to enable the splash screen APIs in the HTML file, these can be toggled on/off as needed.
  initialRouteName: '(tabs)',
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveViewportStyle }} />
        <style dangerouslySetInnerHTML={{ __html: splashScreenStyle }} />
      </head>
      <body>
        {/* Add splash screen for mobile apps */}
        <div id="splash-screen">
          <div className="splash-container">
            <div className="logo-container">
              <div className="logo">TD</div>
            </div>
            <h1 className="app-name">TakDrive</h1>
            <p className="app-tagline">Araç Kiralama ve Yolculuk Paylaşımı</p>
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}

const responsiveViewportStyle = `
@media (max-width: 1000px) {
  body, html {
    margin: 0;
    padding: 0;
  }
}`;

const splashScreenStyle = `
#splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeOut 1s ease-in-out 2s forwards;
}

.splash-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  background-color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  font-weight: bold;
  color: #3b82f6;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5);
  animation: pulse 2s infinite;
}

.app-name {
  color: #FFFFFF;
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0 0 0;
}

.app-tagline {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 5px 0 30px 0;
}

.loading-dots {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #3b82f6;
  border-radius: 50%;
  margin: 0 5px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; visibility: hidden; }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
}`; 