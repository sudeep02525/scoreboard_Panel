import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      {children}
    </div>
  );
}
