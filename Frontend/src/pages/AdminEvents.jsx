import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import { Plus, Edit, Trash2, BarChart3, X, Calendar, Clock, MapPin, Users } from 'lucide-react';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rsvpSummaries, setRsvpSummaries] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.get('/');
      const rows = response?.data?.data?.events || [];

      const normalized = rows.map(ev => ({
        ...ev,
        date: ev.date ? new Date(ev.date).toISOString().slice(0, 10) : ''
      }));

      setEvents(normalized);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRsvpSummary = async (eventId) => {
    try {
      const response = await eventsAPI.get(`/${eventId}/rsvp-summary`);
      setRsvpSummaries(prev => ({ ...prev, [eventId]: response.data.data }));
      setSelectedEvent(eventId);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Error loading RSVP summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanStartTime = formData.start_time?.slice(0, 5);
    const cleanEndTime = formData.end_time?.slice(0, 5);

    const payload = {
      ...formData,
      start_time: cleanStartTime,
      end_time: cleanEndTime,
    };

    try {
      if (editingEvent) {
        await eventsAPI.put(`/${editingEvent.id}`, payload);
      } else {
        await eventsAPI.post('/', payload);
      }

      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const formattedDate = event.date ? new Date(event.date).toISOString().slice(0, 10) : '';

    setFormData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.delete(`/${eventId}`);
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: ''
    });
    setEditingEvent(null);
  };

  const summaryData = selectedEvent ? rsvpSummaries[selectedEvent] : null;

  // Format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1F1F1F]">Event Management</h1>
            <p className="text-[#6B6B6B] mt-1">Create, edit, and monitor event RSVPs</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#6B4EFF] text-white px-5 py-3 rounded-lg hover:bg-opacity-90 
                     transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center">
              <div className="bg-[#F4F2FF] p-3 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-[#6B4EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#6B6B6B]">Total Events</p>
                <p className="text-2xl font-bold text-[#1F1F1F]">{events.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center">
              <div className="bg-[#F4F2FF] p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-[#6B4EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#6B6B6B]">Total RSVPs</p>
                <p className="text-2xl font-bold text-[#1F1F1F]">
                  {events.reduce((sum, event) => sum + (event.going_count || 0) + (event.maybe_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table/Cards */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E0E0E0]">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA] border-b border-[#E0E0E0]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">RSVP Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {events?.map((event) => (
                  <tr key={event?.id} className="hover:bg-[#F4F2FF] transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-lg font-semibold text-[#1F1F1F] mb-1">{event?.title}</div>
                        <div className="text-sm text-[#6B6B6B] line-clamp-2">{event?.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                        <div>
                          <div className="text-[#1F1F1F] font-medium">{formatEventDate(event.date)}</div>
                          <div className="flex items-center text-[#6B6B6B] mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {event?.start_time} - {event?.end_time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                        <span className="text-[#1F1F1F]">{event?.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => loadRsvpSummary(event?._id)}
                        className="flex items-center space-x-3 text-sm hover:opacity-80 transition-opacity"
                      >
                        <div className="bg-[#F4F2FF] p-2 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-[#6B4EFF]" />
                        </div>
                        <div className="flex space-x-3">
                          <span className="bg-[#4CAF50] text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✓ {event.going_count || 0}
                          </span>
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                            ? {event.maybe_count || 0}
                          </span>
                          <span className="bg-[#E53935] text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✗ {event.decline_count || 0}
                          </span>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(event)} 
                          className="p-2 bg-[#F4F2FF] text-[#6B4EFF] rounded-lg hover:bg-[#6B4EFF] hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event?.id)} 
                          className="p-2 bg-red-50 text-[#E53935] rounded-lg hover:bg-[#E53935] hover:text-white transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {events?.map((event) => (
              <div key={event?.id} className="p-4 border-b border-[#E0E0E0] hover:bg-[#F4F2FF] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F1F1F] mb-1">{event?.title}</h3>
                    <p className="text-sm text-[#6B6B6B] line-clamp-2">{event?.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(event)} className="p-2">
                      <Edit className="h-4 w-4 text-[#6B4EFF]" />
                    </button>
                    <button onClick={() => handleDelete(event?.id)} className="p-2">
                      <Trash2 className="h-4 w-4 text-[#E53935]" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                    <span className="text-[#1F1F1F]">{formatEventDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                    <span className="text-[#1F1F1F]">{event?.start_time} - {event?.end_time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                    <span className="text-[#1F1F1F]">{event?.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => loadRsvpSummary(event?._id)}
                  className="w-full flex items-center justify-between bg-[#F4F2FF] p-3 rounded-lg mt-2"
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-[#6B4EFF] mr-2" />
                    <span className="text-sm font-medium text-[#1F1F1F]">RSVP Summary</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-xs font-medium text-[#4CAF50]">✓ {event.going_count || 0}</span>
                    <span className="text-xs font-medium text-amber-600">? {event.maybe_count || 0}</span>
                    <span className="text-xs font-medium text-[#E53935]">✗ {event.decline_count || 0}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {events?.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="bg-[#F4F2FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-[#6B4EFF]" />
              </div>
              <h3 className="text-lg font-medium text-[#1F1F1F] mb-2">No events yet</h3>
              <p className="text-[#6B6B6B] max-w-md mx-auto mb-6">
                Create your first event to start managing RSVPs and attendees
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#6B4EFF] text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Summary Modal */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 relative max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1F1F1F]">RSVP Summary</h2>
                <p className="text-[#6B6B6B]">Detailed breakdown of attendee responses</p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#6B6B6B]" />
              </button>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {summaryData.summary.map((s, i) => (
                <div 
                  key={i} 
                  className={`p-5 rounded-xl border ${s.status === 'going' ? 'border-green-100 bg-green-50' : 
                    s.status === 'maybe' ? 'border-amber-100 bg-amber-50' : 
                    'border-red-100 bg-red-50'}`}
                >
                  <p className={`font-semibold text-lg mb-1 ${s.status === 'going' ? 'text-[#4CAF50]' : 
                    s.status === 'maybe' ? 'text-amber-600' : 
                    'text-[#E53935]'}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </p>
                  <p className="text-3xl font-bold text-[#1F1F1F]">{s.count}</p>
                  <p className="text-sm text-[#6B6B6B] mt-2">Attendees</p>
                </div>
              ))}
            </div>

            {/* Users List */}
            <div className="space-y-6">
              {Object.entries(summaryData.users).map(([status, users]) => (
                <div key={status} className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                  <div className={`p-4 ${status === 'going' ? 'bg-green-50 border-b border-green-100' : 
                    status === 'maybe' ? 'bg-amber-50 border-b border-amber-100' : 
                    'bg-red-50 border-b border-red-100'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold ${status === 'going' ? 'text-[#4CAF50]' : 
                        status === 'maybe' ? 'text-amber-600' : 
                        'text-[#E53935]'}`}>
                        {status.toUpperCase()}
                      </h3>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-[#1F1F1F]">
                        {users.length} {users.length === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-[#E0E0E0]">
                    {users.map((user) => (
                      <div key={user.user_id} className="p-4 hover:bg-[#FAFAFA] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#1F1F1F]">{user.name}</p>
                            <p className="text-sm text-[#6B6B6B]">{user.email}</p>
                          </div>
                          <p className="text-sm text-[#6B6B6B]">
                            Responded on {new Date(user.rsvp_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1F1F1F]">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#6B6B6B]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                  placeholder="Describe your event"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
                  placeholder="Event venue or address"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-[#FAFAFA] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6B4EFF] text-white rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AdminEvents;