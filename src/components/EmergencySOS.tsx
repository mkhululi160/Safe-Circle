import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, Phone, MapPin } from 'lucide-react';

export default function EmergencySOS() {
  const { user } = useAuth();
  const [activating, setActivating] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to get location. Please enable location services.');
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    loadActiveAlert();
  }, [user]);

  const loadActiveAlert = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();

    setActiveAlert(data);
  };

  const activateEmergency = async () => {
    if (!user || activating) return;

    setActivating(true);
    try {
      const { error } = await supabase.from('emergency_alerts').insert({
        user_id: user.id,
        latitude: location?.lat,
        longitude: location?.lng,
        alert_type: 'sos',
        status: 'active',
      });

      if (error) throw error;

      await loadActiveAlert();
    } catch (error) {
      console.error('Error activating emergency:', error);
      alert('Failed to activate emergency alert. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const resolveAlert = async () => {
    if (!activeAlert) return;

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', activeAlert.id);

      if (error) throw error;

      setActiveAlert(null);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (activeAlert) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full animate-pulse">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Emergency Alert Active</h2>
          <p className="text-gray-600">Your trusted contacts have been notified</p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Alert Details</h3>
              <p className="text-red-700 text-sm mb-2">
                Activated: {new Date(activeAlert.created_at).toLocaleString()}
              </p>
              {activeAlert.latitude && activeAlert.longitude && (
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location: {activeAlert.latitude.toFixed(6)}, {activeAlert.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Emergency (911)
          </a>
          <button
            onClick={resolveAlert}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            I'm Safe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Emergency SOS</h2>
        <p className="text-gray-600">Press the button below if you're in danger</p>
      </div>

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          {locationError}
        </div>
      )}

      <div className="text-center space-y-8 py-8">
        <button
          onClick={activateEmergency}
          disabled={activating}
          className="relative inline-flex items-center justify-center w-64 h-64 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
        >
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></div>
          <div className="relative flex flex-col items-center gap-4">
            <AlertCircle className="w-20 h-20" />
            <span className="text-2xl font-bold">
              {activating ? 'ACTIVATING...' : 'SOS'}
            </span>
          </div>
        </button>

        <div className="max-w-md mx-auto space-y-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">What happens when you press SOS:</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                Your location is recorded
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                All trusted contacts are notified immediately
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">3.</span>
                Emergency services can be contacted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">4.</span>
                Your alert remains active until you mark yourself safe
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">For immediate danger:</p>
            <p>Always call 911 or your local emergency number first</p>
          </div>
        </div>
      </div>
    </div>
  );
}
