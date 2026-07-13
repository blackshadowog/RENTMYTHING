import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Shield, LayoutDashboard, Plus, MapPin, Check, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Notification, User as UserType, UserRole } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onViewChange: (view: 'home' | 'search' | 'dashboard' | 'admin', selectedCategory?: string) => void;
  activeView: string;
  onOpenAuthModal: () => void;
  onOpenListingModal: () => void;
  notifications: Notification[];
  onRefreshNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onViewChange,
  activeView,
  onOpenAuthModal,
  onOpenListingModal,
  notifications,
  onRefreshNotifications
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchWord, setSearchWord] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onViewChange('search');
    // Save to window variable or let Search component read it
    (window as any).globalSearchTerm = searchWord;
    const event = new CustomEvent('globalSearch', { detail: searchWord });
    window.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onViewChange('home')} 
          className="flex cursor-pointer items-center space-x-2 text-rose-500 transition hover:opacity-90"
          id="navbar-logo"
        >
          <div className="rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-2 text-white shadow-md shadow-rose-200">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-gray-900 sm:block">
            RentMy<span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Thing</span>
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search cameras, laptops, cycles nearby..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </form>

        {/* Action Menus */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onViewChange('search')}
            className={`text-sm font-medium transition ${activeView === 'search' ? 'text-rose-500' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Explore
          </button>

          {user && (
            <button
              onClick={onOpenListingModal}
              className="hidden items-center space-x-1.5 rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 sm:flex"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>List Item</span>
            </button>
          )}

          {/* Notifications Panel */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowUserDropdown(false);
                }}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition focus:outline-none"
                id="btn-notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium text-rose-500">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-gray-400">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`flex flex-col rounded-xl p-2.5 transition hover:bg-gray-50 text-xs border-b border-gray-50 last:border-0 ${!n.read ? 'bg-rose-50/30' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-gray-900">{n.title}</span>
                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="text-[10px] font-semibold text-rose-500 hover:underline flex items-center"
                              >
                                <Check className="h-3 w-3 mr-0.5" /> Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-gray-500 mt-1">{n.message}</p>
                          <span className="text-[9px] text-gray-300 mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center space-x-2 rounded-full border border-gray-200 p-1.5 hover:shadow-sm transition"
                id="btn-user-profile"
              >
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="hidden pr-2 text-xs font-medium text-gray-700 sm:block">{user.name.split(' ')[0]}</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="border-b border-gray-100 px-4 py-2.5">
                    <p className="text-xs font-medium text-gray-400">Logged in as</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{user.email}</p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        onViewChange('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className={`flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-left text-xs transition ${activeView === 'dashboard' ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      <span>My Dashboard</span>
                    </button>

                    {user.role === UserRole.ADMIN && (
                      <button
                        onClick={() => {
                          onViewChange('admin');
                          setShowUserDropdown(false);
                        }}
                        className={`flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-left text-xs transition ${activeView === 'admin' ? 'bg-amber-50 text-amber-600' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold">Admin Panel</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="flex w-full items-center space-x-2 rounded-xl px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
              id="btn-login"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
