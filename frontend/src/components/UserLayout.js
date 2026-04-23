'use client';
import UserSidebar from './UserSidebar';

export default function UserLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <UserSidebar />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
