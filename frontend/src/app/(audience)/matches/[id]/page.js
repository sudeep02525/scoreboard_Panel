'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const currentRunRate = usedBalls > 0 ? ((innings?.runs || 0) / usedBalls * 6).toFixed(1) : '0.0';
  
  let requiredRunRate = '0.0';
  let target = 0;
  let runsNeeded = 0;
  
  if (currentInnings === 2 && match.innings1) {
    target = match.innings1.runs + 1;
    runsNeeded = target - (innings?.runs || 0);
    if (ballsRemaining > 0) {
      requiredRunRate = (runsNeeded / ballsRemaining * 6).toFixed(1);
    }
  }

  return (
    <UserLayout>
      <AnimatePresence>
        {refreshing && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600 z-50 origin-left shadow-lg shadow-yellow-500/50"
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14]">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-5" style={{ maxWidth: '100%' }}>
          
          {/* Match Header - PREMIUM */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl p-6 overflow-hidden group hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
          >
            {/* Animated Background Glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-radial from-yellow-500/15 via-yellow-500/5 to-transparent rounded-full blur-3xl"
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-5 flex-wrap">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-linear-to-br from-yellow-500/30 via-yellow-600/20 to-yellow-700/10 border-2 border-yellow-500/40 flex items-center justify-center text-4xl backdrop-blur-md shadow-lg shadow-yellow-500/20"
                >
                  🏏
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-xs text-gray-500 tracking-[0.25em] mb-2 uppercase font-inter font-medium"
                  >
                    {match.group} · {match.ground} · T{TOTAL_OVERS} FORMAT
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-3xl md:text-5xl font-black text-white uppercase font-bebas tracking-wider leading-tight"
                  >
                    <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">{match.teamA?.name}</span>
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-yellow-500 text-2xl md:text-3xl mx-3 md:mx-5 font-bebas font-black"
                    >
                      VS
                    </motion.span>
                    <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">{match.teamB?.name}</span>
                  </motion.div>
                </div>
                {isLive && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    className="flex items-center gap-3 bg-linear-to-r from-red-950/60 to-red-900/40 border-2 border-red-500/60 rounded-full px-5 py-2.5 backdrop-blur-md shadow-lg shadow-red-500/30"
                  >
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.4, 1],
                        boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-red-500"
                    />
                    <span className="text-red-500 text-sm font-black tracking-widest font-bebas">LIVE</span>
                  </motion.div>
                )}
              </div>
              {match.tossWinner && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-[#0a0e1a]/70 border border-yellow-500/30 rounded-xl px-5 py-3 text-sm text-gray-400 backdrop-blur-md font-inter shadow-lg"
                >
                  <span className="text-yellow-500 font-bold">{match.tossWinner.name}</span> won the toss and elected to <span className="text-yellow-500 font-bold">{match.tossDecision} first</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Score Card - PREMIUM */}
          {(innings || isLive) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-8 pt-6 pb-5 gap-4">
                {/* Batting Team */}
                <div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-gray-500 tracking-[0.2em] mb-2 uppercase font-inter font-medium"
                  >
                    BATTING
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl font-black text-yellow-500 uppercase truncate font-bebas tracking-wider"
                  >
                    {battingTeam?.name}
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="text-6xl md:text-7xl font-black text-white leading-none mt-3 font-bebas"
                  >
                    <motion.span
                      key={innings?.runs}
                      initial={{ scale: 1.3, color: "#FFD700" }}
                      animate={{ scale: 1, color: "#FFFFFF" }}
                      transition={{ duration: 0.3 }}
                    >
                      {innings?.runs || 0}
                    </motion.span>
                    <span className="text-4xl md:text-5xl text-red-500 font-black">/{innings?.wickets || 0}</span>
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-2 font-inter">
                    {innings?.overs || 0}.{innings?.balls || 0} / {TOTAL_OVERS} overs
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-yellow-500/20"
                  >
                    <span className="text-base font-black text-yellow-500 font-bebas tracking-wider">VS</span>
                  </motion.div>
                  <div className="text-xs text-gray-600 font-inter font-bold tracking-wider">INN {currentInnings}</div>
                </div>

                {/* Bowling Team */}
                <div className="text-right">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-gray-500 tracking-[0.2em] mb-2 uppercase font-inter font-bold"
                  >
                    BOWLING
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl font-black text-gray-600 uppercase truncate font-bebas tracking-wider"
                  >
                    {bowlingTeam?.name}
                  </motion.div>
                  <div className="text-6xl md:text-7xl font-black text-gray-800 leading-none mt-3 font-bebas">—</div>
                  <div className="text-xs text-gray-600 mt-2 font-inter">Yet to bat</div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-4 border-t border-yellow-500/10 bg-black/20">
                <StatBox label="CRR" value={currentRunRate} sub="runs/over" />
                <StatBox label="Balls" value={ballsRemaining} sub="remaining" />
                <StatBox label="Extras" value={innings?.extras || 0} sub="wd/nb" />
                <StatBox label="Target" value={currentInnings === 2 ? target : '—'} sub="inn 2" last />
              </div>
            </motion.div>
          )}

          {/* Match Situation - PREMIUM */}
          {(innings || isLive) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl px-6 py-5 overflow-hidden hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-500/5 to-transparent"
              />
              <div className="relative z-10">
                <div className="text-xs text-gray-500 tracking-[0.25em] mb-4 uppercase font-inter font-medium">MATCH SITUATION</div>
                <div className="grid grid-cols-3 gap-4">
                  <SitItem value={innings?.runs || 0} label="Runs Scored" color="#FFD700" />
                  <SitItem value={innings?.wickets || 0} label="Wickets Lost" color="#EF4444" border />
                  <SitItem value={10 - (innings?.wickets || 0)} label="Wickets Remain" color="#10B981" border />
                </div>
              </div>
            </motion.div>
          )}

          {/* Two Column Grid - Batsmen & Bowler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Batsmen Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl px-5 py-5 hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              <div className="text-xs text-gray-500 tracking-[0.25em] mb-4 uppercase font-inter font-medium">AT THE CREASE</div>
              {striker ? (
                <BatsmanCard name={striker.player?.name || 'STRIKER'} runs={striker.runs} balls={striker.balls} fours={striker.fours} sixes={striker.sixes} isStriker />
              ) : (
                <div className="text-center py-8 text-gray-600 text-sm font-inter">Waiting for batsmen...</div>
              )}
              {nonStriker && (
                <BatsmanCard name={nonStriker.player?.name || 'NON-STRIKER'} runs={nonStriker.runs} balls={nonStriker.balls} fours={nonStriker.fours} sixes={nonStriker.sixes} />
              )}
            </motion.div>

            {/* Bowler & This Over Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl px-5 py-5 hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              <div className="text-xs text-gray-500 tracking-[0.25em] mb-4 uppercase font-inter font-medium">BOWLING ATTACK</div>
              {currentBowler?.player ? (
                <BowlerCard name={currentBowler.player?.name || 'CURRENT BOWLER'} overs={currentBowler.overs} balls={currentBowler.balls} runs={currentBowler.runs} wickets={currentBowler.wickets} />
              ) : (
                <div className="text-center py-8 text-gray-600 text-sm font-inter">Waiting for bowler...</div>
              )}
              
              <div className="text-xs text-gray-500 tracking-[0.25em] mb-3 mt-5 uppercase font-inter font-medium">THIS OVER</div>
              <div className="flex gap-2 flex-wrap">
                {[...Array(6)].map((_, i) => {
                  const ball = recentBalls[i];
                  return <BallBadge key={i} ball={ball} index={i} />;
                })}
              </div>
              
              <div className="flex gap-3 flex-wrap mt-4 pt-4 border-t border-yellow-500/10">
                <Legend label="Four" type="fo" value="4" />
                <Legend label="Six" type="si" value="6" />
                <Legend label="Wicket" type="wi" value="W" />
                <Legend label="Dot" type="em" value="·" />
              </div>
            </motion.div>
          </div>

          {/* Innings Scorecards */}
          {match.innings1 && <InningsScorecard innings={match.innings1} teamName={match.teamA?.name} label={`${match.teamA?.name} Batting`} bowlingTeam={match.teamB?.name} />}
          {match.innings2 && <InningsScorecard innings={match.innings2} teamName={match.teamB?.name} label={`${match.teamB?.name} Batting`} bowlingTeam={match.teamA?.name} />}

        </div>
      </div>
    </UserLayout>
  );
}

