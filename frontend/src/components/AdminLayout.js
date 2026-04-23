'use client';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
