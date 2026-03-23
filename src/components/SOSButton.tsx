import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { locationService } from '../services/locationService';
import { messagingService } from '../services/messagingService';
import { UserData } from './UserSetup';

interface SOSButtonProps {
  userData: UserData | null;
}

const SOSButton: React.FC<SOSButtonProps> = ({ userData }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sendSOSMessage = async () => {
    if (!userData) return;

    const sosMessage = "🚨 SOS EMERGENCY 🚨\n\nI'm in disaster please help me.\n\nThis is an automated emergency alert from Safe Guard app.";
    
    try {
      // Get high accuracy location for emergency
      let currentLocation = locationService.getCurrentLocation();
      
      // Try to get better accuracy for emergency situations
      try {
        console.log('🎯 Getting high accuracy location for SOS...');
        const highAccuracyLocation = await locationService.getHighAccuracyLocation(15, 20000); // 15m accuracy, 20s timeout
        currentLocation = highAccuracyLocation;
        console.log(`✅ High accuracy location obtained: ±${Math.round(currentLocation.accuracy)}m`);
      } catch (error) {
        console.warn('⚠️ Could not get high accuracy location, using current:', error);
        // Use current location as fallback
      }
      
      if (currentLocation && userData.locationPermission) {
        const locationUrl = locationService.getGoogleMapsUrl(currentLocation);
        const locationString = locationService.getLocationString(currentLocation);
        const accuracy = Math.round(currentLocation.accuracy);
        
        // Send SOS with precise location data
        if (userData.emergencyContacts.length > 0) {
          // Send real SOS messages to emergency contacts
          const sosLocation = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy
          };
          
          messagingService.sendLiveLocationToContacts(
            userData.emergencyContacts,
            sosLocation,
            userData.name,
            userData.phoneNumber
          ).then((results) => {
            const contactList = userData.emergencyContacts.map(contact => 
              `${contact.name} (${contact.relationship}): ${contact.phone}`
            ).join('\n');
            
            alert(`🚨 SOS MESSAGES SENT 🚨

✅ Successfully sent to: ${results.success} contacts
❌ Failed to send to: ${results.failed} contacts

SOS Message: "${sosMessage}"

📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

Emergency contacts notified:
${contactList}

💬 Real SOS messages sent via WhatsApp/SMS with your exact location.
🚨 Emergency services (112) should also be contacted immediately.`);
          }).catch((error) => {
            console.error('Error sending SOS messages:', error);
            alert(`🚨 SOS ACTIVATED (FALLBACK) 🚨

❌ Error sending messages: ${error.message}

Message: "${sosMessage}"
📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

⚠️ Please manually contact emergency services at 112
and share your location with emergency contacts.`);
          });
        } else {
          alert(`🚨 SOS ACTIVATED 🚨

Message: "${sosMessage}"
📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

⚠️ No emergency contacts added. 
Please add contacts in settings for automatic SOS messaging.

📞 Call 112 immediately for emergency services.`);
        }
      } else {
        // Try to get location if service doesn't have it
        try {
          const location = await locationService.startLocationTracking();
          const locationUrl = locationService.getGoogleMapsUrl(location);
          const locationString = locationService.getLocationString(location);
          const accuracy = Math.round(location.accuracy);
          
          if (userData.emergencyContacts.length > 0) {
            // Send real SOS messages to emergency contacts
            const sosLocation = {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy
            };
            
            messagingService.sendLiveLocationToContacts(
              userData.emergencyContacts,
              sosLocation,
              userData.name,
              userData.phoneNumber
            ).then((results) => {
              const contactList = userData.emergencyContacts.map(contact => 
                `${contact.name} (${contact.relationship}): ${contact.phone}`
              ).join('\n');
              
              alert(`🚨 SOS MESSAGES SENT 🚨

✅ Successfully sent to: ${results.success} contacts
❌ Failed to send to: ${results.failed} contacts

SOS Message: "${sosMessage}"

📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

Emergency contacts notified:
${contactList}

💬 Real SOS messages sent via WhatsApp/SMS with your exact location.`);
            }).catch((error) => {
              console.error('Error sending SOS messages:', error);
              alert(`🚨 SOS ACTIVATED (FALLBACK) 🚨

❌ Error sending messages: ${error.message}

Message: "${sosMessage}"
📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

⚠️ Please manually contact emergency services at 112.`);
            });
          } else {
            alert(`🚨 SOS ACTIVATED 🚨

Message: "${sosMessage}"
📍 Location: ${locationString}
🎯 Accuracy: ±${accuracy}m
🗺️ Google Maps: ${locationUrl}

⚠️ No emergency contacts added.
📞 Call 112 immediately for emergency services.`);
          }
        } catch {
          // Fallback - send SOS without location
          if (userData.emergencyContacts.length > 0) {
            alert(`🚨 SOS ACTIVATED (NO LOCATION) 🚨

Message: "${sosMessage}"

❌ Location unavailable - please enable location services

⚠️ Emergency contacts: ${userData.emergencyContacts.length} contacts
📞 Call 112 immediately for emergency services.

Please manually share your location with emergency contacts.`);
          } else {
            alert(`🚨 SOS ACTIVATED 🚨

Message: "${sosMessage}"

❌ Location unavailable and no emergency contacts added.
📞 Call 112 immediately for emergency services.

Please complete setup in settings.`);
          }
        }
      }
    } catch (error) {
      // Final fallback
      alert(`🚨 SOS ACTIVATED (ERROR) 🚨

Message: "${sosMessage}"

❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}

📞 CALL 112 IMMEDIATELY for emergency services.

Please manually contact your emergency contacts and share your location.`);
    }
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      sendSOSMessage();
      setIsPressed(false);
    }, 3000);
    setHoldTimer(timer);
  };

  const handleMouseUp = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    setIsPressed(false);
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl border border-red-200 p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center py-4 rounded-xl mb-8 shadow-lg">
          <span className="font-semibold text-lg">🚨 Stay Connected - Stay Safe 🚨</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <button
              className={`relative w-40 h-40 rounded-full text-white font-bold text-3xl transition-all duration-300 shadow-2xl ${
                isPressed 
                  ? 'bg-gradient-to-br from-red-700 to-red-800 scale-90 shadow-3xl' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95'
              }`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              style={{
                boxShadow: isPressed 
                  ? '0 10px 40px rgba(239, 68, 68, 0.6), inset 0 2px 10px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 60px rgba(239, 68, 68, 0.4), 0 10px 30px rgba(239, 68, 68, 0.2)'
              }}
            >
              <span className="relative z-10">SOS</span>
              {isPressed && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-pulse"></div>
                </>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
            </button>
            
            {/* Decorative rings */}
            <div className="absolute inset-0 rounded-full border-2 border-red-300/30 scale-110 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border border-red-200/20 scale-125 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <div className="text-center max-w-sm">
            <p className="text-gray-700 font-medium mb-2">Emergency SOS</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Press and hold for 3 seconds to activate SOS. This will send "I'm in disaster please help me" with your location to emergency contacts.
            </p>
            
            {userData && userData.emergencyContacts.length > 0 && (
              <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{userData.emergencyContacts.length} emergency contact{userData.emergencyContacts.length !== 1 ? 's' : ''} will be notified</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSButton;