// StatBox Component
function StatBox({ label, value, sub, last }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`px-4 py-4 ${!last ? 'border-r border-yellow-500/10' : ''}`}
    >
      <div className="text-xs text-gray-600 tracking-wider mb-2 uppercase truncate font-inter">{label}</div>
      <motion.div 
        key={value}
        initial={{ scale: 1.2, color: "#FFD700" }}
        animate={{ scale: 1, color: "#FFFFFF" }}
        transition={{ duration: 0.3 }}
        className="text-2xl md:text-3xl font-black truncate font-bebas"
      >
        {value}
      </motion.div>
      <div className="text-xs text-gray-600 mt-1 truncate font-inter">{sub}</div>
    </motion.div>
  );
}

// SitItem Component
function SitItem({ value, label, color, border }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      whileHover={{ scale: 1.05 }}
      className={`text-center py-2 ${border ? 'border-l border-yellow-500/20' : ''}`}
    >
      <motion.div 
        key={value}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-4xl md:text-5xl font-black font-bebas"
        style={{ color }}
      >
        {value}
      </motion.div>
      <div className="text-xs text-gray-500 tracking-wider mt-2 uppercase truncate px-2 font-inter">{label}</div>
    </motion.div>
  );
}

// BatsmanCard Component
function BatsmanCard({ name, runs, balls, fours, sixes, isStriker }) {
  const sr = balls > 0 ? ((runs / balls) * 100).toFixed(0) : '—';
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-r from-[#0f1419] to-[#1a1f2e] border border-yellow-500/20 rounded-xl px-4 py-3 mb-3 last:mb-0 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-bold text-white flex items-center gap-2 uppercase font-inter">
          {isStriker && (
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"
            />
          )}
          <span className="truncate">{name}</span>
        </div>
        <motion.div 
          key={runs}
          initial={{ scale: 1.3, color: "#FFD700" }}
          animate={{ scale: 1, color: "#FFD700" }}
          transition={{ duration: 0.3 }}
          className="text-xl font-black font-bebas"
        >
          {runs} <span className="text-sm text-gray-500 font-normal">({balls})</span>
        </motion.div>
      </div>
      <div className="flex gap-4 text-xs font-inter">
        <div className="text-gray-500">4s <span className="text-green-500 font-bold">{fours}</span></div>
        <div className="text-gray-500">6s <span className="text-yellow-500 font-bold">{sixes}</span></div>
        <div className="text-gray-500">SR <span className="text-blue-400 font-bold">{sr}</span></div>
      </div>
    </motion.div>
  );
}

