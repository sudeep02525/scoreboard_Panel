'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import UserLayout from '@/components/UserLayout';
import { api } from '@/lib/api';

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      setRefreshing(true);
      const d = await api.get(`/matches/${id}`);
      if (d._id) setMatch(d);
      setTimeout(() => setRefreshing(false), 500);
    };
    fetchMatch();
    const interval = setInterval(fetchMatch, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!match) return <UserLayout><LoadingSkeleton /></UserLayout>;

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const currentInnings = match.currentInnings || 1;
  const innings = currentInnings === 1 ? match.innings1 : match.innings2;
  const battingTeam = currentInnings === 1 ? match.teamA : match.teamB;
  const bowlingTeam = currentInnings === 1 ? match.teamB : match.teamA;
  
  const striker = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker = innings?.currentBatsmen?.find(b => !b.isStriker);
  const currentBowler = innings?.currentBowler;
  
  const recentBalls = innings?.ballByBall?.slice(-6) || [];
  const allBalls = innings?.ballByBall || [];
  
  const TOTAL_OVERS = match.overs || 5;
  const totalBalls = TOTAL_OVERS * 6;
  const usedBalls = (innings?.overs || 0) * 6 + (innings?.balls || 0);
  const ballsRemaining = Math.max(0, totalBalls - usedBalls);
  
  const currentRunRate = usedBalls > 0 ? ((innings?.runs || 0) / usedBalls * 6).toFixed(2) : '0.00';
  
  let requiredRunRate = '0.00';
  let target = 0;
  let runsNeeded = 0;
  
  if (currentInnings === 2 && match.innings1) {
    target = match.innings1.runs + 1;
    runsNeeded = target - (innings?.runs || 0);
    if (ballsRemaining > 0) {
      requiredRunRate = (runsNeeded / ballsRemaining * 6).toFixed(2);
    }
  }

  return (
    <UserLayout>
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent z-50">
          <div className="h-full bg-yellow-500 animate-pulse" />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4">
          
          {/* Match Header - Compact & Modern */}
          <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{match.group}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{match.ground}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-white">
                    {match.teamA?.name} <span className="text-yellow-500 mx-1">vs</span> {match.teamB?.name}
                  </h1>
                </div>
              </div>
              
              {isLive && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-black text-red-400 uppercase tracking-wider">Live</span>
                </div>
              )}
              
              {isCompleted && (
                <div className="px-4 py-2 rounded-full bg-green-500/20 border-2 border-green-500/50">
                  <span className="text-sm font-black text-green-400 uppercase tracking-wider">Finished</span>
                </div>
              )}
            </div>
            
            {match.tossWinner && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-yellow-500">{match.tossWinner.name}</span> won the toss and chose to <span className="font-semibold text-yellow-500">{match.tossDecision}</span>
                </p>
              </div>
            )}
          </div>

          {/* Main Scoreboard - Hero Section */}
          {(innings || isLive) && (
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Batting</p>
                    <h2 className="text-2xl font-black text-yellow-500">{battingTeam?.name}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bowling</p>
                    <h2 className="text-2xl font-black text-slate-300">{bowlingTeam?.name}</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-6xl md:text-7xl font-black text-white tracking-tight">{innings?.runs || 0}</span>
                    <span className="text-4xl md:text-5xl font-black text-red-500">/{innings?.wickets || 0}</span>
                  </div>
                  <p className="text-lg text-slate-400 mt-2 font-medium">
                    ({innings?.overs || 0}.{innings?.balls || 0} / {TOTAL_OVERS} overs)
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="CRR" value={currentRunRate} icon="📊" />
                  {currentInnings === 2 ? (
                    <>
                      <StatCard label="RRR" value={requiredRunRate} icon="🎯" highlight />
                      <StatCard label="Target" value={target} icon="🏁" />
                      <StatCard label="Need" value={runsNeeded > 0 ? runsNeeded : 0} icon="⚡" />
                    </>
                  ) : (
                    <>
                      <StatCard label="Balls Left" value={ballsRemaining} icon="⏱️" />
                      <StatCard label="Extras" value={innings?.extras || 0} icon="➕" />
                      <StatCard label="Innings" value={`${currentInnings}/2`} icon="🏏" />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chase Tracker */}
          {currentInnings === 2 && match.innings1 && !isCompleted && innings && (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 shadow-2xl">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">Target</p>
                  <p className="text-4xl font-black text-white">{target}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">Runs Needed</p>
                  <p className="text-4xl font-black text-orange-400">{runsNeeded > 0 ? runsNeeded : 0}</p>
                  <p className="text-xs text-slate-400 mt-1">in {ballsRemaining} balls</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">Req RR</p>
                  <p className="text-4xl font-black text-red-400">{requiredRunRate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Banner */}
          {isCompleted && match.result && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border-2 border-green-500/50 p-8 text-center shadow-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/30 border border-green-500/50 mb-4">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-black text-green-400 uppercase">Match Finished</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{match.result.winner?.name || 'Match Tied'}</h3>
              <p className="text-xl text-green-400 font-semibold">{match.result.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Players */}
            {(innings || isLive) && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-yellow-500/20 flex items-center justify-center">🏏</span>
                  Batsmen
                </h3>
                <div className="space-y-3">
                  {striker ? (
                    <PlayerCard name={striker.player?.name || 'Striker'} runs={striker.runs} balls={striker.balls} fours={striker.fours} sixes={striker.sixes} isStriker />
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-sm">Waiting for batsmen...</div>
                  )}
                  {nonStriker && (
                    <PlayerCard name={nonStriker.player?.name || 'Non-Striker'} runs={nonStriker.runs} balls={nonStriker.balls} fours={nonStriker.fours} sixes={nonStriker.sixes} />
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-700/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">⚾</span>
                    Bowler
                  </h3>
                  {currentBowler?.player ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                      <span className="font-bold text-white">{currentBowler.player?.name || 'Bowler'}</span>
                      <span className="text-sm font-mono text-slate-400">{currentBowler.overs}.{currentBowler.balls} - {currentBowler.runs}/{currentBowler.wickets}</span>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">Waiting for bowler...</div>
                  )}
                </div>
              </div>
            )}

            {/* This Over */}
            {(innings || isLive) && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">📍</span>
                  This Over
                </h3>
                {recentBalls.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recentBalls.map((ball, i) => (
                      <BallBadge key={i} ball={ball} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">No balls bowled yet</div>
                )}

                {ballsRemaining > 0 && isLive && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Balls Remaining</span>
                    <span className="text-2xl font-black text-yellow-500">{ballsRemaining}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ball by Ball Commentary */}
          {allBalls.length > 0 && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 shadow-xl">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">💬</span>
                Ball by Ball
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {[...allBalls].reverse().map((ball, i) => (
                  <CommentaryRow key={i} ball={ball} />
                ))}
              </div>
            </div>
          )}

          {/* Innings Scorecards */}
          {match.innings1 && <InningsCard innings={match.innings1} teamName={match.teamA?.name} label="1st Innings" />}
          {match.innings2 && <InningsCard innings={match.innings2} teamName={match.teamB?.name} label="2nd Innings" />}

          {/* Empty State */}
          {!innings && match.status === 'scheduled' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center shadow-xl">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Match Not Started</h3>
              <p className="text-slate-400">The match will begin soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15,23,42,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234,179,8,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,179,8,0.7); }
      `}</style>
    </UserLayout>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' : 'bg-slate-800/50 border border-slate-700/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-2xl md:text-3xl font-black ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function PlayerCard({ name, runs, balls, fours, sixes, isStriker }) {
  const sr = balls > 0 ? ((runs / balls) * 100).toFixed(0) : 0;
  return (
    <div className={`p-4 rounded-xl ${isStriker ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30' : 'bg-slate-800/30 border border-slate-700/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{name}</span>
          {isStriker && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
        </div>
        <span className="text-xl font-black text-white">{runs}<span className="text-slate-500 text-sm">({balls})</span></span>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>4s: <span className="font-bold text-blue-400">{fours}</span></span>
        <span>6s: <span className="font-bold text-yellow-400">{sixes}</span></span>
        <span>SR: <span className="font-bold text-slate-300">{sr}</span></span>
      </div>
    </div>
  );
}

function BallBadge({ ball }) {
  let bgColor = 'bg-slate-700/50 border-slate-600';
  let textColor = 'text-white';
  let label = ball.runs;

  if (ball.isWicket) {
    bgColor = 'bg-red-500/20 border-red-500';
    textColor = 'text-red-400';
    label = 'W';
  } else if (ball.runs === 6) {
    bgColor = 'bg-yellow-500/20 border-yellow-500';
    textColor = 'text-yellow-400';
  } else if (ball.runs === 4) {
    bgColor = 'bg-blue-500/20 border-blue-500';
    textColor = 'text-blue-400';
  } else if (ball.extras === 'wd') {
    bgColor = 'bg-orange-500/20 border-orange-500';
    textColor = 'text-orange-400';
    label = 'WD';
  } else if (ball.extras === 'nb') {
    bgColor = 'bg-orange-500/20 border-orange-500';
    textColor = 'text-orange-400';
    label = 'NB';
  } else if (ball.extras === 'b') {
    label = 'B';
  } else if (ball.extras === 'lb') {
    label = 'LB';
  }

  return (
    <div className={`w-12 h-12 rounded-xl ${bgColor} border-2 flex items-center justify-center font-black text-lg ${textColor} transition-all hover:scale-110 hover:shadow-lg`}>
      {label}
    </div>
  );
}

function CommentaryRow({ ball }) {
  const overBall = `${ball.over}.${ball.ball}`;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:bg-slate-800/50 transition-all">
      <span className="text-xs font-mono font-bold text-yellow-500 bg-slate-900 px-2 py-1 rounded-lg">{overBall}</span>
      <p className="flex-1 text-sm text-slate-300">{ball.commentary || `${ball.runs} run${ball.runs !== 1 ? 's' : ''}`}</p>
      <BallBadge ball={ball} />
    </div>
  );
}

function InningsCard({ innings, teamName, label }) {
  if (!innings) return null;
  
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-yellow-500">{label}</h3>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{teamName}</p>
          <p className="text-lg text-slate-400">{innings.runs}/{innings.wickets} <span className="text-sm">({innings.overs}.{innings.balls} ov)</span></p>
        </div>
      </div>
      
      {innings.batting?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Batting</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-slate-700">
                <tr className="text-slate-400">
                  <th className="text-left py-3 font-bold">Batter</th>
                  <th className="text-center py-3 font-bold">R</th>
                  <th className="text-center py-3 font-bold">B</th>
                  <th className="text-center py-3 font-bold">4s</th>
                  <th className="text-center py-3 font-bold">6s</th>
                  <th className="text-center py-3 font-bold">SR</th>
                </tr>
              </thead>
              <tbody>
                {innings.batting.map((b, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 text-white font-semibold">{b.player?.name || 'Player'}</td>
                    <td className="text-center py-3 text-yellow-400 font-bold">{b.runs}</td>
                    <td className="text-center py-3 text-slate-400">{b.balls}</td>
                    <td className="text-center py-3 text-blue-400">{b.fours}</td>
                    <td className="text-center py-3 text-yellow-400">{b.sixes}</td>
                    <td className="text-center py-3 text-slate-300 font-semibold">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {innings.bowling?.length > 0 && (
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Bowling</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-slate-700">
                <tr className="text-slate-400">
                  <th className="text-left py-3 font-bold">Bowler</th>
                  <th className="text-center py-3 font-bold">O</th>
                  <th className="text-center py-3 font-bold">R</th>
                  <th className="text-center py-3 font-bold">W</th>
                  <th className="text-center py-3 font-bold">Eco</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowling.map((b, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 text-white font-semibold">{b.player?.name || 'Player'}</td>
                    <td className="text-center py-3 text-slate-400">{b.overs}</td>
                    <td className="text-center py-3 text-slate-400">{b.runs}</td>
                    <td className="text-center py-3 text-red-400 font-bold">{b.wickets}</td>
                    <td className="text-center py-3 text-slate-300 font-semibold">{b.overs > 0 ? (b.runs / b.overs).toFixed(1) : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
