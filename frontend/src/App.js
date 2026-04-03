import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Toaster } from 'sonner';
import '@/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#FAF8F5',
            color: '#2C2420',
            border: '1px solid #E5D8C8',
            borderRadius: '12px',
          },
        }}
      />
      
      {!user ? <Login /> : <Dashboard />}
    </div>
  );
}

export default App;
