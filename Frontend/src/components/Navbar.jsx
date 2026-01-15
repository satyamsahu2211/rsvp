import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Menu, X, User, LogOut, Home, LayoutDashboard, Users, Ticket, ChevronDown, Sparkles } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getActiveClass = (path) => {
    return isActive(path) 
      ? "bg-[#6B4EFF] text-white" 
      : "text-[#6B6B6B] hover:bg-[#F4F2FF] hover:text-[#6B4EFF]";
  };

  const NavLinks = ({ mobile = false }) => {
    const linkClass = mobile 
      ? "flex items-center px-4 py-3 text-base font-medium transition-colors rounded-lg"
      : "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-lg";

    return (
      <div className={mobile ? "space-y-1" : "flex items-center space-x-1"}>
        {user?.role === "admin" ? (
          <>
            <Link
              to="/admin/events"
              className={`${linkClass} ${getActiveClass("/admin/events")}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Admin Panel
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className={`${linkClass} ${getActiveClass("/dashboard")}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/events"
              className={`${linkClass} ${getActiveClass("/events")}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Events
            </Link>
            <Link
              to="/my-rsvps"
              className={`${linkClass} ${getActiveClass("/my-rsvps")}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Ticket className="h-5 w-5 mr-2" />
              My RSVPs
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-[#E0E0E0]/50' 
        : 'bg-white border-b border-[#E0E0E0]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to={user?.role === "admin" ? "/admin/events" : "/dashboard"} 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6B4EFF] to-[#FF8A65] rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[#6B4EFF] to-[#FF8A65] p-2 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#1F1F1F] leading-tight">
                  EventPlanner
                </span>
                <span className="text-xs text-[#6B6B6B]">
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'Event Management'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:ml-8">
              <NavLinks />
            </div>
          </div>

          {/* Right Side - User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-3">
              {user?.role !== 'admin' && (
                <div className="relative group">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#F4F2FF] group-hover:bg-[#6B4EFF]/10 transition-colors">
                    <Sparkles className="h-4 w-4 text-[#6B4EFF]" />
                    <span className="text-sm font-medium text-[#6B4EFF]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#6B4EFF]" />
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E0E0E0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                    <div className="p-4 border-b border-[#E0E0E0]">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#F4F2FF] p-2 rounded-lg">
                          <User className="h-5 w-5 text-[#6B4EFF]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1F1F1F]">{user?.name}</p>
                          <p className="text-sm text-[#6B6B6B]">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="px-3 py-2 rounded-lg bg-[#FAFAFA] mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#6B6B6B]">Role</span>
                          <span className="px-2 py-1 bg-[#6B4EFF] text-white text-xs font-medium rounded-full capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </div>
                        <span className="text-xs text-[#6B6B6B]">⌘Q</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {user?.role === 'admin' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#6B6B6B] hover:bg-[#F4F2FF] hover:text-[#6B4EFF] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E0E0E0] py-4 animate-slideDown">
            <div className="flex flex-col space-y-2">
              <NavLinks mobile />
              
              {/* User Info & Logout */}
              <div className="pt-4 border-t border-[#E0E0E0] mt-2">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#F4F2FF] p-2 rounded-lg">
                      <User className="h-5 w-5 text-[#6B4EFF]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F1F1F]">{user?.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[#6B6B6B]">{user?.email}</span>
                        <span className="px-2 py-0.5 bg-[#6B4EFF] text-white text-xs font-medium rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-[#E53935] hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .group:hover .group-hover\\:visible {
          visibility: visible;
        }
        
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;