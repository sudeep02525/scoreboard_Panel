'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const ROLES = ['batsman', 'bowler', 'allrounder', 'wicketkeeper'];

export default function AdminPlayers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ name: '', team: '', role: 'batsman' });
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else { api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); }); loadPlayers(); }
  }, [loading, user]);

  const loadPlayers = () => api.get('/players').then((d) => { if (Array.isArray(d)) setPlayers(d); });

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/players', form);
    if (res._id) { setMsg('Player added!'); setForm({ name: '', team: form.team, role: 'batsman' }); loadPlayers(); }
    else setMsg(res.message || 'Error');
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/players/${deleteConfirm}`);
    setDeleteConfirm(null);
    loadPlayers();
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in" 
            style={{ background: '#0A1628', border: '2px solid #EF4444' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#EF4444' }}>Delete Player?</h3>
            <p className="text-sm mb-6" style={{ color: '#A1BDCB' }}>
              Are you sure you want to delete this player? This action cannot be undone.
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
        <h1 className="text-2xl font-bold mb-6 animate-fade-in" style={{ color: '#F3C570' }}>Manage Players</h1>

        <div className="rounded-xl p-5 mb-6 animate-slide-up animate-delay-100" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          <h2 className="font-semibold mb-3 text-sm" style={{ color: '#A1BDCB' }}>Add Player</h2>
          {msg && <p className="text-sm mb-2" style={{ color: '#F3C570' }}>{msg}</p>}
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Player name"
              className="rounded-lg px-3 py-2 flex-1 min-w-36 focus:outline-none text-sm"
              style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
            />
            <select
              required value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              className="rounded-lg px-3 py-2 focus:outline-none text-sm"
              style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
            >
              <option value="">Select Team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name} (Grp {t.group})</option>)}
            </select>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg px-3 py-2 focus:outline-none text-sm"
              style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 rounded-lg font-bold text-sm transition hover:opacity-90"
              style={{ background: '#F3C570', color: '#00061C' }}>
              Add
            </button>
          </form>
        </div>

        {/* Players grouped by team */}
        <div className="space-y-4">
          {teams.map((team, i) => {
            const teamPlayers = players.filter((p) => p.team?._id === team._id || p.team === team._id);
            return (
              <div key={team._id} className={`rounded-xl p-4 animate-slide-up animate-delay-${Math.min((i + 2) * 100, 400)}`} style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
                <h2 className="font-bold mb-2 text-sm" style={{ color: '#F3C570' }}>{team.name} — Group {team.group} ({teamPlayers.length}/8)</h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {teamPlayers.map((p) => (
                    <div key={p._id} className="rounded-lg p-2 flex justify-between items-center"
                      style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{p.name}</p>
                        <p className="text-xs capitalize" style={{ color: '#A1BDCB' }}>{p.role}</p>
                      </div>
                      <button onClick={() => handleDelete(p._id)} className="text-xs hover:opacity-70" style={{ color: '#EF4444' }}>✕</button>
                    </div>
                  ))}
                  {teamPlayers.length === 0 && <p className="text-sm col-span-4" style={{ color: '#1a2a4a' }}>No players yet</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
