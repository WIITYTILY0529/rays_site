import { useState, useMemo } from 'react';
import { useFangraphsData } from '../hooks/useFangraphsData';
import { useHotColdMLB } from '../hooks/useHotColdMLB';
import { useTeam } from '../context/TeamContext';
import { TabGroup } from './common/TabGroup';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { FangraphsHitter, FangraphsPitcher } from '../services/fangraphsData';
import type { HitterStats } from '../services/types';

const TABS = ['시즌 전체', '최근 7일'];

type SortDir = 'asc' | 'desc';

interface SortState {
  sortKey: string;
  sortDir: SortDir;
}

// Format helpers
function fmtPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

function fmtBabip(val: number): string {
  return val.toFixed(3).replace(/^0/, '');
}

function fmtWar(val: number): string {
  return val.toFixed(1);
}

function fmtInt(val: number): string {
  return String(Math.round(val));
}

function fmtIP(val: number): string {
  // IP like 39.2 means 39 and 2/3
  return val.toFixed(1);
}

function playerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function fgPlayerUrl(name: string, fgPlayerId: number): string {
  return `https://www.fangraphs.com/players/${playerSlug(name)}/${fgPlayerId}/stats`;
}

// Sorting
function sortData<T>(data: T[], key: string, dir: SortDir): T[] {
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[key];
    const bVal = (b as Record<string, unknown>)[key];
    const aNum = typeof aVal === 'number' ? aVal : 0;
    const bNum = typeof bVal === 'number' ? bVal : 0;
    return dir === 'asc' ? aNum - bNum : bNum - aNum;
  });
}

// Column header component
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

