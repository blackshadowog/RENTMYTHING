import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, ShieldAlert, Sparkles, Calendar, MessageSquare, AlertCircle, ShoppingCart, Send, Info, Check } from 'lucide-react';
import { api } from '../lib/api';
import { Product, Review, User as UserType } from '../types';

interface ProductPageProps {
  product: Product;
  user: UserType | null;
  onBack: () => void;
  onOpenAuthModal: () => void;
  onBookingSuccess: () => void;
  onOpenDirectChat: (productId: string, ownerId: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  user,
  onBack,
  onOpenAuthModal,
  onBookingSuccess,
  onOpenDirectChat
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date Picker State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  // Review Form State
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Booking State
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // active photo selection
  const [activePhoto, setActivePhoto] = useState(product.images[0]);

  const fetchProductDetails = async () => {
    try {
      const data = await api.getProductById(product.id);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [product.id]);

  // Calculate rent costs
  const start = new Date(startDate);
  const end = new Date(endDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay));
  const baseRentPrice = product.rentPricePerDay * daysCount;
  const commission = baseRentPrice * 0.05; // 5% commission
  const totalAmount = baseRentPrice + commission;

  const handleBooking = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    try {
      await api.createBooking({
        productId: product.id,
        startDate,
        endDate,
        totalPrice: totalAmount,
        deposit: product.deposit
      });
      setBookingSuccess('Booking request sent successfully! Redirecting you to rentals tab...');
      setTimeout(() => {
        onBookingSuccess();
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }

    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    try {
      const newReview = await api.createReview({
        productId: product.id,
        targetUserId: product.ownerId, // Rate the host
        rating: parseInt(rating),
        comment: comment.trim()
      });

      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setReviewSuccess('Your review has been published!');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    }
  };

  // Safe checks
  const isOwner = user?.id === product.ownerId;

  return (
    <div className="space-y-6 text-left">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to search</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Product Photos & Location Info */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="space-y-4">
            {/* Large Active Photo stage */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
              <img
                src={activePhoto}
                alt={product.title}
                className="h-full w-full object-cover"
                referrerPolicy="referrer"
              />
              {!product.availability && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <span className="rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-lg">
                    Rented Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Selection */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePhoto(img)}
                    className={`relative overflow-hidden rounded-xl border aspect-[1.5] w-20 transition hover:shadow-sm ${activePhoto === img ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Block */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">{product.category}</span>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-1">{product.title}</h1>
              
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{product.college}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                  <span className="font-bold text-gray-700">{product.ownerRating || 5.0}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4">
              <h3 className="font-bold text-xs text-gray-900">Item Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed mt-2 whitespace-pre-line">{product.description}</p>
            </div>

            <div className="border-t border-gray-50 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Condition</p>
                <div className="flex items-center space-x-1 mt-1 font-semibold text-xs text-gray-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{product.condition}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Lender student</p>
                <p className="font-semibold text-xs text-gray-800 mt-1">{product.ownerName || 'Active Host'}</p>
              </div>
            </div>
          </div>

          {/* Interactive OSM Map preview */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
            <div>
              <h3 className="font-bold text-xs text-gray-900">Exchange Location Map</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{product.location.address || 'Campus Hub'}</p>
            </div>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <iframe
                title="Exchange Map Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${product.location.lat},${product.location.lng}&z=15&output=embed`}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Calendar Card */}
        <div className="space-y-6">
          
          <div className="sticky top-20 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl space-y-4">
            
            <div className="flex items-baseline justify-between border-b border-gray-50 pb-3">
              <div>
                <span className="text-xl font-black text-gray-900">${product.rentPricePerDay}</span>
                <span className="text-xs text-gray-500"> / day</span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Security Deposit: <strong>${product.deposit}</strong></span>
            </div>

            {bookingSuccess && (
              <div className="flex items-start space-x-2 rounded-2xl bg-green-50 p-3 text-xs font-semibold text-green-700 animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{bookingSuccess}</span>
              </div>
            )}
            {bookingError && (
              <div className="flex items-start space-x-2 rounded-2xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Date Picker Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Start Date</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">End Date</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Costs breakdown */}
            <div className="rounded-2xl border border-gray-50 bg-gray-50/40 p-3.5 text-xs space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Rent (${product.rentPricePerDay} x {daysCount} {daysCount > 1 ? 'days' : 'day'})</span>
                <span className="font-semibold text-gray-900">${baseRentPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform commission (5%)</span>
                <span className="font-semibold text-gray-900">${commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Insurance/Security deposit</span>
                <span className="font-semibold text-gray-900">${product.deposit}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-gray-900">
                <span>Total Due Amount</span>
                <span>${(totalAmount + product.deposit).toFixed(2)}</span>
              </div>
            </div>

            {/* Book Rent Action Button */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading || !product.availability || isOwner}
              className="w-full flex items-center justify-center space-x-1.5 rounded-2xl bg-rose-500 py-3 text-xs font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600 transition disabled:opacity-55"
              id="btn-rent-now"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isOwner ? 'You own this item' : !product.availability ? 'Currently Rented' : 'Rent Now'}</span>
            </button>

            {/* Direct message chat option */}
            {!isOwner && (
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuthModal();
                    return;
                  }
                  onOpenDirectChat(product.id, product.ownerId);
                }}
                className="w-full flex items-center justify-center space-x-1.5 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span>Chat with Owner</span>
              </button>
            )}

            <div className="text-[10px] text-gray-400 text-center leading-normal mt-2">
              Lender receives base earnings. Commission of 5% goes to security, matching, and agreements.
            </div>

          </div>

        </div>

      </div>

      {/* Reviews Stage Panel */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Review Metrics */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Student Reviews</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Ratings provided by verified borrowing students on completing handoffs.</p>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
            <span className="text-3xl font-black text-gray-900">{product.ownerRating || 5.0}</span>
            <div>
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Based on {reviews.length} reviews</p>
            </div>
          </div>

          {/* Form to submit review */}
          <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Write a review</p>
            
            {reviewSuccess && (
              <p className="text-[10px] font-semibold text-green-600 bg-green-50 p-2 rounded-xl flex items-center">
                <Check className="h-3.5 w-3.5 mr-1" /> {reviewSuccess}
              </p>
            )}
            {reviewError && (
              <p className="text-[10px] font-semibold text-rose-500 bg-rose-50 p-2 rounded-xl flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" /> {reviewError}
              </p>
            )}

            <div>
              <label className="block text-[9px] font-semibold text-gray-600">Trust rating score</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Satisfactory)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Terrible)</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-semibold text-gray-600">Your experience comment</label>
              <textarea
                rows={2}
                placeholder="Write your rating review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs text-gray-900 outline-none transition focus:border-rose-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-black transition"
            >
              Post rating review
            </button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400">No product reviews listed yet. Be the first to rent and leave a review!</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-3.5 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={rev.reviewerImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={rev.reviewerName}
                        className="h-7 w-7 rounded-full object-cover border border-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{rev.reviewerName}</p>
                        <p className="text-[8px] text-gray-300 mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-0.5 text-amber-500 font-bold text-[11px]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mt-2 italic leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
