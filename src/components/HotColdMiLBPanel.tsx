import { useState } from 'react';
import { useHotColdMiLB } from '../hooks/useHotColdMiLB';
import { TabGroup } from './common/TabGroup';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { HitterStats, PitcherStats } from '../services/types';

const DEFAULT_AFFILIATE = 'Durham Bulls';

function HitterRow({ hitter }: { hitter: HitterStats }) {
  return (
    <li className="flex items-center justify-between rounded px-3 py-2 hover:bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{hitter.name}</span>
        <span className="text-xs text-gray-500">{hitter.position}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700">{hitter.wOBA.toFixed(3)}</span>
    </li>
  );
}

function PitcherRow({ pitcher }: { pitcher: PitcherStats }) {
  return (
    <li className="flex items-center justify-between rounded px-3 py-2 hover:bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{pitcher.name}</span>
        <span className="text-xs text-gray-500">{pitcher.position}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700">{pitcher.era.toFixed(2)}</span>
    </li>
  );
}

export function HotColdMiLBPanel() {
  const [activeAffiliate, setActiveAffiliate] = useState(DEFAULT_AFFILIATE);
  const { hitters, pitchers, affiliates, isLoading, isError, error, refetch } =
    useHotColdMiLB(activeAffiliate);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">마이너리그 선수 성적</h2>
      <TabGroup tabs={affiliates} activeTab={activeAffiliate} onTabChange={setActiveAffiliate} />

      <div className="mt-4">
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* 타자 - wOBA 내림차순 */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                타자 <span className="text-xs font-normal text-gray-500">(wOBA 내림차순)</span>
              </h3>
              <ul className="space-y-1">
                {hitters.length > 0 ? (
                  hitters.map((hitter) => (
                    <HitterRow key={hitter.playerId} hitter={hitter} />
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400">데이터 없음</li>
                )}
              </ul>
            </div>

            {/* 투수 - ERA 오름차순 */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                투수 <span className="text-xs font-normal text-gray-500">(ERA 오름차순)</span>
              </h3>
              <ul className="space-y-1">
                {pitchers.length > 0 ? (
                  pitchers.map((pitcher) => (
                    <PitcherRow key={pitcher.playerId} pitcher={pitcher} />
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400">데이터 없음</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