// BowlerCard Component
function BowlerCard({ name, overs, balls, runs, wickets }) {
  const eco = overs > 0 ? (runs / overs).toFixed(1) : '0.0';
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-r from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-xl px-4 py-3 mb-4 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-bold text-white uppercase font-inter truncate">{name}</div>
        <motion.div 
          key={wickets}
          initial={{ scale: 1.3, color: "#EF4444" }}
          animate={{ scale: 1, color: "#EF4444" }}
          transition={{ duration: 0.3 }}
          className="text-lg font-black font-bebas"
        >
          {wickets}/{runs}
        </motion.div>
      </div>
      <div className="flex gap-4 text-xs font-inter">
        <div className="text-gray-500">Ov <span className="text-white font-bold">{overs}.{balls}</span></div>
        <div className="text-gray-500">Eco <span className="text-red-400 font-bold">{eco}</span></div>
        <div className="text-gray-500">Wd <span className="text-gray-400 font-bold">0</span></div>
      </div>
    </motion.div>
  );
}

// BallBadge Component
function BallBadge({ ball, index }) {
  if (!ball) {
    return (
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        className="w-12 h-12 rounded-xl bg-[#0f1419] border border-yellow-500/10 flex items-center justify-center text-lg font-bold text-gray-700 font-bebas"
      >
        ·
      </motion.div>
    );
  }

  let bgClass = 'bg-[#0f1419] border-yellow-500/20 text-gray-500';
  let label = ball.runs;

  if (ball.isWicket) {
    bgClass = 'bg-linear-to-br from-red-950/50 to-red-900/30 border-red-500/50 text-red-500 shadow-lg shadow-red-500/20';
    label = 'W';
  } else if (ball.runs === 6) {
    bgClass = 'bg-linear-to-br from-yellow-950/50 to-yellow-900/30 border-yellow-500/50 text-yellow-500 shadow-lg shadow-yellow-500/20';
  } else if (ball.runs === 4) {
    bgClass = 'bg-linear-to-br from-green-950/50 to-green-900/30 border-green-500/50 text-green-500 shadow-lg shadow-green-500/20';
  } else if (ball.extras === 'wd' || ball.extras === 'nb') {
    label = ball.extras === 'wd' ? 'WD' : 'NB';
  }

  return (
    <motion.div 
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.2, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black cursor-pointer font-bebas ${bgClass}`}
    >
      {label}
    </motion.div>
  );
}

// Legend Component
function Legend({ label, type, value }) {
  const styles = {
    fo: 'bg-linear-to-br from-green-950/50 to-green-900/30 border-green-500/50 text-green-500',
    si: 'bg-linear-to-br from-yellow-950/50 to-yellow-900/30 border-yellow-500/50 text-yellow-500',
    wi: 'bg-linear-to-br from-red-950/50 to-red-900/30 border-red-500/50 text-red-500',
    em: 'bg-[#0f1419] border-yellow-500/20 text-gray-600'
  };
  
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 font-inter">
      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold font-bebas ${styles[type]}`}>
        {value}
      </div>
      {label}
    </div>
  );
}

