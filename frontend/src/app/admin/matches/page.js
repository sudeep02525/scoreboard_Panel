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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else loadMatches();
  }, [loading, user]);

  const loadMatches = () => api.get('/matches').then((d) => { if (Array.isArray(d)) setMatches(d); });

  const setStatus = async (id, status) => {
    await api.put(`/matches/${id}`, { status });
    loadMatches();
  };

  const statusColor = { live: 'text-red-600', scheduled: 'text-blue-600', completed: 'text-gray-500' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Manage Matches</h1>

        {matches.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400">
            No matches yet. <Link href="/admin/schedule" className="text-green-700 underline">Generate schedule first</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{m.teamA?.name} vs {m.teamB?.name}</p>
                  <p className="text-xs text-gray-400">{m.group} • {m.ground} • Round {m.round || '-'}</p>
                </div>
                <span className={`text-xs font-semibold capitalize ${statusColor[m.status]}`}>{m.status}</span>
                <div className="flex gap-2">
                  {m.status === 'scheduled' && (
                    <button onClick={() => setStatus(m._id, 'live')}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition">
                      Start Live
                    </button>
                  )}
                  {m.status === 'live' && (
                    <Link href={`/admin/matches/${m._id}/score`}
                      className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition">
                      Update Score
                    </Link>
                  )}
                  {m.status !== 'completed' && (
                    <Link href={`/admin/matches/${m._id}/complete`}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition">
                      Complete
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
