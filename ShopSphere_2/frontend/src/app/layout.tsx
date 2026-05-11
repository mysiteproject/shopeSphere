import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopSphere - Your Premium Shopping Destination',
  description: 'Discover amazing products at ShopSphere. Shop electronics, fashion, home & kitchen, and more with fast delivery and secure payments.',
  keywords: ['ecommerce', 'shopping', 'online store', 'ShopSphere'],
  openGraph: {
    title: 'ShopSphere',
    description: 'Your Premium Shopping Destination',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
