import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CatalogoPublico from './components/CatalogoPublico';
import { Toaster } from 'sonner';
import './App.css';

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
    <BrowserRouter>
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
        
        <Routes>
          <Route path="/catalogo" element={<CatalogoPublico />} />
          <Route 
            path="/" 
            element={!user ? <Login /> : <Dashboard />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
