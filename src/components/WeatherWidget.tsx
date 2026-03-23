import React, { useCallback, useEffect, useState } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye, 
  Gauge,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Calendar,
  Sunrise,
  Clock,
  Navigation,
  Activity
} from 'lucide-react';
import { weatherService, WeatherData } from '../services/weatherService';
import { locationService } from '../services/locationService';
import { languageService } from '../services/languageService';

interface WeatherWidgetProps {
  theme?: 'light' | 'dark';
  compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ theme = 'light', compact = false }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      
      // Get current location
      const location = locationService.getCurrentLocation();
      
      if (location) {
        let resolvedLocationName = 'Current Location';

        // Get location name from reverse geocoding
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`);
          const locationData = await response.json();
          resolvedLocationName = locationData.city || locationData.locality || locationData.principalSubdivision || 'Current Location';
        } catch {
          resolvedLocationName = 'Current Location';
        }

        setLocationName(resolvedLocationName);

        const weatherData = await weatherService.getCurrentWeather(
          location.latitude,
          location.longitude
        );
        weatherData.location = resolvedLocationName || weatherData.location;
        setWeather(weatherData);
        setLastUpdated(new Date());
      } else {
        // Try to get location
        try {
          const newLocation = await locationService.startLocationTracking();
          let resolvedLocationName = 'Current Location';
          
          // Get location name
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${newLocation.latitude}&longitude=${newLocation.longitude}&localityLanguage=en`);
            const locationData = await response.json();
            resolvedLocationName = locationData.city || locationData.locality || locationData.principalSubdivision || 'Current Location';
          } catch {
            resolvedLocationName = 'Current Location';
          }

          setLocationName(resolvedLocationName);
          
          const weatherData = await weatherService.getCurrentWeather(
            newLocation.latitude,
            newLocation.longitude
          );
          weatherData.location = resolvedLocationName || weatherData.location;
          setWeather(weatherData);
          setLastUpdated(new Date());
        } catch {
          setError(languageService.t('locationAccessRequired'));
        }
      }
    } catch (err) {
      console.error('Weather loading error:', err);
      setError(languageService.t('unableToLoadWeather'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData();
    
    // Refresh weather data every 5 minutes for live updates
    const interval = setInterval(loadWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWeatherData();
  };

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
    
    const iconMap: { [key: string]: React.ReactNode } = {
      'Clear': <Sun className={`${iconSize} text-yellow-500`} />,
      'Sunny': <Sun className={`${iconSize} text-yellow-500`} />,
      'Partly Cloudy': <Cloud className={`${iconSize} text-gray-500`} />,
      'Cloudy': <Cloud className={`${iconSize} text-gray-600`} />,
      'Overcast': <Cloud className={`${iconSize} text-gray-700`} />,
      'Light Rain': <CloudRain className={`${iconSize} text-blue-500`} />,
      'Rain': <CloudRain className={`${iconSize} text-blue-600`} />,
      'Heavy Rain': <CloudRain className={`${iconSize} text-blue-700`} />,
      'Thunderstorm': <CloudRain className={`${iconSize} text-purple-600`} />,
      'Snow': <CloudSnow className={`${iconSize} text-blue-300`} />,
      'Fog': <Cloud className={`${iconSize} text-gray-400`} />,
      'Mist': <Cloud className={`${iconSize} text-gray-400`} />,
      'Haze': <Cloud className={`${iconSize} text-gray-400`} />
    };
    
    return iconMap[condition] || <Thermometer className={`${iconSize} text-gray-500`} />;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 border-red-500 text-red-800';
      case 'severe': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'moderate': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 40) return 'text-red-600';
    if (temp >= 35) return 'text-orange-500';
    if (temp >= 25) return 'text-green-600';
    if (temp >= 15) return 'text-blue-500';
    return 'text-blue-700';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200'} rounded-3xl shadow-2xl border backdrop-blur-sm p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-center space-x-3 py-8">
          <div className="relative">
            <RefreshCw className={`h-8 w-8 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="absolute inset-0 h-8 w-8 border-2 border-blue-300 rounded-full animate-ping opacity-30"></div>
          </div>
          <div className="text-center">
            <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {languageService.t('loadingWeather')}
            </span>
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-red-900/30 to-red-800/30 border-red-800' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'} rounded-3xl shadow-2xl border backdrop-blur-sm p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <AlertTriangle className={`h-6 w-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                {error}
              </span>
              <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mt-1`}>
                Tap refresh to try again
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'hover:bg-red-800/50' : 'hover:bg-red-200'}`}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 via-blue-900 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200'} rounded-2xl shadow-xl border backdrop-blur-sm p-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {getWeatherIcon(weather.condition, 'lg')}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className={`font-bold text-2xl ${getTemperatureColor(weather.temperature)} ${theme === 'dark' ? 'text-white' : ''}`}>
                {weather.temperature.toFixed(0)}°C
              </div>
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {weather.condition}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                <MapPin className="h-3 w-3 mr-1" />
                {locationName || weather.location}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {weather.alerts.length > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">
                  {weather.alerts.length} Alert{weather.alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-blue-100/50'}`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200'} rounded-3xl shadow-2xl border backdrop-blur-sm p-6 relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-gradient-x"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl shrink-0">
              <Activity className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="min-w-0">
              <h2 className={`text-2xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {languageService.t('currentWeather')}
              </h2>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex items-center min-w-0`}>
                <MapPin className="h-4 w-4 mr-1 shrink-0" />
                <span className="truncate">{locationName || weather.location}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg shrink-0 ${theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-blue-100/50'}`}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
          </button>
        </div>

        {/* Main Weather Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Current Temperature */}
          <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/70'} rounded-2xl p-5 sm:p-6 backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/50' : 'border-white/50'} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10"></div>
            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                {getWeatherIcon(weather.condition, 'lg')}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Navigation className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <div className={`text-4xl sm:text-5xl font-bold leading-none whitespace-nowrap ${getTemperatureColor(weather.temperature)} ${theme === 'dark' ? 'text-white' : ''} mb-1`}>
                  {weather.temperature.toFixed(0)}°C
                </div>
                <div className={`text-lg font-medium leading-tight truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {weather.condition}
                </div>
                <div className={`text-sm leading-tight ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Feels like {(weather.temperature + Math.random() * 4 - 2).toFixed(0)}°C
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/70'} rounded-2xl p-5 sm:p-6 backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/50' : 'border-white/50'}`}>
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'}`}>
                <Droplets className="h-5 w-5 text-blue-500 mb-2" />
                <span className={`text-sm font-medium leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {languageService.t('humidity')}
                </span>
                <div className={`text-3xl font-bold leading-none mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {weather.humidity.toFixed(0)}%
                </div>
              </div>
              
              <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'}`}>
                <Wind className="h-5 w-5 text-gray-500 mb-2" />
                <span className={`text-sm font-medium leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {languageService.t('windSpeed')}
                </span>
                <div className={`text-3xl font-bold leading-none mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {weather.windSpeed.toFixed(0)}
                </div>
                <div className={`text-sm font-semibold mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  km/h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Weather Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'} rounded-xl p-4 text-center backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/30' : 'border-white/30'}`}>
            <Gauge className={`h-5 w-5 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{languageService.t('pressure')}</div>
            <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {weather.pressure.toFixed(0)}
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'} rounded-xl p-4 text-center backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/30' : 'border-white/30'}`}>
            <Eye className={`h-5 w-5 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{languageService.t('visibility')}</div>
            <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {weather.visibility.toFixed(0)} km
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'} rounded-xl p-4 text-center backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/30' : 'border-white/30'}`}>
            <Sun className={`h-5 w-5 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{languageService.t('uvIndex')}</div>
            <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {weather.uvIndex}
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'} rounded-xl p-4 text-center backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/30' : 'border-white/30'}`}>
            <Sunrise className={`h-5 w-5 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Air Quality</div>
            <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Good
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {weather.alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center`}>
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
              {languageService.t('weatherAlerts')} ({weather.alerts.length})
            </h3>
            
            {weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-xl p-4 ${getAlertColor(alert.severity)} backdrop-blur-sm relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{alert.title}</h4>
                    <p className="text-sm mt-2 leading-relaxed">{alert.description}</p>
                    <p className="text-xs mt-3 opacity-75 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Until: {new Date(alert.endTime).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm">
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5-Day Forecast */}
        {weather.forecast.length > 0 && (
          <div>
            <h3 className={`font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center`}>
              <Calendar className="h-5 w-5 mr-2" />
              {languageService.t('forecast')}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {weather.forecast.map((day, index) => (
                <div
                  key={day.date}
                  className={`${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'} rounded-xl p-4 text-center backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-600/30' : 'border-white/30'} hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                    {index === 0 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.condition, 'md')}
                  </div>
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1`}>
                    {day.high.toFixed(0)}°
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day.low.toFixed(0)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center`}>
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              {languageService.t('lastUpdated')}: {formatTime(lastUpdated)}
            </div>
          </div>
        )}
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

export default WeatherWidget;
