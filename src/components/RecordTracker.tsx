import { useState } from 'react';
import { useRecordTracker } from '../hooks/useRecordTracker';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { SeasonRecord, TeamStanding } from '../services/types';

function formatWinPct(winPct: number): string {
  return winPct.toFixed(3).replace(/^0/, '');
}

function SeasonRecordDisplay({ record, label }: { record: SeasonRecord; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-2xl font-bold text-gray-900">
        {record.wins}-{record.losses}
      </span>
      <span className="text-lg font-semibold text-gray-600">
        {formatWinPct(record.winPct)}
      </span>
    </div>
  );
}

function StandingsPopover({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">AL East 순위</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="pb-1 pr-3 text-left">팀</th>
            <th className="pb-1 px-2 text-right">승</th>
            <th className="pb-1 px-2 text-right">패</th>
            <th className="pb-1 px-2 text-right">승률</th>
            <th className="pb-1 pl-2 text-right">GB</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.teamName}
              className={`border-b border-gray-50 ${
                team.teamName.includes('Tampa Bay') || team.teamName.includes('Rays')
                  ? 'font-semibold text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <td className="py-1 pr-3 text-left whitespace-nowrap">{team.teamName}</td>
              <td className="py-1 px-2 text-right">{team.wins}</td>
              <td className="py-1 px-2 text-right">{team.losses}</td>
              <td className="py-1 px-2 text-right">{formatWinPct(team.winPct)}</td>
              <td className="py-1 pl-2 text-right">
                {team.gamesBehind === 0 ? '—' : team.gamesBehind.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RecordTracker() {
  const { season2025, season2026, alEastStandings, isLoading, isError, error, refetch } =
    useRecordTracker();
  const [showStandings, setShowStandings] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">시즌 기록 비교</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">시즌 기록 비교</h2>
        <ErrorMessage
          message={error?.message ?? '데이터를 불러오는 중 오류가 발생했습니다.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">시즌 기록 비교</h2>
      {season2025 && season2026 && (
        <div
          className="relative"
          onMouseEnter={() => setShowStandings(true)}
          onMouseLeave={() => setShowStandings(false)}
        >
          <div className="flex items-center justify-center gap-8">
            <SeasonRecordDisplay record={season2025} label="2025" />
            <div className="text-2xl text-gray-300">vs</div>
            <SeasonRecordDisplay record={season2026} label="2026" />
          </div>
          {showStandings && alEastStandings && alEastStandings.length > 0 && (
            <StandingsPopover standings={alEastStandings} />
          )}
        </div>
      )}
    </div>
  );
}
