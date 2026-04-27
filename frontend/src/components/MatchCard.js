import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MatchCard({ match }) {
  const isLive = match.status === 'live';
  const isDone = match.status === 'completed';
  const isUpcoming = match.status === 'scheduled';
  
  // Get current innings data for live matches
  const currentInnings = match.currentInnings || 1;
  const innings = currentInnings === 1 ? match.innings1 : match.innings2;
  const striker = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker = innings?.currentBatsmen?.find(b => !b.isStriker);
  const currentBowler = innings?.currentBowler;

  return (
    <Link href={`/matches/${match._id}`} className="block group h-full">
      <motion.div 
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl p-5 cursor-pointer hover:border-yellow-500/40 transition-all duration-300 h-full flex flex-col hover:shadow-xl hover:shadow-yellow-500/10 overflow-hidden"
      >
        {/* Animated Background Glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-inter">
            <span>{match.group}</span>
            <span className="text-gray-700">•</span>
            <span className="truncate">{match.ground}</span>
          </div>
          
          {isLive && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-linear-to-r from-red-950/60 to-red-900/40 border border-red-500/60 rounded-full px-3 py-1 shrink-0 backdrop-blur-sm"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider font-bebas">LIVE</span>
            </motion.div>
          )}
          
          {isDone && (
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 shrink-0 backdrop-blur-sm">
              <span className="text-xs font-bold text-green-400 uppercase font-inter">Finished</span>
            </div>
          )}
          
          {isUpcoming && (
            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 shrink-0 backdrop-blur-sm">
              <span className="text-xs font-bold text-blue-400 uppercase font-inter">Upcoming</span>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center gap-4 mb-4">
          {/* Team A */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white uppercase tracking-wider mb-2 truncate font-bebas">
              {match.teamA?.name}
            </div>
            {match.innings1 ? (
              <div>
                <div className="text-4xl font-black text-yellow-500 leading-none font-bebas">
                  {match.innings1.runs}<span className="text-xl font-bold text-gray-600">/{match.innings1.wickets}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-inter">
                  ({match.innings1.overs}.{match.innings1.balls} ov)
                </div>
              </div>
            ) : (
              <div className="text-2xl text-gray-700 font-bebas font-black">—</div>
            )}
          </div>

          {/* VS Badge */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-yellow-500/20"
          >
            <span className="text-sm font-black text-yellow-500 font-bebas tracking-wider">VS</span>
          </motion.div>

          {/* Team B */}
          <div className="flex-1 text-right min-w-0">
            <div className="text-base font-black text-white uppercase tracking-wider mb-2 truncate font-bebas">
              {match.teamB?.name}
            </div>
            {match.innings2 ? (
              <div>
                <div className="text-4xl font-black text-yellow-500 leading-none font-bebas">
                  {match.innings2.runs}<span className="text-xl font-bold text-gray-600">/{match.innings2.wickets}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-inter">
                  ({match.innings2.overs}.{match.innings2.balls} ov)
                </div>
              </div>
            ) : (
              <div className="text-2xl text-gray-700 font-bebas font-black">—</div>
            )}
          </div>
        </div>

        {/* Result */}
        {match.result?.description && (
          <div className="mt-4 pt-4 border-t border-yellow-500/10">
            <p className="text-sm font-bold text-center text-yellow-500 truncate font-inter tracking-wide">
              {match.result.description}
            </p>
          </div>
        )}

        {/* Live Players Info */}
        {isLive && (striker || currentBowler) && (
          <div className="mt-auto pt-4 border-t border-yellow-500/10 space-y-2">
            {striker && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 truncate font-inter font-medium">
                  {striker.player?.name} *
                </span>
                <span className="text-yellow-500 font-black shrink-0 ml-2 font-bebas text-sm">
                  {striker.runs}({striker.balls})
                </span>
              </div>
            )}
            {nonStriker && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 truncate font-inter font-medium">
                  {nonStriker.player?.name}
                </span>
                <span className="text-gray-400 font-black shrink-0 ml-2 font-bebas text-sm">
                  {nonStriker.runs}({nonStriker.balls})
                </span>
              </div>
            )}
            {currentBowler?.player && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-yellow-500/10">
                <span className="text-gray-400 truncate font-inter font-medium">
                  {currentBowler.player.name}
                </span>
                <span className="text-red-500 font-black shrink-0 ml-2 font-bebas text-sm">
                  {currentBowler.overs}.{currentBowler.balls}-{currentBowler.runs}/{currentBowler.wickets}
                </span>
              </div>
            )}
          </div>
        )}
        </div>
      </motion.div>
    </Link>
  );
}
