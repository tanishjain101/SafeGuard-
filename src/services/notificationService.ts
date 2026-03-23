import { weatherService } from './weatherService';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'weather' | 'alert' | 'reminder' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  data?: any;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private notificationCallbacks: ((notification: NotificationData) => void)[] = [];
  private weatherNotificationInterval: NodeJS.Timeout | null = null;
  private alertCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadNotifications();
    this.requestNotificationPermission();
    this.startWeatherNotifications();
    this.startAlertMonitoring();
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async showBrowserNotification(notification: NotificationData) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/vite.svg', // App icon
        badge: '/vite.svg',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low'
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        this.markAsRead(notification.id);
      };

      // Auto-close after 10 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  async sendNotification(
    title: string,
    body: string,
    type: NotificationData['type'] = 'reminder',
    priority: NotificationData['priority'] = 'normal',
    data?: any
  ): Promise<string> {
    const notification: NotificationData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      body,
      type,
      priority,
      timestamp: new Date().toISOString(),
      read: false,
      data
    };

    this.notifications.unshift(notification);
    this.saveNotifications();

    // Show browser notification
    await this.showBrowserNotification(notification);

    // Notify callbacks
    this.notificationCallbacks.forEach(callback => callback(notification));

    return notification.id;
  }

  private startWeatherNotifications() {
    // Send weather notifications 3 times a day: 8 AM, 2 PM, 8 PM
    const scheduleWeatherNotifications = () => {
      const now = new Date();
      const scheduleTimes = [8, 14, 20]; // 8 AM, 2 PM, 8 PM
      
      scheduleTimes.forEach(hour => {
        const scheduleTime = new Date();
        scheduleTime.setHours(hour, 0, 0, 0);
        
        // If the time has passed today, schedule for tomorrow
        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }
        
        const timeUntilNotification = scheduleTime.getTime() - now.getTime();
        
        setTimeout(async () => {
          await this.sendWeatherNotification();
          
          // Schedule the next notification for the same time tomorrow
          setInterval(async () => {
            await this.sendWeatherNotification();
          }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilNotification);
      });
    };

    scheduleWeatherNotifications();
  }

  private async sendWeatherNotification() {
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const weather = await weatherService.getCurrentWeather(latitude, longitude);
      
      const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 
                       new Date().getHours() < 17 ? 'Afternoon' : 'Evening';
      
      const title = `${timeOfDay} Weather Update`;
      const body = `${weather.condition} ${weather.temperature.toFixed(0)}°C. ` +
                   `Humidity: ${weather.humidity.toFixed(0)}%. ` +
                   (weather.alerts.length > 0 ? `⚠️ ${weather.alerts.length} weather alert(s)` : 'No alerts');

      await this.sendNotification(title, body, 'weather', 'normal', { weather });
    } catch (error) {
      console.error('Failed to send weather notification:', error);
      
      // Send fallback notification
      const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 
                       new Date().getHours() < 17 ? 'Afternoon' : 'Evening';
      
      await this.sendNotification(
        `${timeOfDay} Weather Update`,
        'Unable to fetch current weather. Please check the app for updates.',
        'weather',
        'low'
      );
    }
  }

  private startAlertMonitoring() {
    // Check for severe weather alerts every 30 minutes
    this.alertCheckInterval = setInterval(async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 10 * 60 * 1000 // 10 minutes
          });
        });

        const { latitude, longitude } = position.coords;
        const alerts = await weatherService.getWeatherAlerts(latitude, longitude);
        
        // Send notifications for new severe alerts
        alerts.forEach(async (alert) => {
          const existingNotification = this.notifications.find(
            n => n.data?.alertId === alert.id
          );
          
          if (!existingNotification && (alert.severity === 'severe' || alert.severity === 'extreme')) {
            await this.sendNotification(
              `🚨 ${alert.title}`,
              alert.description,
              'alert',
              'urgent',
              { alertId: alert.id, alert }
            );
          }
        });
      } catch (error) {
        console.error('Failed to check weather alerts:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  onNotification(callback: (notification: NotificationData) => void) {
    this.notificationCallbacks.push(callback);
  }

  private saveNotifications() {
    try {
      // Keep only last 100 notifications
      const notificationsToSave = this.notifications.slice(0, 100);
      localStorage.setItem('safeGuardNotifications', JSON.stringify(notificationsToSave));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem('safeGuardNotifications');
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Send emergency alert notification
  async sendEmergencyAlert(title: string, message: string, data?: any) {
    await this.sendNotification(title, message, 'emergency', 'urgent', data);
  }

  // Send reminder notification
  async sendReminder(title: string, message: string, data?: any) {
    await this.sendNotification(title, message, 'reminder', 'normal', data);
  }

  // Cleanup intervals
  destroy() {
    if (this.weatherNotificationInterval) {
      clearInterval(this.weatherNotificationInterval);
    }
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
  }
}

export const notificationService = new NotificationService();
export type { NotificationData };
