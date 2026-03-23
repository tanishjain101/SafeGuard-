import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Package, 
  MapPin,
  Phone,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Mountain,
  Waves,
  Flame,
  ChevronRight,
  ChevronDown,
  Award,
  Target,
  Lightbulb
} from 'lucide-react';

interface DisasterPlanningProps {
  theme?: 'light' | 'dark';
}

interface DisasterType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  commonInIndia: boolean;
}

interface PlanningPhase {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: PlanningItem[];
}

interface PlanningItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

type PlanningTab = 'types' | 'planning' | 'checklist' | 'resources';

const DisasterPlanning: React.FC<DisasterPlanningProps> = ({ theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState<PlanningTab>('types');
  const [selectedDisaster, setSelectedDisaster] = useState<string>('earthquake');
  const [expandedPhase, setExpandedPhase] = useState<string>('before');
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});
  const tabs: Array<{ id: PlanningTab; label: string; icon: React.ReactNode }> = [
    { id: 'types', label: 'Disaster Types', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'planning', label: 'Planning Guide', icon: <FileText className="h-4 w-4" /> },
    { id: 'checklist', label: 'Emergency Kit', icon: <Package className="h-4 w-4" /> },
    { id: 'resources', label: 'Resources', icon: <Phone className="h-4 w-4" /> }
  ];

  const disasterTypes: DisasterType[] = [
    {
      id: 'earthquake',
      name: 'Earthquake',
      icon: <Mountain className="h-5 w-5" />,
      color: 'text-orange-600',
      riskLevel: 'High',
      commonInIndia: true
    },
    {
      id: 'flood',
      name: 'Flood',
      icon: <Waves className="h-5 w-5" />,
      color: 'text-blue-600',
      riskLevel: 'High',
      commonInIndia: true
    },
    {
      id: 'cyclone',
      name: 'Cyclone',
      icon: <Wind className="h-5 w-5" />,
      color: 'text-gray-600',
      riskLevel: 'High',
      commonInIndia: true
    },
    {
      id: 'fire',
      name: 'Fire',
      icon: <Flame className="h-5 w-5" />,
      color: 'text-red-600',
      riskLevel: 'Medium',
      commonInIndia: true
    },
    {
      id: 'heatwave',
      name: 'Heat Wave',
      icon: <Thermometer className="h-5 w-5" />,
      color: 'text-yellow-600',
      riskLevel: 'High',
      commonInIndia: true
    },
    {
      id: 'drought',
      name: 'Drought',
      icon: <Droplets className="h-5 w-5" />,
      // Fix: Tailwind does not have text-brown-600 by default, use text-yellow-900 or text-amber-700 for brownish color
      color: 'text-yellow-900',
      riskLevel: 'Medium',
      commonInIndia: true
    }
  ];

  const planningPhases: PlanningPhase[] = [
    {
      id: 'before',
      title: 'Before Disaster (Preparedness)',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-green-600',
      items: [
        {
          id: 'emergency-kit',
          title: 'Prepare Emergency Kit',
          description: 'Stock essential supplies: water (4L per person per day for 3 days), non-perishable food, first aid kit, flashlight, battery radio, medications, important documents in waterproof container',
          priority: 'High'
        },
        {
          id: 'family-plan',
          title: 'Create Family Emergency Plan',
          description: 'Establish meeting points, assign responsibilities, practice evacuation routes, ensure all family members know the plan, designate out-of-state contact person',
          priority: 'High'
        },
        {
          id: 'home-safety',
          title: 'Secure Your Home',
          description: 'Install smoke detectors, secure heavy furniture, know utility shut-offs, trim trees near house, reinforce weak structures, waterproof important areas',
          priority: 'Medium'
        },
        {
          id: 'insurance',
          title: 'Review Insurance Coverage',
          description: 'Ensure adequate home, health, and disaster insurance. Document belongings with photos/videos. Keep copies of policies in emergency kit',
          priority: 'Medium'
        },
        {
          id: 'community',
          title: 'Know Your Community Resources',
          description: 'Locate nearest hospitals, police stations, fire departments, emergency shelters. Join local disaster response groups or volunteer organizations',
          priority: 'Low'
        },
        {
          id: 'skills',
          title: 'Learn Emergency Skills',
          description: 'Take first aid/CPR courses, learn how to use fire extinguisher, practice emergency procedures, teach children basic safety skills',
          priority: 'Medium'
        }
      ]
    },
    {
      id: 'during',
      title: 'During Disaster (Response)',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-600',
      items: [
        {
          id: 'stay-calm',
          title: 'Stay Calm and Alert',
          description: 'Keep calm, think clearly, follow your emergency plan, listen to official instructions via radio/TV/mobile alerts, avoid panic decisions',
          priority: 'High'
        },
        {
          id: 'immediate-safety',
          title: 'Ensure Immediate Safety',
          description: 'Move to safe location immediately, protect yourself from immediate dangers, help injured if safe to do so, account for all family members',
          priority: 'High'
        },
        {
          id: 'communication',
          title: 'Communicate Your Status',
          description: 'Contact emergency services if needed (112), inform family/friends of your safety, use text messages (often work when calls don\'t), conserve phone battery',
          priority: 'High'
        },
        {
          id: 'shelter',
          title: 'Seek Appropriate Shelter',
          description: 'Go to designated safe areas, avoid damaged buildings, stay away from power lines, if trapped - signal for help, conserve energy and resources',
          priority: 'High'
        },
        {
          id: 'monitor',
          title: 'Monitor Situation',
          description: 'Listen to emergency broadcasts, follow official evacuation orders, avoid rumor and misinformation, document damage with photos if safe',
          priority: 'Medium'
        },
        {
          id: 'help-others',
          title: 'Help Others Safely',
          description: 'Assist neighbors if you can do so safely, provide first aid if trained, share resources if possible, report people who need help to authorities',
          priority: 'Low'
        }
      ]
    },
    {
      id: 'after',
      title: 'After Disaster (Recovery)',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-blue-600',
      items: [
        {
          id: 'safety-check',
          title: 'Check for Injuries and Hazards',
          description: 'Provide first aid, check for gas leaks/electrical hazards/structural damage, wear protective clothing, avoid damaged areas until cleared by authorities',
          priority: 'High'
        },
        {
          id: 'contact-family',
          title: 'Contact Family and Authorities',
          description: 'Let family know you\'re safe, report injuries/damage to authorities, contact insurance company, register with disaster relief organizations if needed',
          priority: 'High'
        },
        {
          id: 'document-damage',
          title: 'Document Damage',
          description: 'Take photos/videos of damage before cleanup, keep receipts for emergency expenses, make list of damaged/lost items, don\'t throw away damaged items until documented',
          priority: 'Medium'
        },
        {
          id: 'basic-needs',
          title: 'Address Basic Needs',
          description: 'Ensure safe water supply, secure temporary shelter if needed, maintain sanitation, conserve food and water, seek medical attention for injuries',
          priority: 'High'
        },
        {
          id: 'cleanup',
          title: 'Begin Safe Cleanup',
          description: 'Wait for official all-clear, wear protective equipment, be careful of debris, avoid electrical hazards, work with neighbors to help each other',
          priority: 'Medium'
        },
        {
          id: 'recovery',
          title: 'Plan Long-term Recovery',
          description: 'Apply for disaster assistance, work with insurance adjusters, plan repairs/rebuilding, seek counseling if needed, update emergency plans based on experience',
          priority: 'Low'
        }
      ]
    }
  ];

  const emergencySupplies = [
    { category: 'Water & Food', items: ['4L water per person per day (3-day supply)', 'Non-perishable food (3-day supply)', 'Manual can opener', 'Disposable plates, cups, utensils'] },
    { category: 'First Aid & Medications', items: ['First aid kit', 'Prescription medications (7-day supply)', 'Over-the-counter medications', 'Medical supplies (glasses, hearing aids)'] },
    { category: 'Tools & Supplies', items: ['Flashlight with extra batteries', 'Battery-powered or hand-crank radio', 'Cell phone chargers (solar/battery)', 'Multi-tool or Swiss Army knife'] },
    { category: 'Clothing & Shelter', items: ['Change of clothes for each person', 'Sturdy shoes', 'Blankets or sleeping bags', 'Plastic sheeting and duct tape'] },
    { category: 'Important Documents', items: ['ID cards, passports', 'Insurance policies', 'Bank records', 'Emergency contact list'] },
    { category: 'Personal Items', items: ['Cash in small bills', 'Personal hygiene items', 'Items for infants/elderly', 'Entertainment items for children'] }
  ];

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getCompletionPercentage = () => {
    const totalItems = planningPhases.reduce((total, phase) => total + phase.items.length, 0);
    const completedItems = Object.values(checklist).filter(Boolean).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const renderDisasterTypes = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} border backdrop-blur-sm`}>
        <div className="flex items-center mb-3">
          <Target className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Disaster Risk Assessment
          </h3>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Select a disaster type to view specific preparedness guidelines and risk mitigation strategies tailored for Indian conditions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {disasterTypes.map((disaster) => (
          <div
            key={disaster.id}
            className={`border rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedDisaster === disaster.id
                ? `border-blue-500 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} shadow-lg`
                : theme === 'dark' ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50' : 'border-gray-200 bg-white/70 hover:bg-white'
            }`}
            onClick={() => setSelectedDisaster(disaster.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg bg-white/10 ${disaster.color}`}>
                  {disaster.icon}
                </div>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {disaster.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {disaster.commonInIndia && (
                  <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-medium shadow-lg">
                    Common in India
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-lg ${
                  disaster.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  disaster.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {disaster.riskLevel} Risk
                </span>
              </div>
            </div>
            <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Click to view specific planning guidelines for {disaster.name.toLowerCase()} disasters.
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-800' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'} border backdrop-blur-sm`}>
        <div className="flex items-center mb-3">
          <Lightbulb className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            3-Phase Emergency Planning
          </h3>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive disaster management strategy covering preparation, response, and recovery phases.
        </p>
      </div>
      
      {planningPhases.map((phase) => (
        <div
          key={phase.id}
          className={`border rounded-2xl shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800' : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'} backdrop-blur-sm w-full max-w-full overflow-hidden`}
        >
          <button
            onClick={() => setExpandedPhase(expandedPhase === phase.id ? '' : phase.id)}
            className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-black/5 rounded-2xl transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-white/10 ${phase.color}`}>
                {phase.icon}
              </div>
              <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {phase.title}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'} transition-transform ${expandedPhase === phase.id ? 'rotate-180' : ''}`}>
              {expandedPhase === phase.id ? (
                <ChevronDown className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              )}
            </div>
          </button>
          
          {expandedPhase === phase.id && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
              {phase.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50' : 'border-gray-200 bg-white/70 hover:bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {item.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-lg whitespace-nowrap ${
                        item.priority === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                        item.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${
                        checklist[item.id]
                          ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 shadow-lg'
                          : `border-gray-300 hover:border-green-400 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
                      }`}
                    >
                      {checklist[item.id] && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderChecklist = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-800' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} border backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Emergency Preparedness Progress
            </h3>
          </div>
          <span className={`text-lg font-bold px-4 py-2 rounded-xl ${theme === 'dark' ? 'text-purple-400 bg-purple-900/50' : 'text-purple-600 bg-purple-100'}`}>
            {getCompletionPercentage()}% Complete
          </span>
        </div>
        <div className={`w-full rounded-full h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} shadow-inner`}>
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {emergencySupplies.map((category, index) => (
        <div
          key={index}
          className={`border rounded-2xl p-4 sm:p-6 shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800' : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'} backdrop-blur-sm w-full max-w-full overflow-hidden`}
        >
          <h3 className={`font-bold text-lg mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            {category.category}
          </h3>
          <div className="space-y-3">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-600/30' : 'hover:bg-gray-100/50'}`}>
                <button
                  onClick={() => toggleChecklistItem(`${category.category}-${itemIndex}`)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${
                    checklist[`${category.category}-${itemIndex}`]
                      ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 shadow-lg'
                      : `border-gray-300 hover:border-green-400 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`
                  }`}
                >
                  {checklist[`${category.category}-${itemIndex}`] && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </button>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${checklist[`${category.category}-${itemIndex}`] ? 'line-through opacity-60' : ''}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-800' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'} border backdrop-blur-sm`}>
        <div className="flex items-center mb-3">
          <Phone className={`h-5 w-5 mr-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Emergency Resources & Contacts
          </h3>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Essential emergency numbers, locations, and resources for immediate assistance during disasters.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className={`border rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-red-900/20 to-red-800/20' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Emergency Numbers (India)
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className={`flex justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'}`}>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Emergency Services:</span>
              <span className="font-bold text-red-600 text-lg">112</span>
            </div>
            <div className={`flex justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'}`}>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Fire Services:</span>
              <span className="font-bold text-red-600 text-lg">101</span>
            </div>
            <div className={`flex justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'}`}>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Police:</span>
              <span className="font-bold text-red-600 text-lg">112</span>
            </div>
            <div className={`flex justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'}`}>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Medical Emergency:</span>
              <span className="font-bold text-red-600 text-lg">102</span>
            </div>
            <div className={`flex justify-between p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-white/50'}`}>
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Disaster Management:</span>
              <span className="font-bold text-red-600 text-lg">108</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-blue-900/20 to-blue-800/20' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Important Locations
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Nearest Hospital</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Police Station</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Fire Station</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Emergency Shelter</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Community Center</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-green-900/20 to-green-800/20' : 'border-green-200 bg-gradient-to-br from-green-50 to-white'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Important Documents
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Aadhaar Card</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• PAN Card</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Insurance Policies</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Bank Documents</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Medical Records</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'border-gray-600 bg-gradient-to-br from-pink-900/20 to-pink-800/20' : 'border-pink-200 bg-gradient-to-br from-pink-50 to-white'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Mental Health Resources
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• NIMHANS Helpline: 080-46110007</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Vandrevala Foundation: 9999666555</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• iCall: 9152987821</span>
            </div>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-white/50 text-gray-600'}`}>
              <span className="text-xs sm:text-sm">• Sneha: 044-24640050</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      data-component="disaster-planning"
      className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} rounded-2xl shadow-xl border backdrop-blur-sm p-4 sm:p-6 lg:p-8 mb-6 w-full max-w-full overflow-hidden`}
    >
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Disaster Risk Mitigation & Planning
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive emergency preparedness guide
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex flex-wrap gap-2 mb-6 p-2 rounded-2xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/70'} backdrop-blur-sm overflow-x-auto`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'} shadow-lg scale-105`
                : `${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600/50' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'}`
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] w-full max-w-full overflow-hidden">
        {activeTab === 'types' && renderDisasterTypes()}
        {activeTab === 'planning' && renderPlanning()}
        {activeTab === 'checklist' && renderChecklist()}
        {activeTab === 'resources' && renderResources()}
      </div>
    </div>
  );
};

export default DisasterPlanning;
