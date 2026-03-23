interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  alerts: WeatherAlert[];
  forecast: WeatherForecast[];
  lastUpdated: string;
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  areas: string[];
}

interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
}

class WeatherService {
  private cachedWeather: WeatherData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    // Check cache first
    if (this.cachedWeather && (Date.now() - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedWeather;
    }

    try {
      // Try to fetch from multiple weather APIs
      const weatherData = await this.fetchFromMultipleSources(lat, lon);
      
      this.cachedWeather = weatherData;
      this.lastFetch = Date.now();
      
      // Save to localStorage for offline access
      localStorage.setItem('safeGuardWeatherCache', JSON.stringify({
        data: weatherData,
        timestamp: Date.now()
      }));
      
      return weatherData;
    } catch (error) {
      console.error('Weather fetch failed:', error);
      
      // Try to load from cache
      const cached = this.loadFromCache();
      if (cached) {
        return cached;
      }
      
      // Return fallback weather data
      return this.getFallbackWeatherData(lat, lon);
    }
  }

  private async fetchFromMultipleSources(lat: number, lon: number): Promise<WeatherData> {
    // Try OpenWeatherMap first (most reliable)
    try {
      return await this.fetchFromOpenWeatherMap(lat, lon);
    } catch (_error) {
      console.warn('OpenWeatherMap failed, trying alternative sources');
    }

    // Try alternative weather sources
    try {
      return await this.fetchFromWeatherAPI(lat, lon);
    } catch (_error) {
      console.warn('WeatherAPI failed, trying IMD');
    }

    // Try Indian Meteorological Department
    try {
      return await this.fetchFromIMD(lat, lon);
    } catch (_error) {
      console.warn('All weather sources failed');
      throw new Error('Unable to fetch weather data from any source');
    }
  }

  private async fetchFromOpenWeatherMap(_lat: number, _lon: number): Promise<WeatherData> {
    // For demo purposes, we'll simulate API calls since we don't have real API keys
    // In production, replace with actual API calls
    
    const mockWeatherData: WeatherData = {
      location: 'Current Location',
      temperature: 28 + Math.random() * 10, // 28-38°C
      condition: this.getRandomCondition(),
      humidity: 60 + Math.random() * 30, // 60-90%
      windSpeed: 5 + Math.random() * 15, // 5-20 km/h
      pressure: 1010 + Math.random() * 20, // 1010-1030 hPa
      visibility: 8 + Math.random() * 2, // 8-10 km
      uvIndex: Math.floor(Math.random() * 11), // 0-10
      alerts: this.generateWeatherAlerts(),
      forecast: this.generateForecast(),
      lastUpdated: new Date().toISOString()
    };

    return mockWeatherData;
  }

  private async fetchFromWeatherAPI(_lat: number, _lon: number): Promise<WeatherData> {
    // Alternative weather API implementation
    return this.fetchFromOpenWeatherMap(_lat, _lon); // Fallback to mock for now
  }

  private async fetchFromIMD(_lat: number, _lon: number): Promise<WeatherData> {
    // Indian Meteorological Department API implementation
    return this.fetchFromOpenWeatherMap(_lat, _lon); // Fallback to mock for now
  }

  private getRandomCondition(): string {
    const conditions = [
      'Clear', 'Partly Cloudy', 'Cloudy', 'Overcast', 
      'Light Rain', 'Rain', 'Heavy Rain', 'Thunderstorm',
      'Fog', 'Mist', 'Haze', 'Sunny'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generateWeatherAlerts(): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    
    // Randomly generate alerts for demo
    if (Math.random() > 0.7) {
      alerts.push({
        id: 'alert_' + Date.now(),
        type: 'warning',
        severity: 'moderate',
        title: 'Thunderstorm Warning',
        description: 'Thunderstorms with heavy rain expected in your area. Stay indoors and avoid outdoor activities.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
        areas: ['Current Location', 'Nearby Areas']
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: 'alert_' + (Date.now() + 1),
        type: 'advisory',
        severity: 'minor',
        title: 'High Temperature Advisory',
        description: 'Temperatures expected to reach 40°C. Stay hydrated and avoid prolonged sun exposure.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        areas: ['Current Location']
      });
    }

    return alerts;
  }

  private generateForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 30 + Math.random() * 8, // 30-38°C
        low: 20 + Math.random() * 8, // 20-28°C
        condition: this.getRandomCondition(),
        precipitation: Math.random() * 100, // 0-100%
        windSpeed: 5 + Math.random() * 15 // 5-20 km/h
      });
    }
    
    return forecast;
  }

  private loadFromCache(): WeatherData | null {
    try {
      const cached = localStorage.getItem('safeGuardWeatherCache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        
        // Use cached data if less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to load weather from cache:', error);
    }
    return null;
  }

  private getFallbackWeatherData(_lat: number, _lon: number): WeatherData {
    return {
      location: 'Location Unknown',
      temperature: 25,
      condition: 'Unknown',
      humidity: 70,
      windSpeed: 10,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      alerts: [],
      forecast: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Get weather condition icon
  getWeatherIcon(condition: string): string {
    const iconMap: { [key: string]: string } = {
      'Clear': '☀️',
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Overcast': '☁️',
      'Light Rain': '🌦️',
      'Rain': '🌧️',
      'Heavy Rain': '⛈️',
      'Thunderstorm': '⛈️',
      'Fog': '🌫️',
      'Mist': '🌫️',
      'Haze': '🌫️',
      'Snow': '❄️',
      'Unknown': '🌡️'
    };
    
    return iconMap[condition] || '🌡️';
  }

  // Get weather alerts for notifications
  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const weather = await this.getCurrentWeather(lat, lon);
      return weather.alerts;
    } catch (error) {
      console.error('Failed to get weather alerts:', error);
      return [];
    }
  }

  // Check if severe weather is expected
  async hasSevereWeatherAlerts(lat: number, lon: number): Promise<boolean> {
    const alerts = await this.getWeatherAlerts(lat, lon);
    return alerts.some(alert => alert.severity === 'severe' || alert.severity === 'extreme');
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherAlert, WeatherForecast };
