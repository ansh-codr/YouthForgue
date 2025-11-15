'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Plus } from 'lucide-react';
import { useThemeStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/developers', label: 'Developers' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass backdrop-blur-lg bg-white/5 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg group-hover:shadow-accent/50 transition-shadow">
              Y
            </div>
            <span className="hidden sm:inline font-bold text-xl bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              YouthForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors text-sm font-medium ${
                  pathname === link.href
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Theme Toggle & Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}
            </button>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/projects/new" 
                      className="hidden sm:flex items-center gap-2 glass-button text-sm"
                    >
                      <Plus size={16} />
                      New Project
                    </Link>
                    <UserMenu />
                  </>
                ) : (
                  <Button 
                    onClick={() => setAuthModalOpen(true)}
                    className="hidden sm:block glass-button text-sm"
                  >
                    Login
                  </Button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-accent/20 text-accent'
                    : 'text-muted-foreground hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/projects/new" 
                      className="flex items-center justify-center gap-2 w-full glass-button text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Plus size={16} />
                      New Project
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 rounded-lg text-muted-foreground hover:bg-white/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full glass-button text-sm"
                  >
                    Login
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  );
}
