import { Link } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[100rem] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading text-xl md:text-2xl text-primary">
                Banco de la Guarida Virgilio
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="font-paragraph text-foreground hover:text-primary transition-colors"
            >
              Economía General
            </Link>
            <Link
              to="/reserva"
              className="font-paragraph text-foreground hover:text-primary transition-colors"
            >
              Reserva Bancaria
            </Link>
            <Link
              to="/miembros"
              className="font-paragraph text-foreground hover:text-primary transition-colors"
            >
              Miembros
            </Link>
            <Link
              to="/admin"
              className="font-paragraph bg-accent-gold text-dark-night-blue px-6 py-2 rounded-lg hover:bg-accent-gold/90 transition-colors"
            >
              Admin Panel
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
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
              className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4"
            >
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-paragraph text-foreground hover:text-primary transition-colors py-2"
                >
                  Economía General
                </Link>
                <Link
                  to="/reserva"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-paragraph text-foreground hover:text-primary transition-colors py-2"
                >
                  Reserva Bancaria
                </Link>
                <Link
                  to="/miembros"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-paragraph text-foreground hover:text-primary transition-colors py-2"
                >
                  Miembros
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-paragraph bg-accent-gold text-dark-night-blue px-6 py-2 rounded-lg hover:bg-accent-gold/90 transition-colors text-center"
                >
                  Admin Panel
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