// Season Hitters Table
function SeasonHittersTable({ hitters }: { hitters: FangraphsHitter[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'WAR', sortDir: 'desc' });

  const sorted = useMemo(() => sortData(hitters, sort.sortKey, sort.sortDir), [hitters, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
            <SortHeader label="PA" sortKey="PA" currentSort={sort} onSort={handleSort} />
            <SortHeader label="H" sortKey="H" currentSort={sort} onSort={handleSort} />
            <SortHeader label="HR" sortKey="HR" currentSort={sort} onSort={handleSort} />
            <SortHeader label="BB%" sortKey="bbPct" currentSort={sort} onSort={handleSort} />
            <SortHeader label="K%" sortKey="kPct" currentSort={sort} onSort={handleSort} />
            <SortHeader label="BABIP" sortKey="BABIP" currentSort={sort} onSort={handleSort} />
            <SortHeader label="Barrel%" sortKey="barrelPct" currentSort={sort} onSort={handleSort} />
            <SortHeader label="wRC+" sortKey="wRCPlus" currentSort={sort} onSort={handleSort} />
            <SortHeader label="fWAR" sortKey="WAR" currentSort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((h, i) => (
            <tr
              key={h.fgPlayerId}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              <td className="whitespace-nowrap px-2 py-1.5 text-left">
                <a
                  href={fgPlayerUrl(h.name, h.fgPlayerId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {h.name}
                </a>
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.PA}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.H}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.HR}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(h.bbPct)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(h.kPct)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtBabip(h.BABIP)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtPct(h.barrelPct)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtInt(h.wRCPlus)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{fmtWar(h.WAR)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Season Pitchers Table
function SeasonPitchersTable({ pitchers }: { pitchers: FangraphsPitcher[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'WAR', sortDir: 'desc' });

  const sorted = useMemo(() => sortData(pitchers, sort.sortKey, sort.sortDir), [pitchers, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
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
          {sorted.map((p, i) => (
            <tr
              key={p.fgPlayerId}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              <td className="whitespace-nowrap px-2 py-1.5 text-left">
                <a
                  href={fgPlayerUrl(p.name, p.fgPlayerId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
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
  );
}

// 7-day hitter row type (derived from useHotColdMLB)
interface SevenDayHitter {
  playerId: number;
  name: string;
  pa: number;
  hits: number;
  hr: number;
  bbPct: number;
  kPct: number;
  BABIP: number;
  WAR: number;
}

function deriveSevenDayHitters(allHitters: HitterStats[]): SevenDayHitter[] {
  return allHitters
    .filter((h) => h.pa > 0)
    .map((h) => {
      // Approximate BB% and K% from game log data
      // The hook gives us wOBA-based stats; we can derive rough BB%/K% from pa and hits
      // Actually the hook doesn't give us BB/K directly, so we show what we can
      return {
        playerId: h.playerId,
        name: h.name,
        pa: h.pa,
        hits: h.hits,
        hr: h.hr,
        // These aren't available from the hook's HitterStats, show 0
        bbPct: 0,
        kPct: 0,
        BABIP: 0,
        WAR: 0,
      };
    });
}

// 7-day Hitters Table
function SevenDayHittersTable({ hitters }: { hitters: SevenDayHitter[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'pa', sortDir: 'desc' });

  const sorted = useMemo(() => sortData(hitters, sort.sortKey, sort.sortDir), [hitters, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
            <SortHeader label="PA" sortKey="pa" currentSort={sort} onSort={handleSort} />
            <SortHeader label="H" sortKey="hits" currentSort={sort} onSort={handleSort} />
            <SortHeader label="HR" sortKey="hr" currentSort={sort} onSort={handleSort} />
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">BB%</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">K%</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">BABIP</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">Barrel%</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">wRC+</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">fWAR</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h, i) => (
            <tr
              key={h.playerId}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              <td className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-gray-800">{h.name}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.pa}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.hits}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{h.hr}</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 7-day Pitchers Table (from useHotColdMLB PitcherStats)
interface SevenDayPitcher {
  playerId: number;
  name: string;
  ip: number;
  fip: number;
  strikeouts: number;
}

function SevenDayPitchersTable({ pitchers }: { pitchers: SevenDayPitcher[] }) {
  const [sort, setSort] = useState<SortState>({ sortKey: 'fip', sortDir: 'asc' });

  const sorted = useMemo(() => sortData(pitchers, sort.sortKey, sort.sortDir), [pitchers, sort]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.sortKey === key
        ? { sortKey: key, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }
        : { sortKey: key, sortDir: 'desc' }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium text-gray-600">Player</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">G</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">GS</th>
            <SortHeader label="IP" sortKey="ip" currentSort={sort} onSort={handleSort} />
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">K%</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">BB%</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">BABIP</th>
            <SortHeader label="FIP" sortKey="fip" currentSort={sort} onSort={handleSort} />
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">Stf</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">Cmd</th>
            <th className="whitespace-nowrap px-2 py-2 text-right text-xs font-medium text-gray-400">fWAR</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr
              key={p.playerId}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              <td className="whitespace-nowrap px-2 py-1.5 text-left font-medium text-gray-800">{p.name}</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{p.ip.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{p.fip.toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
              <td className="px-2 py-1.5 text-right text-gray-400">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SeasonStatsPanel() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const { teamKey } = useTeam();
  const { data: fgData, isLoading: fgLoading, isError: fgError, error: fgErr, refetch: fgRefetch } = useFangraphsData();
  const { hotHitters, coldHitters, hotPitchers, coldPitchers, isLoading: mlbLoading, isError: mlbError, error: mlbErr, refetch: mlbRefetch } = useHotColdMLB(7);

  const isSeason = activeTab === TABS[0];
  const isLoading = isSeason ? fgLoading : mlbLoading;
  const isError = isSeason ? fgError : mlbError;
  const error = isSeason ? fgErr : mlbErr;
  const refetch = isSeason ? fgRefetch : mlbRefetch;

  // Season data
  const teamData = fgData?.teams?.[teamKey];

  // 7-day data: combine hot + cold back into single lists
  const allHitters7d = useMemo(() => [...hotHitters, ...coldHitters], [hotHitters, coldHitters]);
  const allPitchers7d = useMemo(() => [...hotPitchers, ...coldPitchers], [hotPitchers, coldPitchers]);
  const sevenDayHitters = useMemo(() => deriveSevenDayHitters(allHitters7d), [allHitters7d]);
  const sevenDayPitchers = useMemo(
    () => allPitchers7d.map((p) => ({ playerId: p.playerId, name: p.name, ip: p.ip, fip: p.fip, strikeouts: p.strikeouts })),
    [allPitchers7d]
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">MLB 선수 시즌 성적</h2>
      <TabGroup tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

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

        {!isLoading && !isError && isSeason && (
          <>
            {!teamData ? (
              <p className="py-8 text-center text-sm text-gray-500">데이터 수집 중</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">타자</h3>
                  <SeasonHittersTable hitters={teamData.hitters} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">투수</h3>
                  <SeasonPitchersTable pitchers={teamData.pitchers} />
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && !isError && !isSeason && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">타자 (최근 7일)</h3>
              {sevenDayHitters.length > 0 ? (
                <SevenDayHittersTable hitters={sevenDayHitters} />
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">데이터 없음</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">투수 (최근 7일)</h3>
              {sevenDayPitchers.length > 0 ? (
                <SevenDayPitchersTable pitchers={sevenDayPitchers} />
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">데이터 없음</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
