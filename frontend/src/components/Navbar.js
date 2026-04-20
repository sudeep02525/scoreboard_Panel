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
    { href: '/dashboard', label: '🏠 Home' },
    { href: '/dashboard?tab=live', label: '🔴 Live' },
    { href: '/dashboard?tab=standings', label: '📊 Standings' },
  ];

  const adminLinks = [
    { href: '/admin', label: '🏠 Dashboard' },
    { href: '/admin/teams', label: '🏏 Teams' },
    { href: '/admin/players', label: '👤 Players' },
    { href: '/admin/matches', label: '📋 Matches' },
    { href: '/admin/schedule', label: '🗓️ Schedule' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav style={{ background: '#000D27', borderBottom: '1px solid #1a2a4a' }} className="px-4 py-3 shadow-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="Logo" width={38} height={38} className="rounded-full border-2 flex-shrink-0"
            style={{ borderColor: '#F3C570' }} />
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: '#F3C570' }}>Cricket Tournament</p>
            <p className="text-xs" style={{ color: '#A1BDCB' }}>
              {isAdmin ? '⚙️ Admin Panel' : 'Live Scoreboard'}
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {links.map((item) => (
            <Link key={item.href} href={item.href}
              className="px-3 py-2 rounded-lg transition font-medium text-xs"
              style={{ color: '#A1BDCB' }}>
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-2 ml-3 pl-3" style={{ borderLeft: '1px solid #1a2a4a' }}>
              <div className="text-right">
                <p className="text-xs font-semibold" style={{ color: '#ffffff' }}>{user.name}</p>
                <p className="text-xs" style={{ color: isAdmin ? '#F3C570' : '#A1BDCB' }}>
                  {isAdmin ? 'Admin' : 'Member'}
                </p>
              </div>
              <button onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                style={{ background: '#1a2a4a', color: '#F9A2B2' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-2">
              <Link href="/login" className="px-3 py-1.5 rounded-lg text-xs transition"
                style={{ color: '#A1BDCB', border: '1px solid #1a2a4a' }}>Login</Link>
              <Link href="/register" className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
                style={{ background: '#F3C570', color: '#00061C' }}>Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-lg" style={{ color: '#F3C570' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 pb-3 border-t flex flex-col gap-1 pt-3" style={{ borderColor: '#1a2a4a' }}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm" style={{ color: '#A1BDCB' }}>{item.label}</Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="text-left px-3 py-2 text-sm mt-1" style={{ color: '#F9A2B2' }}>
              Logout ({user.name})
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm" style={{ color: '#A1BDCB' }}>Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-bold" style={{ color: '#F3C570' }}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
