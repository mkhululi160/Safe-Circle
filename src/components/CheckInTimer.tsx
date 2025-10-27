import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CheckIn } from '../lib/supabase';
import { Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

export default function CheckInTimer() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [hours, setHours] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCheckIns();
  }, [user]);

  const loadCheckIns = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'completed'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setCheckIns(data);
  };

  const createCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    try {
      const expectedArrival = new Date();
      expectedArrival.setHours(expectedArrival.getHours() + parseInt(hours));

      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        destination,
        expected_arrival: expectedArrival.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      setDestination('');
      setHours('1');
      setShowForm(false);
      await loadCheckIns();
    } catch (error) {
      console.error('Error creating check-in:', error);
      alert('Failed to create check-in');
    } finally {
      setLoading(false);
    }
  };

  const completeCheckIn = async (checkInId: string) => {
    try {
      const { error } = await supabase
        .from('check_ins')
        .update({
          status: 'completed',
          check_in_time: new Date().toISOString(),
        })
        .eq('id', checkInId);

      if (error) throw error;
      await loadCheckIns();
    } catch (error) {
      console.error('Error completing check-in:', error);
    }
  };

  const cancelCheckIn = async (checkInId: string) => {
    try {
      const { error } = await supabase
        .from('check_ins')
        .update({ status: 'cancelled' })
        .eq('id', checkInId);

      if (error) throw error;
      await loadCheckIns();
    } catch (error) {
      console.error('Error cancelling check-in:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety Check-Ins</h2>
          <p className="text-gray-600 mt-1">Let contacts know when you arrive safely</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Check-In
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCheckIn} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Where are you going?
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="e.g., Home, Friend's house, Office"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected arrival time (hours from now)
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="0.25">15 minutes</option>
              <option value="0.5">30 minutes</option>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Check-In'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {checkIns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active check-ins</p>
          </div>
        ) : (
          checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">{checkIn.destination}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Expected arrival: {new Date(checkIn.expected_arrival).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      checkIn.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {checkIn.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </span>
                </div>

                {checkIn.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeCheckIn(checkIn.id)}
                      className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      title="I've arrived safely"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => cancelCheckIn(checkIn.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Cancel check-in"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
