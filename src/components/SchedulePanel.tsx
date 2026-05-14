import { useSchedule } from '../hooks/useSchedule';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { ScheduledGame, PitcherGameLog } from '../services/types';

function GameLogCompact({ logs }: { logs: PitcherGameLog[] }) {
  return (
    <div className="mt-1 space-y-0.5">
      {logs.map((log, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-20">{log.date.slice(5)}</span>
          <span className="w-10 text-center">{log.ip}IP</span>
          <span className="w-8 text-center">{log.strikeouts}K</span>
          <span className={`w-6 text-center font-medium ${
            log.result === 'W' ? 'text-green-600' : log.result === 'L' ? 'text-red-600' : 'text-gray-400'
          }`}>
            {log.result}
          </span>
        </div>
      ))}
    </div>
  );
}

function GameRow({ game }: { game: ScheduledGame }) {
  const homeAwayIndicator = game.isHome ? 'vs' : '@';

  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{game.date.slice(5)}</span>
            <span className="text-sm text-gray-500">
              {homeAwayIndicator} {game.opponent}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            <span>ERA {game.opponentTeamERA.toFixed(2)}</span>
            <span>OPS {game.opponentTeamOPS.toFixed(3)}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium ${
            game.probablePitcher ? 'text-gray-800' : 'text-amber-600'
          }`}>
            {game.probablePitcher ? game.probablePitcher.name : 'TBD'}
          </span>
          {game.probablePitcher && (
            <GameLogCompact logs={game.probablePitcher.lastThreeStarts} />
          )}
        </div>
      </div>
    </div>
  );
}

export function SchedulePanel() {
  const { upcomingGames, isLoading, isError, error, refetch } = useSchedule();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">일정 및 선발 투수</h2>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {isError && (
        <ErrorMessage
          message={error?.message ?? '데이터를 불러오는 중 오류가 발생했습니다.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      )}

      {!isLoading && !isError && (
        <div>
          {upcomingGames.map((game, idx) => (
            <GameRow key={idx} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
