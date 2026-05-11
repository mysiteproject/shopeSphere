'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isWishlisted = user?.wishlist?.includes(product._id);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ productId: product._id }));
    toast.success('Added to cart!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="card-hover h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={product.images[0]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-1">
              {discount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  -{discount}%
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  Featured
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  Sold Out
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full shadow-lg transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
              {product.brand}
            </span>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.ratings)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">({product.numReviews})</span>
            </div>

            {/* Price */}
            <div className="mt-auto flex items-center space-x-2">
              <span className="text-lg font-bold text-primary-600">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <span className="text-sm text-slate-400 line-through">₹{product.comparePrice.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
