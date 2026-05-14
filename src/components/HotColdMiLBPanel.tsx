import { useState } from 'react';
import { useHotColdMiLB } from '../hooks/useHotColdMiLB';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { MiLBHitterStats, MiLBPitcherStats } from '../services/types';

type AffiliateKey = 'All' | 'AAA' | 'AA' | 'High A' | 'A';

const AFFILIATE_TABS: AffiliateKey[] = ['All', 'AAA', 'AA', 'High A', 'A'];
const WINDOW_TABS: { label: string; value: 7 | 14 }[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
];

function HitterTable({ hitters, showLevel }: { hitters: MiLBHitterStats[]; showLevel: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase text-gray-500">
          <th className="pb-1 text-left font-medium">Player</th>
          {showLevel && <th className="pb-1 text-left font-medium">Lvl</th>}
          <th className="pb-1 text-right font-medium">PA</th>
          <th className="pb-1 text-right font-medium">wOBA</th>
          <th className="pb-1 text-right font-medium">AVG</th>
          <th className="pb-1 text-right font-medium">HR</th>
        </tr>
      </thead>
      <tbody>
        {hitters.length > 0 ? (
          hitters.map((h) => (
            <tr key={h.playerId} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="py-1.5">
                <a
                  href={`https://www.milb.com/player/${h.playerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {h.name}
                </a>
                <span className="ml-1 text-xs text-gray-400">{h.position}</span>
              </td>
              {showLevel && <td className="py-1.5 text-gray-500">{h.level}</td>}
              <td className="py-1.5 text-right text-gray-400">{h.pa}</td>
              <td className="py-1.5 text-right font-medium">{h.wOBA.toFixed(3)}</td>
              <td className="py-1.5 text-right text-gray-400">{h.avg.toFixed(3)}</td>
              <td className="py-1.5 text-right text-gray-400">{h.hr}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={showLevel ? 6 : 5} className="py-3 text-center text-gray-400">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function PitcherTable({ pitchers, showLevel }: { pitchers: MiLBPitcherStats[]; showLevel: boolean }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase text-gray-500">
          <th className="pb-1 text-left font-medium">Pitcher</th>
          {showLevel && <th className="pb-1 text-left font-medium">Lvl</th>}
          <th className="pb-1 text-right font-medium">IP</th>
          <th className="pb-1 text-right font-medium">ERA</th>
          <th className="pb-1 text-right font-medium">WHIP</th>
          <th className="pb-1 text-right font-medium">K</th>
        </tr>
      </thead>
      <tbody>
        {pitchers.length > 0 ? (
          pitchers.map((p) => (
            <tr key={p.playerId} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="py-1.5">
                <a
                  href={`https://www.milb.com/player/${p.playerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {p.name}
                </a>
                <span className="ml-1 text-xs text-gray-400">{p.position}</span>
              </td>
              {showLevel && <td className="py-1.5 text-gray-500">{p.level}</td>}
              <td className="py-1.5 text-right text-gray-400">{p.ip.toFixed(1)}</td>
              <td className="py-1.5 text-right font-medium">{p.era.toFixed(2)}</td>
              <td className="py-1.5 text-right text-gray-400">{p.whip.toFixed(2)}</td>
              <td className="py-1.5 text-right text-gray-400">{p.strikeouts}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={showLevel ? 6 : 5} className="py-3 text-center text-gray-400">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export function HotColdMiLBPanel() {
  const [activeAffiliate, setActiveAffiliate] = useState<AffiliateKey>('All');
  const [activeWindow, setActiveWindow] = useState<7 | 14>(7);

  const { hotHitters, coldHitters, hotPitchers, coldPitchers, isLoading, isError, error, refetch } =
    useHotColdMiLB(activeAffiliate, activeWindow);

  const showLevel = activeAffiliate === 'All';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">MiLB Hot / Cold</h2>

      {/* Affiliate tabs */}
      <div role="tablist" className="flex border-b border-gray-200">
        {AFFILIATE_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={tab === activeAffiliate}
            onClick={() => setActiveAffiliate(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
              tab === activeAffiliate
                ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Window tabs */}
      <div role="tablist" className="mt-2 flex gap-2">
        {WINDOW_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={tab.value === activeWindow}
            onClick={() => setActiveWindow(tab.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none ${
              tab.value === activeWindow
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {isError && (
          <ErrorMessage
            message={error?.message ?? 'Failed to load minor league data.'}
            onRetry={() => refetch()}
            showRetry={true}
          />
        )}

        {!isLoading && !isError && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hot Hitters */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-green-700">
                🔥 Hottest Hitters
              </h3>
              <HitterTable hitters={hotHitters} showLevel={showLevel} />
            </div>

            {/* Cold Hitters */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-blue-700">
                🧊 Coldest Hitters
              </h3>
              <HitterTable hitters={coldHitters} showLevel={showLevel} />
            </div>

            {/* Hot Pitchers */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-green-700">
                🔥 Hottest Pitchers
              </h3>
              <PitcherTable pitchers={hotPitchers} showLevel={showLevel} />
            </div>

            {/* Cold Pitchers */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-blue-700">
                🧊 Coldest Pitchers
              </h3>
              <PitcherTable pitchers={coldPitchers} showLevel={showLevel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
