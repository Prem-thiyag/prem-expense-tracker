// File: src/components/Navbar.tsx

import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { Bell, UserCircle, Clock, CheckCircle } from "lucide-react";
import logo from "../assets/logo.png";
import { logout, getUnreadAlerts, acknowledgeAlert } from "../api/apiClient";
import type { Alert } from "../types";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(duration);
dayjs.extend(relativeTime);

const Navbar: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string | null>(null);
  
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.length;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const getActiveLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "#22c55e" : "#d1d5db",
    fontWeight: isActive ? "bold" : "normal",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ✅ Fix #1: Corrected the typo from your previous error log.
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect for the session timer
  useEffect(() => {
    const updateTimer = () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setSessionTimeLeft(null);
        return;
      }
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const expirationTime = decodedPayload.exp * 1000;
        const now = new Date().getTime();
        const timeLeft = expirationTime - now;

        if (timeLeft > 0) {
          setSessionTimeLeft(dayjs.duration(timeLeft).format('mm:ss'));
        } else {
          setSessionTimeLeft("00:00");
        }
      } catch (error) {
        console.error("Failed to decode token for timer:", error);
        setSessionTimeLeft(null);
      }
    };
    
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Effect to fetch notifications
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const unreadAlerts = await getUnreadAlerts();
        setAlerts(unreadAlerts);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleAcknowledgeAlert = async (alertId: number) => {
    setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId));
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  return (
    <header className="bg-gray-900 h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <img src={logo} alt="ExpenseTracker Logo" className="h-8 w-8" />
        <span className="text-white text-lg font-semibold">ExpenseTracker</span>
      </div>
      
      <nav className="hidden md:flex space-x-6">
        <NavLink to="/dashboard" style={getActiveLinkStyle} className="hover:text-white text-sm">Dashboard</NavLink>
        <NavLink to="/analytics" style={getActiveLinkStyle} className="hover:text-white text-sm">Analytics</NavLink>
        <NavLink to="/expenses" style={getActiveLinkStyle} className="hover:text-white text-sm">Expenses</NavLink>
        <NavLink to="/budgets" style={getActiveLinkStyle} className="hover:text-white text-sm">Budgets</NavLink>
        <NavLink to="/settings" style={getActiveLinkStyle} className="hover:text-white text-sm">Settings</NavLink>
      </nav>

      <div className="flex items-center space-x-4 text-white">
        {sessionTimeLeft && (
          <div className="flex items-center text-sm text-gray-400" title="Session time remaining">
            <Clock size={16} className="mr-1.5" />
            <span>{sessionTimeLeft}</span>
          </div>
        )}

        <div className="relative" ref={alertsRef}>
          <button onClick={() => setIsAlertsOpen(!isAlertsOpen)} className="relative hover:text-green-400 focus:outline-none">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3 font-bold border-b">Notifications</div>
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className="p-3 border-b hover:bg-gray-50 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 mt-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-grow">
                      <p className="text-sm">
                        {/* ✅ Fix #2: Use optional chaining (?.) to prevent crashes if `goal` or `category` is not present. */}
                        You've used {alert.threshold_percentage}% of your <strong>{alert.goal?.category?.name || 'a'}</strong> budget for {dayjs(alert.goal?.month + "-01").format("MMMM")}.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{dayjs(alert.triggered_at).fromNow()}</p>
                    </div>
                    <button 
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      title="Mark as read"
                      className="p-1 text-gray-400 hover:text-green-600 flex-shrink-0"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-center text-gray-500">You're all caught up!</p>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="hover:ring-2 ring-white transition duration-150 rounded-full p-1">
            <UserCircle className="w-7 h-7 text-green-400" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-1 z-50">
              <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">
                Your Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;