import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#1B2559',
                background: '#ffffff',
                border: '1px solid #E3E8F4',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(27,37,89,0.10)',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#DCFCE7' },
                duration: 3000,
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#FEE2E2' },
                duration: 5000,
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
