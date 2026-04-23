'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/teams', label: 'Teams', icon: 'users' },
  { href: '/admin/players', label: 'Players', icon: 'user' },
  { href: '/admin/matches', label: 'Matches', icon: 'clock' },
  { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
];

const icons = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); router.push('/admin/login'); };
  const isActive = (href) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-area">
        <Image src="/logo.jpeg" alt="Logo" width={46} height={46} className="sidebar-logo-img" />
        <div>
          <p className="sidebar-brand-name">APL SCOREBOARD</p>
          <p className="sidebar-brand-sub">Admin Panel</p>
        </div>
      </div>

      <p className="sidebar-section-label">Navigation</p>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}>
            {icons[item.icon]}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--gold)', marginTop: '1px' }}>Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          {icons.logout}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
