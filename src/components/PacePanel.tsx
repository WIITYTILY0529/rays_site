import { usePace } from '../hooks/usePace';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { HitterPaceStats, PitcherPaceStats } from '../services/types';

function HitterPaceRow({ pace }: { pace: HitterPaceStats }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-3 text-sm font-medium text-gray-800">{pace.player.fullName}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.hr}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.hits}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.rbi}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.sb}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.hr}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.hits}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.rbi}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.sb}</td>
    </tr>
  );
}

function PitcherPaceRow({ pace }: { pace: PitcherPaceStats }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-3 text-sm font-medium text-gray-800">{pace.player.fullName}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.wins}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.strikeouts}</td>
      <td className="px-2 py-2 text-center text-sm text-gray-600">{pace.currentStats.ip}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.wins}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.strikeouts}</td>
      <td className="px-2 py-2 text-center text-sm font-bold text-[var(--accent)]">{pace.projectedStats.ip}</td>
    </tr>
  );
}

export function PacePanel() {
  const { hitterPace, pitcherPace, isLoading, isError, error, refetch } = usePace();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">2026 시즌 페이스 예측</h2>

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
        <div className="space-y-6">
          {/* Hitter Pace Table */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">타자 페이스</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-3 text-xs font-medium text-gray-500">선수</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">HR</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">H</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">RBI</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">SB</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">HR*</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">H*</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">RBI*</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">SB*</th>
                  </tr>
                </thead>
                <tbody>
                  {hitterPace.map((pace) => (
                    <HitterPaceRow key={pace.player.id} pace={pace} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-xs text-gray-400">* 162경기 기준 예측값</p>
          </div>

          {/* Pitcher Pace Table */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">투수 페이스</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-3 text-xs font-medium text-gray-500">선수</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">W</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">K</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-gray-500">IP</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">W*</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">K*</th>
                    <th className="px-2 pb-2 text-center text-xs font-medium text-[var(--accent)]">IP*</th>
                  </tr>
                </thead>
                <tbody>
                  {pitcherPace.map((pace) => (
                    <PitcherPaceRow key={pace.player.id} pace={pace} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-xs text-gray-400">* 162경기 기준 예측값</p>
          </div>
        </div>
      )}
    </div>
  );
}
