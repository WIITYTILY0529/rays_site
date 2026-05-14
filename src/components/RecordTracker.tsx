import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useRecordTracker } from '../hooks/useRecordTracker';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { TeamStanding } from '../services/types';
import type { GameResult } from '../hooks/useRecordTracker';

const RAYS_NAVY = '#092C5C';
const GRAY_2025 = '#9ca3af';

function formatWinPct(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return '.000';
  return (wins / total).toFixed(3).replace(/^0/, '');
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-gray-400">even</span>;
  const isPositive = value > 0;
  return (
    <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? '+' : ''}{value}
    </span>
  );
}

function StandingsPopover({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">AL East Standings</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500">
            <th className="pb-1 pr-3 text-left">Team</th>
            <th className="pb-1 px-2 text-right">W</th>
            <th className="pb-1 px-2 text-right">L</th>
            <th className="pb-1 px-2 text-right">PCT</th>
            <th className="pb-1 pl-2 text-right">GB</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.teamName}
              className={`border-b border-gray-50 ${
                team.teamName.includes('Tampa Bay') || team.teamName.includes('Rays')
                  ? 'font-semibold text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <td className="py-1 pr-3 text-left whitespace-nowrap">{team.teamName}</td>
              <td className="py-1 px-2 text-right">{team.wins}</td>
              <td className="py-1 px-2 text-right">{team.losses}</td>
              <td className="py-1 px-2 text-right">{team.winPct.toFixed(3).replace(/^0/, '')}</td>
              <td className="py-1 pl-2 text-right">
                {team.gamesBehind === 0 ? '—' : team.gamesBehind.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({
  label,
  value,
  subtext,
  delta,
}: {
  label: string;
  value: string;
  subtext?: string;
  delta?: number;
}) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-lg bg-gray-50 p-4">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="mt-1 text-2xl font-bold text-gray-900">{value}</span>
      {subtext && <span className="mt-0.5 text-xs text-gray-500">{subtext}</span>}
      {delta !== undefined && (
        <div className="mt-1">
          <DeltaBadge value={delta} />
        </div>
      )}
    </div>
  );
}

function HomeAwayPill({
  homeRecord,
  awayRecord,
}: {
  homeRecord: { wins: number; losses: number };
  awayRecord: { wins: number; losses: number };
}) {
  const homeGamesPlayed = homeRecord.wins + homeRecord.losses;
  const awayGamesPlayed = awayRecord.wins + awayRecord.losses;
  const homeRemaining = 81 - homeGamesPlayed;
  const awayRemaining = 81 - awayGamesPlayed;
  const homePct = formatWinPct(homeRecord.wins, homeRecord.losses);
  const awayPct = formatWinPct(awayRecord.wins, awayRecord.losses);

  return (
    <div className="flex items-stretch divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex flex-1 flex-col items-center px-4 py-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Home</span>
        <span className="mt-1 text-lg font-bold text-gray-900">
          {homeRecord.wins}-{homeRecord.losses}
        </span>
        <span className="text-xs text-gray-500">{homePct} · {homeRemaining} remaining</span>
      </div>
      <div className="flex flex-1 flex-col items-center px-4 py-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Away</span>
        <span className="mt-1 text-lg font-bold text-gray-900">
          {awayRecord.wins}-{awayRecord.losses}
        </span>
        <span className="text-xs text-gray-500">{awayPct} · {awayRemaining} remaining</span>
      </div>
    </div>
  );
}

interface ChartDataPoint {
  game: number;
  wins2025?: number;
  wins2026?: number;
}

function buildChartData(games2025: GameResult[], games2026: GameResult[]): ChartDataPoint[] {
  const maxGames = Math.max(games2025.length, games2026.length);
  const data: ChartDataPoint[] = [];

  for (let i = 0; i < maxGames; i++) {
    const point: ChartDataPoint = { game: i + 1 };
    if (i < games2025.length) {
      point.wins2025 = games2025[i].cumulativeWins;
    }
    if (i < games2026.length) {
      point.wins2026 = games2026[i].cumulativeWins;
    }
    data.push(point);
  }

  return data;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-gray-700 mb-1">Game {label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === 'wins2025' ? '2025' : '2026'}: {entry.value} wins
        </p>
      ))}
    </div>
  );
}

export function RecordTracker() {
  const { data, isLoading, isError, error, refetch } = useRecordTracker();
  const [showStandings, setShowStandings] = useState(false);
  const [show2025, setShow2025] = useState(true);
  const [show2026, setShow2026] = useState(true);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Rays: 2025 vs 2026 Record Tracker</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Rays: 2025 vs 2026 Record Tracker</h2>
        <ErrorMessage
          message={error?.message ?? 'Failed to load record tracker data.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  if (!data) return null;

  const {
    season2025Games,
    season2026Games,
    currentRecord2026,
    record2025AtSamePoint,
    homeRecord2026,
    awayRecord2026,
    pythagRecord2026,
    gamesPlayed2026,
  } = data;

  const winDelta = currentRecord2026.wins - record2025AtSamePoint.wins;
  const chartData = buildChartData(season2025Games, season2026Games);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div
        className="relative mb-5"
        onMouseEnter={() => setShowStandings(true)}
        onMouseLeave={() => setShowStandings(false)}
      >
        <h2 className="text-lg font-semibold text-gray-800">
          Rays: 2025 vs 2026 Record Tracker
        </h2>
        <p className="text-xs text-gray-400 mt-0.5 cursor-default">
          AL East standings on hover
        </p>
        {showStandings && data.alEastStandings.length > 0 && (
          <StandingsPopover standings={data.alEastStandings} />
        )}
      </div>

      {/* Stats Row */}
      <div className="mb-5 flex gap-3">
        <StatBox
          label={`2025 Through G${gamesPlayed2026}`}
          value={`${record2025AtSamePoint.wins}-${record2025AtSamePoint.losses}`}
          subtext={formatWinPct(record2025AtSamePoint.wins, record2025AtSamePoint.losses)}
        />
        <StatBox
          label={`2026 Through G${gamesPlayed2026}`}
          value={`${currentRecord2026.wins}-${currentRecord2026.losses}`}
          subtext={formatWinPct(currentRecord2026.wins, currentRecord2026.losses)}
          delta={winDelta}
        />
        <StatBox
          label="2026 Pythag"
          value={`${pythagRecord2026.expectedWins}-${pythagRecord2026.expectedLosses}`}
          subtext={`RD: ${pythagRecord2026.runDiff >= 0 ? '+' : ''}${pythagRecord2026.runDiff} · Luck: ${pythagRecord2026.luck >= 0 ? '+' : ''}${pythagRecord2026.luck}`}
        />
      </div>

      {/* Home/Away Pill */}
      <div className="mb-5">
        <HomeAwayPill homeRecord={homeRecord2026} awayRecord={awayRecord2026} />
      </div>

      {/* Season Progress Chart */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Season Progress</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="game"
                tick={{ fontSize: 11 }}
                label={{ value: 'Games', position: 'insideBottom', offset: -2, fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: 'Wins', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={30} />
              {show2025 && (
                <Line
                  type="monotone"
                  dataKey="wins2025"
                  name="2025"
                  stroke={GRAY_2025}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              )}
              {show2026 && (
                <Line
                  type="monotone"
                  dataKey="wins2026"
                  name="2026"
                  stroke={RAYS_NAVY}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={show2025}
            onChange={(e) => setShow2025(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: GRAY_2025 }} />
          2025
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={show2026}
            onChange={(e) => setShow2026(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: RAYS_NAVY }} />
          2026
        </label>
      </div>
    </div>
  );
}
