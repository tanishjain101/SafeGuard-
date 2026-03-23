import React, { useState } from 'react';
import { Globe, ChevronRight, Check } from 'lucide-react';
import { languageService } from '../services/languageService';

interface LanguageSelectorProps {
  onLanguageSelected: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelected }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isAnimating, setIsAnimating] = useState(false);
  const languages = languageService.getAvailableLanguages();

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    languageService.setLanguage(languageCode);
  };

  const handleContinue = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onLanguageSelected(selectedLanguage);
    }, 300);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Globe className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {languageService.t('selectLanguage')}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {languageService.t('choosePreferredLanguage')}
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-3 mb-8">
          {languages.map((language, index) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                selectedLanguage === language.code
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:bg-white'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{language.flag}</div>
                  <div className="text-left">
                    <h3 className={`font-bold text-lg ${
                      selectedLanguage === language.code ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {language.nativeName}
                    </h3>
                    <p className={`text-sm ${
                      selectedLanguage === language.code ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {language.name}
                    </p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  selectedLanguage === language.code
                    ? 'border-blue-500 bg-blue-500 scale-110'
                    : 'border-gray-300'
                }`}>
                  {selectedLanguage === language.code && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 group"
        >
          <span>{languageService.t('continue')}</span>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
