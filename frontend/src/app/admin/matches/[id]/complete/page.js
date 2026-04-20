'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CompleteMatchPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [winnerId, setWinnerId] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else api.get(`/matches/${id}`).then((d) => { if (d._id) setMatch(d); });
  }, [loading, user, id]);

  const handleComplete = async (e) => {
    e.preventDefault();
    const res = await api.put(`/matches/${id}/complete`, { winnerId, description });
    if (res._id) { setMsg('Match completed!'); setTimeout(() => router.push('/admin/matches'), 1500); }
    else setMsg(res.message || 'Error');
  };

  if (!match) return <div className="min-h-screen bg-gray-50"><Navbar /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">✅ Complete Match</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="font-semibold text-gray-700 mb-4">{match.teamA?.name} vs {match.teamB?.name}</p>
          {msg && <p className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">{msg}</p>}
          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Winner</label>
              <select required value={winnerId} onChange={(e) => setWinnerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select winner</option>
                <option value={match.teamA?._id}>{match.teamA?.name}</option>
                <option value={match.teamB?._id}>{match.teamB?.name}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Team A won by 5 wickets"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button type="submit"
              className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">
              Mark as Completed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
