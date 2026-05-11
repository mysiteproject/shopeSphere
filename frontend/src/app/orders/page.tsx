'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders } from '@/store/slices/orderSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { useRouter, useSearchParams } from 'next/navigation';

const statusColors: Record<string, string> = {
  processing: 'badge-yellow',
  confirmed: 'badge-blue',
  shipped: 'badge-blue',
  out_for_delivery: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
  returned: 'badge-red',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage text="Loading orders..." />}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const dispatch = useAppDispatch();
  const { orders, totalPages, page, loading } = useAppSelector((state) => state.order);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    dispatch(fetchMyOrders(currentPage));
  }, [dispatch, currentPage]);

  if (loading) return <LoadingSpinner fullPage text="Loading orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-slate-500 mb-6">Start shopping to see your orders here!</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`} className="card p-4 sm:p-6 block hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-500">Order #{order.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={statusColors[order.orderStatus] || 'badge-blue'}>
                    {order.orderStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {order.orderItems.slice(0, 4).map((item, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {order.orderItems.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">+{order.orderItems.length - 4}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-slate-500">{order.orderItems.length} item(s)</span>
                <span className="font-bold text-primary-600">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </Link>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => router.push(`/orders?page=${p}`)}
          />
        </div>
      )}
    </div>
  );
}
