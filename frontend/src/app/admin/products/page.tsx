'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&limit=10${search ? `&search=${search}` : ''}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Add Product</span>
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b dark:border-slate-700">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="input-field pl-10 !py-2 text-sm"
            />
          </div>
        </div>

        {loading ? <div className="p-8"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Rating</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium line-clamp-1 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{p.category}</td>
                    <td className="p-4 font-medium">₹{p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={p.stock <= 10 ? 'text-red-600 font-bold' : ''}>{p.stock}</span>
                    </td>
                    <td className="p-4">{p.ratings?.toFixed(1) || '-'} ⭐</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/products/${p._id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg">
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
        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
