import React, { useState } from 'react';
import { User, Phone, MapPin, Users, Shield, ChevronRight } from 'lucide-react';
import { languageService } from '../services/languageService';

interface UserSetupProps {
  onComplete: (userData: UserData) => void;
}

export interface UserData {
  name: string;
  phoneNumber: string;
  locationPermission: boolean;
  liveLocationPermission: boolean;
  contactSharingPermission: boolean;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phoneNumber: '',
    locationPermission: false,
    liveLocationPermission: false,
    contactSharingPermission: false,
    emergencyContacts: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      if (!userData.name.trim()) {
        newErrors.name = 'Name is required for emergency identification';
      }
      if (!userData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required for emergency contact';
      } else if (!/^\+91[\s-]?[6-9]\d{9}$|^[6-9]\d{9}$/.test(userData.phoneNumber.trim().replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(userData);
      }
    }
  };

  const handlePermissionRequest = async (permissionType: string) => {
    try {
      if (permissionType === 'location') {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        setUserData(prev => ({ 
          ...prev, 
          locationPermission: true,
          liveLocationPermission: true 
        }));
        
        alert(`Location access granted! Current coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      } else if (permissionType === 'contacts') {
        // Simulate contact sharing permission
        setUserData(prev => ({ ...prev, contactSharingPermission: true }));
        alert('Contact sharing permission granted for emergency situations');
      }
    } catch (error) {
      alert(`Permission denied: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddEmergencyContact = () => {
    if (newContact.name && newContact.phone && newContact.relationship) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact
      };
      setUserData(prev => ({ 
        ...prev, 
        emergencyContacts: [...prev.emergencyContacts, contact] 
      }));
      setNewContact({ name: '', phone: '', relationship: '' });
    }
  };

  const handleDeleteEmergencyContact = (id: string) => {
    setUserData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(contact => contact.id !== id)
    }));
  };

  const steps = [
    {
      title: 'Personal Information',
      subtitle: 'Required for emergency identification',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              {languageService.t('fullName')} *
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              {languageService.t('phoneNumber')} *
            </label>
            <input
              type="tel"
              value={userData.phoneNumber}
              onChange={(e) => setUserData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Privacy & Security</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your information is stored locally and only shared during emergency situations with authorized rescue teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: languageService.t('locationPermissions'),
      subtitle: 'Essential for emergency response',
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">{languageService.t('locationAccess')}</h4>
                  <p className="text-sm text-gray-600">Allow access to your current location</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${userData.locationPermission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <button
              onClick={() => handlePermissionRequest('location')}
              disabled={userData.locationPermission}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                userData.locationPermission
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {userData.locationPermission ? 'Location Access Granted' : 'Grant Location Access'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">{languageService.t('liveLocationTracking')}</h4>
                  <p className="text-sm text-gray-600">Share real-time location during emergencies</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${userData.liveLocationPermission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <p className="text-sm text-gray-500">
              {userData.liveLocationPermission ? 'Enabled automatically with location access' : 'Requires location access first'}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Why Location Access?</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Emergency responders need your exact location to provide fast, accurate assistance during critical situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: languageService.t('emergencyContacts'),
      subtitle: 'Add contacts for emergency notifications',
      content: (
        <div className="space-y-6">
          {/* Add Emergency Contact Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {languageService.t('addEmergencyContact')}
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={languageService.t('contactName')}
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <input
                type="tel"
                placeholder={languageService.t('phoneNumber')}
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">{languageService.t('relationship')}</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
              <button
                onClick={handleAddEmergencyContact}
                disabled={!newContact.name || !newContact.phone || !newContact.relationship}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  newContact.name && newContact.phone && newContact.relationship
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {languageService.t('addEmergencyContact')}
              </button>
            </div>
          </div>

          {/* Emergency Contacts List */}
          {userData.emergencyContacts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{languageService.t('emergencyContacts')} ({userData.emergencyContacts.length})</h4>
              <div className="space-y-2">
                {userData.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.phone} • {contact.relationship}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEmergencyContact(contact.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">Contact Sharing</h4>
                  <p className="text-sm text-gray-600">Share emergency contacts with rescue teams</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${userData.contactSharingPermission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <button
              onClick={() => handlePermissionRequest('contacts')}
              disabled={userData.contactSharingPermission}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                userData.contactSharingPermission
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {userData.contactSharingPermission ? 'Contact Sharing Enabled' : 'Enable Contact Sharing'}
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">SOS Emergency Protocol</h4>
                <p className="text-sm text-red-700 mt-1">
                  When SOS is activated, your emergency contacts will receive your location and a distress message: "I'm in disaster please help me." This helps coordinate immediate assistance.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Setup Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">{userData.name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium">{userData.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>Location Access:</span>
                <span className={`font-medium ${userData.locationPermission ? 'text-green-600' : 'text-red-600'}`}>
                  {userData.locationPermission ? 'Granted' : 'Not granted'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contact Sharing:</span>
                <span className={`font-medium ${userData.contactSharingPermission ? 'text-green-600' : 'text-red-600'}`}>
                  {userData.contactSharingPermission ? 'Enabled' : 'Not enabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Contacts:</span>
                <span className="font-medium text-blue-600">
                  {userData.emergencyContacts.length} added
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep === 0 ? userData.name && userData.phoneNumber : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg mr-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{languageService.t('appName')}</h1>
              <p className="text-sm text-gray-500">{languageService.t('appSubtitle')}</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-medium">Emergency Safety Setup</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="font-semibold text-blue-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 shadow-lg'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center shadow-lg ${
              canProceed
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-red-500/30'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Complete Setup' : languageService.t('next')}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
