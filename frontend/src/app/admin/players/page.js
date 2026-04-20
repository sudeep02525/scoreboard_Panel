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
    if (!confirm('Delete player?')) return;
    await api.delete(`/players/${id}`);
    loadPlayers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Manage Players</h1>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Add Player</h2>
          {msg && <p className="text-sm text-green-600 mb-2">{msg}</p>}
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Player name"
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-36 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              required value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name} (Grp {t.group})</option>)}
            </select>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              Add
            </button>
          </form>
        </div>

        {/* Players grouped by team */}
        <div className="space-y-4">
          {teams.map((team) => {
            const teamPlayers = players.filter((p) => p.team?._id === team._id || p.team === team._id);
            return (
              <div key={team._id} className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="font-bold text-gray-700 mb-2">{team.name} — Group {team.group} ({teamPlayers.length}/8)</h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {teamPlayers.map((p) => (
                    <div key={p._id} className="bg-gray-50 rounded-lg p-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{p.role}</p>
                      </div>
                      <button onClick={() => handleDelete(p._id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                    </div>
                  ))}
                  {teamPlayers.length === 0 && <p className="text-gray-400 text-sm col-span-4">No players yet</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
