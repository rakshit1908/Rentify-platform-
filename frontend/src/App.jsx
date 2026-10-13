import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import FavoritesProvider  from './context/FavoritesProvider';
import AppRouter          from './routes/AppRouter';
import { ToastContainer } from './components/common/Toast';
import { useToast }       from './hooks/useToast';

const AppInner = () => {
  const { toasts, dismiss } = useToast();
  return (
    <>
      <AppRouter />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <FavoritesProvider>
        <AppInner />
      </FavoritesProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
