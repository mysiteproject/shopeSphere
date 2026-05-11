'use client';

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  processing: 'badge-yellow', confirmed: 'badge-blue', shipped: 'badge-blue',
  out_for_delivery: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red', returned: 'badge-red',
};

const statuses = ['all', 'processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await api.get(`/admin/orders?page=${page}&limit=15${q}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="card">
        <div className="p-4 border-b dark:border-slate-700 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
              }`}>{s === 'all' ? 'All' : s.replace(/_/g, ' ')}</button>
          ))}
        </div>

        {loading ? <div className="p-8"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-medium">#{order.invoiceNumber}</td>
                    <td className="p-4">{order.user?.name || 'N/A'}</td>
                    <td className="p-4">{order.orderItems?.length}</td>
                    <td className="p-4 font-bold">₹{order.totalPrice?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={order.isPaid ? 'text-green-600' : 'text-yellow-600'}>{order.isPaid ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className="p-4">
                      <select value={order.orderStatus} onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-xs rounded-lg border dark:border-slate-600 bg-transparent p-1.5 capitalize">
                        {statuses.filter((s) => s !== 'all').map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
