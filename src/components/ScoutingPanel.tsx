import { useState } from 'react';
import { useScouting } from '../hooks/useScouting';
import { TabGroup } from './common/TabGroup';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import { Sparkline } from './common/Sparkline';
import type { HitterStats, PitcherStats, ScoutingPlayerCard } from '../services/types';

const WINDOW_TABS = ['7일', '14일', '30일'];

function getWindowFromTab(tab: string): 7 | 14 | 30 {
  if (tab === '7일') return 7;
  if (tab === '14일') return 14;
  return 30;
}

function HitterRow({ hitter, colorClass, isProbableStarter }: { hitter: HitterStats; colorClass: 'green' | 'red'; isProbableStarter?: boolean }) {
  return (
    <li className={`flex items-center justify-between rounded px-3 py-2 ${
      colorClass === 'green' ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          colorClass === 'green' ? 'text-green-700' : 'text-red-700'
        }`}>
          {hitter.name}{isProbableStarter ? ' *' : ''}
        </span>
        <span className="text-xs text-gray-500">{hitter.position}</span>
      </div>
      <span className={`text-sm font-semibold ${
        colorClass === 'green' ? 'text-green-600' : 'text-red-600'
      }`}>
        {hitter.wOBA.toFixed(3)}
      </span>
    </li>
  );
}

function PitcherRow({ pitcher, colorClass, isProbableStarter }: { pitcher: PitcherStats; colorClass: 'green' | 'red'; isProbableStarter?: boolean }) {
  return (
    <li className={`flex items-center justify-between rounded px-3 py-2 ${
      colorClass === 'green' ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          colorClass === 'green' ? 'text-green-700' : 'text-red-700'
        }`}>
          {pitcher.name}{isProbableStarter ? ' *' : ''}
        </span>
        <span className="text-xs text-gray-500">{pitcher.position}</span>
      </div>
      <span className={`text-sm font-semibold ${
        colorClass === 'green' ? 'text-green-600' : 'text-red-600'
      }`}>
        {pitcher.fip.toFixed(2)}
      </span>
    </li>
  );
}

function ScoutingCardRow({ card }: { card: ScoutingPlayerCard }) {
  const isHitter = !['SP', 'RP', 'CL'].includes(card.player.position);
  const statLabel = isHitter ? 'wRC+' : 'FIP';
  const sparkColor = card.colorClass === 'green' ? '#16a34a' : card.colorClass === 'red' ? '#dc2626' : '#6b7280';

  return (
    <div className={`flex items-center justify-between rounded px-3 py-2 ${
      card.colorClass === 'green' ? 'bg-green-50' : card.colorClass === 'red' ? 'bg-red-50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          card.colorClass === 'green' ? 'text-green-700' : card.colorClass === 'red' ? 'text-red-700' : 'text-gray-700'
        }`}>
          {card.player.fullName}{card.isProbableStarter ? ' *' : ''}
        </span>
        <span className="text-xs text-gray-500">{card.player.position}</span>
      </div>
      <div className="flex items-center gap-3">
        <Sparkline data={card.sparklineData} color={sparkColor} width={80} height={24} />
        <span className={`text-sm font-semibold ${
          card.colorClass === 'green' ? 'text-green-600' : card.colorClass === 'red' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {statLabel} {isHitter ? card.stat.toFixed(0) : card.stat.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function HotColdView({ hotHitters, coldHitters, hotPitchers, coldPitchers }: {
  hotHitters: HitterStats[];
  coldHitters: HitterStats[];
  hotPitchers: PitcherStats[];
  coldPitchers: PitcherStats[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Hot 타자 */}
      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-700">
          <span>🔥</span> Hot 타자
          <span className="text-xs font-normal text-gray-500">(wOBA 내림차순)</span>
        </h3>
        <ul className="space-y-1">
          {hotHitters.length > 0 ? (
            hotHitters.map((hitter) => (
              <HitterRow key={hitter.playerId} hitter={hitter} colorClass="green" />
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">해당 선수 없음</li>
          )}
        </ul>
      </div>

      {/* Cold 타자 */}
      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700">
          <span>🥶</span> Cold 타자
          <span className="text-xs font-normal text-gray-500">(wOBA &lt; .290)</span>
        </h3>
        <ul className="space-y-1">
          {coldHitters.length > 0 ? (
            coldHitters.map((hitter) => (
              <HitterRow key={hitter.playerId} hitter={hitter} colorClass="red" />
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">해당 선수 없음</li>
          )}
        </ul>
      </div>

      {/* Hot 투수 */}
      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-700">
          <span>🔥</span> Hot 투수
          <span className="text-xs font-normal text-gray-500">(FIP 오름차순)</span>
        </h3>
        <ul className="space-y-1">
          {hotPitchers.length > 0 ? (
            hotPitchers.map((pitcher) => (
              <PitcherRow key={pitcher.playerId} pitcher={pitcher} colorClass="green" />
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">해당 선수 없음</li>
          )}
        </ul>
      </div>

      {/* Cold 투수 */}
      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700">
          <span>🥶</span> Cold 투수
          <span className="text-xs font-normal text-gray-500">(FIP &gt; 3.75)</span>
        </h3>
        <ul className="space-y-1">
          {coldPitchers.length > 0 ? (
            coldPitchers.map((pitcher) => (
              <PitcherRow key={pitcher.playerId} pitcher={pitcher} colorClass="red" />
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">해당 선수 없음</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function SparklineView({ scoutingCards }: { scoutingCards: ScoutingPlayerCard[] }) {
  const hitterCards = scoutingCards.filter((c) => !['SP', 'RP', 'CL'].includes(c.player.position));
  const pitcherCards = scoutingCards.filter((c) => ['SP', 'RP', 'CL'].includes(c.player.position));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">타자 (wRC+)</h3>
        <div className="space-y-1">
          {hitterCards.map((card) => (
            <ScoutingCardRow key={card.player.id} card={card} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">투수 (FIP)</h3>
        <div className="space-y-1">
          {pitcherCards.map((card) => (
            <ScoutingCardRow key={card.player.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoutingPanel() {
  const [activeTab, setActiveTab] = useState(WINDOW_TABS[0]);
  const window = getWindowFromTab(activeTab);
  // Default opponent for mock data
  const opponent = 'NYY';

  const { hotHitters, coldHitters, hotPitchers, coldPitchers, scoutingCards, isLoading, isError, error, refetch } =
    useScouting(window, opponent);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">상대팀 스카우팅</h2>
      <TabGroup tabs={WINDOW_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

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
          <>
            {window === 30 ? (
              <SparklineView scoutingCards={scoutingCards} />
            ) : (
              <HotColdView
                hotHitters={hotHitters}
                coldHitters={coldHitters}
                hotPitchers={hotPitchers}
                coldPitchers={coldPitchers}
              />
            )}
            <p className="mt-3 text-xs text-gray-400">* 예상 선발 투수</p>
          </>
        )}
      </div>
    </div>
  );
}
