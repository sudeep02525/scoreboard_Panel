'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const TOTAL_OVERS = 5;

function calcRunRate(runs, overs, balls) {
  const totalBalls = overs * 6 + balls;
  if (totalBalls === 0) return '0.00';
  return ((runs / totalBalls) * 6).toFixed(2);
}

function ballsLeft(overs, balls) {
  return TOTAL_OVERS * 6 - (overs * 6 + balls);
}

function oversDisplay(overs, balls) {
  return `${overs}.${balls}`;
}

function ballLabel(ball) {
  if (ball.isWicket) return 'W';
  if (ball.extras === 'wd') return 'Wd';
  if (ball.extras === 'nb' || ball.extras?.startsWith('nb-')) return 'Nb';
  if (ball.extras === 'b') return `B${ball.runs > 1 ? ball.runs : ''}`;
  if (ball.extras === 'lb') return `Lb${ball.runs > 1 ? ball.runs : ''}`;
  if (ball.extras?.startsWith('ot')) return `${ball.runs}+${ball.extras.replace('ot', '')}`;
  return ball.runs;
}

function ballStyle(ball) {
  if (ball.isWicket) return { background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' };
  if (ball.runs >= 6 || ball.extras?.startsWith('ot')) return { background: 'rgba(243,197,112,0.2)', color: '#F3C570', border: '1px solid rgba(243,197,112,0.4)' };
  if (ball.runs === 4) return { background: 'rgba(161,189,203,0.2)', color: '#8aacbf', border: '1px solid rgba(161,189,203,0.4)' };
  if (ball.extras === 'wd' || ball.extras?.startsWith('nb')) return { background: 'rgba(255,165,0,0.15)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.3)' };
  return { background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' };
}

export default function ScorePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [inningsNum, setInningsNum] = useState(1);
  const [players, setPlayers] = useState([]);
  
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  // Wicket modal state
  const [wicketModal, setWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState('bowled');
  const [pendingRuns, setPendingRuns] = useState(0);
  const [pendingExtras, setPendingExtras] = useState('');

  // Extras modal (for nb/wide with runs)
  const [extrasModal, setExtrasModal] = useState(false);
  const [extrasType, setExtrasType] = useState('');
  const [extrasRuns, setExtrasRuns] = useState(0);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info'); // info | error | success

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else loadMatch();
  }, [loading, user, id]);

  const showMsg = (text, type = 'info', duration = 2500) => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), duration);
  };

  const loadMatch = async () => {
    const matchData = await api.get(`/matches/${id}`);
    if (matchData._id) {
      setMatch(matchData);
      setInningsNum(matchData.currentInnings || 1);
      
      const [teamAPlayers, teamBPlayers] = await Promise.all([
        api.get(`/players/team/${matchData.teamA._id}`),
        api.get(`/players/team/${matchData.teamB._id}`)
      ]);
      setPlayers([...teamAPlayers, ...teamBPlayers]);
      
      const innings = (matchData.currentInnings || 1) === 1 ? matchData.innings1 : matchData.innings2;
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

  const handleInningsSwitch = (num) => {
    setInningsNum(num);
    const innings = num === 1 ? match?.innings1 : match?.innings2;
    if (innings?.currentBatsmen?.length > 0) {
      const striker = innings.currentBatsmen.find(b => b.isStriker);
      const nonStriker = innings.currentBatsmen.find(b => !b.isStriker);
      setStrikerId(striker?.player?._id || striker?.player || '');
      setNonStrikerId(nonStriker?.player?._id || nonStriker?.player || '');
    } else { setStrikerId(''); setNonStrikerId(''); }
    if (innings?.currentBowler?.player) {
      setBowlerId(innings.currentBowler.player._id || innings.currentBowler.player);
    } else { setBowlerId(''); }
  };

  const handleSetPlayers = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) return;
    const res = await api.put(`/matches/${id}/players`, { inningsNum, strikerId, nonStrikerId, bowlerId });
    if (res._id) { setMatch(res); showMsg('Players updated!', 'success'); }
  };

  // Core ball submission
  const submitBall = async ({ runs = 0, isWicket = false, dismissalType = '', extras = '', extraRuns = 0 }) => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      showMsg('Please select all players first', 'error'); return;
    }
    const res = await api.post(`/matches/${id}/ball`, {
      inningsNum, runs, isWicket, dismissalType, extras, extraRuns,
      batsmanId: strikerId, bowlerId, strikerId, nonStrikerId,
      commentary: buildCommentary(runs, isWicket, dismissalType, extras, extraRuns),
    });
    if (res._id) {
      setMatch(res);
      const updatedInnings = inningsNum === 1 ? res.innings1 : res.innings2;
      if (!updatedInnings?.currentBowler?.player) {
        setBowlerId('');
        showMsg('Over complete! Select new bowler', 'info', 4000);
        return;
      }
      if (isWicket) {
        setStrikerId('');
        showMsg('Wicket! Select new batsman', 'error', 3000);
      } else {
        const label = extras ? extras.toUpperCase() : `${runs} run${runs !== 1 ? 's' : ''}`;
        showMsg(label, 'success');
      }
    } else {
      showMsg(res.message || 'Error recording ball', 'error');
    }
  };

  const buildCommentary = (runs, isWicket, dismissalType, extras, extraRuns) => {
    if (isWicket) return `WICKET! ${dismissalType}`;
    if (extras === 'wd') return `Wide${runs > 0 ? ` +${runs}` : ''}`;
    if (extras?.startsWith('nb')) return `No Ball${runs > 0 ? ` +${runs}` : ''}`;
    if (extras === 'b') return `Bye ${runs}`;
    if (extras === 'lb') return `Leg Bye ${runs}`;
    if (extras?.startsWith('ot')) return `${runs} + ${extraRuns} Overthrow`;
    return `${runs} run${runs !== 1 ? 's' : ''}`;
  };

  // Undo last ball
  const handleUndo = async () => {
    const res = await api.post(`/matches/${id}/undo`, { inningsNum });
    if (res._id) { setMatch(res); showMsg('Last ball undone', 'info'); }
    else showMsg(res.message || 'Nothing to undo', 'error');
  };

  // Swap batsmen
  const handleSwap = () => {
    const tmp = strikerId;
    setStrikerId(nonStrikerId);
    setNonStrikerId(tmp);
    setTimeout(() => handleSetPlayers(), 50);
  };

  // Open wicket modal
  const openWicket = (runs = 0, extras = '') => {
    setPendingRuns(runs);
    setPendingExtras(extras);
    setWicketType('bowled');
    setWicketModal(true);
  };

  const confirmWicket = () => {
    setWicketModal(false);
    submitBall({ runs: pendingRuns, isWicket: true, dismissalType: wicketType, extras: pendingExtras });
  };

  // Open extras modal (wide/nb with additional runs)
  const openExtrasModal = (type) => {
    setExtrasType(type);
    setExtrasRuns(0);
    setExtrasModal(true);
  };

  const confirmExtras = () => {
    setExtrasModal(false);
    submitBall({ runs: extrasRuns, extras: extrasType });
  };

  if (!match) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
        </div>
      </AdminLayout>
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
  
  // Only show balls from the current over
  const currentOverBalls = (innings?.ballByBall || []).filter(b => b.over === (innings?.overs || 0));

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
            LIVE SCORING
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#F3C570' }}>
            {match.teamA?.name} vs {match.teamB?.name}
          </h1>
          <p className="text-sm" style={{ color: '#8aacbf' }}>{match.group} • {match.ground}</p>
        </div>

        {/* Innings selector */}
        <div className="flex gap-2 mb-4">
          {[1, 2].map((n) => (
            <button key={n} onClick={() => handleInningsSwitch(n)}
              className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300"
              style={inningsNum === n
                ? { background: '#c9a227', color: '#0a1628' }
                : { background: '#112240', color: '#8aacbf', border: '1px solid rgba(255,255,255,0.1)' }}>
              Innings {n} — {n === 1 ? match.teamA?.name : match.teamB?.name}
            </button>
          ))}
        </div>

        {msg && (
          <div className="p-3 rounded-lg text-sm mb-4 animate-fade-in"
            style={{
              background: msgType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(243,197,112,0.1)',
              color: msgType === 'error' ? '#EF4444' : '#F3C570',
              border: `1px solid ${msgType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(243,197,112,0.3)'}`,
            }}>
            {msg}
          </div>
        )}

        {/* ── Scoreboard ── */}
        <div className="rounded-xl p-4 sm:p-5 mb-4"
          style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Score row */}
          <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #1a2a4a' }}>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#8aacbf' }}>BATTING</p>
              <p className="font-bold text-base" style={{ color: '#F3C570' }}>{battingTeam?.name}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: '#ffffff' }}>
                {innings?.runs || 0}/{innings?.wickets || 0}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#8aacbf' }}>
                {oversDisplay(innings?.overs || 0, innings?.balls || 0)} / {TOTAL_OVERS}.0 ov
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold mb-1" style={{ color: '#8aacbf' }}>BOWLING</p>
              <p className="font-bold text-base" style={{ color: '#ffffff' }}>{bowlingTeam?.name}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="rounded-lg p-2" style={{ background: '#0a1628' }}>
              <p className="text-xs mb-1" style={{ color: '#8aacbf' }}>BALLS LEFT</p>
              <p className="text-xl font-bold" style={{ color: '#F3C570' }}>
                {ballsLeft(innings?.overs || 0, innings?.balls || 0)}
              </p>
            </div>
            <div className="rounded-lg p-2" style={{ background: '#0a1628' }}>
              <p className="text-xs mb-1" style={{ color: '#8aacbf' }}>RUN RATE</p>
              <p className="text-xl font-bold" style={{ color: '#ffffff' }}>
                {calcRunRate(innings?.runs || 0, innings?.overs || 0, innings?.balls || 0)}
              </p>
            </div>
            <div className="rounded-lg p-2" style={{ background: '#0a1628' }}>
              <p className="text-xs mb-1" style={{ color: '#8aacbf' }}>EXTRAS</p>
              <p className="text-xl font-bold" style={{ color: '#ffffff' }}>{innings?.extras || 0}</p>
            </div>
          </div>

          {/* Batsmen */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg p-3" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>STRIKER *</p>
              <select value={strikerId} onChange={(e) => { setStrikerId(e.target.value); setTimeout(handleSetPlayers, 50); }}
                className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
                style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                <option value="">Select striker</option>
                {battingPlayers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {striker && (
                <p className="text-xs" style={{ color: '#8aacbf' }}>
                  {striker.runs}({striker.balls}) • 4s:{striker.fours} 6s:{striker.sixes}
                </p>
              )}
            </div>

            <button onClick={handleSwap} title="Change strike"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-180"
              style={{ background: '#c9a227', border: '2px solid #0a1628', boxShadow: '0 2px 10px rgba(201,162,39,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>

            <div className="rounded-lg p-3" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>NON-STRIKER</p>
              <select value={nonStrikerId} onChange={(e) => { setNonStrikerId(e.target.value); setTimeout(handleSetPlayers, 50); }}
                className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
                style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                <option value="">Select non-striker</option>
                {battingPlayers.filter(p => p._id !== strikerId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {nonStriker && (
                <p className="text-xs" style={{ color: '#8aacbf' }}>
                  {nonStriker.runs}({nonStriker.balls}) • 4s:{nonStriker.fours} 6s:{nonStriker.sixes}
                </p>
              )}
            </div>
          </div>

          {/* Bowler */}
          <div className="rounded-lg p-3 mb-4" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>CURRENT BOWLER</p>
            <select value={bowlerId} onChange={(e) => { setBowlerId(e.target.value); setTimeout(handleSetPlayers, 50); }}
              className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm font-semibold mb-2"
              style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
              <option value="">Select bowler</option>
              {bowlingPlayers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {currentBowler?.player && (
              <p className="text-xs" style={{ color: '#8aacbf' }}>
                {currentBowler.overs}.{currentBowler.balls} ov — {currentBowler.runs}r / {currentBowler.wickets}w
              </p>
            )}
          </div>

          {/* This over timeline */}
          {currentOverBalls.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>THIS OVER</p>
              <div className="flex gap-2 flex-wrap">
                {currentOverBalls.map((ball, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={ballStyle(ball)}>
                    {ballLabel(ball)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Scoring Buttons ── */}
        <div className="rounded-xl p-4 sm:p-5 space-y-4"
          style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Runs 0–6 */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>RUNS</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[0, 1, 2, 3].map((r) => (
                <button key={r} onClick={() => submitBall({ runs: r })}
                  className="h-14 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {r}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => submitBall({ runs: 4 })}
                className="h-14 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(161,189,203,0.2)', color: '#8aacbf', border: '1px solid rgba(161,189,203,0.3)' }}>
                4
              </button>
              <button onClick={() => submitBall({ runs: 5 })}
                className="h-14 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
                5
              </button>
              <button onClick={() => submitBall({ runs: 6 })}
                className="h-14 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(243,197,112,0.2)', color: '#F3C570', border: '1px solid rgba(243,197,112,0.3)' }}>
                6
              </button>
            </div>
          </div>

          {/* Extras */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>EXTRAS</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => openExtrasModal('wd')}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,165,0,0.15)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.3)' }}>
                Wide (Wd)
              </button>
              <button onClick={() => openExtrasModal('nb')}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,165,0,0.15)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.3)' }}>
                No Ball (NB)
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button onClick={() => openExtrasModal('nb-ff')}
                className="h-11 rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,165,0,0.1)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.2)' }}>
                Front Foot NB
              </button>
              <button onClick={() => openExtrasModal('nb-2b')}
                className="h-11 rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,165,0,0.1)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.2)' }}>
                2 Bounce NB
              </button>
              <button onClick={() => openExtrasModal('nb-wh')}
                className="h-11 rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,165,0,0.1)', color: '#ffa500', border: '1px solid rgba(255,165,0,0.2)' }}>
                Waist High NB
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => submitBall({ runs: 1, extras: 'b' })}
                className="h-11 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
                Bye
              </button>
              <button onClick={() => submitBall({ runs: 1, extras: 'lb' })}
                className="h-11 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
                Leg Bye
              </button>
            </div>
          </div>

          {/* Overthrow */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>OVERTHROW</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((ot) => (
                <button key={ot} onClick={() => submitBall({ runs: 0, extras: `ot${ot}`, extraRuns: ot })}
                  className="h-12 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(243,197,112,0.1)', color: '#F3C570', border: '1px solid rgba(243,197,112,0.2)' }}>
                  +{ot}
                </button>
              ))}
            </div>
          </div>

          {/* Wicket */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>WICKET</p>
            <button onClick={() => openWicket(0, '')}
              className="w-full h-14 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' }}>
              WICKET
            </button>
          </div>

          {/* Admin Controls */}
          <div style={{ borderTop: '1px solid #1a2a4a', paddingTop: '14px' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#8aacbf' }}>ADMIN CONTROLS</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleUndo}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#8aacbf', border: '1px solid rgba(255,255,255,0.1)' }}>
                ↩ Undo Last Ball
              </button>
              <button onClick={handleSwap}
                className="h-12 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#8aacbf', border: '1px solid rgba(255,255,255,0.1)' }}>
                ⇄ Change Strike
              </button>
            </div>
          </div>
        </div>

        {/* ── Wicket Modal ── */}
        {wicketModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#112240', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '24px', maxWidth: '360px', width: '100%', margin: '0 16px' }}>
              <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Select Dismissal Type</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['bowled', 'caught', 'run out', 'lbw', 'stumped', 'hit wicket', 'retired out'].map((type) => (
                  <button key={type} onClick={() => setWicketType(type)}
                    className="py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all"
                    style={wicketType === type
                      ? { background: '#EF4444', color: '#fff', border: '1px solid #EF4444' }
                      : { background: '#0a1628', color: '#8aacbf', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setWicketModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={confirmWicket}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Confirm Wicket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Extras Modal ── */}
        {extrasModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#112240', border: '1px solid rgba(255,165,0,0.4)', borderRadius: '12px', padding: '24px', maxWidth: '340px', width: '100%', margin: '0 16px' }}>
              <p style={{ color: '#ffa500', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                {extrasType === 'wd' ? 'Wide' : extrasType === 'nb' ? 'No Ball' : extrasType === 'nb-ff' ? 'Front Foot No Ball' : extrasType === 'nb-2b' ? '2 Bounce No Ball' : 'Waist High Full Toss NB'}
              </p>
              <p style={{ color: '#4a6a82', fontSize: '12px', marginBottom: '16px' }}>
                +1 penalty added automatically. Select additional runs if any:
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                  <button key={r} onClick={() => setExtrasRuns(r)}
                    className="py-2 rounded-lg font-bold text-sm transition-all"
                    style={extrasRuns === r
                      ? { background: '#ffa500', color: '#0a1628', border: '1px solid #ffa500' }
                      : { background: '#0a1628', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setExtrasModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={confirmExtras}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#ffa500', color: '#0a1628', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
