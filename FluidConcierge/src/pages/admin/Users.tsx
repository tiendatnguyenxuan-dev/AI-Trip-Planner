import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import type { AdminUserResponse, SharedContentResponse } from '../../types/trip';

export default function Users() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [userReviews, setUserReviews] = useState<SharedContentResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      if (error.response?.status === 403) {
        alert('Access Denied: You must be logged in as an Admin to view this data.');
      } else {
        alert('Failed to connect to server. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await adminApi.lockUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to lock user');
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await adminApi.unlockUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to unlock user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user. Make sure the user is locked first.');
    }
  };

  const handleViewDetails = async (user: AdminUserResponse) => {
    setSelectedUser(user);
    setShowModal(true);
    setModalLoading(true);
    try {
      const reviews = await adminApi.getUserReviews(user.id);
      setUserReviews(reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ALL') return true;
    return u.status === filter;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-10 space-y-8 min-h-screen bg-surface-container-lowest/20">
      {/* Header & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">User Management</h1>
          <p className="text-on-surface-variant max-w-lg">Oversee, filter, and manage your concierge ecosystem's travelers and agents.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              All Users
            </button>
            <button 
              onClick={() => setFilter('ACTIVE')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'ACTIVE' ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('LOCKED')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === 'LOCKED' ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">Total Users</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{users.length}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">Active Now</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{users.filter(u => u.status === 'ACTIVE').length}</span>
            <span className="text-sky-400 text-sm animate-pulse ml-2">● Online</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">Blocked</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-error">{users.filter(u => u.status === 'LOCKED').length}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">System Status</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">Healthy</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">User</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email Address</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Last Active</th>
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-on-surface-variant">Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-on-surface-variant">No users found.</td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-white leading-tight">{user.name}</p>
                      <p className="text-xs text-on-surface-variant">Role: {user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant font-medium">{user.email}</td>
                <td className="px-8 py-5">
                  {user.status === 'ACTIVE' ? (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">Active</span>
                  ) : (
                    <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest rounded-full border border-error/20">Blocked</span>
                  )}
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{formatDate(user.lastActiveAt)}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleViewDetails(user)}
                      title="View Details"
                      className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-all hover:text-white"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    {user.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleLock(user.id)}
                        title="Lock Account"
                        className="p-2 hover:bg-error/10 hover:text-error rounded-lg text-on-surface-variant transition-all"
                      >
                        <span className="material-symbols-outlined">block</span>
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleUnlock(user.id)}
                          title="Unlock Account"
                          className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-on-surface-variant transition-all"
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          title="Delete Account"
                          className="p-2 hover:bg-error/20 hover:text-error rounded-lg text-error transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-8 py-5 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
          <span className="text-xs font-semibold text-on-surface-variant">Showing {filteredUsers.length} of {users.length} users</span>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Account Details</h2>
                <p className="text-sm text-on-surface-variant">Detailed overview of traveler profile and contributions.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-container-highest rounded-full text-on-surface-variant transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="space-y-6">
                  <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center text-3xl text-primary font-bold mb-4">
                      {selectedUser.name?.charAt(0) || '?'}
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-4">{selectedUser.email}</p>
                    <div className="flex justify-center">
                       {selectedUser.status === 'ACTIVE' ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">Active</span>
                      ) : (
                        <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest rounded-full border border-error/20">Blocked</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Metadata</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">User ID</p>
                        <p className="text-sm text-white font-mono break-all">{selectedUser.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">Joined Date</p>
                        <p className="text-sm text-white">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">Account Role</p>
                        <p className="text-sm text-white">{selectedUser.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">rate_review</span>
                    Travel Reviews & Contributions
                  </h3>
                  
                  {modalLoading ? (
                    <div className="py-20 text-center text-on-surface-variant">Fetching contributions...</div>
                  ) : userReviews.length === 0 ? (
                    <div className="bg-surface-container-lowest/50 border border-dashed border-outline-variant/20 rounded-xl p-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">history</span>
                      <p className="text-on-surface-variant font-medium">No reviews or shared content found for this traveler.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review.id} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                review.type === 'EXPLORE_ITEM' ? 'bg-sky-500/10 text-sky-400 border-sky-400/20' : 
                                review.type === 'TRIP' ? 'bg-amber-500/10 text-amber-400 border-amber-400/20' : 
                                'bg-purple-500/10 text-purple-400 border-purple-400/20'
                              }`}>
                                {review.type}
                              </span>
                              <span className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm">
                                  {i < (review.rating || 0) ? 'star' : 'star_outline'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-white text-sm font-medium mb-2">{review.description || 'No description provided.'}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">thumb_up</span> {review.totalVotes} Votes</span>
                            {review.cost && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">payments</span> ${review.cost}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low/50 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-surface-container-highest text-white rounded-full font-bold text-sm hover:brightness-110 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
