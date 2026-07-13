import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Package, ShoppingCart, DollarSign, Ban, Check, Percent, Settings, RefreshCw, Star, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Report, User, SystemStats } from '../types';

interface AdminPanelProps {
  onRefreshProducts: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefreshProducts }) => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commissionRate, setCommissionRate] = useState('5');
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'rates'>('reports');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);
      setCommissionRate(statsData.stats.commissionPercentage.toString());

      const reportsData = await api.getAdminReports();
      setReports(reportsData);

      const usersData = await api.getAdminUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading admin panel data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, action: 'RESOLVED' | 'ACTION_TAKEN') => {
    try {
      await api.resolveReport(reportId, action);
      setMsg({
        text: action === 'ACTION_TAKEN' ? 'Listing removed from marketplace and report closed.' : 'Report dismissed successfully.',
        type: 'success'
      });
      loadAdminData();
      onRefreshProducts();
    } catch (err: any) {
      setMsg({ text: err.message || 'Action failed', type: 'error' });
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('Are you absolutely sure you want to ban this user? All their listed items will be deleted immediately.')) return;
    try {
      await api.banUser(userId);
      setMsg({ text: 'User banned and all their listings deleted.', type: 'success' });
      loadAdminData();
      onRefreshProducts();
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to ban user', type: 'error' });
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateCommission(parseFloat(commissionRate));
      setStats((prev: any) => prev ? { ...prev, stats: updated } : null);
      setMsg({ text: `Commission successfully set to ${commissionRate}%.`, type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to update commission', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-500">Loading system console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Refresh */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Settings className="h-6 w-6 text-rose-500" />
            <span>Marketplace Admin Console</span>
          </h1>
          <p className="text-xs text-gray-500">Monitor campus listings, reports, commission structures, and moderating rogue accounts.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Console</span>
        </button>
      </div>

      {msg.text && (
        <div className={`flex items-center space-x-2 rounded-2xl p-3.5 text-xs font-semibold animate-fade-in ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
          <AlertCircle className="h-4 w-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Metrics Dashboard Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        
        {/* Metric 1 */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.userCount || 0}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-500">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Listings</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.listingCount || 0}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Rentals</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.stats?.totalRentals || 0}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-2xl bg-green-50 p-3 text-green-500">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Earnings</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">${(stats?.stats?.platformEarnings || 0).toFixed(2)}</p>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => { setActiveTab('reports'); setMsg({ text: '', type: '' }); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'reports' ? 'border-rose-500 text-rose-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Reports Inbox ({reports.filter(r => r.status === 'PEND').length || reports.length})
        </button>
        <button
          onClick={() => { setActiveTab('users'); setMsg({ text: '', type: '' }); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'users' ? 'border-rose-500 text-rose-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Student Accounts ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('rates'); setMsg({ text: '', type: '' }); }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'rates' ? 'border-rose-500 text-rose-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Commission Setup
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm min-h-[300px]">
        
        {/* Panel 1: Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4 text-left">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Flagged Product Reports</h3>
            {reports.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">Perfect record! No listings have been reported.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {reports.map(rep => (
                  <div key={rep.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold text-rose-600">
                          {rep.status}
                        </span>
                        <span className="text-[10px] text-gray-400">Reported on {new Date(rep.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mt-1">Item: "{rep.productTitle || 'Unknown Product'}"</p>
                      <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded-xl border border-gray-100 mt-1.5">
                        Reason: {rep.reason}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Reported by Student ID: {rep.reporterName || rep.reporterId}</p>
                    </div>

                    {rep.status === 'PENDING' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                          className="flex items-center space-x-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[10px] font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span>Dismiss</span>
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'ACTION_TAKEN')}
                          className="flex items-center space-x-1 rounded-xl bg-rose-500 px-3.5 py-2 text-[10px] font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Ban Listing</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel 2: User Accounts */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-left">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Registered Students Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-3 font-semibold text-gray-600">Student Profile</th>
                    <th className="p-3 font-semibold text-gray-600">College & Hostel</th>
                    <th className="p-3 font-semibold text-gray-600">Trust Rating</th>
                    <th className="p-3 font-semibold text-gray-600">ID Verification</th>
                    <th className="p-3 font-semibold text-gray-600 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="p-3 flex items-center space-x-2.5">
                        <img src={u.profileImage} alt={u.name} className="h-8 w-8 rounded-full object-cover border border-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-700">{u.college}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{u.hostel || 'No Dorm listed'}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-0.5 text-amber-600 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{u.rating}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${u.studentIdVerified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'}`}>
                          {u.studentIdVerified ? 'Verified Student' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition"
                          title="Ban Student Account"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Panel 3: Commission Settings */}
        {activeTab === 'rates' && (
          <div className="space-y-6 text-left max-w-md">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Commission & Revenue Rates</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Manage the fee structure that RentMyThing takes on completed peer-to-peer student transactions.</p>
            </div>

            <form onSubmit={handleUpdateCommission} className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Platform Service Commission (%)</label>
                <div className="relative mt-1 max-w-[200px]">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-8 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 font-bold">
                    <Percent className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
                Current structural payout on a <strong>$100.00</strong> rental:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Owner receives: <strong>${(100 - parseFloat(commissionRate || '0')).toFixed(2)}</strong></li>
                  <li>Platform earns: <strong>${parseFloat(commissionRate || '0').toFixed(2)}</strong></li>
                </ul>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
              >
                Apply Commission Rate
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};
