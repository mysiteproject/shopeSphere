'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Camera, Package, Heart, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getProfile, updateProfile } from '@/store/slices/authSlice';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [tab, setTab] = useState('profile');
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  const onSubmitProfile = async (data: any) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(getProfile());
      toast.success('Avatar updated!');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (!user) return <LoadingSpinner fullPage />;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary-600">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <h2 className="font-bold">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <nav className="mt-4 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  tab === id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /><span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {tab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-6">Personal Information</h2>
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input {...register('name')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input value={user.email} disabled className="input-field bg-slate-50 dark:bg-slate-800 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input {...register('phone')} className="input-field" placeholder="+91 9876543210" />
                </div>
                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {tab === 'addresses' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-6">Saved Addresses</h2>
              {user.addresses.length === 0 ? (
                <p className="text-slate-500">No saved addresses.</p>
              ) : (
                <div className="space-y-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="p-4 rounded-xl border dark:border-slate-700 relative">
                      {addr.isDefault && <span className="badge-green absolute top-3 right-3">Default</span>}
                      <p className="font-semibold">{addr.fullName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{addr.street}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border dark:border-slate-700">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive order updates and offers</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border dark:border-slate-700">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-500">Browser push notifications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
