import React from 'react';
import { 
  Phone, 
  MapPin, 
  Shield, 
  Flashlight, 
  Radio, 
  Camera, 
  Heart, 
  FileText,
  WifiOff
} from 'lucide-react';
import { locationService } from '../services/locationService';
import { messagingService } from '../services/messagingService';
import { offlineService } from '../services/offlineService';
import type { EmergencyContact, UserData } from './UserSetup';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  action: () => void;
}

interface EmergencyActionsProps {
  userData: UserData | null;
  theme?: 'light' | 'dark';
}

const EmergencyActions: React.FC<EmergencyActionsProps> = ({ userData, theme = 'light' }) => {
  const [isFlashlightOn, setIsFlashlightOn] = React.useState(false);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

  // Cleanup media stream on unmount
  React.useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const actionItems: ActionItem[] = [
    {
      id: 'emergency-call',
      title: 'Emergency Call',
      subtitle: '112 / National Emergency',
      icon: <Phone className="h-6 w-6" />,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      action: () => {
        const offlineCapability = offlineService.getOfflineCapability();
        
        if (!offlineCapability.isOnline) {
          const emergencyNumbers = offlineService.getOfflineEmergencyNumbers();
          let numbersText = '📞 EMERGENCY NUMBERS (OFFLINE MODE)\n\n';
          Object.entries(emergencyNumbers).forEach(([service, number]) => {
            numbersText += `${service}: ${number}\n`;
          });
          numbersText += '\n⚠️ You are currently offline. These numbers can be dialed directly from your phone.';
          alert(numbersText);
        } else {
          if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
            window.location.href = 'tel:112';
          } else {
            alert(`📞 EMERGENCY CALL: 112\n\nCaller: ${userData?.name || 'Unknown'}\nPhone: ${userData?.phoneNumber || 'Not provided'}\n\n⚠️ In a real emergency, dial 112 directly from your phone.`);
          }
        }
      }
    },
    {
      id: 'share-location',
      title: 'Share Location',
      subtitle: 'Send GPS coordinates',
      icon: <MapPin className="h-6 w-6" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => {
        const offlineCapability = offlineService.getOfflineCapability();
        
        if (!offlineCapability.isOnline) {
          const offlineContacts = offlineService.getOfflineEmergencyContacts();
          if (offlineContacts.length > 0) {
            const contactList = offlineContacts.map(contact => 
              `${contact.name} (${contact.relationship}): ${contact.phone}`
            ).join('\n');
            
            const message = `🚨 EMERGENCY LOCATION SHARE (OFFLINE)\n\nI need help! I'm currently offline but will share my location as soon as I'm back online.\n\nFrom: ${userData?.name || 'Emergency Contact'}\nPhone: ${userData?.phoneNumber || 'Not provided'}\n\nThis message will be sent automatically when connection is restored.`;
            
            offlineService.saveOfflineEmergencyMessage(message, offlineContacts);
            
            alert(`📴 OFFLINE MODE - LOCATION SHARE QUEUED\n\nYour emergency location message has been saved and will be sent automatically when you're back online.\n\nEmergency contacts to notify:\n${contactList}\n\n💡 Try to get to an area with better signal or WiFi connection.`);
          } else {
            alert(`📴 OFFLINE MODE\n\nNo emergency contacts found. Please add contacts when back online.\n\n📞 Call emergency services directly: 112`);
          }
          return;
        }

        let currentLocation = locationService.getCurrentLocation();
        
        if (currentLocation && userData?.locationPermission) {
          
          // Get emergency contacts from localStorage for real-time data
          const savedUserData = localStorage.getItem('safeGuardUserData');
          let emergencyContacts: EmergencyContact[] = [];
          
          if (savedUserData) {
            try {
              const parsedData = JSON.parse(savedUserData);
              emergencyContacts = parsedData.emergencyContacts || userData?.emergencyContacts || [];
            } catch (error) {
              console.error('Error loading emergency contacts:', error);
              emergencyContacts = userData?.emergencyContacts || [];
            }
          } else {
            emergencyContacts = userData?.emergencyContacts || [];
          }
          
          console.log('Emergency contacts found:', emergencyContacts);
          
          // Send actual live location messages to emergency contacts
          if (emergencyContacts.length > 0) {
            // Send real live location messages
            messagingService.sendLiveLocationToContacts(
              emergencyContacts,
              currentLocation,
              userData?.name || 'Emergency Contact',
              userData?.phoneNumber || 'Not provided'
            ).then((results) => {
              const contactList = emergencyContacts.map(contact => 
                `${contact.name} (${contact.relationship}): ${contact.phone}`
              ).join('\n');
              
              alert(`📱 LIVE LOCATION MESSAGES SENT 📱

✅ Successfully sent to: ${results.success} contacts
❌ Failed to send to: ${results.failed} contacts

Emergency contacts notified:
${contactList}

📍 Location: ${locationService.getLocationString(currentLocation)}
🎯 Accuracy: ±${Math.round(currentLocation.accuracy)}m
🗺️ Google Maps: ${locationService.getGoogleMapsUrl(currentLocation)}

🔄 CONTINUOUS LIVE SHARING STARTED
Your location will be shared every 2 minutes for the next 30 minutes.

💬 Messages sent via WhatsApp/SMS to each contact with live location data.`);
              
              // Start continuous live location sharing
              const liveSharing = messagingService.startLiveLocationSharing(
                emergencyContacts,
                userData?.name || 'Emergency Contact',
                userData?.phoneNumber || 'Not provided',
                2 // Update every 2 minutes
              );
              
              // Store the stop function globally so user can stop if needed
              (window as Window & { stopLiveSharing?: () => void }).stopLiveSharing = liveSharing.stopSharing;
              
              console.log('🚀 Live location sharing started - updates every 2 minutes');
              console.log('💡 To stop sharing manually, run: window.stopLiveSharing()');
            }).catch((error) => {
              console.error('Error sending live location:', error);
              alert(`❌ Error sending live location messages: ${error.message}\n\nPlease check your internet connection and try again.`);
            });
          } else {
            alert(`⚠️ NO EMERGENCY CONTACTS FOUND ⚠️

Please add emergency contacts in Settings → Contacts to enable live location sharing.

📍 Current Location: ${locationService.getLocationString(currentLocation)}
🎯 Accuracy: ±${Math.round(currentLocation.accuracy)}m
🗺️ Google Maps: ${locationService.getGoogleMapsUrl(currentLocation)}

Add contacts first, then use Share Location to send real messages with your live location.`);
          }
        } else {
          // Try to get fresh location
          locationService.startLocationTracking()
            .then((location) => {
              
              // Get emergency contacts from localStorage for real-time data
              const savedUserData = localStorage.getItem('safeGuardUserData');
              let emergencyContacts: EmergencyContact[] = [];
              
              if (savedUserData) {
                try {
                  const parsedData = JSON.parse(savedUserData);
                  emergencyContacts = parsedData.emergencyContacts || userData?.emergencyContacts || [];
                } catch (error) {
                  console.error('Error loading emergency contacts:', error);
                  emergencyContacts = userData?.emergencyContacts || [];
                }
              } else {
                emergencyContacts = userData?.emergencyContacts || [];
              }
              
              console.log('Emergency contacts found (fallback):', emergencyContacts);
              
              // Send actual live location messages to emergency contacts
              if (emergencyContacts.length > 0) {
                // Send real live location messages
                messagingService.sendLiveLocationToContacts(
                  emergencyContacts,
                  location,
                  userData?.name || 'Emergency Contact',
                  userData?.phoneNumber || 'Not provided'
                ).then((results) => {
                  const contactList = emergencyContacts.map(contact => 
                    `${contact.name} (${contact.relationship}): ${contact.phone}`
                  ).join('\n');
                  
                  alert(`📱 LIVE LOCATION MESSAGES SENT 📱

✅ Successfully sent to: ${results.success} contacts
❌ Failed to send to: ${results.failed} contacts

Emergency contacts notified:
${contactList}

📍 Location: ${locationService.getLocationString(location)}
🎯 Accuracy: ±${Math.round(location.accuracy)}m
🗺️ Google Maps: ${locationService.getGoogleMapsUrl(location)}

🔄 CONTINUOUS LIVE SHARING STARTED
Your location will be shared every 2 minutes for the next 30 minutes.

💬 Messages sent via WhatsApp/SMS to each contact with live location data.`);
                  
                  // Start continuous live location sharing
                  const liveSharing = messagingService.startLiveLocationSharing(
                    emergencyContacts,
                    userData?.name || 'Emergency Contact',
                    userData?.phoneNumber || 'Not provided',
                    2 // Update every 2 minutes
                  );
                  
                  // Store the stop function globally so user can stop if needed
                  (window as Window & { stopLiveSharing?: () => void }).stopLiveSharing = liveSharing.stopSharing;
                  
                  console.log('🚀 Live location sharing started - updates every 2 minutes');
                  console.log('💡 To stop sharing manually, run: window.stopLiveSharing()');
                }).catch((error) => {
                  console.error('Error sending live location:', error);
                  alert(`❌ Error sending live location messages: ${error.message}\n\nPlease check your internet connection and try again.`);
                });
              } else {
                alert(`⚠️ NO EMERGENCY CONTACTS FOUND ⚠️

Please add emergency contacts in Settings → Contacts to enable live location sharing.

📍 Current Location: ${locationService.getLocationString(location)}
🎯 Accuracy: ±${Math.round(location.accuracy)}m
🗺️ Google Maps: ${locationService.getGoogleMapsUrl(location)}

Add contacts first, then use Share Location to send real messages with your live location.`);
              }
            })
            .catch(() => {
              alert(`❌ LOCATION ACCESS DENIED ❌

Cannot share live location without location permissions.

To enable:
1. Go to Settings → Location Permissions
2. Click "Request Location Permission"
3. Allow location access in browser
4. Try Share Location again

Live location sharing requires GPS access to send real-time coordinates to your emergency contacts.`);
            });
        }
      }
    },
    {
      id: 'safety-checklist',
      title: 'Safety Checklist',
      subtitle: 'Disaster planning guide',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => {
        const offlineCapability = offlineService.getOfflineCapability();
        
        if (!offlineCapability.isOnline) {
          const instructions = offlineService.getOfflineEmergencyInstructions();
          let instructionsText = '📋 OFFLINE EMERGENCY INSTRUCTIONS\n\n';
          Object.entries(instructions).forEach(([disaster, steps]) => {
            instructionsText += `🚨 ${disaster.toUpperCase()}:\n`;
            steps.forEach((step, index) => {
              instructionsText += `${index + 1}. ${step}\n`;
            });
            instructionsText += '\n';
          });
          alert(instructionsText);
          return;
        }

        // Scroll to disaster planning section
        const disasterPlanningElement = document.querySelector('[data-component="disaster-planning"]');
        if (disasterPlanningElement) {
          disasterPlanningElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert('📋 DISASTER PLANNING GUIDE 📋\n\nScroll down to view the comprehensive disaster planning section with:\n\n• Before, During & After disaster guidelines\n• Emergency supply checklists\n• Risk mitigation strategies\n• Indian emergency resources\n\nThis helps you prepare for earthquakes, floods, cyclones, and other disasters common in India.');
        }
      }
    },
    {
      id: 'flashlight',
      title: 'Flashlight',
      subtitle: 'Emergency lighting',
      icon: <Flashlight className="h-6 w-6" />,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      action: async () => {
        try {
          if (!isFlashlightOn) {
            // Turn on flashlight
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' }
            });
            
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
            
            if (capabilities.torch) {
              await track.applyConstraints({
                advanced: [{ torch: true } as any]
              });
              setMediaStream(stream);
              setIsFlashlightOn(true);
              alert('🔦 Flashlight turned ON\n\nClick again to turn off.\n\n⚠️ This uses your device camera flash. Battery usage may increase.');
            } else {
              // Fallback: Create bright white screen
              document.body.style.backgroundColor = 'white';
              document.body.style.filter = 'brightness(2)';
              setIsFlashlightOn(true);
              alert('💡 Screen flashlight activated!\n\nYour screen is now at maximum brightness to provide light.\n\nClick again to turn off.');
            }
          } else {
            // Turn off flashlight
            if (mediaStream) {
              const track = mediaStream.getVideoTracks()[0];
              const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
              if (capabilities.torch) {
                await track.applyConstraints({
                  advanced: [{ torch: false } as any]
                });
              }
              mediaStream.getTracks().forEach(track => track.stop());
              setMediaStream(null);
            }
            
            // Reset screen brightness
            document.body.style.backgroundColor = '';
            document.body.style.filter = '';
            setIsFlashlightOn(false);
            alert('🔦 Flashlight turned OFF');
          }
        } catch (error) {
          console.error('Flashlight error:', error);
          // Fallback to screen flashlight
          if (!isFlashlightOn) {
            document.body.style.backgroundColor = 'white';
            document.body.style.filter = 'brightness(2)';
            setIsFlashlightOn(true);
            alert('💡 Screen flashlight activated!\n\nCamera flash not available, using screen brightness instead.\n\nClick again to turn off.');
          } else {
            document.body.style.backgroundColor = '';
            document.body.style.filter = '';
            setIsFlashlightOn(false);
            alert('💡 Screen flashlight turned OFF');
          }
        }
      }
    },
    {
      id: 'emergency-radio',
      title: 'Emergency Radio',
      subtitle: 'Weather & alerts',
      icon: <Radio className="h-6 w-6" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => {
        const radioStations = [
          { name: 'All India Radio News', url: 'https://air.gov.in/live-streaming' },
          { name: 'DD News Live', url: 'https://www.ddinews.gov.in/live-tv' },
          { name: 'Emergency Broadcast System', url: 'https://ndma.gov.in/' },
          { name: 'Weather Updates', url: 'https://mausam.imd.gov.in/' }
        ];
        
        let radioText = '📻 EMERGENCY RADIO STATIONS\n\n';
        radioStations.forEach((station, index) => {
          radioText += `${index + 1}. ${station.name}\n   ${station.url}\n\n`;
        });
        radioText += '📡 Click on any link to access emergency broadcasts and weather updates.\n\n⚠️ These stations provide official emergency information and weather alerts.';
        
        alert(radioText);
        
        // Open the first radio station
        window.open(radioStations[0].url, '_blank');
      }
    },
    {
      id: 'document-scene',
      title: 'Document Scene',
      subtitle: 'Photo evidence',
      icon: <Camera className="h-6 w-6" />,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      action: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false 
          });
          
          // Create a video element to show camera feed
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.style.position = 'fixed';
          video.style.top = '0';
          video.style.left = '0';
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
          video.style.zIndex = '9999';
          video.style.backgroundColor = 'black';
          
          // Create capture button
          const captureBtn = document.createElement('button');
          captureBtn.innerHTML = '📸 Capture';
          captureBtn.style.position = 'fixed';
          captureBtn.style.bottom = '20px';
          captureBtn.style.left = '50%';
          captureBtn.style.transform = 'translateX(-50%)';
          captureBtn.style.padding = '15px 30px';
          captureBtn.style.fontSize = '18px';
          captureBtn.style.backgroundColor = '#3B82F6';
          captureBtn.style.color = 'white';
          captureBtn.style.border = 'none';
          captureBtn.style.borderRadius = '25px';
          captureBtn.style.zIndex = '10000';
          captureBtn.style.cursor = 'pointer';
          
          // Create close button
          const closeBtn = document.createElement('button');
          closeBtn.innerHTML = '✕ Close';
          closeBtn.style.position = 'fixed';
          closeBtn.style.top = '20px';
          closeBtn.style.right = '20px';
          closeBtn.style.padding = '10px 20px';
          closeBtn.style.fontSize = '16px';
          closeBtn.style.backgroundColor = '#EF4444';
          closeBtn.style.color = 'white';
          closeBtn.style.border = 'none';
          closeBtn.style.borderRadius = '20px';
          closeBtn.style.zIndex = '10000';
          closeBtn.style.cursor = 'pointer';
          
          document.body.appendChild(video);
          document.body.appendChild(captureBtn);
          document.body.appendChild(closeBtn);
          
          // Capture functionality
          captureBtn.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `emergency-documentation-${Date.now()}.jpg`;
                a.click();
                URL.revokeObjectURL(url);
                alert('📸 Photo captured and saved!\n\nThe emergency documentation photo has been downloaded to your device.');
              }
            }, 'image/jpeg', 0.9);
          };
          
          // Close functionality
          const cleanup = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(video);
            document.body.removeChild(captureBtn);
            document.body.removeChild(closeBtn);
          };
          
          closeBtn.onclick = cleanup;
          
          // Auto-close after 5 minutes
          setTimeout(() => {
            if (document.body.contains(video)) {
              cleanup();
              alert('📸 Camera closed automatically after 5 minutes to save battery.');
            }
          }, 5 * 60 * 1000);
          
        } catch (error) {
          console.error('Camera error:', error);
          alert('📸 Camera not available\n\nUnable to access camera for documentation.\n\nPossible reasons:\n• Camera permission denied\n• Camera in use by another app\n• Device doesn\'t have a camera\n\nTry:\n• Refresh page and allow camera access\n• Close other apps using camera\n• Use your phone\'s built-in camera app');
        }
      }
    },
    {
      id: 'medical-info',
      title: 'Medical Info',
      subtitle: 'Health conditions',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      action: () => {
        const medicalInfo = localStorage.getItem('safeGuardMedicalInfo');
        
        if (medicalInfo) {
          const info = JSON.parse(medicalInfo);
          let infoText = '🏥 MEDICAL INFORMATION\n\n';
          infoText += `Name: ${info.name || 'Not provided'}\n`;
          infoText += `Blood Type: ${info.bloodType || 'Not provided'}\n`;
          infoText += `Allergies: ${info.allergies || 'None listed'}\n`;
          infoText += `Medications: ${info.medications || 'None listed'}\n`;
          infoText += `Medical Conditions: ${info.conditions || 'None listed'}\n`;
          infoText += `Emergency Contact: ${info.emergencyContact || 'Not provided'}\n`;
          infoText += `Doctor: ${info.doctor || 'Not provided'}\n\n`;
          infoText += '📝 To update this information, click "Edit Medical Info" below.';
          
          if (confirm(infoText + '\n\nWould you like to edit this information?')) {
            // Show medical info form
            showMedicalInfoForm(info);
          }
        } else {
          if (confirm('🏥 No medical information found.\n\nWould you like to add your medical information for emergency situations?')) {
            showMedicalInfoForm({});
          }
        }
      }
    },
    {
      id: 'report-incident',
      title: 'Report Incident',
      subtitle: 'Submit emergency report',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => {
        const currentLocation = locationService.getCurrentLocation();
        const timestamp = new Date().toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'medium'
        });
        
        const incidentType = prompt(`🚨 INCIDENT REPORT FORM\n\nSelect incident type:\n\n1. Medical Emergency\n2. Fire\n3. Accident\n4. Natural Disaster\n5. Crime/Security\n6. Infrastructure Failure\n7. Other\n\nEnter number (1-7):`);
        
        if (!incidentType || !['1','2','3','4','5','6','7'].includes(incidentType)) {
          alert('❌ Invalid selection. Please try again.');
          return;
        }
        
        const incidentTypes = {
          '1': 'Medical Emergency',
          '2': 'Fire',
          '3': 'Accident',
          '4': 'Natural Disaster',
          '5': 'Crime/Security',
          '6': 'Infrastructure Failure',
          '7': 'Other'
        };
        
        const description = prompt(`📝 Describe the incident:\n\nIncident Type: ${incidentTypes[incidentType as keyof typeof incidentTypes]}\n\nPlease provide details:`);
        
        if (!description) {
          alert('❌ Description is required for incident report.');
          return;
        }
        
        const severity = prompt(`⚠️ Incident Severity:\n\n1. Low (Minor issue)\n2. Medium (Requires attention)\n3. High (Urgent response needed)\n4. Critical (Life-threatening)\n\nEnter number (1-4):`);
        
        if (!severity || !['1','2','3','4'].includes(severity)) {
          alert('❌ Invalid severity selection. Please try again.');
          return;
        }
        
        const severityLevels = {
          '1': 'Low',
          '2': 'Medium', 
          '3': 'High',
          '4': 'Critical'
        };
        
        // Create incident report
        const report = {
          id: Date.now().toString(),
          timestamp: timestamp,
          type: incidentTypes[incidentType as keyof typeof incidentTypes],
          severity: severityLevels[severity as keyof typeof severityLevels],
          description: description,
          location: currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
            address: locationService.getLocationString(currentLocation)
          } : null,
          reporter: {
            name: userData?.name || 'Anonymous',
            phone: userData?.phoneNumber || 'Not provided'
          },
          status: 'Submitted'
        };
        
        // Save report locally
        const existingReports = JSON.parse(localStorage.getItem('safeGuardIncidentReports') || '[]');
        existingReports.push(report);
        localStorage.setItem('safeGuardIncidentReports', JSON.stringify(existingReports));
        
        // Show confirmation
        let confirmationText = `✅ INCIDENT REPORT SUBMITTED\n\n`;
        confirmationText += `Report ID: ${report.id}\n`;
        confirmationText += `Type: ${report.type}\n`;
        confirmationText += `Severity: ${report.severity}\n`;
        confirmationText += `Time: ${report.timestamp}\n`;
        if (report.location) {
          confirmationText += `Location: ${report.location.address}\n`;
          confirmationText += `Accuracy: ±${Math.round(report.location.accuracy)}m\n`;
        }
        confirmationText += `Reporter: ${report.reporter.name}\n\n`;
        confirmationText += `📋 Your incident report has been saved locally.\n`;
        confirmationText += `🚨 For immediate emergencies, call 112 directly.\n`;
        confirmationText += `📞 Report will be submitted to authorities when online.`;
        
        alert(confirmationText);
        
        // If critical, suggest immediate action
        if (severity === '4') {
          if (confirm('🚨 CRITICAL INCIDENT DETECTED\n\nThis appears to be a life-threatening emergency.\n\nWould you like to call emergency services (112) immediately?')) {
            window.location.href = 'tel:112';
          }
        }
      }
    },
  ];

  const showMedicalInfoForm = (existingInfo: any) => {
    const name = prompt(`👤 Full Name:\n\nCurrent: ${existingInfo.name || 'Not provided'}`, existingInfo.name || '');
    if (name === null) return; // User cancelled
    
    const bloodType = prompt(`🩸 Blood Type (A+, B+, O+, AB+, etc.):\n\nCurrent: ${existingInfo.bloodType || 'Not provided'}`, existingInfo.bloodType || '');
    if (bloodType === null) return;
    
    const allergies = prompt(`⚠️ Allergies (medications, foods, etc.):\n\nCurrent: ${existingInfo.allergies || 'None listed'}`, existingInfo.allergies || '');
    if (allergies === null) return;
    
    const medications = prompt(`💊 Current Medications:\n\nCurrent: ${existingInfo.medications || 'None listed'}`, existingInfo.medications || '');
    if (medications === null) return;
    
    const conditions = prompt(`🏥 Medical Conditions:\n\nCurrent: ${existingInfo.conditions || 'None listed'}`, existingInfo.conditions || '');
    if (conditions === null) return;
    
    const emergencyContact = prompt(`📞 Medical Emergency Contact:\n\nCurrent: ${existingInfo.emergencyContact || 'Not provided'}`, existingInfo.emergencyContact || '');
    if (emergencyContact === null) return;
    
    const doctor = prompt(`👨‍⚕️ Primary Doctor/Hospital:\n\nCurrent: ${existingInfo.doctor || 'Not provided'}`, existingInfo.doctor || '');
    if (doctor === null) return;
    
    const medicalInfo = {
      name,
      bloodType,
      allergies,
      medications,
      conditions,
      emergencyContact,
      doctor,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('safeGuardMedicalInfo', JSON.stringify(medicalInfo));
    alert('✅ Medical information saved successfully!\n\nThis information will be available to emergency responders when needed.');
  };
  return (
    <>
      {/* Offline indicator */}
      {!offlineService.getOfflineCapability().isOnline && (
        <div className={`mb-4 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-orange-900/30 border-orange-800 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3">
            <WifiOff className="h-5 w-5" />
            <div>
              <p className="font-semibold">Offline Mode Active</p>
              <p className="text-sm opacity-90">Some features are limited. Emergency numbers still work.</p>
            </div>
          </div>
        </div>
      )}
      
    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} rounded-2xl shadow-xl border backdrop-blur-sm p-6`}>
      <div className="flex items-center mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-3">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Quick Emergency Actions</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {actionItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`${item.color} ${item.hoverColor} text-white p-5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl relative overflow-hidden group ${
              item.id === 'flashlight' && isFlashlightOn ? 'ring-4 ring-yellow-300 animate-pulse' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-sm leading-tight">
                  {item.title}
                </div>
                <div className="text-xs opacity-90 leading-tight mt-1">
                  {item.subtitle}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
    </>
  );
};

export default EmergencyActions;
