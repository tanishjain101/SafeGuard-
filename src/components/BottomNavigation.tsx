import React, { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  MapPin,
  Moon,
  Palette,
  Phone,
  Plus,
  Settings,
  Shield,
  Sun,
  Trash2,
  Users,
} from 'lucide-react';
import { placesService } from '../services/placesService';
import { locationService } from '../services/locationService';
import type { UserData } from './UserSetup';

interface BottomNavigationProps {
  userData: UserData | null;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onReset?: () => void;
  notificationCount?: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  distance?: number;
  rating?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now?: boolean;
  };
}

type ModalId = 'notifications' | 'hospital' | 'rescue' | 'contacts' | 'settings';

const emptyContact = { name: '', phone: '', relationship: '' };

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  userData,
  theme,
  onThemeChange,
  onReset,
  notificationCount = 0,
}) => {
  const [activeModal, setActiveModal] = useState<ModalId | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Place[]>([]);
  const [nearbyRescueCenters, setNearbyRescueCenters] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState(emptyContact);

  useEffect(() => {
    const savedUserData = localStorage.getItem('safeGuardUserData');
    if (!savedUserData) {
      return;
    }

    try {
      const parsed = JSON.parse(savedUserData) as { emergencyContacts?: EmergencyContact[] };
      if (Array.isArray(parsed.emergencyContacts)) {
        setEmergencyContacts(parsed.emergencyContacts);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  }, []);

  const saveEmergencyContacts = (contacts: EmergencyContact[]) => {
    try {
      const savedUserData = localStorage.getItem('safeGuardUserData');
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData) as Record<string, unknown>;
        parsedData.emergencyContacts = contacts;
        localStorage.setItem('safeGuardUserData', JSON.stringify(parsedData));
        return;
      }

      const newUserData = {
        name: '',
        phoneNumber: '',
        locationPermission: false,
        liveLocationPermission: false,
        contactSharingPermission: false,
        emergencyContacts: contacts,
      };
      localStorage.setItem('safeGuardUserData', JSON.stringify(newUserData));
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      return;
    }

    const rawPhone = newContact.phone.replace(/\s/g, '');
    const phone = /^\+91/.test(rawPhone)
      ? rawPhone
      : /^[6-9]\d{9}$/.test(rawPhone)
        ? `+91 ${rawPhone}`
        : newContact.phone.trim();

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phone,
      relationship: newContact.relationship,
    };

    const updatedContacts = [...emergencyContacts, contact];
    setEmergencyContacts(updatedContacts);
    saveEmergencyContacts(updatedContacts);
    setNewContact(emptyContact);
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = emergencyContacts.filter((contact) => contact.id !== id);
    setEmergencyContacts(updatedContacts);
    saveEmergencyContacts(updatedContacts);
  };

  const findNearestLocation = async (type: 'hospital' | 'rescue') => {
    const currentLocation = locationService.getCurrentLocation();

    if (!currentLocation) {
      try {
        const location = await locationService.startLocationTracking();
        await findRealNearbyPlaces(location.latitude, location.longitude, type);
      } catch (_error) {
        alert('Location access denied. Please enable location services to find nearby facilities.');
      }
      return;
    }

    await findRealNearbyPlaces(currentLocation.latitude, currentLocation.longitude, type);
  };

  const findRealNearbyPlaces = async (lat: number, lng: number, type: 'hospital' | 'rescue') => {
    setIsLoadingPlaces(true);

    try {
      let places: Place[] = [];

      if (type === 'hospital') {
        places = await placesService.findNearbyHospitals(lat, lng, 10000);
        setNearbyHospitals(places);
      } else {
        places = await placesService.findNearbyRescueCenters(lat, lng, 10000);
        setNearbyRescueCenters(places);
      }

      if (places.length === 0) {
        alert(`No ${type === 'hospital' ? 'hospitals' : 'rescue centers'} found within 10km of your location.`);
        return;
      }

      const nearest = places[0];
      const distance = nearest.distance?.toFixed(1) ?? 'Unknown';
      const estimatedTime = nearest.distance ? Math.round(nearest.distance * 3) : 'Unknown';
      const directionsUrl = placesService.getDirectionsUrl(lat, lng, nearest.geometry.location.lat, nearest.geometry.location.lng);

      alert(
        `📍 NEAREST ${type.toUpperCase()} FOUND 📍\n\n` +
          `${nearest.name}\n` +
          `Address: ${nearest.vicinity || 'Address not available'}\n` +
          `Distance: ${distance} km\n` +
          `Estimated time: ${estimatedTime} minutes\n\n` +
          `Get Directions: ${directionsUrl}`,
      );
    } catch (error) {
      console.error(`Error finding nearby ${type}:`, error);
      alert(`Error finding nearby ${type === 'hospital' ? 'hospitals' : 'rescue centers'}. Please try again.`);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const navItems: Array<{
    id: ModalId;
    icon: React.ReactNode;
    label: string;
    color: string;
    badge?: number;
  }> = [
    {
      id: 'notifications',
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      color: 'text-blue-600',
      badge: notificationCount,
    },
    {
      id: 'hospital',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Hospital',
      color: 'text-red-600',
    },
    {
      id: 'rescue',
      icon: <Shield className="h-5 w-5" />,
      label: 'Rescue Center',
      color: 'text-green-600',
    },
    {
      id: 'contacts',
      icon: <Users className="h-5 w-5" />,
      label: 'Contacts',
      color: 'text-purple-600',
    },
    {
      id: 'settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      color: 'text-gray-600',
    },
  ];

  const renderPlaces = (places: Place[]) => (
    <div className="space-y-3">
      {places.slice(0, 5).map((place) => (
        <div key={place.place_id} className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-gray-800">{place.name}</h4>
          <p className="text-sm text-gray-600">{place.vicinity || 'Address not available'}</p>
          <p className="text-sm text-gray-500">
            Distance: ~{place.distance?.toFixed(1) ?? 'Unknown'} km
            {place.rating && ` • Rating: ${place.rating.toFixed(1)}⭐`}
            {place.opening_hours?.open_now && ' • Open Now'}
          </p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() =>
                window.open(
                  placesService.getGoogleMapsUrl(place.geometry.location.lat, place.geometry.location.lng),
                  '_blank',
                )
              }
              className="text-blue-600 text-sm font-medium"
            >
              View on Map
            </button>
            <button
              onClick={() => {
                const currentLocation = locationService.getCurrentLocation();
                if (!currentLocation) {
                  return;
                }
                const directionsUrl = placesService.getDirectionsUrl(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  place.geometry.location.lat,
                  place.geometry.location.lng,
                );
                window.open(directionsUrl, '_blank');
              }}
              className="text-green-600 text-sm font-medium"
            >
              Get Directions
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const modalContent: Record<ModalId, React.ReactNode> = {
    notifications: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Notifications</h3>
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="font-medium text-red-800">Weather Alert</p>
            <p className="text-sm text-red-600">Severe thunderstorm warning in your area</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="font-medium text-yellow-800">Safety Reminder</p>
            <p className="text-sm text-yellow-600">Update your emergency contacts</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium text-blue-800">System Update</p>
            <p className="text-sm text-blue-600">Safe Guard app updated successfully</p>
          </div>
        </div>
      </div>
    ),
    hospital: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearest Hospitals</h3>
        <button
          onClick={() => void findNearestLocation('hospital')}
          disabled={isLoadingPlaces}
          className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
            isLoadingPlaces ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <MapPin className="h-5 w-5 mr-2" />
          {isLoadingPlaces ? 'Searching...' : 'Find Nearest Hospitals'}
        </button>
        {nearbyHospitals.length > 0 && renderPlaces(nearbyHospitals)}
      </div>
    ),
    rescue: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Rescue Centers</h3>
        <button
          onClick={() => void findNearestLocation('rescue')}
          disabled={isLoadingPlaces}
          className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
            isLoadingPlaces ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <Shield className="h-5 w-5 mr-2" />
          {isLoadingPlaces ? 'Searching...' : 'Find Nearest Rescue Centers'}
        </button>
        {nearbyRescueCenters.length > 0 && renderPlaces(nearbyRescueCenters)}
      </div>
    ),
    contacts: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contacts</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-700">Add New Contact</h4>
          <input
            type="text"
            placeholder="Full Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
          <button
            onClick={handleAddContact}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>

        <div className="space-y-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{contact.name}</h4>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                  <p className="text-xs text-gray-500">{contact.relationship}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-green-600 hover:text-green-700"
                    onClick={() => {
                      window.open(`tel:${contact.phone.replace(/\s/g, '')}`);
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            App Theme
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => onThemeChange('light')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Sun className="h-4 w-4 mr-3" />
                <span>Light Theme</span>
              </div>
              {theme === 'light' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Moon className="h-4 w-4 mr-3" />
                <span>Dark Theme</span>
              </div>
              {theme === 'dark' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
          </div>
        </div>

        {userData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">User Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{userData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{userData.phoneNumber || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location Access:</span>
                <span className={`font-medium ${userData.locationPermission ? 'text-green-600' : 'text-red-600'}`}>
                  {userData.locationPermission ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact Sharing:</span>
                <span className={`font-medium ${userData.contactSharingPermission ? 'text-green-600' : 'text-red-600'}`}>
                  {userData.contactSharingPermission ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        )}

        {onReset && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Reset app? This clears all local data and returns to setup.',
                )
              ) {
                onReset();
              }
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg"
          >
            Reset App
          </button>
        )}
      </div>
    ),
  };

  return (
    <>
      <div
        className={`${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
            : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
        } rounded-2xl shadow-xl border backdrop-blur-sm p-4`}
      >
        <div className="grid grid-cols-5 gap-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className={`relative flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                theme === 'dark' ? 'hover:bg-gray-600/50' : 'hover:bg-gray-100/70'
              } backdrop-blur-sm group`}
            >
              <div className={`${item.color} transition-transform duration-300 group-hover:scale-110`}>{item.icon}</div>
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
              <span
                className={`text-xs font-medium text-center leading-tight ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {modalContent[activeModal]}
              <button
                onClick={() => setActiveModal(null)}
                className="w-full mt-6 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavigation;
