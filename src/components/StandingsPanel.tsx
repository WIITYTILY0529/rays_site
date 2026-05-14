import { useStandings } from '../hooks/useStandings';
import { useTeam } from '../context/TeamContext';
import { DIVISION_NAMES } from '../services/mlbApi';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import type { StandingsRow } from '../services/types';

function DiffCell({ value }: { value: number }) {
  const formatted = value > 0 ? `+${value}` : `${value}`;
  const colorClass =
    value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  return <span className={colorClass}>{formatted}</span>;
}

function StreakCell({ value }: { value: string }) {
  if (!value || value === '-') return <span className="text-gray-500">-</span>;
  const isWin = value.startsWith('W');
  const colorClass = isWin ? 'text-green-600' : 'text-red-600';
  return <span className={`font-medium ${colorClass}`}>{value}</span>;
}

function StandingsTable({ rows, selectedTeamId }: { rows: StandingsRow[]; selectedTeamId: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="sticky left-0 z-10 bg-white pb-2 pr-3 text-left font-medium">Team</th>
            <th className="pb-2 px-2 text-right font-medium">W</th>
            <th className="pb-2 px-2 text-right font-medium">L</th>
            <th className="pb-2 px-2 text-right font-medium">PCT</th>
            <th className="pb-2 px-2 text-right font-medium">GB</th>
            <th className="pb-2 px-2 text-right font-medium">WCGB</th>
            <th className="pb-2 px-2 text-right font-medium">L10</th>
            <th className="pb-2 px-2 text-right font-medium">STRK</th>
            <th className="pb-2 px-2 text-right font-medium">RS</th>
            <th className="pb-2 px-2 text-right font-medium">RA</th>
            <th className="pb-2 px-2 text-right font-medium">DIFF</th>
            <th className="pb-2 px-2 text-right font-medium whitespace-nowrap">X-W/L</th>
            <th className="pb-2 px-2 text-right font-medium">HOME</th>
            <th className="pb-2 px-2 text-right font-medium">AWAY</th>
            <th className="pb-2 px-2 text-right font-medium whitespace-nowrap">&gt;.500</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = row.teamId === selectedTeamId;
            const rowClass = isSelected
              ? 'font-semibold text-blue-700'
              : 'text-gray-700';

            return (
              <tr
                key={row.teamId}
                className={`border-b border-gray-50 ${rowClass}`}
              >
                <td className="sticky left-0 z-10 bg-white py-2 pr-3 text-left whitespace-nowrap">
                  {row.teamAbbr}
                </td>
                <td className="py-2 px-2 text-right">{row.W}</td>
                <td className="py-2 px-2 text-right">{row.L}</td>
                <td className="py-2 px-2 text-right">{row.PCT}</td>
                <td className="py-2 px-2 text-right">{row.GB}</td>
                <td className="py-2 px-2 text-right">{row.WCGB}</td>
                <td className="py-2 px-2 text-right">{row.L10}</td>
                <td className="py-2 px-2 text-right">
                  <StreakCell value={row.STRK} />
                </td>
                <td className="py-2 px-2 text-right">{row.RS}</td>
                <td className="py-2 px-2 text-right">{row.RA}</td>
                <td className="py-2 px-2 text-right">
                  <DiffCell value={row.DIFF} />
                </td>
                <td className="py-2 px-2 text-right">{row.xWL}</td>
                <td className="py-2 px-2 text-right">{row.HOME}</td>
                <td className="py-2 px-2 text-right">{row.AWAY}</td>
                <td className="py-2 px-2 text-right">{row.vs500}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StandingsPanel() {
  const { data, isLoading, isError, error, refetch } = useStandings();
  const { team } = useTeam();

  const divisionName = DIVISION_NAMES[team.divisionId] ?? 'Division';

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">{divisionName} Standings</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">{divisionName} Standings</h2>
        <ErrorMessage
          message={error?.message ?? 'Failed to load standings data.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{divisionName} Standings</h2>
      <StandingsTable rows={data} selectedTeamId={team.id} />
    </div>
  );
}
