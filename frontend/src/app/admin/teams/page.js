'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminTeams() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'A' });
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else loadTeams();
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/teams', form);
    if (res._id) { 
      setMsg('Team added!'); 
      const currentGroup = form.group; // Save current group
      setForm({ name: '', group: currentGroup }); // Keep the same group selected
      loadTeams(); 
    }
    else setMsg(res.message || 'Error');
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/teams/${deleteConfirm}`);
    setDeleteConfirm(null);
    loadTeams();
  };

  const groupA = teams.filter((t) => t.group === 'A');
  const groupB = teams.filter((t) => t.group === 'B');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in" 
            style={{ background: '#0A1628', border: '2px solid #EF4444' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#EF4444' }}>Delete Team?</h3>
            <p className="text-sm mb-6" style={{ color: '#A1BDCB' }}>
              Are you sure you want to delete this team? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg font-bold text-sm transition hover:opacity-90"
                style={{ background: '#1a2a4a', color: '#A1BDCB' }}>
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg font-bold text-sm transition hover:opacity-90"
                style={{ background: '#EF4444', color: '#ffffff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 animate-fade-in" style={{ color: '#F3C570' }}>Manage Teams</h1>

        <div className="rounded-xl p-5 mb-6 animate-slide-up animate-delay-100" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          <h2 className="font-semibold mb-3 text-sm" style={{ color: '#A1BDCB' }}>Add Team</h2>
          {msg && <p className="text-sm mb-2" style={{ color: '#F3C570' }}>{msg}</p>}
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Team name"
              className="rounded-lg px-3 py-2 flex-1 min-w-40 focus:outline-none text-sm"
              style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }} />
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}
              className="rounded-lg px-3 py-2 focus:outline-none text-sm"
              style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>
            <button type="submit" className="px-4 py-2 rounded-lg font-bold text-sm transition"
              style={{ background: '#F3C570', color: '#00061C' }}>Add Team</button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {['A', 'B'].map((g, i) => (
            <div key={g} className={`rounded-xl p-4 animate-slide-up animate-delay-${(i + 2) * 100}`} style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
              <h2 className="font-bold mb-3 text-sm" style={{ color: '#F3C570' }}>
                Group {g} ({(g === 'A' ? groupA : groupB).length}/4)
              </h2>
              <div className="space-y-2">
                {(g === 'A' ? groupA : groupB).map((t) => (
                  <div key={t._id} className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#ffffff' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: '#A1BDCB' }}>{t.players?.length || 0}/8 players</p>
                    </div>
                    <button onClick={() => handleDelete(t._id)} className="text-xs px-2 py-1 rounded hover:opacity-70" style={{ color: '#EF4444' }}>Delete</button>
                  </div>
                ))}
                {(g === 'A' ? groupA : groupB).length === 0 && <p className="text-xs" style={{ color: '#1a2a4a' }}>No teams yet</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
