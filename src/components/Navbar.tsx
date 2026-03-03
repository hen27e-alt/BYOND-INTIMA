import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'דף בית', href: '/' },
    { name: 'קולקציית Experience', href: '/experience' },
    { name: 'The Journey', href: '/journey' },
    { name: 'אודות', href: '/about' },
    { name: 'כניסה', href: '/login' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-gold/10" role="navigation" aria-label="תפריט ראשי">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-serif tracking-[0.2em] font-light" aria-label="Byond Intima - דף הבית">
            BYOND <span className="text-brand-gold">INTIMA</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={location.pathname === link.href ? "page" : undefined}
                className={cn(
                  "text-sm tracking-widest uppercase transition-colors hover:text-brand-gold",
                  location.pathname === link.href ? "text-brand-gold" : "text-brand-black/60"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2 rounded-full border border-brand-gold/20 hover:bg-brand-gold/5 transition-colors"
            aria-label="אזור אישי"
          >
            <User size={20} className="text-brand-black/70" />
          </Link>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "סגור תפריט" : "פתח תפריט"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-0 right-0 bg-brand-cream border-b border-brand-gold/10 p-6 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-serif tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};
