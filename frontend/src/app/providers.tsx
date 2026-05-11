'use client';

import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}
