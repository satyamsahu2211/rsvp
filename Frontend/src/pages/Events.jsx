import React, { useState, useEffect } from 'react';
import { eventsAPI, rsvpAPI } from '../services/api';
import { Calendar, MapPin, Clock, Users, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [eventsResponse, rsvpsResponse] = await Promise.all([
        eventsAPI.get('/'),
        rsvpAPI.get('/my-rsvps')
      ]);
      
      setEvents(eventsResponse?.data?.data?.events || []);
      
      // Load user's RSVP status for each event
      const statusMap = {};
      (rsvpsResponse?.data?.data?.rsvps || []).forEach(rsvp => {
        statusMap[rsvp.event_id] = rsvp.status;
      });
      setRsvpStatus(statusMap);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await rsvpAPI.post('/', { event_id: eventId, status });
      setRsvpStatus(prev => ({ ...prev, [eventId]: status }));
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = date - now;
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   if (diffDays === 0) return 'Today';
  //   if (diffDays === 1) return 'Tomorrow';
  //   if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    
  //   return date.toLocaleDateString('en-US', {
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const getStatusButtonConfig = (status) => {
    const configs = {
      going: {
        icon: CheckCircle,
        text: 'Going',
        activeClass: 'bg-[#4CAF50] text-white border-[#4CAF50]',
        inactiveClass: 'bg-green-50 text-[#4CAF50] border-green-100 hover:bg-green-100'
      },
      maybe: {
        icon: AlertCircle,
        text: 'Maybe',
        activeClass: 'bg-amber-500 text-white border-amber-500',
        inactiveClass: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
      },
      decline: {
        icon: XCircle,
        text: "Can't Go",
        activeClass: 'bg-[#E53935] text-white border-[#E53935]',
        inactiveClass: 'bg-red-50 text-[#E53935] border-red-100 hover:bg-red-100'
      }
    };
    return configs[status] || {};
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const diffTime = eventDateObj - now;
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours < 0) return 'past';
    if (diffHours < 24) return 'today';
    if (diffHours < 48) return 'tomorrow';
    return 'upcoming';
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    const status = getEventStatus(event.date);
    return status === activeFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF]/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF]/30 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F1F1F] mb-4">
            Discover <span className="text-[#6B4EFF]">Events</span>
          </h1>
          <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto">
            Find and join exciting events happening around you
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Events', count: events.length },
            { id: 'today', label: 'Today', count: events.filter(e => getEventStatus(e.date) === 'today').length },
            { id: 'tomorrow', label: 'Tomorrow', count: events.filter(e => getEventStatus(e.date) === 'tomorrow').length },
            { id: 'upcoming', label: 'Upcoming', count: events.filter(e => getEventStatus(e.date) === 'upcoming').length }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                activeFilter === filter.id
                  ? 'bg-[#6B4EFF] text-white shadow-md'
                  : 'bg-white text-[#6B6B6B] hover:bg-[#F4F2FF] border border-[#E0E0E0]'
              }`}
            >
              {filter.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeFilter === filter.id
                  ? 'bg-white/20'
                  : 'bg-[#F4F2FF] text-[#6B4EFF]'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents?.map((event) => {
            const eventStatus = getEventStatus(event.date);
            const currentRsvp = rsvpStatus[event._id];
            
            return (
              <div 
                key={event?.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E0E0E0] group"
              >
                {/* Event Header with Status Badge */}
                <div className="p-6 pb-4 relative">
                  {eventStatus === 'today' && (
                    <span className="absolute top-4 right-4 bg-[#FF8A65] text-white text-xs font-bold px-3 py-1 rounded-full">
                      TODAY
                    </span>
                  )}
                  {eventStatus === 'tomorrow' && (
                    <span className="absolute top-4 right-4 bg-[#6B4EFF] text-white text-xs font-bold px-3 py-1 rounded-full">
                      TOMORROW
                    </span>
                  )}
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-[#F4F2FF] p-3 rounded-xl flex-shrink-0">
                      <Calendar className="h-6 w-6 text-[#6B4EFF]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1F1F1F] mb-2 group-hover:text-[#6B4EFF] transition-colors">
                        {event?.title}
                      </h3>
                      <div className="text-sm text-[#6B4EFF] font-medium">
                        {formatFullDate(event?.date)}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#6B6B6B] line-clamp-3 mb-4">
                    {event?.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-[#6B6B6B] mr-3 flex-shrink-0" />
                    <div>
                      <span className="text-[#1F1F1F] font-medium">{formatTime(event?.start_time)}</span>
                      <span className="text-[#6B6B6B] mx-2">→</span>
                      <span className="text-[#1F1F1F] font-medium">{formatTime(event?.end_time)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-[#6B6B6B] mr-3 flex-shrink-0" />
                    <span className="text-[#1F1F1F]">{event?.location}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-[#6B6B6B] mr-3 flex-shrink-0" />
                    <div>
                      <span className="text-[#6B6B6B]">Hosted by </span>
                      <span className="text-[#1F1F1F] font-medium">{event?.created_by_name}</span>
                    </div>
                  </div>

                  {/* RSVP Stats */}
                  {event.going_count > 0 && (
                    <div className="pt-3 border-t border-[#E0E0E0]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6B6B6B]">Attending</span>
                        <div className="flex items-center">
                          <div className="flex -space-x-2 mr-2">
                            {[...Array(Math.min(3, event.going_count))].map((_, i) => (
                              <div 
                                key={i} 
                                className="w-6 h-6 rounded-full bg-[#6B4EFF] border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                              >
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            +{event.going_count} going
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RSVP Buttons */}
                <div className="px-6 pb-6 pt-4 border-t border-[#E0E0E0] bg-[#FAFAFA]">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-[#6B6B6B] mb-2">
                      {currentRsvp ? 'Your response:' : 'Will you attend?'}
                    </p>
                    {currentRsvp && (
                      <div className="flex items-center">
                        {React.createElement(getStatusButtonConfig(currentRsvp).icon, { 
                          className: "h-4 w-4 mr-2" 
                        })}
                        <span className="text-sm font-medium text-[#1F1F1F]">
                          {getStatusButtonConfig(currentRsvp).text}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['going', 'maybe', 'decline'].map((status) => {
                      const config = getStatusButtonConfig(status);
                      const Icon = config.icon;
                      const isActive = currentRsvp === status;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleRSVP(event._id, status)}
                          className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center border ${
                            isActive ? config.activeClass : config.inactiveClass
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{config.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-[#F4F2FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-[#6B4EFF]" />
            </div>
            <h3 className="text-xl font-medium text-[#1F1F1F] mb-2">No events found</h3>
            <p className="text-[#6B6B6B] max-w-md mx-auto">
              {activeFilter === 'all' 
                ? "There are no events scheduled at the moment. Check back soon!"
                : `No ${activeFilter} events found. Try viewing all events.`
              }
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-4 bg-[#6B4EFF] text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-all inline-flex items-center"
              >
                View All Events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;