import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rsvpAPI } from '../services/api';
import { Calendar, MapPin, Clock, Search, Filter, CheckCircle, AlertCircle, XCircle, Users, Loader2, ArrowRight } from 'lucide-react';

function MyRSVPs() {
  const [rsvps, setRsvps] = useState([]);
  const [filteredRsvps, setFilteredRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingRsvp, setUpdatingRsvp] = useState(null);

  useEffect(() => {
    loadMyRSVPs();
  }, []);

  useEffect(() => {
    filterRSVPs();
  }, [rsvps, searchTerm, statusFilter]);

  const loadMyRSVPs = async () => {
    try {
      const response = await rsvpAPI.get('/my-rsvps');
      setRsvps(response.data.data.rsvps || []);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRSVPs = () => {
    let filtered = rsvps;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rsvp =>
        rsvp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.status === statusFilter);
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setFilteredRsvps(filtered);
  };

  const handleRSVPUpdate = async (rsvpId, newStatus) => {
    try {
      setUpdatingRsvp(rsvpId);
      const rsvp = rsvps.find(r => r.id === rsvpId);
      await rsvpAPI.post('/', { event_id: rsvp.event_id, status: newStatus });
      
      // Update local state
      setRsvps(prev => prev.map(r => 
        r.id === rsvpId ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error('Error updating RSVP:', error);
    } finally {
      setUpdatingRsvp(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const getStatusConfig = (status) => {
    const configs = {
      going: {
        icon: CheckCircle,
        color: 'text-[#4CAF50] bg-green-50 border-green-100',
        text: 'Going',
        badgeColor: 'bg-[#4CAF50]',
        iconColor: 'text-[#4CAF50]'
      },
      maybe: {
        icon: AlertCircle,
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        text: 'Maybe',
        badgeColor: 'bg-amber-500',
        iconColor: 'text-amber-600'
      },
      decline: {
        icon: XCircle,
        color: 'text-[#E53935] bg-red-50 border-red-100',
        text: "Can't Go",
        badgeColor: 'bg-[#E53935]',
        iconColor: 'text-[#E53935]'
      }
    };
    return configs[status] || {};
  };

  const getStatusButtonConfig = (status) => {
    const configs = {
      going: {
        icon: CheckCircle,
        activeClass: 'bg-[#4CAF50] text-white border-[#4CAF50]',
        inactiveClass: 'bg-white text-[#4CAF50] border-green-200 hover:bg-green-50'
      },
      maybe: {
        icon: AlertCircle,
        activeClass: 'bg-amber-500 text-white border-amber-500',
        inactiveClass: 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
      },
      decline: {
        icon: XCircle,
        activeClass: 'bg-[#E53935] text-white border-[#E53935]',
        inactiveClass: 'bg-white text-[#E53935] border-red-200 hover:bg-red-50'
      }
    };
    return configs[status] || {};
  };

  const isEventPassed = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const getStatusStats = () => {
    const stats = {
      all: rsvps.length,
      going: rsvps.filter(r => r.status === 'going').length,
      maybe: rsvps.filter(r => r.status === 'maybe').length,
      decline: rsvps.filter(r => r.status === 'decline').length
    };
    return stats;
  };

  const statusStats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF]/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4EFF] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading your RSVPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF]/30 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F1F1F]">
                My <span className="text-[#6B4EFF]">RSVPs</span>
              </h1>
              <p className="text-[#6B6B6B] mt-2">Manage your event responses and attendance</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[#6B6B6B] bg-white px-4 py-2 rounded-lg border border-[#E0E0E0]">
              <span className="font-medium">{rsvps.length}</span>
              <span>total responses</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(statusStats).map(([status, count]) => {
              const config = getStatusConfig(status);
              const Icon = config.icon;
              const isActive = statusFilter === status;
              
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'border-[#6B4EFF] bg-[#F4F2FF] ring-2 ring-[#6B4EFF]/20' 
                      : 'border-[#E0E0E0] bg-white hover:border-[#6B4EFF]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm text-[#6B6B6B] capitalize">
                        {status === 'all' ? 'All RSVPs' : status}
                      </p>
                      <p className="text-2xl font-bold text-[#1F1F1F]">{count}</p>
                    </div>
                    {Icon && (
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#6B4EFF]/10' : 'bg-[#FAFAFA]'}`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-[#6B4EFF]' : config.iconColor}`} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#6B6B6B]" />
              </div>
              <input
                type="text"
                placeholder="Search events by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-[#1F1F1F] placeholder-[#6B6B6B]/60 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#F4F2FF] p-2 rounded-lg">
                <Filter className="h-5 w-5 text-[#6B4EFF]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#E0E0E0] rounded-xl px-4 py-3 bg-[#FAFAFA] text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="going">Going</option>
                <option value="maybe">Maybe</option>
                <option value="decline">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {/* RSVPs List */}
        {filteredRsvps.length > 0 ? (
          <div className="space-y-6">
            {filteredRsvps.map((rsvp) => {
              const isPassed = isEventPassed(rsvp.date);
              const statusConfig = getStatusConfig(rsvp.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={rsvp.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E0E0E0] hover:shadow-xl transition-all ${
                    isPassed ? 'opacity-80' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#1F1F1F]">
                                {rsvp.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 ${statusConfig.color}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {statusConfig.text}
                              </span>
                            </div>
                            <p className="text-[#6B6B6B] line-clamp-2">
                              {rsvp.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center text-[#6B6B6B]">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-[#1F1F1F]">{formatDate(rsvp.date)}</span>
                                {!isPassed && (
                                  <span className="ml-2 text-xs text-[#6B6B6B]">
                                    ({formatFullDate(rsvp.date)})
                                  </span>
                                )}
                              </div>
                              {isPassed && (
                                <span className="ml-3 px-2 py-1 bg-[#FAFAFA] text-[#6B6B6B] text-xs rounded border border-[#E0E0E0]">
                                  Past Event
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center text-[#6B6B6B]">
                              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium text-[#1F1F1F]">{formatTime(rsvp.start_time)}</span>
                              {rsvp.end_time && (
                                <>
                                  <span className="mx-2">-</span>
                                  <span className="font-medium text-[#1F1F1F]">{formatTime(rsvp.end_time)}</span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center text-[#6B6B6B]">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium text-[#1F1F1F]">{rsvp.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RSVP Actions */}
                      {!isPassed && (
                        <div className="lg:w-64">
                          <div className="bg-[#FAFAFA] rounded-xl p-4 border border-[#E0E0E0]">
                            <p className="text-sm font-medium text-[#6B6B6B] mb-3">
                              Update your response:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {['going', 'maybe', 'decline'].map((status) => {
                                const config = getStatusButtonConfig(status);
                                const Icon = config.icon;
                                const isActive = rsvp.status === status;
                                const isUpdating = updatingRsvp === rsvp.id;
                                
                                return (
                                  <button
                                    key={status}
                                    onClick={() => !isUpdating && handleRSVPUpdate(rsvp.id, status)}
                                    disabled={isActive || isUpdating}
                                    className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center border relative ${
                                      isActive ? config.activeClass : config.inactiveClass
                                    } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                                  >
                                    {isUpdating && isActive ? (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                      </div>
                                    ) : (
                                      <>
                                        <Icon className="h-4 w-4 mb-1 opacity-80" />
                                        <span className="text-xs">
                                          {config.icon === CheckCircle ? 'Going' :
                                           config.icon === AlertCircle ? 'Maybe' :
                                           "Can't Go"}
                                        </span>
                                      </>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {rsvp.status === 'going' && (
                              <div className="mt-3 pt-3 border-t border-[#E0E0E0]">
                                <div className="flex items-center text-xs text-[#4CAF50]">
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                  <span>You're attending this event</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-12 max-w-2xl mx-auto">
              <div className="bg-[#F4F2FF] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#6B4EFF]" />
              </div>
              <h3 className="text-xl font-medium text-[#1F1F1F] mb-2">
                {rsvps.length === 0 ? "No RSVPs yet" : "No matching RSVPs"}
              </h3>
              <p className="text-[#6B6B6B] max-w-md mx-auto mb-6">
                {rsvps.length === 0 
                  ? "You haven't responded to any events yet. Browse events to RSVP."
                  : "Try adjusting your search or filter to find your RSVPs."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/events"
                  className="bg-[#6B4EFF] text-white px-5 py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  Browse Events
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="bg-white text-[#6B4EFF] border border-[#6B4EFF] px-5 py-3 rounded-lg hover:bg-[#F4F2FF] transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRSVPs;