import React from 'react';
import { CheckCircle, MapPin, Users, Bell } from 'lucide-react';
import { UserData } from './UserSetup';

interface SafetyStatusProps {
  userData: UserData | null;
  theme?: 'light' | 'dark';
}

const SafetyStatus: React.FC<SafetyStatusProps> = ({ userData, theme = 'light' }) => {
  const statusItems = [
    {
      id: 'gps',
      label: 'GPS enabled',
      icon: <MapPin className="h-4 w-4" />,
      active: userData?.locationPermission || false
    },
    {
      id: 'contacts',
      label: 'Emergency contacts verified',
      icon: <Users className="h-4 w-4" />,
      active: userData?.contactSharingPermission || false
    },
    {
      id: 'notifications',
      label: 'Notifications active',
      icon: <Bell className="h-4 w-4" />,
      active: true
    }
  ];

  const allSystemsActive = statusItems.every(item => item.active);

  return (
    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} rounded-2xl shadow-xl border backdrop-blur-sm p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-xl shadow-lg mr-3 ${allSystemsActive ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-yellow-500 to-yellow-600'}`}>
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Safety Status</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full animate-pulse ${allSystemsActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${allSystemsActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          </div>
          <span className={`text-sm font-semibold px-4 py-2 rounded-full border ${
            allSystemsActive 
              ? `text-green-700 ${theme === 'dark' ? 'bg-green-900/50 border-green-800' : 'bg-green-100 border-green-200'}` 
              : `text-yellow-700 ${theme === 'dark' ? 'bg-yellow-900/50 border-yellow-800' : 'bg-yellow-100 border-yellow-200'}`
          }`}>
            {allSystemsActive ? 'All Systems Active' : 'Setup Required'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {statusItems.map((item) => (
          <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${item.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {item.icon}
              </div>
              <span className={`text-sm font-medium ${item.active ? (theme === 'dark' ? 'text-white' : 'text-gray-800') : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>
      
      {userData && (
        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <div>Registered: {userData.name}</div>
            <div>Contact: {userData.phoneNumber}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyStatus;