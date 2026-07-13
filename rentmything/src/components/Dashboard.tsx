import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Phone, Home, Building2, Star, Plus, CheckCircle, Clock, Trash2, XCircle, ArrowRight, Eye, Sparkles, Heart, MessageSquare, AlertCircle, RefreshCw, BarChart3, Lock, Check, QrCode, Scan } from 'lucide-react';
import { api } from '../lib/api';
import { Product, Booking, WishlistItem, User as UserType } from '../types';
import { ChatMessenger } from './ChatMessenger';
import { QRGeneratorModal, QRScannerModal } from './QRManager';

interface DashboardProps {
  user: UserType;
  onRefreshUser: () => void;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
  onRefreshProducts: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onRefreshUser,
  onSelectProduct,
  allProducts,
  onRefreshProducts
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'rentals' | 'orders' | 'wishlist' | 'chats' | 'stats'>('rentals');
  const [myRentals, setMyRentals] = useState<Booking[]>([]);
  const [myOrders, setMyOrders] = useState<Booking[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [pickupCodes, setPickupCodes] = useState<Record<string, string>>({}); // bookingId -> typedCode
  const [actionError, setActionError] = useState<Record<string, string>>({}); // bookingId -> error
  const [actionSuccess, setActionSuccess] = useState<Record<string, string>>({}); // bookingId -> msg
  const [showScanner, setShowScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState<{ booking: Booking; type: 'pickup' | 'return' } | null>(null);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const rentals = await api.getMyRentals();
      setMyRentals(rentals);

      const orders = await api.getMyListings();
      setMyOrders(orders);

      const wishlist = await api.getWishlist();
      setWishlistItems(wishlist);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleVerifyStudent = async () => {
    setVerificationLoading(true);
    try {
      await api.verifyStudent();
      onRefreshUser();
    } catch (err) {
      console.error('Student verification failed', err);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteProduct(id);
      onRefreshProducts();
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleUpdateOrderStatus = async (bookingId: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      setActionError(prev => ({ ...prev, [bookingId]: '' }));
      const updated = await api.updateBookingStatus(bookingId, status);
      
      setActionSuccess(prev => ({ 
        ...prev, 
        [bookingId]: status === 'APPROVED' ? 'Order accepted! Enter the verification code once the student arrives.' : `Order marked as ${status.toLowerCase()}.` 
      }));

      loadDashboardData();
      onRefreshProducts();
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message || 'Action failed' }));
    }
  };

