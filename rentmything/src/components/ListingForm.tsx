import React, { useState } from 'react';
import { X, Plus, AlertCircle, Camera, Check } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';

interface ListingFormProps {
  onClose: () => void;
  onSuccess: (newProduct: Product) => void;
  userCollege: string;
  userHostel: string;
}

const CATEGORIES = [
  'Electronics', 'Books', 'Laptop', 'Camera', 'Cycle', 'Gaming', 
  'Projector', 'Sports', 'Musical Instruments', 'Kitchen Items', 
  'Hostel Essentials', 'Tools', 'Fashion'
];

const PRESET_IMAGES = [
  { label: 'Laptop / Tech', url: 'https://images.unsplash.com/photo-1496181130204-7552cc1524e2?w=600&h=400&fit=crop' },
  { label: 'Camera / Gear', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop' },
  { label: 'Console / Gaming', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop' },
  { label: 'Cycle / Commute', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop' },
  { label: 'Acoustic Instrument', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop' },
  { label: 'Kitchen / Blender', url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&h=400&fit=crop' }
];

export const ListingForm: React.FC<ListingFormProps> = ({
  onClose,
  onSuccess,
  userCollege,
  userHostel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rentPricePerDay, setRentPricePerDay] = useState('');
  const [deposit, setDeposit] = useState('');
  const [condition, setCondition] = useState<'New' | 'Like New' | 'Good' | 'Fair'>('Good');
  const [college, setCollege] = useState(userCollege || '');
  const [hostel, setHostel] = useState(userHostel || '');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !rentPricePerDay || !deposit || !college) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const finalImage = imageUrl || selectedPreset || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop';
      
      const newProduct = await api.createProduct({
        title,
        description,
        category,
        rentPricePerDay: parseFloat(rentPricePerDay),
        deposit: parseFloat(deposit),
        images: [finalImage],
        location: {
          lat: 42.3505 + (Math.random() - 0.5) * 0.005,
          lng: -71.1054 + (Math.random() - 0.5) * 0.005,
          address: hostel ? `${hostel}, ${college}` : `Main Campus, ${college}`
        },
        condition,
        college,
        hostel
      });

      onSuccess(newProduct);
    } catch (err: any) {
      setError(err.message || 'Something went wrong listing your item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">List an Item for Rent</h2>
            <p className="text-xs text-gray-500">Make some easy money by sharing items you occasionally use with nearby students.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-2xl bg-rose-50 p-3 text-xs font-medium text-rose-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Listing Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sony Alpha Camera, Specialized Sirrus Cycle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Item Description *</label>
              <textarea
                required
                rows={3}
                placeholder="What condition is it in? What accessories are included? Where can they pick it up?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
              >
                <option value="New">New (Unopened / Boxed)</option>
                <option value="Like New">Like New (Perfect condition)</option>
                <option value="Good">Good (Minor wear & tear)</option>
                <option value="Fair">Fair (Clearly used but functional)</option>
              </select>
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">Rent Price / Day ($) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 10"
                value={rentPricePerDay}
                onChange={(e) => setRentPricePerDay(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">Security Deposit ($) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 50"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* College */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">College / Campus *</label>
              <input
                type="text"
                required
                placeholder="e.g. Boston University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Hostel */}
            <div>
              <label className="block text-xs font-semibold text-gray-700">Hostel / Dormitory (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Kilachand Hall Room 402"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Images input & selection presets */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Custom Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setSelectedPreset(null);
                }}
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold text-gray-500 mb-2">Or Choose from High-Fidelity Presets:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRESET_IMAGES.map((preset) => (
                  <div
                    key={preset.label}
                    onClick={() => {
                      setSelectedPreset(preset.url);
                      setImageUrl('');
                    }}
                    className={`relative cursor-pointer overflow-hidden rounded-2xl border aspect-[1.5] transition hover:shadow-sm ${selectedPreset === preset.url ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200'}`}
                  >
                    <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] font-bold text-white text-center">
                      {preset.label}
                    </div>
                    {selectedPreset === preset.url && (
                      <div className="absolute top-1.5 right-1.5 bg-rose-500 rounded-full p-0.5 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-4 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600 disabled:opacity-55"
              id="btn-submit-listing"
            >
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
