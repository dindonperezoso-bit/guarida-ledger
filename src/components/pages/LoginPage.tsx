import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/lib/auth-store';
import { createLoginController } from '@/lib/login-controller';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const loginControllerRef = useRef(createLoginController());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (isLoading) {
      console.warn('[LOGIN_PAGE] Login already in progress');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const result = await loginControllerRef.current(
        username,
        password,
        {
          onSuccess: async ({ user, profile }) => {
            console.log(`[LOGIN_PAGE] Login successful for ${user.username}`);
            
            // Store auth data with user and profile info
            setAuthUser({
              _id: user._id,
              username: user.username,
              userRole: user.userRole,
              memberProfileId: user.memberProfileId,
              isActive: user.isActive
            }, rememberMe);

            // Redirect to home after a brief delay to ensure state is updated
            setTimeout(() => {
              navigate('/');
            }, 100);
          },
          onError: (err) => {
            console.error('[LOGIN_PAGE] Login error:', err);
            setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.');
            setIsLoading(false);
          }
        }
      );

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión. Intenta de nuevo.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[LOGIN_PAGE] Unexpected error:', err);
      setError('Error inesperado. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-halloween-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-halloween-orange to-halloween-orange-light flex items-center justify-center shadow-lg mx-auto mb-6"
          >
            <span className="text-3xl">🎃</span>
          </motion.div>
          <h1 className="font-heading text-4xl text-halloween-orange-light mb-2">
            Banco Guarida
          </h1>
          <p className="font-paragraph text-halloween-purple-bright text-lg">Virgilio</p>
          <p className="font-paragraph text-foreground/60 text-sm mt-4">
            Sistema de Gestión Financiera
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-halloween-purple/20 rounded-2xl p-8 border border-halloween-purple/40 shadow-2xl"
        >
          <h2 className="font-heading text-2xl text-halloween-orange-light mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <Alert className="mb-6 bg-destructive/10 border-destructive">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <Label htmlFor="username" className="font-paragraph text-foreground flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-halloween-orange-light" />
                Nombre de Usuario
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40 focus:border-halloween-orange-light"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="font-paragraph text-foreground flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-halloween-orange-light" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="bg-halloween-black/50 border-halloween-purple-bright/30 text-foreground placeholder:text-foreground/40 focus:border-halloween-orange-light"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-halloween-purple/40 bg-halloween-black/50 text-halloween-orange-light cursor-pointer"
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="font-paragraph text-foreground/70 text-sm cursor-pointer">
                Recordar mi sesión
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-halloween-orange text-halloween-black hover:bg-halloween-orange-light font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-halloween-black/30 border-t-halloween-black rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-8 pt-6 border-t border-halloween-purple/30">
            <p className="font-paragraph text-xs text-halloween-purple-bright uppercase tracking-wider mb-3 font-bold">
              Cuentas de Demostración
            </p>
            <div className="space-y-2 text-xs text-foreground/70 font-paragraph">
              <p><span className="text-halloween-orange-light font-bold">IKER</span> - Presidente</p>
              <p><span className="text-halloween-orange-light font-bold">CRISTIAN</span> - Supervisor</p>
              <p><span className="text-halloween-orange-light font-bold">JORDAN</span> - Administrador</p>
              <p><span className="text-halloween-orange-light font-bold">IAN</span> - Miembro</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <p className="text-center text-foreground/50 text-xs mt-8 font-paragraph">
          Sistema seguro de autenticación • Sesión persistente en este dispositivo
        </p>
      </motion.div>
    </div>
  );
}
