'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart as HeartOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/authSlice';
import { addToCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import { useState } from 'react';
import { Product } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/auth/wishlist');
        setWishlistProducts(res.data.wishlist);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user?.wishlist]);

  const handleRemove = (productId: string) => {
    dispatch(toggleWishlist(productId));
    setWishlistProducts((prev) => prev.filter((p) => p._id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId }));
    toast.success('Added to cart!');
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Wishlist ({wishlistProducts.length})</h1>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <HeartOff className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <Link href="/products" className="btn-primary mt-4 inline-block">Explore Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="card p-4 flex items-center gap-4">
              <Link href={`/products/${product.slug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-semibold hover:text-primary-600 line-clamp-1">{product.name}</Link>
                <p className="text-sm text-slate-500">{product.brand}</p>
                <p className="text-lg font-bold text-primary-600">₹{product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleAddToCart(product._id)} className="btn-primary !py-2 text-sm flex items-center space-x-1">
                  <ShoppingCart className="w-4 h-4" /><span className="hidden sm:block">Add to Cart</span>
                </button>
                <button onClick={() => handleRemove(product._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
