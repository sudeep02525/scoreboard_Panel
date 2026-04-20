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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else loadTeams();
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/teams', form);
    if (res._id) { setMsg('Team added!'); setForm({ name: '', group: 'A' }); loadTeams(); }
    else setMsg(res.message || 'Error');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    await api.delete(`/teams/${id}`);
    loadTeams();
  };

  const groupA = teams.filter((t) => t.group === 'A');
  const groupB = teams.filter((t) => t.group === 'B');

  return (
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#F3C570' }}>🏏 Manage Teams</h1>

        <div className="rounded-xl p-5 mb-6" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
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
          {['A', 'B'].map((g) => (
            <div key={g} className="rounded-xl p-4" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
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
                    <button onClick={() => handleDelete(t._id)} className="text-xs" style={{ color: '#F9A2B2' }}>Delete</button>
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
