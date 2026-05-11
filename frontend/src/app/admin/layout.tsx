'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Users, ShoppingBag, Tag, ChevronLeft, Menu } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all duration-300 fixed lg:relative z-30 h-[calc(100vh-80px)]`}>
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <span className="font-bold text-primary-600">Admin Panel</span>}
          <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className={`flex-1 p-6 lg:p-8 ${sidebarOpen ? 'lg:ml-0' : ''} transition-all`}>
        {children}
      </main>
    </div>
  );
}
