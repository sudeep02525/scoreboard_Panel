'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/register');
  };

  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/dashboard?tab=live', label: 'Live' },
    { href: '/dashboard?tab=standings', label: 'Standings' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/teams', label: 'Teams' },
    { href: '/admin/players', label: 'Players' },
    { href: '/admin/matches', label: 'Matches' },
    { href: '/admin/schedule', label: 'Schedule' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav style={{ 
      background: 'rgba(0, 6, 28, 0.98)',
      borderBottom: '1px solid rgba(243, 197, 112, 0.15)',
      backdropFilter: 'blur(10px)'
    }} className="px-6 py-3.5 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="Logo" width={42} height={42} 
            className="rounded-xl border-2 flex-shrink-0"
            style={{ borderColor: '#F3C570' }} />
          <div>
            <p className="font-black text-base leading-tight tracking-wide" style={{ color: '#F3C570' }}>
              APL SCOREBOARD
            </p>
            <p className="text-xs font-semibold" style={{ color: '#A1BDCB' }}>
              {isAdmin ? 'Admin Panel' : 'Live Tournament'}
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((item) => (
            <Link key={item.href} href={item.href}
              className="px-4 py-2 transition-all duration-300 font-semibold text-sm relative group inline-block"
              style={{ color: '#A1BDCB' }}>
              <span className="relative inline-block group-hover:text-white transition-colors duration-300">
                {item.label}
                {/* Animated underline - very thin line */}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500 ease-out block"
                  style={{ background: '#F3C570' }}></span>
              </span>
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4 ml-4 pl-4" style={{ borderLeft: '1px solid rgba(243, 197, 112, 0.2)' }}>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold" style={{ color: '#ffffff' }}>{user.name}</p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md" 
                  style={{ 
                    color: isAdmin ? '#F3C570' : '#A1BDCB',
                    background: isAdmin ? 'rgba(243, 197, 112, 0.1)' : 'rgba(161, 189, 203, 0.1)',
                    border: `1px solid ${isAdmin ? 'rgba(243, 197, 112, 0.3)' : 'rgba(161, 189, 203, 0.3)'}`
                  }}>
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
              <div className="flex-1"></div>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300"
                style={{ 
                  background: 'rgba(249, 162, 178, 0.1)', 
                  color: '#F9A2B2',
                  border: '1px solid rgba(249, 162, 178, 0.3)'
                }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{ color: '#A1BDCB', border: '1px solid rgba(161, 189, 203, 0.3)' }}>
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300"
                style={{ background: '#F3C570', color: '#00061C', boxShadow: '0 4px 15px rgba(243, 197, 112, 0.3)' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-xl rounded-lg transition-all duration-300" 
          style={{ color: '#F3C570', background: 'rgba(243, 197, 112, 0.1)' }} 
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t flex flex-col gap-2 pt-4" 
          style={{ borderColor: 'rgba(243, 197, 112, 0.2)' }}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ 
                color: '#A1BDCB',
                background: 'rgba(161, 189, 203, 0.05)',
                border: '1px solid rgba(161, 189, 203, 0.1)'
              }}>
              {item.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="text-left px-4 py-2.5 rounded-lg text-sm font-bold mt-2 transition-all"
              style={{ 
                color: '#F9A2B2',
                background: 'rgba(249, 162, 178, 0.1)',
                border: '1px solid rgba(249, 162, 178, 0.3)'
              }}>
              Logout ({user.name})
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} 
                className="px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ color: '#A1BDCB', border: '1px solid rgba(161, 189, 203, 0.3)' }}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} 
                className="px-4 py-2.5 rounded-lg text-sm font-bold"
                style={{ background: '#F3C570', color: '#00061C' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
