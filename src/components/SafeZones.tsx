import { useState, useEffect } from 'react';
import { supabase, SafeZone } from '../lib/supabase';
import { MapPin, Phone, Clock, Shield, Building2, Heart, Users } from 'lucide-react';

export default function SafeZones() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafeZones();
  }, [filter]);

  const loadSafeZones = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('safe_zones')
        .select('*')
        .order('verified', { ascending: false })
        .order('name');

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSafeZones(data || []);
    } catch (error) {
      console.error('Error loading safe zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeZoneTypes = [
    { value: 'all', label: 'All Zones', icon: MapPin },
    { value: 'police', label: 'Police Stations', icon: Shield },
    { value: 'hospital', label: 'Hospitals', icon: Heart },
    { value: 'shelter', label: 'Shelters', icon: Building2 },
    { value: 'community_center', label: 'Community Centers', icon: Users },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'police':
        return Shield;
      case 'hospital':
        return Heart;
      case 'shelter':
        return Building2;
      case 'community_center':
        return Users;
      default:
        return MapPin;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'police':
        return 'from-blue-500 to-blue-600';
      case 'hospital':
        return 'from-red-500 to-red-600';
      case 'shelter':
        return 'from-amber-500 to-amber-600';
      case 'community_center':
        return 'from-teal-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Safe Zones</h2>
        <p className="text-gray-600 mt-1">Find verified safe locations in your community</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {safeZoneTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === type.value
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading safe zones...</div>
      ) : safeZones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No safe zones found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {safeZones.map((zone) => {
            const Icon = getIcon(zone.type);
            return (
              <div
                key={zone.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getColorClass(
                      zone.type
                    )} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      {zone.verified && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="break-words">{zone.address}</span>
                      </div>

                      {zone.phone_number && (
                        <a
                          href={`tel:${zone.phone_number}`}
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          {zone.phone_number}
                        </a>
                      )}

                      {zone.operating_hours && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          {zone.operating_hours}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${zone.latitude},${zone.longitude}`;
                        window.open(url, '_blank');
                      }}
                      className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all text-sm"
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Need immediate help?</p>
        <p>
          In an emergency, go to the nearest safe zone or call emergency services immediately
        </p>
      </div>
    </div>
  );
}
