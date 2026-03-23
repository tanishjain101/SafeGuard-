import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Wifi } from 'lucide-react';
import { locationService, LocationData } from '../services/locationService';

interface LocationTrackerProps {
  theme?: 'light' | 'dark';
  showDetails?: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ theme = 'light', showDetails = true }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to location updates
    locationService.onLocationUpdate((newLocation) => {
      setLocation(newLocation);
      setLastUpdate(new Date());
      setIsTracking(true);
      setError(null);
    });

    locationService.onLocationError((locationError) => {
      setError(locationError.message);
      setIsTracking(false);
    });

    // Start tracking
    locationService.startLocationTracking()
      .then((initialLocation) => {
        setLocation(initialLocation);
        setLastUpdate(new Date());
        setIsTracking(true);
      })
      .catch((err) => {
        setError(err.message);
        setIsTracking(false);
      });

    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 5) return 'Excellent';
    if (accuracy < 10) return 'High';
    if (accuracy < 25) return 'Good';
    if (accuracy < 50) return 'Medium';
    return 'Low';
  };

  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center justify-between p-4 rounded-2xl shadow-lg border backdrop-blur-sm ${
        theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
      }`}>
        <div className={`flex items-center space-x-3 ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isTracking && <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>}
          </div>
          <MapPin className="h-4 w-4" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {isTracking ? 'Live Location Active' : 'Location Inactive'}
          </span>
        </div>
        {location && (
          <span className={`text-xs px-3 py-1 rounded-full ${
            location.accuracy < 10 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : location.accuracy < 50 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            ±{Math.round(location.accuracy)}m
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Navigation className={`h-5 w-5 ${isTracking ? 'text-green-500' : 'text-gray-400'}`} />
          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Real-time Location
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
            {isTracking ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Latitude:</span>
              <p className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {location.latitude.toFixed(6)}
              </p>
            </div>
            <div>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Longitude:</span>
              <p className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Wifi className={`h-4 w-4 ${location.accuracy < 10 ? 'text-green-500' : location.accuracy < 50 ? 'text-yellow-500' : 'text-red-500'}`} />
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Accuracy: {formatAccuracy(location.accuracy)} ({Math.round(location.accuracy)}m)
              </span>
            </div>
            {lastUpdate && (
              <div className="flex items-center space-x-1">
                <Clock className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatLastUpdate(lastUpdate)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const mapsUrl = locationService.getGoogleMapsUrl(location);
              window.open(mapsUrl, '_blank');
            }}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>View on Google Maps</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;