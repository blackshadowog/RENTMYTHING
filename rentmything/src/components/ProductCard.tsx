import React from 'react';
import { Heart, MapPin, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (productId: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onWishlistToggle,
  onSelectProduct
}) => {
  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-gray-100/70 cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'}
          alt={product.title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Condition Badge */}
        <span className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow-sm">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>{product.condition}</span>
        </span>

        {/* Wishlist Heart Action */}
        <button
          onClick={(e) => onWishlistToggle(product.id, e)}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-400 transition hover:bg-white hover:text-rose-500 shadow-sm"
          id={`btn-wishlist-${product.id}`}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600 hover:text-rose-500'}`} 
          />
        </button>

        {!product.availability && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20">
              Rented Out
            </span>
          </div>
        )}
      </div>

      {/* Meta Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
            {product.category}
          </span>
          {product.ownerRating && (
            <div className="flex items-center space-x-0.5 text-xs font-medium text-amber-600">
              <Star className="h-3 w-3 fill-current" />
              <span>{product.ownerRating}</span>
            </div>
          )}
        </div>

        <h3 className="mt-1 font-sans text-sm font-semibold tracking-tight text-gray-900 line-clamp-1 group-hover:text-rose-500 transition-colors">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span className="truncate">{product.college}</span>
        </div>

        {/* Bottom Pricing Layout */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <span className="text-base font-extrabold text-gray-900">${product.rentPricePerDay}</span>
            <span className="text-[10px] text-gray-500"> / day</span>
          </div>
          <div className="text-[10px] font-medium text-gray-400">
            Deposit: <span className="font-semibold text-gray-600">${product.deposit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
