import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, rsvpAPI } from '../services/api';
import { Calendar, Users, CheckCircle, Clock, MapPin, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    myRsvps: 0,
    goingCount: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myUpcomingRsvps, setMyUpcomingRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [eventsResponse, rsvpsResponse] = await Promise.all([
        eventsAPI.get('/'),
        rsvpAPI.get('/my-rsvps')
      ]);  

      const events = eventsResponse?.data?.data?.events;
      const rsvps = rsvpsResponse?.data?.data?.rsvps || [];

      // Calculate stats
      const goingRsvps = rsvps.filter(rsvp => rsvp.status === 'going');
      const upcomingRsvps = rsvps.filter(rsvp => new Date(rsvp.date) >= new Date());

      setStats({
        totalEvents: events.length,
        myRsvps: rsvps.length,
        goingCount: goingRsvps.length
      });

      // Get upcoming events (next 5)
      setUpcomingEvents(events.slice(0, 5));

      // Get my upcoming RSVPs (next 3)
      setMyUpcomingRsvps(upcomingRsvps.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'going': return 'text-[#4CAF50] bg-green-50 border border-green-100';
      case 'maybe': return 'text-amber-600 bg-amber-50 border border-amber-100';
      case 'decline': return 'text-[#E53935] bg-red-50 border border-red-100';
      default: return 'text-[#6B6B6B] bg-[#FAFAFA] border border-[#E0E0E0]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'going': return '✅';
      case 'maybe': return '❓';
      case 'decline': return '❌';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF]/30 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F1F1F]">
                Welcome back, <span className="text-[#6B4EFF]">{user?.name}</span>! 👋
              </h1>
              <p className="text-[#6B6B6B] mt-2 text-lg">
                Here's your event activity overview
              </p>
            </div>
            <div className="text-sm text-[#6B6B6B] bg-white px-4 py-2 rounded-lg border border-[#E0E0E0]">
              <span className="font-medium">Last updated:</span> Today
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6B6B] mb-2">Total Events</p>
                <p className="text-3xl font-bold text-[#1F1F1F]">{stats.totalEvents}</p>
                <p className="text-xs text-[#6B6B6B] mt-2">All upcoming and past events</p>
              </div>
              <div className="bg-[#F4F2FF] p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-[#6B4EFF]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
              <div className="flex items-center text-sm text-[#4CAF50]">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Active now</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6B6B] mb-2">Confirmed RSVPs</p>
                <p className="text-3xl font-bold text-[#1F1F1F]">{stats.goingCount}</p>
                <p className="text-xs text-[#6B6B6B] mt-2">Events you're attending</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-[#4CAF50]" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
              <div className="text-sm text-[#6B6B6B]">
                <span className="font-medium">{stats.goingCount}</span> of {stats.myRsvps} total responses
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6B6B] mb-2">My RSVPs</p>
                <p className="text-3xl font-bold text-[#1F1F1F]">{stats.myRsvps}</p>
                <p className="text-xs text-[#6B6B6B] mt-2">Total responses submitted</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
              <div className="flex items-center space-x-2">
                <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                  <div 
                    className="bg-[#6B4EFF] h-2 rounded-full" 
                    style={{ width: stats.totalEvents ? `${(stats.myRsvps / stats.totalEvents) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="text-xs text-[#6B6B6B] whitespace-nowrap">
                  {stats.totalEvents ? Math.round((stats.myRsvps / stats.totalEvents) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] overflow-hidden">
            <div className="p-6 border-b border-[#E0E0E0] bg-gradient-to-r from-[#F4F2FF] to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">Upcoming Events</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Next events happening soon</p>
                </div>
                <Link
                  to="/events"
                  className="text-[#6B4EFF] hover:text-opacity-80 text-sm font-medium flex items-center group"
                >
                  View all 
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents?.map((event, index) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      className="block border border-[#E0E0E0] rounded-xl p-4 hover:border-[#6B4EFF] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start">
                        <div className="bg-[#F4F2FF] text-[#6B4EFF] font-bold text-sm px-3 py-2 rounded-lg mr-4 min-w-12 text-center">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-[#1F1F1F] group-hover:text-[#6B4EFF] transition-colors">
                              {event.title}
                            </h3>
                            {event.rsvp_count && (
                              <span className="text-xs text-[#6B6B6B] bg-[#FAFAFA] px-2 py-1 rounded">
                                {event.rsvp_count} attending
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-[#6B6B6B]">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center text-[#6B6B6B]">
                              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                            </div>
                            <div className="flex items-center text-[#6B6B6B]">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-[#F4F2FF] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-[#6B4EFF]" />
                  </div>
                  <p className="text-[#6B6B6B]">No upcoming events found</p>
                  <Link
                    to="/events"
                    className="inline-block mt-3 text-[#6B4EFF] text-sm font-medium hover:text-opacity-80"
                  >
                    Browse all events
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* My Upcoming RSVPs Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] overflow-hidden">
            <div className="p-6 border-b border-[#E0E0E0] bg-gradient-to-r from-[#F4F2FF] to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#1F1F1F]">My Upcoming RSVPs</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1">Your event responses</p>
                </div>
                <Link
                  to="/my-rsvps"
                  className="text-[#6B4EFF] hover:text-opacity-80 text-sm font-medium flex items-center group"
                >
                  View all 
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {myUpcomingRsvps.length > 0 ? (
                <div className="space-y-4">
                  {myUpcomingRsvps.map((rsvp) => (
                    <div 
                      key={rsvp.id} 
                      className="border border-[#E0E0E0] rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-[#1F1F1F]">{rsvp.title}</h3>
                        <div className="flex items-center">
                          <span className="text-xs mr-2 opacity-70">{getStatusIcon(rsvp.status)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rsvp.status)}`}>
                            {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-[#6B6B6B]">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(rsvp.date)}</span>
                        </div>
                        <div className="flex items-center text-[#6B6B6B]">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{formatTime(rsvp.start_time)}</span>
                        </div>
                        <div className="flex items-center text-[#6B6B6B]">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{rsvp.location}</span>
                        </div>
                      </div>
                      {rsvp.status === 'going' && (
                        <div className="mt-4 pt-3 border-t border-[#E0E0E0]">
                          <div className="flex items-center text-xs text-[#4CAF50]">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>You're attending this event</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-[#F4F2FF] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-[#6B4EFF]" />
                  </div>
                  <p className="text-[#6B6B6B]">No upcoming RSVPs yet</p>
                  <Link
                    to="/events"
                    className="inline-block mt-3 text-[#6B4EFF] text-sm font-medium hover:text-opacity-80"
                  >
                    Browse events to RSVP
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6">
            <h2 className="text-xl font-bold text-[#1F1F1F] mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/events"
                className="bg-[#6B4EFF] text-white px-5 py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center shadow-md hover:shadow-lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Manage Events
              </Link>
              <Link
                to="/events"
                className="bg-white text-[#6B4EFF] border border-[#6B4EFF] px-5 py-3 rounded-lg hover:bg-[#F4F2FF] transition-all flex items-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Browse Events
              </Link>
              <Link
                to="/admin/analytics"
                className="bg-[#FAFAFA] text-[#1F1F1F] px-5 py-3 rounded-lg hover:bg-[#F4F2FF] transition-all flex items-center border border-[#E0E0E0]"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Analytics
              </Link>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B6B6B]">
            Need help? <Link to="/help" className="text-[#6B4EFF] hover:underline">Visit our help center</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;