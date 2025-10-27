import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TrustedContact } from '../lib/supabase';
import { Users, Plus, Trash2, Phone, Mail, UserCheck } from 'lucide-react';

export default function TrustedContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    relationship: '',
  });

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setContacts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('trusted_contacts').insert({
        user_id: user.id,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail || undefined,
        relationship: formData.relationship,
        is_active: true,
      });

      if (error) throw error;

      setFormData({
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        relationship: '',
      });
      setShowForm(false);
      await loadContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      await loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const toggleActive = async (contactId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .update({ is_active: !currentStatus })
        .eq('id', contactId);

      if (error) throw error;
      await loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trusted Contacts</h2>
          <p className="text-gray-600 mt-1">People who will be notified in emergencies</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              required
              placeholder="e.g., Jane Smith"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              required
              placeholder="e.g., +1 234 567 8900"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="e.g., jane@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Friend, Family, Partner"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contact'}
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
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No trusted contacts added yet</p>
            <p className="text-sm">Add people who should be notified in emergencies</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 hover:shadow-md transition-shadow ${
                contact.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">{contact.contact_name}</h3>
                    {contact.relationship && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {contact.relationship}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <a
                      href={`tel:${contact.contact_phone}`}
                      className="flex items-center gap-2 hover:text-emerald-600"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.contact_phone}
                    </a>

                    {contact.contact_email && (
                      <a
                        href={`mailto:${contact.contact_email}`}
                        className="flex items-center gap-2 hover:text-emerald-600"
                      >
                        <Mail className="w-4 h-4" />
                        {contact.contact_email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(contact.id, contact.is_active)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      contact.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {contact.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {contacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">How trusted contacts work</p>
          <p>
            When you activate an emergency alert, all active trusted contacts will be notified with
            your location and situation
          </p>
        </div>
      )}
    </div>
  );
}