  const handleVerifyPickupCode = async (bookingId: string) => {
    const code = pickupCodes[bookingId];
    if (!code) {
      setActionError(prev => ({ ...prev, [bookingId]: 'Please enter the pickup code.' }));
      return;
    }

    try {
      setActionError(prev => ({ ...prev, [bookingId]: '' }));
      await api.confirmPickup(bookingId, code.trim());
      setActionSuccess(prev => ({ ...prev, [bookingId]: 'Pickup code verified successfully! Possession of item has been transferred.' }));
      loadDashboardData();
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message || 'Verification failed. Code is incorrect.' }));
    }
  };

  const handleScanSuccess = async (bookingId: string, type: 'pickup' | 'return', code: string) => {
    try {
      setActionError(prev => ({ ...prev, [bookingId]: '' }));
      if (type === 'pickup') {
        await api.confirmPickup(bookingId, code);
        setActionSuccess(prev => ({ ...prev, [bookingId]: 'Pickup verified via QR scan! Possession has been transferred.' }));
      } else {
        await api.confirmReturn(bookingId, code);
        setActionSuccess(prev => ({ ...prev, [bookingId]: 'Return verified via QR scan! Rental completed successfully.' }));
      }
      loadDashboardData();
      onRefreshProducts();
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message || 'Verification failed.' }));
      throw err;
    }
  };

  const myListings = allProducts.filter(p => p.ownerId === user.id);
  const myWishlistProducts = allProducts.filter(p => wishlistItems.some(w => w.productId === p.id));

  // Renter Expenses & Listings Income calculation
  const totalRentingExpenses = myRentals
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalListingEarnings = myOrders
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      
      {/* Sidebar Navigation (Left) */}
      <div className="flex flex-col space-y-4 lg:col-span-1">
        
        {/* Student Profile Quick View Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm text-left">
          <div className="flex items-center space-x-3.5">
            <img
              src={user.profileImage}
              alt={user.name}
              className="h-14 w-14 rounded-2xl object-cover border border-gray-100 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center space-x-1.5 mt-1">
                {user.verified ? (
                  <span className="flex items-center space-x-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-600 border border-green-100">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-100">
                    Unverified
                  </span>
                )}
                <div className="flex items-center space-x-0.5 text-xs text-amber-600 font-semibold">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{user.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Building2 className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{user.college}</span>
            </div>
            {user.hostel && (
              <div className="flex items-center space-x-2">
                <Home className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{user.hostel}</span>
              </div>
            )}
          </div>

          {/* Student ID Verification callout */}
          {!user.studentIdVerified && (
            <div className="mt-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100 p-3 text-center">
              <h4 className="text-[10px] font-bold text-amber-800">Verify Student ID</h4>
              <p className="text-[9px] text-amber-700 mt-1 leading-relaxed">Gain double trust badge status and waive standard product listing holding periods.</p>
              <button
                onClick={handleVerifyStudent}
                disabled={verificationLoading}
                className="mt-2.5 w-full rounded-xl bg-amber-600 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-amber-700 transition disabled:opacity-50"
              >
                {verificationLoading ? 'Verifying...' : 'Verify Status'}
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="rounded-3xl border border-gray-100 bg-white p-2.5 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 text-left">
          {[
            { id: 'rentals', label: 'My Rentals (Borrows)', count: myRentals.length },
            { id: 'orders', label: 'Renting Out (Orders)', count: myOrders.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length },
            { id: 'listings', label: 'My Listings', count: myListings.length },
            { id: 'wishlist', label: 'My Wishlist', count: wishlistItems.length },
            { id: 'chats', label: 'Messages', count: 0 },
            { id: 'stats', label: 'Personal Analytics', count: 0 },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition flex-1 lg:flex-initial ${isActive ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${isActive ? 'bg-white text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Panel Content Area (Right) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Panel 1: My Rentals */}
        {activeTab === 'rentals' && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <h3 className="font-bold text-sm text-gray-900">My Rentals & Borrows</h3>
              <button onClick={loadDashboardData} className="text-gray-400 hover:text-gray-900">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loadingData ? (
              <p className="text-center text-xs text-gray-400 py-10">Loading rentals history...</p>
            ) : myRentals.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-xs text-gray-500">No active rentals found</p>
                <p className="text-[10px] text-gray-400 mt-1">Need a projector, gaming console, or a cycle? Find other students listing items around you!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRentals.map(b => (
                  <div key={b.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/20">
                    <img
                      src={b.productImage}
                      alt={b.productTitle}
                      className="h-16 w-16 rounded-xl object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{b.productTitle}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Dates: {b.startDate} to {b.endDate}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                          b.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                          b.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                          b.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {b.status}
                        </span>
                        {b.isPickedUp && (
                          <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                            Picked Up
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                      <span className="text-sm font-black text-gray-900">${b.totalPrice}</span>
                      <span className="text-[9px] text-gray-400">Deposit Paid: ${b.deposit}</span>

                      {/* Code and Return actions */}
                      {b.status === 'APPROVED' && !b.isPickedUp && (
                        <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-100 text-center w-full sm:w-44">
                          <p className="text-[8px] font-bold text-rose-500 uppercase">Pickup Code</p>
                          <p className="font-mono text-xs font-extrabold text-rose-600 tracking-wider mt-0.5">{b.pickupCode}</p>
                          <p className="text-[8px] text-rose-400 mt-1 leading-tight mb-2">Show this code to owner to authorize pick up.</p>
                          <button
                            onClick={() => setShowQRGenerator({ booking: b, type: 'pickup' })}
                            className="w-full flex items-center justify-center space-x-1 rounded-lg bg-rose-500 hover:bg-rose-600 py-1 text-[9px] font-bold text-white transition shadow-sm"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>Show QR Code</span>
                          </button>
                        </div>
                      )}

                      {b.status === 'APPROVED' && b.isPickedUp && (
                        <div className="flex flex-col gap-1.5 w-full sm:w-44">
                          <button
                            onClick={() => handleUpdateOrderStatus(b.id, 'COMPLETED')}
                            className="mt-2.5 w-full rounded-xl bg-rose-500 px-4 py-2 text-[10px] font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600 transition"
                          >
                            Mark Returned & Complete
                          </button>
                          <button
                            onClick={() => setShowQRGenerator({ booking: b, type: 'return' })}
                            className="w-full flex items-center justify-center space-x-1 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 py-1.5 text-[10px] font-bold text-rose-600 transition"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>Show Return QR Code</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel 2: Renting Out (Orders) */}
        {activeTab === 'orders' && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <h3 className="font-bold text-sm text-gray-900">Renting Out My Items</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center space-x-1 rounded-xl bg-rose-500 hover:bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
                >
                  <Scan className="h-3.5 w-3.5" />
                  <span>Scan QR Code</span>
                </button>
                <button onClick={loadDashboardData} className="text-gray-400 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingData ? (
              <p className="text-center text-xs text-gray-400 py-10">Loading borrow requests...</p>
            ) : myOrders.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-xs text-gray-500">No incoming rental orders yet</p>
                <p className="text-[10px] text-gray-400 mt-1">When students nearby request your listed items, they will appear here for you to approve.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(b => {
                  const errorMsg = actionError[b.id];
                  const successMsg = actionSuccess[b.id];
                  return (
                    <div key={b.id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/20 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <img
                          src={b.productImage}
                          alt={b.productTitle}
                          className="h-14 w-14 rounded-xl object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{b.productTitle}</h4>
                          <p className="text-[10px] text-gray-500 mt-1">Renter student: <span className="font-semibold text-gray-700">{b.renterName}</span></p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Dates: {b.startDate} to {b.endDate}</p>
                        </div>
                        <div className="text-right sm:ml-auto flex flex-col items-end gap-1">
                          <span className="text-sm font-black text-gray-900">${b.totalPrice}</span>
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide bg-amber-50 text-amber-700">
                            {b.status}
                          </span>
                        </div>
                      </div>

                      {/* Display Alert Messages */}
                      {errorMsg && (
                        <p className="text-[10px] font-semibold text-rose-500 bg-rose-50 p-2 rounded-xl flex items-center">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" /> {errorMsg}
                        </p>
                      )}
                      {successMsg && (
                        <p className="text-[10px] font-semibold text-green-600 bg-green-50 p-2 rounded-xl flex items-center">
                          <Check className="h-3.5 w-3.5 mr-1" /> {successMsg}
                        </p>
                      )}

                      {/* Dynamic Action Panel */}
                      {b.status === 'PENDING' && (
                        <div className="flex items-center space-x-2 border-t border-gray-50 pt-3">
                          <button
                            onClick={() => handleUpdateOrderStatus(b.id, 'REJECTED')}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-[10px] font-bold text-gray-700 transition hover:bg-gray-50 flex-1 sm:flex-initial"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(b.id, 'APPROVED')}
                            className="rounded-xl bg-rose-500 px-5 py-2 text-[10px] font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600 transition flex-1 sm:flex-initial"
                          >
                            Accept & Approve
                          </button>
                        </div>
                      )}

                      {b.status === 'APPROVED' && !b.isPickedUp && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-gray-50 pt-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-gray-500 uppercase">Verify Student Pickup Code</p>
                            <p className="text-[9px] text-gray-400">Ask the renter student for their pickup code to authorize possession transfer.</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="e.g. QR-..."
                              value={pickupCodes[b.id] || ''}
                              onChange={(e) => setPickupCodes(prev => ({ ...prev, [b.id]: e.target.value }))}
                              className="w-28 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-center outline-none transition focus:border-rose-500"
                            />
                            <button
                              onClick={() => handleVerifyPickupCode(b.id)}
                              className="rounded-xl bg-rose-500 px-4 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-rose-600 transition"
                            >
                              Verify Code
                            </button>
                            <button
                              onClick={() => setShowScanner(true)}
                              className="rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 p-1.5 text-[10px] font-bold transition flex items-center justify-center flex-shrink-0"
                              title="Scan QR Code"
                            >
                              <Scan className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {b.status === 'APPROVED' && b.isPickedUp && (
                        <div className="border-t border-gray-50 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-[10px] text-gray-500">
                          <span className="flex items-center text-green-600 font-bold">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                            Item is with the renter. Waiting for return.
                          </span>
                          <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center justify-center space-x-1 rounded-xl border border-rose-200 hover:bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-500 transition"
                          >
                            <Scan className="h-3.5 w-3.5" />
                            <span>Scan Return QR</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Panel 3: My Listings */}
        {activeTab === 'listings' && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left">
            <h3 className="font-bold text-sm text-gray-900 mb-4 border-b border-gray-50 pb-3">My Product Listings</h3>
            {myListings.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <Trash2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-xs text-gray-500">No active postings</p>
                <p className="text-[10px] text-gray-400 mt-1">Make extra money on items lying idle in your hostel dorm. Post an item to begin!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {myListings.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-50 bg-gray-50/20">
                    <img src={p.images[0]} alt={p.title} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{p.title}</h4>
                      <p className="text-[10px] text-rose-500 font-bold mt-0.5">${p.rentPricePerDay}/day</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-extrabold mt-1.5 ${p.availability ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                        {p.availability ? 'Available' : 'Rented Out'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteListing(p.id)}
                      className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel 4: My Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left">
            <h3 className="font-bold text-sm text-gray-900 mb-4 border-b border-gray-50 pb-3">My Saved Favorites</h3>
            {myWishlistProducts.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-xs text-gray-500">Wishlist is empty</p>
                <p className="text-[10px] text-gray-400 mt-1">Click the heart button on listed items to keep tabs on them for your future events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {myWishlistProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-50 bg-gray-50/20 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <img src={p.images[0]} alt={p.title} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{p.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{p.college}</p>
                      <p className="text-[10px] text-rose-500 font-bold mt-1">${p.rentPricePerDay}/day</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel 5: Chats */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            <ChatMessenger user={user} />
          </div>
        )}

        {/* Panel 6: Stats */}
        {activeTab === 'stats' && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left space-y-6">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-3">Student Borrowing & Listing Analytics</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50/30 border border-green-50 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earnings (Renting out)</span>
                <p className="text-xl font-extrabold text-green-600 mt-1">${totalListingEarnings}</p>
              </div>
              <div className="bg-rose-50/30 border border-rose-50 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spendings (Borrowing)</span>
                <p className="text-xl font-extrabold text-rose-600 mt-1">${totalRentingExpenses}</p>
              </div>
              <div className="bg-amber-50/30 border border-amber-50 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">My Reputation</span>
                <p className="text-xl font-extrabold text-amber-600 mt-1 flex items-center">
                  {user.rating} <Star className="h-4 w-4 fill-current ml-1" />
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-50 p-5 bg-gray-50/10">
              <h4 className="font-bold text-xs text-gray-800 mb-2">Student Peer-to-Peer Agreement Cover</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                RentMyThing operates on a secure 5% commission structure. Security deposits are processed successfully at rental completion, protecting student lenders from late return damage or non-return penalties. Be sure to document condition details in the direct message chat messenger logs prior to hand-off.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showQRGenerator && (
        <QRGeneratorModal
          booking={showQRGenerator.booking}
          type={showQRGenerator.type}
          onClose={() => setShowQRGenerator(null)}
        />
      )}

      {showScanner && (
        <QRScannerModal
          activeOrders={myOrders}
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

    </div>
  );
};
