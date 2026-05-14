import { useState, useMemo } from 'react';
import { useMiLBNotable } from '../hooks/useMiLBNotable';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { MiLBSeasonHitter, MiLBSeasonPitcher } from '../services/types';

type AffiliateKey = 'All' | 'AAA' | 'AA' | 'High A' | 'A';
type SortDir = 'asc' | 'desc';

interface SortState {
  sortKey: string;
  sortDir: SortDir;
}

const AFFILIATE_TABS: AffiliateKey[] = ['All', 'AAA', 'AA', 'High A', 'A'];

// Format helpers
function fmtRate(val: number): string {
  return val.toFixed(3).replace(/^0/, '');
}

function fmtERA(val: number): string {
  return val.toFixed(2);
}

function fmtPer9(val: number): string {
  return val.toFixed(2);
}

function fmtIP(val: number): string {
  return val.toFixed(1);
}

// Generic sort
function sortData<T>(data: T[], key: string, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[key];
    const bVal = (b as Record<string, unknown>)[key];
    const aNum = typeof aVal === 'number' ? aVal : 0;
    const bNum = typeof bVal === 'number' ? bVal : 0;
    return dir === 'asc' ? aNum - bNum : bNum - aNum;
  });
}

// Sortable column header
function SortHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: string;
  currentSort: SortState;
  onSort: (key: string) => void;
}) {
  const isActive = currentSort.sortKey === sortKey;
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600 hover:text-gray-900"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && (
        <span className="ml-0.5">{currentSort.sortDir === 'asc' ? '▲' : '▼'}</span>
      )}
    </th>
  );
}

// Hitters Table
function NotableHittersTable({
  hitters,
  showLevel,
}: {
  hitters: MiLBSeasonHitter[];
  showLevel: boolean;
}) {
  // Default sort by OPS descending (OBP + SLG)
  const [sort, setSort] = useState<SortState>({ sortKey: 'OPS', sortDir: 'desc' });

  const sorted = useMemo(() => {
    if (sort.sortKey === 'OPS') {
      return [...hitters].sort((a, b) => {
        const aOPS = a.OBP + a.SLG;
        const bOPS = b.OBP + b.SLG;
        return sort.sortDir === 'asc' ? aOPS - bOPS : bOPS - aOPS;
      });
    }
    return sortData(hitters, sort.sortKey, sort.sortDir);
  }, [hitters, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: key === 'K' ? 'asc' : 'desc' }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">
              Player
            </th>
            {showLevel && (
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">
                Lvl
              </th>
            )}
            <SortHeader label="G" sortKey="G" currentSort={sort} onSort={handleSort} />
            <SortHeader label="PA" sortKey="PA" currentSort={sort} onSort={handleSort} />
            <SortHeader label="HR" sortKey="HR" currentSort={sort} onSort={handleSort} />
            <SortHeader label="SB" sortKey="SB" currentSort={sort} onSort={handleSort} />
            <SortHeader label="BB" sortKey="BB" currentSort={sort} onSort={handleSort} />
            <SortHeader label="K" sortKey="K" currentSort={sort} onSort={handleSort} />
            <SortHeader label="OBP" sortKey="OBP" currentSort={sort} onSort={handleSort} />
            <SortHeader label="SLG" sortKey="SLG" currentSort={sort} onSort={handleSort} />
            <SortHeader label="wOBA" sortKey="wOBA" currentSort={sort} onSort={handleSort} />
            <SortHeader label="BABIP" sortKey="BABIP" currentSort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.length > 0 ? (
            sorted.map((h, i) => (
              <tr
                key={h.playerId}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="whitespace-nowrap px-2 py-1.5 text-left">
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
                {showLevel && (
                  <td className="whitespace-nowrap px-2 py-1.5 text-left text-gray-500">
                    {h.level}
                  </td>
                )}
                <td className="px-2 py-1.5 text-right tabular-nums">{h.G}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.PA}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.HR}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.SB}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.BB}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.K}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtRate(h.OBP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtRate(h.SLG)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtRate(h.wOBA)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtRate(h.BABIP)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={showLevel ? 12 : 11}
                className="py-3 text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Pitchers Table
function NotablePitchersTable({
  pitchers,
  showLevel,
}: {
  pitchers: MiLBSeasonPitcher[];
  showLevel: boolean;
}) {
  // Default sort by ERA ascending
  const [sort, setSort] = useState<SortState>({ sortKey: 'ERA', sortDir: 'asc' });

  const sorted = useMemo(() => sortData(pitchers, sort.sortKey, sort.sortDir), [pitchers, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: key === 'ERA' || key === 'BB9' ? 'asc' : 'desc' }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">
              Player
            </th>
            {showLevel && (
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">
                Lvl
              </th>
            )}
            <SortHeader label="G" sortKey="G" currentSort={sort} onSort={handleSort} />
            <SortHeader label="GS" sortKey="GS" currentSort={sort} onSort={handleSort} />
            <SortHeader label="IP" sortKey="IP" currentSort={sort} onSort={handleSort} />
            <SortHeader label="ERA" sortKey="ERA" currentSort={sort} onSort={handleSort} />
            <SortHeader label="K/9" sortKey="K9" currentSort={sort} onSort={handleSort} />
            <SortHeader label="BB/9" sortKey="BB9" currentSort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.length > 0 ? (
            sorted.map((p, i) => (
              <tr
                key={p.playerId}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="whitespace-nowrap px-2 py-1.5 text-left">
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
                {showLevel && (
                  <td className="whitespace-nowrap px-2 py-1.5 text-left text-gray-500">
                    {p.level}
                  </td>
                )}
                <td className="px-2 py-1.5 text-right tabular-nums">{p.G}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.GS}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtIP(p.IP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtERA(p.ERA)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPer9(p.K9)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPer9(p.BB9)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={showLevel ? 8 : 7}
                className="py-3 text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function MiLBNotablePanel() {
  const [activeAffiliate, setActiveAffiliate] = useState<AffiliateKey>('All');

  const { hitters, pitchers, isLoading, isError, error, refetch } =
    useMiLBNotable(activeAffiliate);

  const showLevel = activeAffiliate === 'All';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">MiLB Notable Players</h2>

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
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Hitters</h3>
              <NotableHittersTable hitters={hitters} showLevel={showLevel} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Pitchers</h3>
              <NotablePitchersTable pitchers={pitchers} showLevel={showLevel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
