'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminMatches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    teamA: '',
    teamB: '',
    stage: 'group',
    group: 'A',
    ground: 'Ground 1',
    overs: 5,
    date: '',
    round: 1,
  });
  const [msg, setMsg] = useState('');
  const [editingMatch, setEditingMatch] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else { loadMatches(); loadTeams(); }
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const loadMatches = () => api.get('/matches').then((d) => { if (Array.isArray(d)) setMatches(d); });

  const setStatus = async (id, status) => {
    await api.put(`/matches/${id}`, { status });
    loadMatches();
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/matches/${deleteConfirm}`);
    setMsg('Match deleted successfully!');
    setDeleteConfirm(null);
    loadMatches();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setForm({
      teamA: match.teamA?._id || match.teamA,
      teamB: match.teamB?._id || match.teamB,
      stage: match.stage,
      group: match.group,
      ground: match.ground,
      overs: match.overs,
      date: match.date ? new Date(match.date).toISOString().split('T')[0] : '',
      round: match.round || 1,
    });
    setShowCreateForm(true);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.teamA === form.teamB) {
      setMsg('Please select different teams');
      return;
    }
    
    const matchData = {
      teamA: form.teamA,
      teamB: form.teamB,
      stage: form.stage,
      group: form.group,
      ground: form.ground,
      overs: form.overs,
      date: form.date || new Date(),
      status: editingMatch ? editingMatch.status : 'scheduled'
    };
    
    // Add round only for group stage matches
    if (form.stage === 'group') {
      matchData.round = form.round;
    }
    
    let res;
    if (editingMatch) {
      res = await api.put(`/matches/${editingMatch._id}`, matchData);
      setMsg('Match updated successfully!');
    } else {
      res = await api.post('/matches', matchData);
      setMsg('Match created successfully!');
    }
    
    if (res._id || res.message !== 'Error') {
      setForm({
        teamA: '',
        teamB: '',
        stage: 'group',
        group: 'A',
        ground: 'Ground 1',
        overs: 5,
        date: '',
        round: 1,
      });
      setShowCreateForm(false);
      setEditingMatch(null);
      loadMatches();
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(res.message || 'Error saving match');
    }
  };

  const statusColor = { 
    live: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }, 
    scheduled: { color: '#A1BDCB', bg: 'rgba(161, 189, 203, 0.1)' }, 
    completed: { color: '#1a2a4a', bg: 'rgba(26, 42, 74, 0.1)' } 
  };

  // Group matches by stage
  const groupAMatches = matches.filter(m => m.group === 'A');
  const groupBMatches = matches.filter(m => m.group === 'B');
  const semiMatches = matches.filter(m => m.stage === 'semi');
  const finalMatches = matches.filter(m => m.stage === 'final');

  const MatchCard = ({ m }) => (
    <div className="rounded-xl p-4 flex items-center justify-between gap-4"
      style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>{m.teamA?.name} vs {m.teamB?.name}</p>
        <p className="text-xs" style={{ color: '#A1BDCB' }}>{m.ground} • Round {m.round || '-'} • {m.overs} overs</p>
      </div>
      <span className="text-xs font-semibold capitalize px-2 py-1 rounded"
        style={{ color: statusColor[m.status].color, background: statusColor[m.status].bg }}>
        {m.status}
      </span>
      <div className="flex gap-2">
        {m.status === 'scheduled' && (
          <>
            <button onClick={() => setStatus(m._id, 'live')}
              className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
              style={{ background: '#EF4444', color: '#ffffff' }}>
              Start Live
            </button>
            <button onClick={() => handleEdit(m)}
              className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
              style={{ background: '#A1BDCB', color: '#00061C' }}>
              Edit
            </button>
          </>
        )}
        {m.status === 'live' && (
          <Link href={`/admin/matches/${m._id}/score`}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
            style={{ background: '#F3C570', color: '#00061C' }}>
            Update Score
          </Link>
        )}
        {m.status !== 'completed' && (
          <Link href={`/admin/matches/${m._id}/complete`}
            className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
            style={{ background: '#A1BDCB', color: '#00061C' }}>
            Complete
          </Link>
        )}
        <button onClick={() => handleDelete(m._id)}
          className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          Delete
        </button>
      </div>
    </div>
  );

  const StageSection = ({ title, matches, icon, delay = 0 }) => {
    if (matches.length === 0) return null;
    return (
      <div className={`animate-slide-up animate-delay-${delay}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(243, 197, 112, 0.1)', color: '#F3C570' }}>
            {icon}
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#F3C570' }}>{title}</h2>
          <span className="text-xs px-2 py-1 rounded-full font-semibold" 
            style={{ background: 'rgba(161, 189, 203, 0.1)', color: '#A1BDCB' }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
        <div className="space-y-3 mb-8">
          {matches.map((m) => <MatchCard key={m._id} m={m} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in" 
            style={{ background: '#0A1628', border: '2px solid #EF4444' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#EF4444' }}>Delete Match?</h3>
            <p className="text-sm mb-6" style={{ color: '#A1BDCB' }}>
              Are you sure you want to delete this match? This action cannot be undone.
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
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold" style={{ color: '#F3C570' }}>Manage Matches</h1>
          <button 
            onClick={() => {
              if (showCreateForm && editingMatch) {
                setEditingMatch(null);
                setForm({
                  teamA: '',
                  teamB: '',
                  stage: 'group',
                  group: 'A',
                  ground: 'Ground 1',
                  overs: 5,
                  date: '',
                  round: 1,
                });
              }
              setShowCreateForm(!showCreateForm);
            }}
            className="px-4 py-2 rounded-lg font-bold text-sm transition hover:opacity-90"
            style={{ background: '#F3C570', color: '#00061C' }}>
            {showCreateForm ? 'Cancel' : '+ Create Match'}
          </button>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm animate-fade-in" 
            style={{ background: 'rgba(243, 197, 112, 0.1)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>
            {msg}
          </div>
        )}

        {/* Create Match Form */}
        {showCreateForm && (
          <div className="rounded-xl p-5 mb-6 animate-slide-up" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <h2 className="font-semibold mb-4 text-sm" style={{ color: '#A1BDCB' }}>
              {editingMatch ? 'Edit Match' : 'Create New Match'}
            </h2>
            
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Team A</label>
                  <select 
                    required 
                    value={form.teamA}
                    onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                    <option value="">Select Team A</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} (Group {t.group})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Team B</label>
                  <select 
                    required 
                    value={form.teamB}
                    onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                    <option value="">Select Team B</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} (Group {t.group})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Match Type</label>
                  <select 
                    value={form.stage}
                    onChange={(e) => {
                      const stage = e.target.value;
                      setForm({ 
                        ...form, 
                        stage,
                        group: stage === 'group' ? 'A' : stage === 'semi' ? 'Semi Final 1' : 'Final',
                        round: stage === 'group' ? 1 : undefined
                      });
                    }}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                    <option value="group">Group Stage</option>
                    <option value="semi">Semi Final</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>
                    {form.stage === 'group' ? 'Group' : form.stage === 'semi' ? 'Semi Final' : 'Match'}
                  </label>
                  {form.stage === 'group' ? (
                    <select 
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                    </select>
                  ) : form.stage === 'semi' ? (
                    <select 
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                      <option value="Semi Final 1">Semi Final 1</option>
                      <option value="Semi Final 2">Semi Final 2</option>
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value="Final"
                      disabled
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#A1BDCB' }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Ground</label>
                  <select 
                    value={form.ground}
                    onChange={(e) => setForm({ ...form, ground: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                    <option value="Ground 1">Ground 1</option>
                    <option value="Ground 2">Ground 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Overs</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50"
                    value={form.overs}
                    onChange={(e) => setForm({ ...form, overs: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                  />
                </div>

                {form.stage === 'group' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Round</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={form.round}
                      onChange={(e) => setForm({ ...form, round: Number(e.target.value) })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                    />
                  </div>
                )}

                <div className={form.stage === 'group' ? '' : 'col-span-2'}>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#A1BDCB' }}>Date</label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90"
                style={{ background: '#F3C570', color: '#00061C' }}>
                {editingMatch ? 'Update Match' : 'Create Match'}
              </button>
            </form>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="rounded-xl p-6 text-center animate-slide-up animate-delay-100" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <p style={{ color: '#A1BDCB' }}>No matches yet. <Link href="/admin/schedule" className="underline" style={{ color: '#F3C570' }}>Generate schedule first</Link></p>
          </div>
        ) : (
          <>
            <StageSection 
              title="Group A Matches" 
              matches={groupAMatches}
              delay={100}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Group B Matches" 
              matches={groupBMatches}
              delay={200}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Semi Finals" 
              matches={semiMatches}
              delay={300}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Final" 
              matches={finalMatches}
              delay={400}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