// InningsScorecard Component
function InningsScorecard({ innings, teamName, label, bowlingTeam }) {
  if (!innings) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl px-6 py-5 hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
    >
      <div className="text-xs text-gray-500 tracking-[0.25em] mb-4 uppercase font-inter font-medium">SCORECARD — {label}</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-yellow-500/10">
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-left font-medium uppercase font-inter">BATSMAN</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">R</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">B</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">4S</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">6S</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.batting && innings.batting.length > 0 ? (
              innings.batting.map((b, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-yellow-500/5 last:border-0 hover:bg-yellow-500/5 transition-colors"
                >
                  <td className="px-3 py-3 text-left font-medium text-sm text-white uppercase font-inter">
                    {b.player?.name || 'PLAYER'}
                    <span className="text-xs px-2 py-1 rounded ml-2 font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 font-bebas">BAT</span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-yellow-500 font-black font-bebas">{b.runs}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-500 font-bebas">{b.balls}</td>
                  <td className="px-3 py-3 text-right text-sm text-green-500 font-bold font-bebas">{b.fours}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-500 font-bebas">{b.sixes}</td>
                  <td className="px-3 py-3 text-right text-sm text-yellow-500 font-black font-bebas">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '—'}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-xs text-gray-600 tracking-wider uppercase font-inter">NO BATTING DATA YET</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="h-px bg-yellow-500/20 my-5" />

      <div className="text-xs text-gray-500 tracking-[0.25em] mb-4 uppercase font-inter font-medium">{bowlingTeam} BOWLING</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-yellow-500/10">
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-left font-medium uppercase font-inter">BOWLER</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">O</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">M</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">R</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">W</th>
              <th className="text-xs text-gray-600 tracking-wider px-3 py-3 text-right font-medium uppercase font-inter">ECO</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowling && innings.bowling.length > 0 ? (
              innings.bowling.map((b, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-yellow-500/5 last:border-0 hover:bg-yellow-500/5 transition-colors"
                >
                  <td className="px-3 py-3 text-left font-medium text-sm text-white uppercase font-inter">
                    {b.player?.name || 'PLAYER'}
                    <span className="text-xs px-2 py-1 rounded ml-2 font-semibold bg-red-500/10 text-red-500 border border-red-500/30 font-bebas">BOWL</span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-500 font-bebas">{b.overs}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-500 font-bebas">0</td>
                  <td className="px-3 py-3 text-right text-sm text-red-500 font-bebas">{b.runs}</td>
                  <td className="px-3 py-3 text-right text-sm text-red-500 font-black font-bebas">{b.wickets}</td>
                  <td className="px-3 py-3 text-right text-sm text-red-500 font-bebas">{b.overs > 0 ? (b.runs / b.overs).toFixed(1) : '0.0'}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-xs text-gray-600 tracking-wider uppercase font-inter">NO BOWLING DATA YET</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// LoadingSkeleton Component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14] px-6 py-6">
      <div className="w-full mx-auto space-y-5">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-40 bg-linear-to-br from-[#1a1f2e] to-[#0f1419] rounded-2xl border border-yellow-500/10"
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-64 bg-linear-to-br from-[#1a1f2e] to-[#0f1419] rounded-2xl border border-yellow-500/10"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="h-56 bg-linear-to-br from-[#1a1f2e] to-[#0f1419] rounded-2xl border border-yellow-500/10"
          />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="h-56 bg-linear-to-br from-[#1a1f2e] to-[#0f1419] rounded-2xl border border-yellow-500/10"
          />
        </div>
      </div>
    </div>
  );
}
