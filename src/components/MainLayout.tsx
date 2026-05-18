import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut, Home, Store, MapPin } from 'lucide-react';

export const MainLayout = () => {
  const { user, userData, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'হোম', path: '/', icon: Home },
    { label: 'প্রোডাক্ট', path: '/shop', icon: Store },
    { label: 'ট্র্যাকিং', path: '/tracking', icon: MapPin },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <nav className="fixed w-full top-0 z-50 bg-brand text-white py-3 px-4 md:px-6 shadow-md shadow-brand/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-wider text-white">
            <img src="https://lh3.googleusercontent.com/d/1E5PnXNEVOpyKQf9Z_ZXVw4x3BCdI4SMC" alt="Baby Pyar" className="h-8 md:h-10 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-medium transition-colors hover:text-accent ${location.pathname === link.path ? 'text-white font-bold' : 'text-white/80'}`}
              >
                {link.label}
              </Link>
            ))}
            
            <Link to="/cart" className="relative text-white hover:text-accent transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-brand text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <UserIcon size={18} className={isAdmin ? "text-accent" : ""} />
                  <span className="hidden lg:inline font-medium">{isAdmin ? 'অ্যাডমিন' : (userData?.name || user.displayName || 'User')}</span>
                </Link>
                <button onClick={logout} className="text-white hover:text-red-400 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-accent text-brand px-5 py-2 rounded-full font-bold shadow-lg hover:bg-accent-hover transition-all">
                লগইন / রেজিস্টার
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex items-center justify-around pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex flex-col items-center justify-center w-full py-3 ${isActive ? 'text-brand' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <Icon size={20} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold font-anek">{link.label}</span>
            </Link>
          );
        })}
        <Link to="/cart" className={`relative flex flex-col items-center justify-center w-full py-3 ${location.pathname === '/cart' ? 'text-brand' : 'text-gray-400 hover:text-gray-900'}`}>
          <div className="relative">
            <ShoppingCart size={20} className={`mb-1 transition-transform ${location.pathname === '/cart' ? 'scale-110' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-brand text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold font-anek">কার্ট</span>
        </Link>
        
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} className={`flex flex-col items-center justify-center w-full py-3 ${['/dashboard', '/admin', '/login'].includes(location.pathname) ? 'text-brand' : 'text-gray-400 hover:text-gray-900'}`}>
          <UserIcon size={20} className={`mb-1 transition-transform ${['/dashboard', '/admin', '/login'].includes(location.pathname) ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold font-anek">{user ? 'প্রোফাইল' : 'লগইন'}</span>
        </Link>
      </div>

      <main className="flex-1 mt-[60px] md:mt-[68px]">
        <Outlet />
      </main>
      
      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/8801970876206" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-[80px] md:bottom-6 right-6 md:right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 animate-bounce"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>

      <footer className="bg-brand border-t border-black/10 py-10 pb-28 md:pb-10 px-4 mt-auto text-white/80">
        <div className="max-w-7xl mx-auto text-center">
              <div className="text-white mb-4">
            <img src="https://lh3.googleusercontent.com/d/1E5PnXNEVOpyKQf9Z_ZXVw4x3BCdI4SMC" alt="Baby Pyar" className="h-8 md:h-10 object-contain mx-auto" />
          </div>
          <p className="text-white/70 text-sm mb-4">© 2026 Baby Pyar. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="text-white/80 hover:text-white font-medium transition-colors">প্রাইভেসি পলিসি</Link>
            <Link to="/return" className="text-white/80 hover:text-white font-medium transition-colors">রিটার্ন পলিসি</Link>
            <Link to="/contact" className="text-white/80 hover:text-white font-medium transition-colors">যোগাযোগ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
