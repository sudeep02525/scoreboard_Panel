'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function ScorePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [inningsNum, setInningsNum] = useState(1);
  const [players, setPlayers] = useState([]);
  
  // Current players
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else loadMatch();
  }, [loading, user, id]);

  const loadMatch = async () => {
    const matchData = await api.get(`/matches/${id}`);
    if (matchData._id) {
      setMatch(matchData);
      setInningsNum(matchData.currentInnings || 1);
      
      // Load players for both teams
      const [teamAPlayers, teamBPlayers] = await Promise.all([
        api.get(`/players/team/${matchData.teamA._id}`),
        api.get(`/players/team/${matchData.teamB._id}`)
      ]);
      
      setPlayers([...teamAPlayers, ...teamBPlayers]);
      
      // Set current players if already selected
      const innings = inningsNum === 1 ? matchData.innings1 : matchData.innings2;
      if (innings?.currentBatsmen?.length > 0) {
        const striker = innings.currentBatsmen.find(b => b.isStriker);
        const nonStriker = innings.currentBatsmen.find(b => !b.isStriker);
        if (striker) setStrikerId(striker.player._id || striker.player);
        if (nonStriker) setNonStrikerId(nonStriker.player._id || nonStriker.player);
      }
      if (innings?.currentBowler?.player) {
        setBowlerId(innings.currentBowler.player._id || innings.currentBowler.player);
      }
    }
  };

  const handleInningsSwitch = async (num) => {
    setInningsNum(num);
    const innings = num === 1 ? match?.innings1 : match?.innings2;
    
    if (innings?.currentBatsmen?.length > 0) {
      const striker = innings.currentBatsmen.find(b => b.isStriker);
      const nonStriker = innings.currentBatsmen.find(b => !b.isStriker);
      setStrikerId(striker?.player?._id || striker?.player || '');
      setNonStrikerId(nonStriker?.player?._id || nonStriker?.player || '');
    } else {
      setStrikerId('');
      setNonStrikerId('');
    }
    
    if (innings?.currentBowler?.player) {
      setBowlerId(innings.currentBowler.player._id || innings.currentBowler.player);
    } else {
      setBowlerId('');
    }
  };

  const handleSetPlayers = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      return; // Silently return if not all selected
    }
    
    const res = await api.put(`/matches/${id}/players`, {
      inningsNum,
      strikerId,
      nonStrikerId,
      bowlerId
    });
    
    if (res._id) {
      setMatch(res);
      setMsg('Players updated!');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const handleBall = async (runs, isWicket = false, extras = '') => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      setMsg('Please select players first');
      return;
    }

    const res = await api.post(`/matches/${id}/ball`, {
      inningsNum,
      runs,
      isWicket,
      extras,
      batsmanId: strikerId,
      bowlerId,
      strikerId,
      nonStrikerId,
      commentary: `${runs} run${runs !== 1 ? 's' : ''}${isWicket ? ' - WICKET!' : ''}${extras ? ` (${extras})` : ''}`
    });

    if (res._id) {
      setMatch(res);
      
      // If wicket, clear striker and show message
      if (isWicket) {
        setStrikerId('');
        setMsg('Wicket! Select new batsman');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg(`${runs} run${runs !== 1 ? 's' : ''}`);
        setTimeout(() => setMsg(''), 1500);
      }
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
        </div>
      </div>
    );
  }

  const battingTeam = inningsNum === 1 ? match.teamA : match.teamB;
  const bowlingTeam = inningsNum === 1 ? match.teamB : match.teamA;
  const innings = inningsNum === 1 ? match.innings1 : match.innings2;
  
  const battingPlayers = players.filter(p => p.team === battingTeam._id || p.team?._id === battingTeam._id);
  const bowlingPlayers = players.filter(p => p.team === bowlingTeam._id || p.team?._id === bowlingTeam._id);

  const striker = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker = innings?.currentBatsmen?.find(b => !b.isStriker);
  const currentBowler = innings?.currentBowler;
  
  // Get last 6 balls
  const recentBalls = innings?.ballByBall?.slice(-6) || [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(249, 162, 178, 0.1)', border: '1px solid rgba(249, 162, 178, 0.3)', color: '#F9A2B2' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8"/>
            </svg>
            LIVE SCORING
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#F3C570' }}>
            {match.teamA?.name} vs {match.teamB?.name}
          </h1>
          <p className="text-sm" style={{ color: '#A1BDCB' }}>{match.group} • {match.ground}</p>
        </div>

        {/* Innings selector */}
        <div className="flex gap-2 mb-6 animate-slide-up animate-delay-100">
          {[1, 2].map((n) => (
            <button key={n} onClick={() => handleInningsSwitch(n)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={inningsNum === n
                ? { background: '#F3C570', color: '#00061C' }
                : { background: '#0A1628', color: '#A1BDCB', border: '1px solid #1a2a4a' }}>
              Innings {n} — {n === 1 ? match.teamA?.name : match.teamB?.name}
            </button>
          ))}
        </div>

        {msg && (
          <div className="p-3 rounded-lg text-sm mb-4 flex items-center gap-2 animate-fade-in"
            style={{ background: 'rgba(243, 197, 112, 0.1)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {msg}
          </div>
        )}

        {/* Scoreboard */}
        <div className="rounded-xl p-6 mb-4 animate-slide-up animate-delay-200"
          style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          
          {/* Team Info & Score */}
          <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid #1a2a4a' }}>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#A1BDCB' }}>BATTING</p>
              <p className="font-bold text-xl" style={{ color: '#F3C570' }}>{battingTeam?.name}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: '#ffffff' }}>
                {innings?.runs || 0}/{innings?.wickets || 0}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#A1BDCB' }}>
                ({innings?.overs || 0}.{innings?.balls || 0} overs)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold mb-1" style={{ color: '#A1BDCB' }}>BOWLING</p>
              <p className="font-bold text-xl" style={{ color: '#ffffff' }}>{bowlingTeam?.name}</p>
            </div>
          </div>

          {/* Current Batsmen */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg p-3" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: '#A1BDCB' }}>STRIKER</p>
                {striker && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F3C570', color: '#00061C' }}>*</span>}
              </div>
              <select value={strikerId} onChange={(e) => { setStrikerId(e.target.value); handleSetPlayers(); }}
                className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
                style={{ background: '#0A1628', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                <option value="">Select striker</option>
                {battingPlayers.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              {striker && (
                <p className="text-xs" style={{ color: '#A1BDCB' }}>
                  {striker.runs}({striker.balls}) • 4s: {striker.fours} • 6s: {striker.sixes}
                </p>
              )}
            </div>

            <div className="rounded-lg p-3" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#A1BDCB' }}>NON-STRIKER</p>
              <select value={nonStrikerId} onChange={(e) => { setNonStrikerId(e.target.value); handleSetPlayers(); }}
                className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
                style={{ background: '#0A1628', border: '1px solid #1a2a4a', color: '#ffffff' }}>
                <option value="">Select non-striker</option>
                {battingPlayers.filter(p => p._id !== strikerId).map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              {nonStriker && (
                <p className="text-xs" style={{ color: '#A1BDCB' }}>
                  {nonStriker.runs}({nonStriker.balls}) • 4s: {nonStriker.fours} • 6s: {nonStriker.sixes}
                </p>
              )}
            </div>
          </div>

          {/* Current Bowler */}
          <div className="rounded-lg p-3 mb-4" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#A1BDCB' }}>CURRENT BOWLER</p>
            <select value={bowlerId} onChange={(e) => { setBowlerId(e.target.value); handleSetPlayers(); }}
              className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
              style={{ background: '#0A1628', border: '1px solid #1a2a4a', color: '#ffffff' }}>
              <option value="">Select bowler</option>
              {bowlingPlayers.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {currentBowler && (
              <p className="text-xs" style={{ color: '#A1BDCB' }}>
                {currentBowler.overs}.{currentBowler.balls} - {currentBowler.runs}/{currentBowler.wickets}
              </p>
            )}
          </div>

          {/* Recent Balls */}
          {recentBalls.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: '#A1BDCB' }}>THIS OVER</p>
              <div className="flex gap-2">
                {recentBalls.map((ball, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={
                      ball.isWicket ? { background: 'rgba(249, 162, 178, 0.2)', color: '#F9A2B2', border: '1px solid rgba(249, 162, 178, 0.3)' }
                      : ball.runs === 4 ? { background: 'rgba(161, 189, 203, 0.2)', color: '#A1BDCB', border: '1px solid rgba(161, 189, 203, 0.3)' }
                      : ball.runs === 6 ? { background: 'rgba(243, 197, 112, 0.2)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }
                      : { background: '#000D27', color: '#ffffff', border: '1px solid #1a2a4a' }
                    }>
                    {ball.isWicket ? 'W' : ball.extras ? ball.extras.toUpperCase() : ball.runs}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Selection Button - Removed */}
        </div>

        {/* Scoring Buttons */}
        <div className="rounded-xl p-6 space-y-5 animate-slide-up animate-delay-300"
          style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#A1BDCB' }}>RUNS</p>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((r) => (
                <button key={r} onClick={() => handleBall(r)}
                  className="h-14 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
                  style={{ background: '#000D27', color: '#ffffff', border: '1px solid #1a2a4a' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleBall(4)}
              className="h-14 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(161, 189, 203, 0.2)', color: '#A1BDCB', border: '1px solid rgba(161, 189, 203, 0.3)' }}>
              4 (FOUR)
            </button>
            <button onClick={() => handleBall(6)}
              className="h-14 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(243, 197, 112, 0.2)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>
              6 (SIX)
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#A1BDCB' }}>EXTRAS & WICKET</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleBall(1, false, 'wd')}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: '#000D27', color: '#ffffff', border: '1px solid #1a2a4a' }}>
                WD
              </button>
              <button onClick={() => handleBall(1, false, 'nb')}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: '#000D27', color: '#ffffff', border: '1px solid #1a2a4a' }}>
                NB
              </button>
              <button onClick={() => handleBall(0, true)}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: 'rgba(249, 162, 178, 0.2)', color: '#F9A2B2', border: '1px solid rgba(249, 162, 178, 0.3)' }}>
                WICKET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
