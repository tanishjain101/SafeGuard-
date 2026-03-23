export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private locationCallbacks: ((location: LocationData) => void)[] = [];
  private errorCallbacks: ((error: LocationError) => void)[] = [];
  private highAccuracyWatchId: number | null = null;
  private locationBuffer: LocationData[] = [];
  private readonly BUFFER_SIZE = 5;

  constructor() {
    this.initializeLocationTracking();
  }

  private initializeLocationTracking() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
    }
  }

  startLocationTracking(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser. Please use a modern browser with GPS capabilities.'));
        return;
      }

      // Show user-friendly permission request
      this.showLocationPermissionDialog();

      // High accuracy options for precise location
      const highAccuracyOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 5000 // Reduced max age for fresher data
      };

      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = this.processLocationData(position);
          
          this.currentLocation = locationData;
          this.addToBuffer(locationData);
          this.notifyLocationCallbacks(locationData);
          resolve(locationData);
          
          // Start high accuracy continuous tracking
          this.startHighAccuracyTracking();
        },
        (error) => {
          // Fallback to lower accuracy if high accuracy fails
          console.warn('High accuracy location failed, trying fallback:', this.getDetailedErrorMessage(error));
          this.tryFallbackLocation(resolve, reject);
        },
        highAccuracyOptions
      );
    });
  }

  private showLocationPermissionDialog() {
    // This helps users understand why location is needed
    console.log('📍 Requesting location permission for emergency services...');
  }
  private tryFallbackLocation(resolve: (value: LocationData) => void, reject: (reason: unknown) => void) {
    const fallbackOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = this.processLocationData(position);
        
        this.currentLocation = locationData;
        this.addToBuffer(locationData);
        this.notifyLocationCallbacks(locationData);
        resolve(locationData);
        
        // Start regular tracking
        this.startRegularTracking();
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: this.getDetailedErrorMessage(error)
        };
        this.notifyErrorCallbacks(locationError);
        reject(locationError);
      },
      fallbackOptions
    );
  }

  private startHighAccuracyTracking() {
    if (this.highAccuracyWatchId !== null) {
      navigator.geolocation.clearWatch(this.highAccuracyWatchId);
    }

    const highAccuracyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000 // Very fresh data for high accuracy
    };

    this.highAccuracyWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = this.processLocationData(position);
        
        // Only update if accuracy is better or significantly different
        if (this.shouldUpdateLocation(locationData)) {
          this.currentLocation = locationData;
          this.addToBuffer(locationData);
          this.notifyLocationCallbacks(locationData);
        }
      },
      (error) => {
        console.warn('High accuracy tracking error:', error.message);
        // Fall back to regular tracking if high accuracy fails
        this.startRegularTracking();
      },
      highAccuracyOptions
    );
  }

  private startRegularTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    const regularOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = this.processLocationData(position);
        
        if (this.shouldUpdateLocation(locationData)) {
          this.currentLocation = locationData;
          this.addToBuffer(locationData);
          this.notifyLocationCallbacks(locationData);
        }
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: this.getDetailedErrorMessage(error)
        };
        this.notifyErrorCallbacks(locationError);
      },
      regularOptions
    );
  }

  private processLocationData(position: GeolocationPosition): LocationData {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined
    };
  }

  private shouldUpdateLocation(newLocation: LocationData): boolean {
    if (!this.currentLocation) return true;
    
    // Update if accuracy is significantly better (at least 20% improvement)
    if (newLocation.accuracy < this.currentLocation.accuracy * 0.8) {
      return true;
    }
    
    // Update if location has changed significantly (more than current accuracy)
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    ) * 1000; // Convert to meters
    
    if (distance > Math.max(newLocation.accuracy, this.currentLocation.accuracy)) {
      return true;
    }
    
    // Update if data is much fresher (more than 30 seconds old)
    if (Date.now() - this.currentLocation.timestamp > 30000) {
      return true;
    }
    
    return false;
  }

  private addToBuffer(location: LocationData) {
    this.locationBuffer.push(location);
    if (this.locationBuffer.length > this.BUFFER_SIZE) {
      this.locationBuffer.shift();
    }
  }

  private getDetailedErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return `Location access denied. To enable location access:

🔧 For Chrome/Edge:
1. Click the location icon (🌐) in the address bar
2. Select "Allow" for location access
3. Refresh the page

🔧 For Firefox:
1. Click the shield icon in the address bar
2. Turn off "Enhanced Tracking Protection" for this site
3. Refresh and allow location access

🔧 For Safari:
1. Go to Safari > Preferences > Websites > Location Services
2. Allow location access for this website
3. Refresh the page

📱 For Mobile:
1. Enable location services in device settings
2. Allow browser to access location
3. Refresh the page

⚠️ Location access is essential for emergency services to find you quickly during disasters.`;
      case error.POSITION_UNAVAILABLE:
        return `Location information unavailable. Please try these steps:

📡 Check your connections:
• Ensure GPS/Location Services are enabled on your device
• Check if you have internet connection (WiFi or mobile data)
• Move to an area with better GPS signal (away from tall buildings)
• Try refreshing the page

🏢 If you're indoors:
• Move closer to a window
• Step outside if possible
• Wait a few moments for GPS to acquire signal

📱 Device settings:
• Make sure Location Services are enabled in device settings
• Check if battery saver mode is limiting GPS accuracy
• Restart your browser or device if needed`;
      case error.TIMEOUT:
        return `Location request timed out. This usually means:

⏱️ GPS is taking longer than expected:
• Move to an area with clearer sky view
• Wait a bit longer for GPS to acquire signal
• Try refreshing the page

📶 Connection issues:
• Check your internet connection
• Try switching between WiFi and mobile data
• Move to an area with better signal

🔄 Quick fixes:
• Refresh the page and try again
• Restart your browser
• Clear browser cache and cookies for this site`;
      default:
        return `Location error: ${error.message}

🔧 General troubleshooting:
• Refresh the page and try again
• Check if location services are enabled
• Try using a different browser
• Restart your device if the problem persists

📞 If you're in an emergency and can't get location working:
• Call emergency services directly (112 in India)
• Provide your address or nearby landmarks verbally
• Ask someone nearby to help with location sharing`;
    }
  }

  // Get the most accurate recent location from buffer
  getBestRecentLocation(): LocationData | null {
    if (this.locationBuffer.length === 0) return this.currentLocation;
    
    // Find the most accurate location from recent buffer
    return this.locationBuffer.reduce((best, current) => {
      if (!best) return current;
      
      // Prefer more accurate locations
      if (current.accuracy < best.accuracy) return current;
      
      // If accuracy is similar, prefer more recent
      if (Math.abs(current.accuracy - best.accuracy) < 5) {
        return current.timestamp > best.timestamp ? current : best;
      }
      
      return best;
    });
  }

  // Get average location from buffer for better accuracy
  getAverageLocation(): LocationData | null {
    if (this.locationBuffer.length === 0) return this.currentLocation;
    if (this.locationBuffer.length === 1) return this.locationBuffer[0];
    
    // Filter out locations with poor accuracy (>100m)
    const goodLocations = this.locationBuffer.filter(loc => loc.accuracy <= 100);
    if (goodLocations.length === 0) return this.currentLocation;
    
    // Calculate weighted average based on accuracy (better accuracy = higher weight)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let bestAccuracy = Math.min(...goodLocations.map(loc => loc.accuracy));
    
    goodLocations.forEach(location => {
      const weight = bestAccuracy / location.accuracy; // Better accuracy = higher weight
      totalWeight += weight;
      weightedLat += location.latitude * weight;
      weightedLng += location.longitude * weight;
    });
    
    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLng / totalWeight,
      accuracy: bestAccuracy,
      timestamp: Date.now()
    };
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.highAccuracyWatchId !== null) {
      navigator.geolocation.clearWatch(this.highAccuracyWatchId);
      this.highAccuracyWatchId = null;
    }
  }

  getCurrentLocation(): LocationData | null {
    // Return the best available location
    return this.getBestRecentLocation() || this.currentLocation;
  }

  // Get location with specified accuracy requirements
  async getHighAccuracyLocation(maxAccuracy: number = 20, timeout: number = 30000): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let bestLocation: LocationData | null = null;
      
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000
      };
      
      const checkLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = this.processLocationData(position);
            
            // Keep the best location found so far
            if (!bestLocation || locationData.accuracy < bestLocation.accuracy) {
              bestLocation = locationData;
            }
            
            // If we have the required accuracy, resolve immediately
            if (locationData.accuracy <= maxAccuracy) {
              resolve(locationData);
              return;
            }
            
            // If we've been trying for too long, return the best we have
            if (Date.now() - startTime > timeout) {
              if (bestLocation) {
                resolve(bestLocation);
              } else {
                reject(new Error(`Could not achieve required accuracy of ${maxAccuracy}m within ${timeout}ms`));
              }
              return;
            }
            
            // Try again in 2 seconds
            setTimeout(checkLocation, 2000);
          },
          (error) => {
            if (bestLocation) {
              resolve(bestLocation);
            } else {
              reject(new Error(this.getDetailedErrorMessage(error)));
            }
          },
          options
        )
      };
      
      checkLocation();
    });
  }

  onLocationUpdate(callback: (location: LocationData) => void) {
    this.locationCallbacks.push(callback);
  }

  onLocationError(callback: (error: LocationError) => void) {
    this.errorCallbacks.push(callback);
  }

  private notifyLocationCallbacks(location: LocationData) {
    this.locationCallbacks.forEach(callback => callback(location));
  }

  private notifyErrorCallbacks(error: LocationError) {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  // Get Google Maps URL for current location
  getGoogleMapsUrl(location?: LocationData): string {
    const loc = location || this.currentLocation;
    if (!loc) return '';
    
    return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
  }

  // Get formatted address string
  getLocationString(location?: LocationData): string {
    const loc = location || this.currentLocation;
    if (!loc) return 'Location unavailable';
    
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Find nearest location from a list
  findNearest(locations: Array<{lat: number, lng: number, name: string}>): Array<{lat: number, lng: number, name: string, distance: number}> {
    if (!this.currentLocation) return [];

    return locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(
          this.currentLocation!.latitude,
          this.currentLocation!.longitude,
          location.lat,
          location.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }
}

export const locationService = new LocationService();
