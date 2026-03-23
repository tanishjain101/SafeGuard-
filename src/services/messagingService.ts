import { locationService } from './locationService';

interface MessageData {
  to: string;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class MessagingService {
  private readonly WHATSAPP_API_URL = 'https://api.whatsapp.com/send';
  
  // Send SMS via Web Share API or fallback methods
  async sendLocationSMS(phoneNumber: string, message: string, location?: { latitude: number; longitude: number }): Promise<MessageResponse> {
    try {
      // Method 1: Try Web Share API (works on mobile devices)
      if (navigator.share && this.isMobileDevice()) {
        const shareData = {
          title: '🚨 Emergency Location Share',
          text: message,
          url: location ? `https://maps.google.com/maps?q=${location.latitude},${location.longitude}` : undefined
        };
        
        await navigator.share(shareData);
        return { success: true, messageId: 'shared_via_web_share' };
      }
      
      // Method 2: WhatsApp Web API (most reliable for Indian users)
      if (this.isWhatsAppAvailable()) {
        const whatsappMessage = encodeURIComponent(message);
        const whatsappUrl = `${this.WHATSAPP_API_URL}?phone=91${phoneNumber.replace(/\D/g, '').slice(-10)}&text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
        return { success: true, messageId: 'sent_via_whatsapp' };
      }
      
      // Method 3: SMS URI scheme (works on most mobile devices)
      if (this.isMobileDevice()) {
        const smsUri = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUri;
        return { success: true, messageId: 'sent_via_sms_uri' };
      }
      
      // Method 4: Copy to clipboard as fallback
      await this.copyToClipboard(message);
      return { success: true, messageId: 'copied_to_clipboard' };
      
    } catch (error) {
      console.error('Error sending location message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Send live location updates to multiple contacts
  async sendLiveLocationToContacts(
    contacts: Array<{ name: string; phone: string; relationship: string }>,
    location: { latitude: number; longitude: number; accuracy: number },
    userName: string,
    userPhone: string
  ): Promise<{ success: number; failed: number; results: MessageResponse[] }> {
    const results: MessageResponse[] = [];
    let success = 0;
    let failed = 0;
    
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    const locationUrl = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    for (const contact of contacts) {
      const message = `🚨 EMERGENCY LIVE LOCATION 🚨

From: ${userName}
Phone: ${userPhone}

LIVE LOCATION:
📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
🎯 Accuracy: ±${Math.round(location.accuracy)}m

🗺️ Google Maps: ${locationUrl}

⚠️ THIS IS AN EMERGENCY LOCATION SHARE ⚠️
Please respond immediately if assistance is needed.

🕐 Time: ${timestamp}
📱 Sent via Safe Guard Emergency App

📍 Location is being shared in real-time for emergency response.`;

      try {
        const result = await this.sendLocationSMS(contact.phone, message, location);
        results.push(result);
        
        if (result.success) {
          success++;
          console.log(`✅ Live location sent to ${contact.name} (${contact.phone})`);
        } else {
          failed++;
          console.error(`❌ Failed to send to ${contact.name}: ${result.error}`);
        }
        
        // Small delay between messages to avoid rate limiting
        await this.delay(500);
        
      } catch (error) {
        failed++;
        const errorResult = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        results.push(errorResult);
        console.error(`❌ Error sending to ${contact.name}:`, error);
      }
    }
    
    return { success, failed, results };
  }
  
  // Start continuous live location sharing
  startLiveLocationSharing(
    contacts: Array<{ name: string; phone: string; relationship: string }>,
    userName: string,
    userPhone: string,
    intervalMinutes: number = 2
  ): { stopSharing: () => void } {
    let isSharing = true;
    let updateCount = 0;
    const maxUpdates = 15; // Stop after 30 minutes (15 updates × 2 minutes)
    
    const shareLocation = async () => {
      if (!isSharing || updateCount >= maxUpdates) {
        console.log('🛑 Live location sharing stopped');
        return;
      }
      
      try {
        // Get high accuracy location for live sharing
        console.log(`🔄 Live location update #${updateCount} - Getting high accuracy location...`);
        const locationData = await locationService.getHighAccuracyLocation(20, 10000); // 20m accuracy, 10s timeout
        
        const location = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy
        };
        
        console.log(`📍 High accuracy location for update #${updateCount}: ±${Math.round(location.accuracy)}m`);
        
        updateCount++;
        
        // Send to all contacts
        const results = await this.sendLiveLocationToContacts(contacts, location, userName, userPhone);
        
        console.log(`📊 Update #${updateCount}: ${results.success} sent, ${results.failed} failed`);
        
        // Schedule next update
        if (isSharing && updateCount < maxUpdates) {
          setTimeout(shareLocation, intervalMinutes * 60 * 1000);
        }
        
      } catch (error) {
        console.error('❌ Error in live location sharing:', error);
        // Try again in next interval
        if (isSharing && updateCount < maxUpdates) {
          setTimeout(shareLocation, intervalMinutes * 60 * 1000);
        }
      }
    };
    
    // Start sharing immediately
    shareLocation();
    
    return {
      stopSharing: () => {
        isSharing = false;
        console.log('🛑 Live location sharing stopped manually');
      }
    };
  }
  
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  private isWhatsAppAvailable(): boolean {
    // WhatsApp Web is available on most devices
    return true;
  }
  
  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Format phone number for Indian standards
  formatIndianPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('91') && digits.length === 12) {
      return `+91 ${digits.slice(2)}`;
    } else if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return `+91 ${digits}`;
    }
    
    return phone; // Return original if can't format
  }
  
  // Validate Indian phone number
  isValidIndianPhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return true;
    }
    
    if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]/.test(digits)) {
      return true;
    }
    
    return false;
  }
}

export const messagingService = new MessagingService();
export type { MessageData, MessageResponse };
