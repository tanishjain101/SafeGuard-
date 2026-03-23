import { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import WeatherWidget from './components/WeatherWidget';
import Header from './components/Header';
import SOSButton from './components/SOSButton';
import EmergencyActions from './components/EmergencyActions';
import SafetyStatus from './components/SafetyStatus';
import BottomNavigation from './components/BottomNavigation';
import LocationTracker from './components/LocationTracker';
import DisasterPlanning from './components/DisasterPlanning';
import UserSetup, { UserData } from './components/UserSetup';
import { offlineService } from './services/offlineService';
import { notificationService } from './services/notificationService';

function App() {
  const [languageSelected, setLanguageSelected] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Check if language has been selected
    const savedLanguage = localStorage.getItem('safeGuardLanguage');
    if (savedLanguage) {
      setLanguageSelected(true);
    }
    
    // Initialize notification service
    notificationService.onNotification(() => {
      setNotifications(notificationService.getUnreadCount());
    });
    
    // Update notification count
    setNotifications(notificationService.getUnreadCount());
    
    // Monitor online/offline status
    const handleOnline = () => {
      offlineService.sendPendingMessages();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Check if user has already completed setup
    const savedUserData = localStorage.getItem('safeGuardUserData');
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        // Ensure emergencyContacts is always an array
        if (!parsedData.emergencyContacts || !Array.isArray(parsedData.emergencyContacts)) {
          parsedData.emergencyContacts = [];
        }
        setUserData(parsedData);
        setIsSetupComplete(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('safeGuardUserData');
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('safeGuardTheme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleLanguageSelected = () => {
    setLanguageSelected(true);
  };

  const handleSetupComplete = (newUserData: UserData) => {
    setUserData(newUserData);
    setIsSetupComplete(true);
    // Save user data to localStorage
    localStorage.setItem('safeGuardUserData', JSON.stringify(newUserData));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('safeGuardTheme', newTheme);
  };

  const handleReset = () => {
    setIsSetupComplete(false);
    setUserData(null);
    // Clear all local data
    localStorage.removeItem('safeGuardUserData');
  };

  // Show language selector first
  if (!languageSelected) {
    return <LanguageSelector onLanguageSelected={handleLanguageSelected} />;
  }

  if (!isSetupComplete) {
    return <UserSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/3 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-float"></div>
      </div>
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Header userData={userData} theme={theme} />
        <WeatherWidget theme={theme} compact={false} />
        <LocationTracker theme={theme} showDetails={false} />
        <SOSButton userData={userData} />
        <EmergencyActions userData={userData} theme={theme} />
        <DisasterPlanning theme={theme} />
        <SafetyStatus userData={userData} theme={theme} />
        <BottomNavigation 
          userData={userData} 
          theme={theme} 
          onThemeChange={handleThemeChange} 
          onReset={handleReset}
          notificationCount={notifications}
        />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(-120deg);
          }
          66% {
            transform: translateY(-25px) rotate(-240deg);
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
