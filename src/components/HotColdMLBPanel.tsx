import { useState } from 'react';
import { useHotColdMLB } from '../hooks/useHotColdMLB';
import { TabGroup } from './common/TabGroup';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { HitterStats, PitcherStats } from '../services/types';

const WINDOW_TABS = ['7d', '14d'];

function getWindowFromTab(tab: string): 7 | 14 {
  return tab === '7d' ? 7 : 14;
}

function HitterRow({ hitter, colorClass }: { hitter: HitterStats; colorClass: 'green' | 'red' }) {
  return (
    <li className={`flex items-center justify-between rounded px-3 py-2 ${
      colorClass === 'green' ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          colorClass === 'green' ? 'text-green-700' : 'text-red-700'
        }`}>
          {hitter.name}
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

function PitcherRow({ pitcher, colorClass }: { pitcher: PitcherStats; colorClass: 'green' | 'red' }) {
  return (
    <li className={`flex items-center justify-between rounded px-3 py-2 ${
      colorClass === 'green' ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${
          colorClass === 'green' ? 'text-green-700' : 'text-red-700'
        }`}>
          {pitcher.name}
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

export function HotColdMLBPanel() {
  const [activeTab, setActiveTab] = useState(WINDOW_TABS[0]);
  const window = getWindowFromTab(activeTab);
  const { hotHitters, coldHitters, hotPitchers, coldPitchers, isLoading, isError, error, refetch } =
    useHotColdMLB(window);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">MLB Hot &amp; Cold</h2>
      <TabGroup tabs={WINDOW_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {isError && (
          <ErrorMessage
            message={error?.message ?? 'Failed to load data.'}
            onRetry={() => refetch()}
            showRetry={true}
          />
        )}

        {!isLoading && !isError && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hot Hitters */}
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-700">
                <span>🔥</span> Hot Hitters
                <span className="text-xs font-normal text-gray-500">(wOBA desc)</span>
              </h3>
              <ul className="space-y-1">
                {hotHitters.map((hitter) => (
                  <HitterRow key={hitter.playerId} hitter={hitter} colorClass="green" />
                ))}
              </ul>
            </div>

            {/* Cold Hitters */}
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700">
                <span>🥶</span> Cold Hitters
                <span className="text-xs font-normal text-gray-500">(wOBA &lt; .290)</span>
              </h3>
              <ul className="space-y-1">
                {coldHitters.length > 0 ? (
                  coldHitters.map((hitter) => (
                    <HitterRow key={hitter.playerId} hitter={hitter} colorClass="red" />
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400">None</li>
                )}
              </ul>
            </div>

            {/* Hot Pitchers */}
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-700">
                <span>🔥</span> Hot Pitchers
                <span className="text-xs font-normal text-gray-500">(FIP asc)</span>
              </h3>
              <ul className="space-y-1">
                {hotPitchers.map((pitcher) => (
                  <PitcherRow key={pitcher.playerId} pitcher={pitcher} colorClass="green" />
                ))}
              </ul>
            </div>

            {/* Cold Pitchers */}
            <div>
              <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700">
                <span>🥶</span> Cold Pitchers
                <span className="text-xs font-normal text-gray-500">(FIP &gt; 3.75)</span>
              </h3>
              <ul className="space-y-1">
                {coldPitchers.length > 0 ? (
                  coldPitchers.map((pitcher) => (
                    <PitcherRow key={pitcher.playerId} pitcher={pitcher} colorClass="red" />
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400">None</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
