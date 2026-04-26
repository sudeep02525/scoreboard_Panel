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
    const interval = setInterval(fetchMatch, 5000); // Auto refresh every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  if (!match) return (
    <UserLayout>
      <LoadingSkeleton />
    </UserLayout>
  );

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
      {/* Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse z-50" />
      )}

      <div className="px-4 md:px-6 py-6 space-y-6 max-w-6xl mx-auto">
        
        {/* Match Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400">{match.group} • {match.ground}</span>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-400">LIVE</span>
              </div>
            )}
            {isCompleted && (
              <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="text-xs font-bold text-green-400">FINISHED</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {match.teamA?.name} <span className="text-yellow-400">vs</span> {match.teamB?.name}
          </h2>
          {match.tossWinner && (
            <p className="text-sm text-gray-400">
              Toss: {match.tossWinner.name} won and chose to {match.tossDecision}
            </p>
          )}
        </div>

        {/* Main Scoreboard */}
        {innings && (
          <div className="premium-card p-6 md:p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">BATTING</p>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400">{battingTeam?.name}</h3>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-white">
                  {innings?.runs || 0}<span className="text-red-400">/{innings?.wickets || 0}</span>
                </div>
                <div className="text-base text-gray-400 mt-2">
                  ({innings?.overs || 0}.{innings?.balls || 0} / {TOTAL_OVERS} overs)
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 mb-1">BOWLING</p>
                <h3 className="text-xl md:text-2xl font-bold text-white">{bowlingTeam?.name}</h3>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
              <StatBox label="Current RR" value={currentRunRate} />
              {currentInnings === 2 && (
                <>
                  <StatBox label="Required RR" value={requiredRunRate} highlight />
                  <StatBox label="Target" value={target} />
                  <StatBox label="Runs Needed" value={runsNeeded > 0 ? runsNeeded : 0} />
                </>
              )}
              {currentInnings === 1 && (
                <>
                  <StatBox label="Balls Left" value={ballsRemaining} />
                  <StatBox label="Extras" value={innings?.extras || 0} />
                  <StatBox label="Innings" value={`${currentInnings} of 2`} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Chase Card - Only in 2nd Innings */}
        {currentInnings === 2 && match.innings1 && !isCompleted && innings && (
          <div className="premium-card p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">TARGET</p>
                <p className="text-3xl md:text-4xl font-black text-yellow-400">{target}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">NEED</p>
                <p className="text-3xl md:text-4xl font-black text-white">{runsNeeded > 0 ? runsNeeded : 0}</p>
                <p className="text-xs text-gray-500 mt-1">in {ballsRemaining} balls</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">REQ RR</p>
                <p className="text-3xl md:text-4xl font-black text-orange-400">{requiredRunRate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result Card */}
        {isCompleted && match.result && (
          <div className="premium-card p-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 text-center animate-bounce-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 mb-4">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold text-green-400">MATCH FINISHED</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              {match.result.winner?.name || 'Match Tied'}
            </h3>
            <p className="text-lg md:text-xl text-green-400 font-semibold">{match.result.description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Current Players */}
          {innings && (
            <div className="premium-card p-6 animate-slide-up">
              <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                BATSMEN
              </h4>
              <div className="space-y-3">
                {striker && (
                  <PlayerRow 
                    name={striker.player?.name || 'Striker'} 
                    runs={striker.runs} 
                    balls={striker.balls}
                    fours={striker.fours}
                    sixes={striker.sixes}
                    isStriker 
                  />
                )}
                {nonStriker && (
                  <PlayerRow 
                    name={nonStriker.player?.name || 'Non-Striker'} 
                    runs={nonStriker.runs} 
                    balls={nonStriker.balls}
                    fours={nonStriker.fours}
                    sixes={nonStriker.sixes}
                  />
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  BOWLER
                </h4>
                {currentBowler?.player && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <span className="font-semibold text-white">{currentBowler.player?.name || 'Bowler'}</span>
                    <span className="text-sm text-gray-400">
                      {currentBowler.overs}.{currentBowler.balls} - {currentBowler.runs}/{currentBowler.wickets}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Over */}
          {innings && (
            <div className="premium-card p-6 animate-slide-up">
              <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                THIS OVER
              </h4>
              {recentBalls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recentBalls.map((ball, i) => (
                    <BallBadge key={i} ball={ball} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No balls bowled yet</p>
              )}

              {ballsRemaining > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Balls Remaining</span>
                    <span className="font-bold text-yellow-400">{ballsRemaining}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ball by Ball Timeline */}
        {allBalls.length > 0 && (
          <div className="premium-card p-6 animate-slide-up">
            <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              BALL BY BALL COMMENTARY
            </h4>
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
          <div className="premium-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Match Not Started</h3>
            <p className="text-gray-400">The match will begin soon. Stay tuned!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234,179,8,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,179,8,0.7); }
      `}</style>
    </UserLayout>
  );
}

// Components
function StatBox({ label, value, highlight }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function PlayerRow({ name, runs, balls, fours, sixes, isStriker }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">{name}</span>
        {isStriker && (
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="On Strike" />
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-white font-bold">{runs}({balls})</span>
        <span className="text-gray-500">4s: {fours}</span>
        <span className="text-gray-500">6s: {sixes}</span>
      </div>
    </div>
  );
}

function BallBadge({ ball }) {
  let bgColor = 'bg-gray-700';
  let textColor = 'text-white';
  let label = ball.runs;

  if (ball.isWicket) {
    bgColor = 'bg-red-500/20 border-red-500/50';
    textColor = 'text-red-400';
    label = 'W';
  } else if (ball.runs === 6) {
    bgColor = 'bg-yellow-500/20 border-yellow-500/50';
    textColor = 'text-yellow-400';
  } else if (ball.runs === 4) {
    bgColor = 'bg-blue-500/20 border-blue-500/50';
    textColor = 'text-blue-400';
  } else if (ball.extras === 'wd') {
    bgColor = 'bg-orange-500/20 border-orange-500/50';
    textColor = 'text-orange-400';
    label = 'WD';
  } else if (ball.extras === 'nb') {
    bgColor = 'bg-orange-500/20 border-orange-500/50';
    textColor = 'text-orange-400';
    label = 'NB';
  } else if (ball.extras === 'b') {
    label = 'B';
  } else if (ball.extras === 'lb') {
    label = 'LB';
  }

  return (
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${bgColor} border flex items-center justify-center font-bold text-base md:text-lg ${textColor} transition-transform hover:scale-110`}>
      {label}
    </div>
  );
}

function CommentaryRow({ ball }) {
  const overBall = `${ball.over}.${ball.ball}`;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
      <span className="text-xs font-mono text-yellow-400 bg-gray-900 px-2 py-1 rounded">{overBall}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-300">{ball.commentary || `${ball.runs} run${ball.runs !== 1 ? 's' : ''}`}</p>
      </div>
      <div className="flex-shrink-0">
        <BallBadge ball={ball} />
      </div>
    </div>
  );
}

function InningsCard({ innings, teamName, label }) {
  if (!innings) return null;
  
  return (
    <div className="premium-card p-6 animate-slide-up">
      <h3 className="text-lg font-bold text-yellow-400 mb-4">
        {label} — {teamName}
        <span className="ml-3 text-white">{innings.runs}/{innings.wickets}</span>
        <span className="ml-2 text-sm text-gray-400">({innings.overs}.{innings.balls} ov)</span>
      </h3>
      
      {innings.batting?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-400 mb-3">BATTING</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left py-2">Batter</th>
                  <th className="text-center py-2">R</th>
                  <th className="text-center py-2">B</th>
                  <th className="text-center py-2">4s</th>
                  <th className="text-center py-2">6s</th>
                  <th className="text-center py-2">SR</th>
                </tr>
              </thead>
              <tbody>
                {innings.batting.map((b, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 text-white font-medium">{b.player?.name || 'Player'}</td>
                    <td className="text-center py-2 text-yellow-400 font-bold">{b.runs}</td>
                    <td className="text-center py-2 text-gray-400">{b.balls}</td>
                    <td className="text-center py-2 text-gray-400">{b.fours}</td>
                    <td className="text-center py-2 text-gray-400">{b.sixes}</td>
                    <td className="text-center py-2 text-gray-400">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {innings.bowling?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-400 mb-3">BOWLING</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left py-2">Bowler</th>
                  <th className="text-center py-2">O</th>
                  <th className="text-center py-2">R</th>
                  <th className="text-center py-2">W</th>
                  <th className="text-center py-2">Eco</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowling.map((b, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 text-white font-medium">{b.player?.name || 'Player'}</td>
                    <td className="text-center py-2 text-gray-400">{b.overs}</td>
                    <td className="text-center py-2 text-gray-400">{b.runs}</td>
                    <td className="text-center py-2 text-yellow-400 font-bold">{b.wickets}</td>
                    <td className="text-center py-2 text-gray-400">{b.overs > 0 ? (b.runs / b.overs).toFixed(1) : 0}</td>
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
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-6xl mx-auto">
      <div className="h-32 bg-gray-800 rounded-2xl animate-pulse" />
      <div className="h-64 bg-gray-800 rounded-2xl animate-pulse" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
