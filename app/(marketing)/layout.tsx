'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown,
  Home,
  Building2,
  Users,
  Phone,
  DollarSign,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { 
    href: '/products', 
    label: 'Products', 
    icon: Building2,
    children: [
      { href: '/products', label: 'Overview', description: 'All our products' },
      { href: '/products#investor-dashboard', label: 'Investor Dashboard', description: 'For individual investors' },
      { href: '/products#deal-room', label: 'Deal Room', description: 'For agents & groups' },
    ]
  },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/about', label: 'About', icon: Users },
  { href: '/contact', label: 'Contact', icon: Phone },
];

function NavDropdown({ item }: { item: typeof navLinks[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
          "text-ink-600 hover:text-foreground",
          isOpen && "text-foreground"
        )}
      >
        {item.label}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 pt-2 z-50"
          >
            <div className="bg-surface rounded-xl border border-border shadow-xl overflow-hidden min-w-[240px]">
              {item.children?.map((child, idx) => (
                <Link
                  key={idx}
                  href={child.href}
                  className={cn(
                    "block px-4 py-3 transition-colors",
                    "hover:bg-rice-100",
                    idx !== (item.children?.length || 0) - 1 && "border-b border-border"
                  )}
                >
                  <div className="font-medium text-sm text-foreground">{child.label}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{child.description}</div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-zen" 
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vermillion to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                Foreclosure Funder
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                link.children ? (
                  <NavDropdown key={link.href} item={link} />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      "text-ink-600 hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-all shadow-zen hover:shadow-zen-lg"
              >
                Try Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-rice-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-surface border-b border-border"
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-ink-600 hover:bg-rice-100 hover:text-foreground transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                    {link.children && (
                      <div className="ml-8 mt-1 space-y-1">
                        {link.children.slice(1).map((child, idx) => (
                          <Link
                            key={idx}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-500 hover:text-foreground transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-border space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-border text-ink-700 font-medium hover:bg-rice-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
                  >
                    Try Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        {children}
      </main>
    </div>
  );
}
