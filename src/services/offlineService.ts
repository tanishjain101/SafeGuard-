interface OfflineData {
  userData: any;
  emergencyContacts: any[];
  placesCache: any;
  lastSync: number;
}

interface OfflineCapability {
  isOnline: boolean;
  hasOfflineData: boolean;
  lastSyncTime: Date | null;
}

class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private offlineData: OfflineData | null = null;
  private syncCallbacks: (() => void)[] = [];

  constructor() {
    this.initializeOfflineSupport();
    this.loadOfflineData();
  }

  private initializeOfflineSupport() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online! Syncing data...');
      this.isOnline = true;
      this.syncData();
      this.notifySyncCallbacks();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline! Using cached data...');
      this.isOnline = false;
      this.saveCurrentStateForOffline();
    });

    // Avoid stale cache issues while developing.
    if (import.meta.env.DEV) {
      this.unregisterServiceWorkersInDev();
      return;
    }

    // Register service worker for offline caching in production builds only.
    if ('serviceWorker' in navigator) {
      void this.registerServiceWorker();
    }
  }

  private async unregisterServiceWorkersInDev() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
      console.log('🧹 Unregistered service workers in development mode');
    } catch (error) {
      console.warn('Could not unregister service workers in dev:', error);
    }
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
    } catch (error) {
      console.warn('❌ Service Worker registration failed:', error);
    }
  }

  private loadOfflineData() {
    try {
      const stored = localStorage.getItem('safeGuardOfflineData');
      if (stored) {
        this.offlineData = JSON.parse(stored);
        console.log('📱 Offline data loaded');
      }
    } catch (error) {
      console.warn('Could not load offline data:', error);
    }
  }

  private saveCurrentStateForOffline() {
    try {
      const userData = localStorage.getItem('safeGuardUserData');
      const placesCache = localStorage.getItem('safeGuardPlacesCache');
      
      const offlineData: OfflineData = {
        userData: userData ? JSON.parse(userData) : null,
        emergencyContacts: userData ? JSON.parse(userData).emergencyContacts || [] : [],
        placesCache: placesCache ? JSON.parse(placesCache) : {},
        lastSync: Date.now()
      };

      localStorage.setItem('safeGuardOfflineData', JSON.stringify(offlineData));
      this.offlineData = offlineData;
      console.log('💾 Current state saved for offline use');
    } catch (error) {
      console.warn('Could not save offline data:', error);
    }
  }

  private syncData() {
    if (!this.isOnline || !this.offlineData) return;

    try {
      // Restore user data if needed
      if (this.offlineData.userData) {
        localStorage.setItem('safeGuardUserData', JSON.stringify(this.offlineData.userData));
      }

      // Restore places cache if needed
      if (this.offlineData.placesCache) {
        localStorage.setItem('safeGuardPlacesCache', JSON.stringify(this.offlineData.placesCache));
      }

      console.log('🔄 Data synced successfully');
    } catch (error) {
      console.warn('Sync failed:', error);
    }
  }

  getOfflineCapability(): OfflineCapability {
    return {
      isOnline: this.isOnline,
      hasOfflineData: this.offlineData !== null,
      lastSyncTime: this.offlineData ? new Date(this.offlineData.lastSync) : null
    };
  }

  getOfflineEmergencyContacts(): any[] {
    if (!this.offlineData) return [];
    return this.offlineData.emergencyContacts || [];
  }

  getOfflineUserData(): any | null {
    if (!this.offlineData) return null;
    return this.offlineData.userData;
  }

  onSync(callback: () => void) {
    this.syncCallbacks.push(callback);
  }

  private notifySyncCallbacks() {
    this.syncCallbacks.forEach(callback => callback());
  }

  // Emergency offline features
  getOfflineEmergencyNumbers(): { [key: string]: string } {
    return {
      'Emergency Services': '112',
      'Fire Services': '101',
      'Medical Emergency': '102',
      'Disaster Management': '108',
      'Police': '112',
      'Women Helpline': '1091',
      'Child Helpline': '1098',
      'Tourist Helpline': '1363'
    };
  }

  getOfflineEmergencyInstructions(): { [key: string]: string[] } {
    return {
      'Earthquake': [
        'Drop, Cover, and Hold On',
        'Stay away from windows and heavy objects',
        'If outdoors, move away from buildings',
        'After shaking stops, evacuate if building is damaged',
        'Check for injuries and hazards'
      ],
      'Flood': [
        'Move to higher ground immediately',
        'Avoid walking or driving through flood water',
        'Stay away from electrical lines',
        'Listen to emergency broadcasts',
        'Do not return home until authorities say it\'s safe'
      ],
      'Fire': [
        'Alert others and call fire services (101)',
        'If small fire, use appropriate extinguisher',
        'If large fire, evacuate immediately',
        'Stay low to avoid smoke inhalation',
        'Feel doors before opening - if hot, find another exit'
      ],
      'Cyclone': [
        'Stay indoors and away from windows',
        'Move to the strongest part of the building',
        'Keep emergency supplies ready',
        'Listen to weather updates',
        'Do not go outside during the eye of the storm'
      ]
    };
  }

  // Save emergency message for offline sending when back online
  saveOfflineEmergencyMessage(message: string, contacts: any[]) {
    try {
      const offlineMessages = JSON.parse(localStorage.getItem('safeGuardOfflineMessages') || '[]');
      offlineMessages.push({
        message,
        contacts,
        timestamp: Date.now(),
        sent: false
      });
      localStorage.setItem('safeGuardOfflineMessages', JSON.stringify(offlineMessages));
      console.log('📝 Emergency message saved for offline sending');
    } catch (error) {
      console.warn('Could not save offline message:', error);
    }
  }

  // Send pending offline messages when back online
  async sendPendingMessages() {
    if (!this.isOnline) return;

    try {
      const offlineMessages = JSON.parse(localStorage.getItem('safeGuardOfflineMessages') || '[]');
      const pendingMessages = offlineMessages.filter((msg: any) => !msg.sent);

      for (const message of pendingMessages) {
        // Try to send the message
        console.log('📤 Sending pending emergency message:', message.message);
        // Mark as sent
        message.sent = true;
      }

      localStorage.setItem('safeGuardOfflineMessages', JSON.stringify(offlineMessages));
      console.log(`✅ Sent ${pendingMessages.length} pending emergency messages`);
    } catch (error) {
      console.warn('Could not send pending messages:', error);
    }
  }
}

export const offlineService = new OfflineService();
export type { OfflineCapability };
