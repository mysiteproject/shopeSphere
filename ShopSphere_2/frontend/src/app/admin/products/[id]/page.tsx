'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const categories = ['electronics', 'fashion', 'home', 'beauty', 'sports', 'books', 'toys', 'grocery', 'automotive', 'health'];

export default function AdminProductFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = id !== 'new';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.product;
        Object.entries(p).forEach(([key, val]) => {
          if (key === 'colors' || key === 'sizes' || key === 'tags') {
            setValue(key, (val as string[]).join(', '));
          } else {
            setValue(key, val);
          }
        });
        setExistingImages(p.images || []);
        setLoading(false);
      }).catch(() => { setLoading(false); toast.error('Product not found'); });
    }
  }, [id, isEdit, setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const formData = new FormData();
      const fields = ['name', 'description', 'price', 'comparePrice', 'category', 'brand', 'stock', 'sku', 'isFeatured'];
      fields.forEach((f) => { if (data[f] !== undefined) formData.append(f, data[f]); });

      ['colors', 'sizes', 'tags'].forEach((f) => {
        if (data[f]) formData.append(f, JSON.stringify(data[f].split(',').map((s: string) => s.trim()).filter(Boolean)));
      });

      images.forEach((img) => formData.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register('name', { required: 'Required' })} className="input-field" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{(errors.name as any).message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description', { required: 'Required' })} rows={4} className="input-field" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register('category', { required: 'Required' })} className="input-field">
                <option value="">Select</option>
                {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input {...register('brand')} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" {...register('price', { required: 'Required', min: 0 })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Price</label>
              <input type="number" {...register('comparePrice')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" {...register('stock', { required: 'Required', min: 0 })} className="input-field" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input {...register('sku')} className="input-field" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" {...register('isFeatured')} className="rounded text-primary-600" />
              <label className="text-sm font-medium">Featured Product</label>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold">Variants & Tags</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
              <input {...register('colors')} className="input-field" placeholder="Red, Blue, Black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
              <input {...register('sizes')} className="input-field" placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input {...register('tags')} className="input-field" placeholder="trending, new" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold">Images</h2>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary-600 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">Click to upload images</span>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} className="hidden" />
          </label>
          {images.length > 0 && <p className="text-sm text-slate-500">{images.length} file(s) selected</p>}
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
