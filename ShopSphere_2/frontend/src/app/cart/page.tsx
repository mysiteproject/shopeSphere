'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart, updateCartItem, removeCartItem } from '@/store/slices/cartSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQty = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeCartItem(itemId));
    toast.success('Item removed from cart');
  };

  if (loading) return <LoadingSpinner fullPage text="Loading cart..." />;

  if (!cart.items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-20 h-20 text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Shopping Cart ({cart.totalItems} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item._id}
                layout
                exit={{ opacity: 0, x: -100 }}
                className="card p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  <Link href={`/products/${item.product?.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt={item.product?.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product?.slug}`} className="font-semibold hover:text-primary-600 line-clamp-2">
                      {item.product?.name}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-slate-500">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                    <p className="text-lg font-bold text-primary-600 mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-xl">
                        <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-28">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal ({cart.totalItems} items)</span>
                <span className="font-semibold">₹{cart.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-green-600">{cart.totalPrice >= 999 ? 'FREE' : '₹49'}</span>
              </div>
              <hr className="dark:border-slate-700" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  ₹{(cart.totalPrice + (cart.totalPrice >= 999 ? 0 : 49)).toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href={isAuthenticated ? '/checkout' : '/login'}
              className="btn-primary w-full mt-6 flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link href="/products" className="btn-secondary w-full mt-3 text-center block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
