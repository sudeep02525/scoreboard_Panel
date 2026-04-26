import Link from 'next/link';

export default function MatchCard({ match }) {
  const isLive = match.status === 'live';
  const isDone = match.status === 'completed';
  const isUpcoming = match.status === 'scheduled';

  return (
    <Link href={`/matches/${match._id}`} className="block group h-full">
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {match.group}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-500 truncate">{match.ground}</span>
          </div>
          
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 flex-shrink-0 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-black text-red-400 uppercase">Live</span>
            </div>
          )}
          
          {isDone && (
            <div className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/50 flex-shrink-0 ml-2">
              <span className="text-xs font-black text-green-400 uppercase">Finished</span>
            </div>
          )}
          
          {isUpcoming && (
            <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/50 flex-shrink-0 ml-2">
              <span className="text-xs font-black text-blue-400 uppercase">Upcoming</span>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="relative flex items-center justify-between gap-3 mb-5 flex-1">
          {/* Team A */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bebas font-bold text-white mb-3 truncate uppercase tracking-wider">{match.teamA?.name}</h3>
            {match.innings1 ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-yellow-500">{match.innings1.runs}</span>
                  <span className="text-xl font-bold text-slate-400">/{match.innings1.wickets}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">({match.innings1.overs}.{match.innings1.balls} ov)</p>
              </div>
            ) : (
              <div className="text-3xl font-black text-slate-700">-</div>
            )}
          </div>

          {/* VS Badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
            <span className="text-xs font-black text-yellow-500">VS</span>
          </div>

          {/* Team B */}
          <div className="flex-1 text-right min-w-0">
            <h3 className="text-sm font-bebas font-bold text-white mb-3 truncate uppercase tracking-wider">{match.teamB?.name}</h3>
            {match.innings2 ? (
              <div>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-4xl font-black text-yellow-500">{match.innings2.runs}</span>
                  <span className="text-xl font-bold text-slate-400">/{match.innings2.wickets}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">({match.innings2.overs}.{match.innings2.balls} ov)</p>
              </div>
            ) : (
              <div className="text-3xl font-black text-slate-700">-</div>
            )}
          </div>
        </div>

        {/* Result */}
        {match.result?.description && (
          <div className="relative mt-auto pt-5 border-t border-slate-700/50">
            <p className="text-xs font-semibold text-center text-yellow-500 truncate">
              {match.result.description}
            </p>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
      </div>
    </Link>
  );
}
