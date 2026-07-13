import { useTeamRankings } from '../hooks/useTeamRankings';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';

function RankBadge({ rank }: { rank: number }) {
  let color = 'bg-gray-100 text-gray-700';
  if (rank <= 5) color = 'bg-green-100 text-green-800';
  else if (rank <= 10) color = 'bg-blue-100 text-blue-800';
  else if (rank >= 25) color = 'bg-red-100 text-red-800';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      #{rank}
    </span>
  );
}

function StatCard({ label, value, rank, suffix }: { label: string; value: number; rank: number; suffix?: string }) {
  let decimals = 1;
  if (label === 'wRC+') decimals = 0;
  else if (label === 'FIP') decimals = 2;

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900">
        {value.toFixed(decimals)}{suffix ?? ''}
      </span>
      <RankBadge rank={rank} />
    </div>
  );
}

export function TeamRankingsPanel() {
  const { data, isLoading, isError, error, refetch } = useTeamRankings();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Team Rankings (MLB)</h2>
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Team Rankings (MLB)</h2>
        <ErrorMessage
          message={error?.message ?? 'Failed to load rankings.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">Team Rankings (MLB)</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="wRC+" value={data.batting.wRCPlus} rank={data.batting.wRCPlusRank} />
        <StatCard label="Batting WAR" value={data.batting.WAR} rank={data.batting.WARRank} />
        <StatCard label="FIP" value={data.pitching.FIP} rank={data.pitching.FIPRank} />
        <StatCard label="Pitching WAR" value={data.pitching.WAR} rank={data.pitching.WARRank} />
      </div>
      <p className="mt-2 text-right text-xs text-gray-400">out of 30 teams · via FanGraphs</p>
    </div>
  );
}
