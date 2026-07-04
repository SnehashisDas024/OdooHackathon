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
                fontFamily: 'Avenir Next, Nunito, Inter, sans-serif',
                fontSize: '14px',
                color: '#2C343C',
                background: '#ECF0F3',
                border: '0',
                borderRadius: '16px',
                boxShadow: '10px 10px 20px rgba(22,27,29,0.23), -10px -10px 20px #FAFBFB',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#6EA985', secondary: '#E5F1E9' },
                duration: 3000,
              },
              error: {
                iconTheme: { primary: '#C77777', secondary: '#F2E3E3' },
                duration: 5000,
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
