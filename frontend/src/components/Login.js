import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastCustom } from './Toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToastCustom();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Logo/Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-800 dark:text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              jessicaalesuarez
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm tracking-wide">
              Administración de Catálogo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#0f172a] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all text-sm"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#0f172a] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#C9A96E] hover:bg-[#B8986A] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
