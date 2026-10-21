import { Link } from 'react-router-dom';
import { Menu, X, Shield, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMember } from '@/integrations';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { member, isAuthenticated, actions } = useMember();

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Economía', path: '/' },
    { label: 'Reserva', path: '/reserva' },
    { label: 'Miembros', path: '/miembros' },
    { label: 'Transferencias', path: '/transferencias' },
    { label: 'Proyectos', path: '/admin' },
    { label: 'Historial', path: '/' },
  ];

  return (
    <header className="w-full bg-halloween-black border-b-2 border-halloween-purple sticky top-0 z-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-halloween-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-halloween-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[100rem] mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-halloween-orange to-halloween-orange-light flex items-center justify-center shadow-lg"
            >
              <span className="text-halloween-black font-bold text-lg">🎃</span>
            </motion.div>
            <div>
              <h1 className="font-heading text-lg md:text-xl text-foreground group-hover:text-halloween-orange-light transition-colors">
                Banco Guarida
              </h1>
              <p className="text-xs text-halloween-purple-bright font-medium">Virgilio</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="font-paragraph text-foreground hover:text-halloween-orange-light px-3 py-2 rounded-lg transition-all duration-300 hover:bg-halloween-purple/20 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Admin Panel Button - Desktop */}
          <Link
            to="/admin"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-halloween-orange to-halloween-orange-light text-halloween-black px-6 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-halloween-orange/50 transition-all duration-300 group"
          >
            <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>ADMIN</span>
          </Link>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-foreground hover:text-halloween-orange-light px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{member?.profile?.nickname || 'Perfil'}</span>
                </Link>
                <button
                  onClick={actions.logout}
                  className="flex items-center gap-2 text-foreground hover:text-halloween-orange-light px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Salir</span>
                </button>
              </>
            ) : (
              <button
                onClick={actions.login}
                className="bg-halloween-purple text-foreground hover:bg-halloween-purple-bright px-6 py-2 rounded-lg font-bold transition-all duration-300"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-halloween-orange-light transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 pb-4 border-t border-halloween-purple/30 pt-4"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-paragraph text-foreground hover:text-halloween-orange-light px-4 py-2 rounded-lg transition-all duration-300 hover:bg-halloween-purple/20"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-paragraph bg-gradient-to-r from-halloween-orange to-halloween-orange-light text-halloween-black px-4 py-2 rounded-lg font-bold text-center mt-2 hover:shadow-lg hover:shadow-halloween-orange/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN PANEL
                </Link>
                
                {/* Mobile Auth Buttons */}
                <div className="border-t border-halloween-purple/30 pt-4 mt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="font-paragraph flex items-center gap-2 text-foreground hover:text-halloween-orange-light px-4 py-2 rounded-lg transition-all duration-300 hover:bg-halloween-purple/20"
                      >
                        <User className="w-4 h-4" />
                        <span>{member?.profile?.nickname || 'Mi Perfil'}</span>
                      </Link>
                      <button
                        onClick={() => {
                          actions.logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full font-paragraph flex items-center gap-2 text-foreground hover:text-halloween-orange-light px-4 py-2 rounded-lg transition-all duration-300 hover:bg-halloween-purple/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        actions.login();
                        setIsMenuOpen(false);
                      }}
                      className="w-full font-paragraph bg-halloween-purple text-foreground hover:bg-halloween-purple-bright px-4 py-2 rounded-lg font-bold transition-all duration-300"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
