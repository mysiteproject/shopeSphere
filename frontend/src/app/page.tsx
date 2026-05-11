'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Headphones, RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeaturedProducts, fetchCategories } from '@/store/slices/productSlice';
import ProductCard from '@/components/ui/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round the clock help' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
];

const heroBanners = [
  { title: 'New Season Arrivals', subtitle: 'Discover the latest trends in fashion and electronics', cta: 'Shop Now', bg: 'from-primary-600 via-primary-700 to-indigo-800' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { featured, categories, loading } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${heroBanners[0].bg} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              {heroBanners[0].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg sm:text-xl text-white/80 mb-8"
            >
              {heroBanners[0].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products" className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]">
                <span>{heroBanners[0].cta}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/products?sort=-ratings" className="inline-flex items-center space-x-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all">
                <span>Best Sellers</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
              <span>View All</span><ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className="block p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 
                             hover:shadow-lg hover:-translate-y-1 transition-all text-center group border dark:border-slate-700"
                >
                  <h3 className="font-semibold group-hover:text-primary-600 transition-colors">{cat}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
              <span>View All</span><ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 lg:p-16 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Join ShopSphere Today</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Get exclusive deals, personalized recommendations, and faster checkout.
            </p>
            <Link href="/register" className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition-all shadow-xl">
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
