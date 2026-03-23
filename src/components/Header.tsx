import React from 'react';
import { Shield } from 'lucide-react';
import { UserData } from './UserSetup';
import { languageService } from '../services/languageService';

interface HeaderProps {
  userData: UserData | null;
  theme?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ userData, theme = 'light' }) => {
  return (
    <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 via-blue-900 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-blue-200'} rounded-3xl shadow-2xl border backdrop-blur-sm p-6 relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 animate-gradient-x"></div>
      
      <div className="relative z-10">
      {userData && (
        <div className={`mb-4 pb-4 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {languageService.t('welcomeBack')}, <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{userData.name}</span>
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl">
            <Shield className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h1 className={`font-bold text-2xl bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent`}>
              {languageService.t('appName')}
            </h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {languageService.t('appSubtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className={`text-sm font-bold text-green-700 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'} px-4 py-2 rounded-full border ${theme === 'dark' ? 'border-green-800' : 'border-green-200'} shadow-lg`}>
            {languageService.t('active')}
          </span>
        </div>
      </div>
      </div>
      
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Header;
