export default function StandingsTable({ teams, groupName }) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-lg font-black text-white">{groupName}</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Group {groupName}</h3>
            <p className="text-xs text-slate-400">Points Table</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/30">
              <th className="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Team</th>
              <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">P</th>
              <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">W</th>
              <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">L</th>
              <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Pts</th>
              <th className="text-center py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">NRR</th>
            </tr>
          </thead>
          <tbody>
            {teams && teams.length > 0 ? teams.map((team, i) => (
              <tr 
                key={team._id} 
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 px-6">
                  <span className="text-slate-400 font-semibold">{i + 1}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{team.name}</span>
                    {i < 2 && (
                      <span className="px-2 py-0.5 rounded-md bg-green-500/20 border border-green-500/50 text-xs font-black text-green-400">
                        Q
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-center py-4 px-3 text-slate-300 font-semibold">{team.stats.played}</td>
                <td className="text-center py-4 px-3 text-green-400 font-bold">{team.stats.won}</td>
                <td className="text-center py-4 px-3 text-red-400 font-bold">{team.stats.lost}</td>
                <td className="text-center py-4 px-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-black">
                    {team.stats.points}
                  </span>
                </td>
                <td className="text-center py-4 px-3 text-slate-400 font-mono text-xs">
                  {team.stats.nrr?.toFixed(2)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="text-4xl mb-2">🏏</div>
                  <p className="text-slate-500">No teams yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {teams && teams.length > 0 && (
        <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-green-500/20 border border-green-500/50 text-green-400 font-black">Q</span>
            <span>Top 2 teams qualify for Semi Finals</span>
          </div>
        </div>
      )}
    </div>
  );
}
