import { useState, useMemo } from 'react';
import { useOpponentStats } from '../hooks/useOpponentStats';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { FangraphsHitter, FangraphsPitcher } from '../services/fangraphsData';

type SortDir = 'asc' | 'desc';
interface SortState { sortKey: string; sortDir: SortDir }

function fmtPct(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

function fmtBabip(val: number): string {
  return val.toFixed(3);
}

function fmtWar(val: number): string {
  if (val == null || isNaN(val)) return '0.0';
  return val.toFixed(1);
}

function fmtIP(val: number): string {
  const fullInnings = Math.floor(val);
  const decimal = Math.round((val - fullInnings) * 10);
  const outs = decimal > 2 ? 2 : decimal;
  return `${fullInnings}.${outs}`;
}

function playerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function savantUrl(name: string, mlbId: number): string {
  return `https://baseballsavant.mlb.com/savant-player/${playerSlug(name)}-${mlbId}`;
}

function sortData<T>(data: T[], key: string, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[key];
    const bVal = (b as Record<string, unknown>)[key];
    const aNum = typeof aVal === 'number' ? aVal : 0;
    const bNum = typeof bVal === 'number' ? bVal : 0;
    return dir === 'asc' ? aNum - bNum : bNum - aNum;
  });
}

function SortHeader({ label, sortKey, currentSort, onSort }: {
  label: string; sortKey: string; currentSort: SortState; onSort: (key: string) => void;
}) {
  const isActive = currentSort.sortKey === sortKey;
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-600 hover:text-gray-900"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && <span className="ml-0.5">{currentSort.sortDir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  );
}

function OpponentHittersTable({ hitters }: { hitters: FangraphsHitter[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'WAR', sortDir: 'desc' });
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => sortData(hitters, sort.sortKey, sort.sortDir), [hitters, sort]);
  const displayData = expanded ? sorted : sorted.slice(0, 5);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
              <SortHeader label="PA" sortKey="PA" currentSort={sort} onSort={handleSort} />
              <SortHeader label="H" sortKey="H" currentSort={sort} onSort={handleSort} />
              <SortHeader label="HR" sortKey="HR" currentSort={sort} onSort={handleSort} />
              <SortHeader label="OBP" sortKey="OBP" currentSort={sort} onSort={handleSort} />
              <SortHeader label="SLG" sortKey="SLG" currentSort={sort} onSort={handleSort} />
              <SortHeader label="BB%" sortKey="bbPct" currentSort={sort} onSort={handleSort} />
              <SortHeader label="K%" sortKey="kPct" currentSort={sort} onSort={handleSort} />
              <SortHeader label="BABIP" sortKey="BABIP" currentSort={sort} onSort={handleSort} />
              <SortHeader label="wRC+" sortKey="wRCPlus" currentSort={sort} onSort={handleSort} />
              <SortHeader label="fWAR" sortKey="WAR" currentSort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {displayData.map((h, i) => (
              <tr key={h.fgPlayerId} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                <td className="whitespace-nowrap px-2 py-1.5 text-left">
                  <a href={savantUrl(h.name, h.mlbId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {h.name}
                  </a>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.PA}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.H}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.HR}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtBabip(h.OBP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtBabip(h.SLG)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(h.bbPct)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(h.kPct)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtBabip(h.BABIP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{h.wRCPlus}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtWar(h.WAR)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 5 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 w-full rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          {expanded ? 'Show less' : `Show all (${sorted.length})`}
        </button>
      )}
    </div>
  );
}

function OpponentPitchersTable({ pitchers }: { pitchers: FangraphsPitcher[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'WAR', sortDir: 'desc' });
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => sortData(pitchers, sort.sortKey, sort.sortDir), [pitchers, sort]);
  const displayData = expanded ? sorted : sorted.slice(0, 5);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
              <SortHeader label="G" sortKey="G" currentSort={sort} onSort={handleSort} />
              <SortHeader label="GS" sortKey="GS" currentSort={sort} onSort={handleSort} />
              <SortHeader label="IP" sortKey="IP" currentSort={sort} onSort={handleSort} />
              <SortHeader label="K%" sortKey="kPct" currentSort={sort} onSort={handleSort} />
              <SortHeader label="BB%" sortKey="bbPct" currentSort={sort} onSort={handleSort} />
              <SortHeader label="BABIP" sortKey="BABIP" currentSort={sort} onSort={handleSort} />
              <SortHeader label="FIP" sortKey="FIP" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Stf" sortKey="pbStuff" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Cmd" sortKey="pbCommand" currentSort={sort} onSort={handleSort} />
              <SortHeader label="fWAR" sortKey="WAR" currentSort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {displayData.map((p, i) => (
              <tr key={p.fgPlayerId} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                <td className="whitespace-nowrap px-2 py-1.5 text-left">
                  <a href={savantUrl(p.name, p.mlbId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {p.name}
                  </a>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.G}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.GS}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtIP(p.IP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(p.kPct)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(p.bbPct)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtBabip(p.BABIP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.FIP.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.pbStuff.toFixed(1)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{p.pbCommand.toFixed(1)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtWar(p.WAR)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 5 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-2 w-full rounded bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          {expanded ? 'Show less' : `Show all (${sorted.length})`}
        </button>
      )}
    </div>
  );
}

export function ScoutingPanel() {
  const { opponentName, hitters, pitchers, isLoading, isError, error, refetch } = useOpponentStats();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Opponent Scouting — <span className="text-blue-600">{opponentName}</span>
        </h2>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {isError && (
        <ErrorMessage
          message={error?.message ?? 'Failed to load opponent data.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Hitters</h3>
            {hitters.length > 0 ? (
              <OpponentHittersTable hitters={hitters} />
            ) : (
              <p className="text-sm text-gray-400">No upcoming opponent found</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Pitchers</h3>
            {pitchers.length > 0 ? (
              <OpponentPitchersTable pitchers={pitchers} />
            ) : (
              <p className="text-sm text-gray-400">No upcoming opponent found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
