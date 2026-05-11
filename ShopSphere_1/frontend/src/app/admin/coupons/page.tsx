'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.coupons);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const onSubmit = async (data: any) => {
    try {
      if (editId) {
        await api.put(`/coupons/${editId}`, data);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', data);
        toast.success('Coupon created');
      }
      setShowForm(false);
      setEditId(null);
      reset();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (coupon: any) => {
    setEditId(coupon._id);
    Object.entries(coupon).forEach(([k, v]) => {
      if (k === 'validFrom' || k === 'validUntil') {
        setValue(k, new Date(v as string).toISOString().split('T')[0]);
      } else {
        setValue(k, v);
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Deleted');
      fetchCoupons();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); reset(); }} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>{showForm ? 'Close' : 'Add Coupon'}</span>
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-slide-down">
          <h2 className="font-bold mb-4">{editId ? 'Edit Coupon' : 'New Coupon'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input {...register('code', { required: true })} className="input-field" placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select {...register('discountType')} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input type="number" {...register('discountValue', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Purchase (₹)</label>
              <input type="number" {...register('minPurchase')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
              <input type="number" {...register('maxDiscount')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <input type="number" {...register('usageLimit')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input type="date" {...register('validFrom')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input type="date" {...register('validUntil')} className="input-field" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">{editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="p-8"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Discount</th>
                  <th className="text-left p-4 font-medium">Min Purchase</th>
                  <th className="text-left p-4 font-medium">Used</th>
                  <th className="text-left p-4 font-medium">Valid Until</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-b dark:border-slate-700">
                    <td className="p-4 font-mono font-bold">{c.code}</td>
                    <td className="p-4">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="p-4">₹{c.minPurchase || 0}</td>
                    <td className="p-4">{c.usedCount}/{c.usageLimit || '∞'}</td>
                    <td className="p-4 text-slate-500">{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '-'}</td>
                    <td className="p-4">
                      <span className={c.isActive ? 'badge-green' : 'badge-red'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
