'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.stats);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;
  if (!stats) return <p>Failed to load dashboard</p>;

  const cards = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-100', change: '+12%', up: true },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100', change: '+8%', up: true },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600 bg-purple-100', change: '+5%', up: true },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-orange-600 bg-orange-100', change: '+3%', up: true },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium flex items-center space-x-1 ${card.up ? 'text-green-600' : 'text-red-600'}`}>
                {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{card.change}</span>
              </span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-medium">#{order.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{order.totalPrice?.toLocaleString()}</p>
                  <span className="text-xs capitalize text-slate-500">{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Sales by Category</h2>
          <div className="space-y-3">
            {stats.categoryDistribution?.map((cat: any) => (
              <div key={cat._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{cat._id}</span>
                  <span className="font-medium">{cat.count} orders</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-primary-600 rounded-full h-2" style={{ width: `${Math.min((cat.count / (stats.totalOrders || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 text-red-600">Low Stock Alert</h2>
          <div className="space-y-2">
            {stats.lowStockProducts?.map((p: any) => (
              <div key={p._id} className="flex items-center justify-between py-2 text-sm">
                <span className="line-clamp-1 flex-1">{p.name}</span>
                <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>{p.stock} left</span>
              </div>
            ))}
            {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) && (
              <p className="text-sm text-slate-500">All products are well stocked!</p>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Order Status</h2>
          <div className="space-y-3">
            {stats.orderStatusDistribution?.map((s: any) => (
              <div key={s._id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{s._id.replace(/_/g, ' ')}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
