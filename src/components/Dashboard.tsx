import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EmergencySOS from './EmergencySOS';
import CheckInTimer from './CheckInTimer';
import IncidentReport from './IncidentReport';
import SafeZones from './SafeZones';
import TrustedContacts from './TrustedContacts';
import Profile from './Profile';
import { Shield, Clock, AlertTriangle, MapPin, Users, User as UserIcon, LogOut } from 'lucide-react';

type Tab = 'emergency' | 'check-in' | 'report' | 'safe-zones' | 'contacts' | 'profile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('emergency');
  const { signOut, profile } = useAuth();

  const tabs = [
    { id: 'emergency' as Tab, label: 'Emergency', icon: Shield },
    { id: 'check-in' as Tab, label: 'Check-In', icon: Clock },
    { id: 'report' as Tab, label: 'Report', icon: AlertTriangle },
    { id: 'safe-zones' as Tab, label: 'Safe Zones', icon: MapPin },
    { id: 'contacts' as Tab, label: 'Contacts', icon: Users },
    { id: 'profile' as Tab, label: 'Profile', icon: UserIcon },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SafeCircle</h1>
                <p className="text-sm text-gray-600">Welcome, {profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px]">
          {activeTab === 'emergency' && <EmergencySOS />}
          {activeTab === 'check-in' && <CheckInTimer />}
          {activeTab === 'report' && <IncidentReport />}
          {activeTab === 'safe-zones' && <SafeZones />}
          {activeTab === 'contacts' && <TrustedContacts />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
}
