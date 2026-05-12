import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import type { ExploreItem } from '../../types/trip';

export default function Places() {
  const [places, setPlaces] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<ExploreItem | null>(null);
  const [formData, setFormData] = useState<Partial<ExploreItem>>({
    title: '',
    destination: '',
    type: 'PLACE',
    tags: [],
    minBudget: 0,
    maxBudget: 0,
    durationDays: 1,
    thumbnailUrl: '',
    description: '',
    popularityScore: 5.0
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPlaces();
      setPlaces(data);
    } catch (error: any) {
      console.error('Failed to fetch places:', error);
      if (error.response?.status === 403) {
        alert('Access Denied: You must be logged in as an Admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlace(null);
    setFormData({
      title: '',
      destination: '',
      type: 'PLACE',
      tags: [],
      minBudget: 0,
      maxBudget: 0,
      durationDays: 1,
      thumbnailUrl: '',
      description: '',
      popularityScore: 5.0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (place: ExploreItem) => {
    setEditingPlace(place);
    setFormData(place);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { url } = await adminApi.uploadImage(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;
    try {
      await adminApi.deletePlace(id);
      setPlaces(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete place:', error);
      alert('Failed to delete place');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlace) {
        const updated = await adminApi.updatePlace(editingPlace.id, formData);
        setPlaces(prev => prev.map(p => p.id === editingPlace.id ? updated : p));
      } else {
        const created = await adminApi.createPlace(formData);
        setPlaces(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save place:', error);
      alert('Failed to save place');
    }
  };

  const getCategoryClass = (type: string) => {
    switch (type) {
      case 'EXPERIENCE': return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'PLACE': return 'bg-primary-fixed text-on-primary-fixed';
      default: return 'bg-secondary-fixed text-on-secondary-fixed';
    }
  };

  return (
    <div className="p-10 space-y-12">
      <section className="relative overflow-hidden rounded-xl p-12 bg-surface-container-low min-h-[300px] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW_if29luK5SWyA0LfzI0OGq7QJzuvmXMSUXIHOHwWGjNt_FARkvi3lq-3RJGvUAg9H7TNpKQ6SruNJA3NZKvYS0g_9matWNQ3m21l2RaROxlWnGgfDWVmVK0oNy-s_upXWN5nikP7LVlgcv7cxXd1XYHbjVpRbIvRVZ4LKKOdR0s8YBnCSuuB0w2tKEkWoTYLOSZSW1sTNtqnzM4bmQoA5bmaDGtaiZ0_uPbivMTKh-qDT3kk-fH_9zU8hfGZS8hwRejXAFwXzMo" alt="Mountains" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline text-5xl font-bold mb-4 tracking-tight leading-tight">
            Curate the World's<br/><span className="bg-gradient-to-r from-primary to-sky-300 bg-clip-text text-transparent">Finest Destinations.</span>
          </h2>
          <p className="text-on-surface-variant text-lg max-w-lg mb-8">
            Manage the global repository of places, venues, and experiences that power the Concierge AI swap engine.
          </p>
          <button 
            onClick={handleOpenCreate}
            className="bg-white text-slate-950 px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary-fixed transition-colors"
          >
            <span className="material-symbols-outlined">add_circle</span>
            New Place
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-2xl font-semibold">Active Destinations</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">filter_list</span></button>
              <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">sort</span></button>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Place Name</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Category</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Budget</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Location</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">Loading destinations...</td></tr>
                ) : places.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">No destinations found.</td></tr>
                ) : places.map((place) => (
                  <tr key={place.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
                          {place.thumbnailUrl && <img src={place.thumbnailUrl} alt={place.title} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{place.title}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-1">{place.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`${getCategoryClass(place.type)} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{place.type}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-primary text-xs font-bold">${place.minBudget.toLocaleString()}</span>
                        <span className="text-on-surface-variant text-[10px]">Min. Budget</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{place.destination}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(place)}
                          className="p-2 text-slate-400 hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(place.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Showing {places.length} destinations</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg border border-outline-variant text-sm hover:bg-surface-container-high transition-colors">Previous</button>
                <button className="px-4 py-2 rounded-lg border border-outline-variant text-sm hover:bg-surface-container-high transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-headline text-2xl font-semibold">AI Swap Engine</h3>
          <div className="bg-surface-container-low rounded-xl p-8 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h4 className="font-semibold text-white">Suggestion Logic</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">Manage the keywords that trigger the AI to suggest these locations as alternatives.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">Active Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {['Luxury', 'Quiet', 'Romantic', 'Pet Friendly', 'Outdoor Seating'].map((keyword) => (
                      <span key={keyword} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs text-on-surface-variant border border-outline-variant/20 hover:border-primary/50 transition-colors cursor-pointer">{keyword}</span>
                    ))}
                    <button className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">+ Add</button>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Swap Frequency</span>
                    <span className="text-xs font-bold text-primary">High (84%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[84%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/10">
              <h5 className="text-xs font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                AI Recommendation
              </h5>
              <p className="text-[13px] text-on-surface-variant italic leading-relaxed">"Suggest 'L'Avant-Garde' when users search for 'Fine Dining' or 'Michelin' in the 8th arrondissement."</p>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPlace ? 'Edit Destination' : 'Add New Destination'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destination</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.destination}
                onChange={e => setFormData({...formData, destination: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
              <select 
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="PLACE">PLACE</option>
                <option value="EXPERIENCE">EXPERIENCE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Days)</label>
              <input 
                type="number" 
                required
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.durationDays}
                onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Budget</label>
              <input 
                type="number" 
                required
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.minBudget}
                onChange={e => setFormData({...formData, minBudget: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Budget</label>
              <input 
                type="number" 
                required
                className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={formData.maxBudget}
                onChange={e => setFormData({...formData, maxBudget: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
            <input 
              type="text" 
              className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Nature, Food, Sightseeing"
              value={formData.tags?.join(', ')}
              onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thumbnail Image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-[#0F1115] border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {formData.thumbnailUrl ? (
                  <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-600 text-3xl">image</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  id="thumbnail-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="thumbnail-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-sm font-bold cursor-pointer hover:bg-slate-800 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm">{uploading ? 'sync' : 'upload'}</span>
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
                <p className="text-[10px] text-slate-500 mt-2">Recommended: 16:9 ratio, max 2MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <textarea 
              rows={3}
              className="w-full bg-[#0F1115] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-sky-400 shadow-lg shadow-primary/20 transition-colors"
            >
              {editingPlace ? 'Update Destination' : 'Create Destination'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Separate Modal Component for clarity
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1C2333] border border-slate-700/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
