import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, IncidentReport as IncidentReportType } from '../lib/supabase';
import { AlertTriangle, Send, Eye, EyeOff } from 'lucide-react';

export default function IncidentReport() {
  const { user } = useAuth();
  const [reports, setReports] = useState<IncidentReportType[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incidentType: 'harassment',
    description: '',
    locationDescription: '',
    incidentDate: new Date().toISOString().slice(0, 16),
    isAnonymous: false,
  });

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setReports(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('incident_reports').insert({
        user_id: formData.isAnonymous ? null : user.id,
        incident_type: formData.incidentType,
        description: formData.description,
        location_description: formData.locationDescription,
        incident_date: formData.incidentDate,
        is_anonymous: formData.isAnonymous,
        status: 'submitted',
      });

      if (error) throw error;

      setFormData({
        incidentType: 'harassment',
        description: '',
        locationDescription: '',
        incidentDate: new Date().toISOString().slice(0, 16),
        isAnonymous: false,
      });

      await loadReports();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const incidentTypes = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'stalking', label: 'Stalking' },
    { value: 'assault', label: 'Physical Assault' },
    { value: 'verbal_abuse', label: 'Verbal Abuse' },
    { value: 'domestic_violence', label: 'Domestic Violence' },
    { value: 'sexual_harassment', label: 'Sexual Harassment' },
    { value: 'unsafe_area', label: 'Unsafe Area' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Incident</h2>
          <p className="text-gray-600 mt-1">Document incidents to help keep the community safe</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          {showForm ? 'View Reports' : 'New Report'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Your safety matters</p>
            <p>This information helps prevent future incidents and supports community safety</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Incident
            </label>
            <select
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {incidentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Please describe what happened..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.locationDescription}
              onChange={(e) => setFormData({ ...formData, locationDescription: e.target.value })}
              required
              placeholder="e.g., Main Street near Central Park"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={formData.incidentDate}
              onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="anonymous" className="flex items-center gap-2 text-sm text-gray-700">
              {formData.isAnonymous ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
              Submit anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reports submitted</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">
                      {incidentTypes.find((t) => t.value === report.incident_type)?.label ||
                        report.incident_type}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : report.status === 'under_review'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{report.location_description}</span>
                  <span>{new Date(report.incident_date).toLocaleDateString()}</span>
                </div>
                {report.is_anonymous && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <EyeOff className="w-3 h-3" />
                    Anonymous report
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
