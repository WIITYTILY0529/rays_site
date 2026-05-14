import { useState, useMemo } from 'react';
import { useScouting } from '../hooks/useScouting';
import { TabGroup } from './common/TabGroup';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { HitterStats, PitcherStats } from '../services/types';

const WINDOW_TABS = ['Season', 'Last 7 Days'];

function getWindowFromTab(tab: string): 7 | 14 | 30 {
  if (tab === 'Last 7 Days') return 7;
  return 30; // Season uses 30-day window (full available data)
}

function HittersTable({ hitters, expanded, onToggle }: { hitters: HitterStats[]; expanded: boolean; onToggle: () => void }) {
  const sorted = useMemo(
    () => [...hitters].sort((a, b) => b.wRCPlus - a.wRCPlus),
    [hitters]
  );
  const displayData = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">PA</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">wRC+</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">wOBA</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">OPS</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">K%</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">BB%</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((h, i) => (
                <tr
                  key={h.playerId}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-gray-800">
                    {h.name}
                    <span className="ml-1 text-xs text-gray-400">{h.position}</span>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{h.pa}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{h.wRCPlus}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{h.wOBA.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{h.ops.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-500">—</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-500">—</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-3 text-center text-gray-400">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > 5 && (
        <button
          onClick={onToggle}
          className="mt-2 w-full rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {expanded ? 'Show less' : `Show all (${sorted.length})`}
        </button>
      )}
    </div>
  );
}

function PitchersTable({ pitchers, expanded, onToggle }: { pitchers: PitcherStats[]; expanded: boolean; onToggle: () => void }) {
  const sorted = useMemo(
    () => [...pitchers].sort((a, b) => a.fip - b.fip),
    [pitchers]
  );
  const displayData = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">IP</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">FIP</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">ERA</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">K%</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">BB%</th>
              <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600">WHIP</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((p, i) => (
                <tr
                  key={p.playerId}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-gray-800">
                    {p.name}
                    <span className="ml-1 text-xs text-gray-400">{p.position}</span>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{p.ip.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{p.fip.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{p.era.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-500">—</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-500">—</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-gray-500">—</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-3 text-center text-gray-400">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > 5 && (
        <button
          onClick={onToggle}
          className="mt-2 w-full rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {expanded ? 'Show less' : `Show all (${sorted.length})`}
        </button>
      )}
    </div>
  );
}

export function ScoutingPanel() {
  const [activeTab, setActiveTab] = useState(WINDOW_TABS[0]);
  const window = getWindowFromTab(activeTab);
  const opponent = 'NYY';

  const { hotHitters, coldHitters, hotPitchers, coldPitchers, isLoading, isError, error, refetch } =
    useScouting(window, opponent);

  // Combine hot + cold back into single sorted lists
  const allHitters = useMemo(() => [...hotHitters, ...coldHitters], [hotHitters, coldHitters]);
  const allPitchers = useMemo(() => [...hotPitchers, ...coldPitchers], [hotPitchers, coldPitchers]);

  const [hittersExpanded, setHittersExpanded] = useState(false);
  const [pitchersExpanded, setPitchersExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Opponent Scouting</h2>
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
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Hitters (sorted by wRC+)</h3>
              <HittersTable
                hitters={allHitters}
                expanded={hittersExpanded}
                onToggle={() => setHittersExpanded(!hittersExpanded)}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Pitchers (sorted by FIP)</h3>
              <PitchersTable
                pitchers={allPitchers}
                expanded={pitchersExpanded}
                onToggle={() => setPitchersExpanded(!pitchersExpanded)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
