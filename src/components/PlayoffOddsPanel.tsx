import { usePlayoffOdds } from '../hooks/usePlayoffOdds';
import { useTeam } from '../context/TeamContext';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function fmtPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export function PlayoffOddsPanel() {
  const { data, isLoading, isError, error, refetch } = usePlayoffOdds();
  const { team } = useTeam();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Playoff Odds</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Playoff Odds</h2>
        <ErrorMessage
          message={error?.message ?? 'Failed to load data.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Playoff Odds</h2>
        <p className="py-8 text-center text-sm text-gray-500">Data not yet available</p>
      </div>
    );
  }

  const { current, history } = data;

  // Prepare chart data (convert decimal to percentage for display)
  const chartData = history.map((entry) => ({
    date: entry.date,
    playoff: +(entry.playoff * 100).toFixed(1),
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Playoff Odds</h2>

      <div className="flex flex-col items-center gap-2">
        {/* Large current playoff % */}
        <span className="text-5xl font-bold text-gray-900">
          {fmtPct(current.playoff)}
        </span>

        {/* Sub-stats */}
        <div className="mt-2 flex gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold">{fmtPct(current.division)}</div>
            <div className="text-xs text-gray-400">Division</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{fmtPct(current.wildcard)}</div>
            <div className="text-xs text-gray-400">Wild Card</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{fmtPct(current.worldSeries)}</div>
            <div className="text-xs text-gray-400">World Series</div>
          </div>
        </div>
      </div>

      {/* Rolling chart */}
      {chartData.length > 1 && (
        <div className="mt-6 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(val: string) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickFormatter={(val: number) => `${val}%`}
                width={40}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
                      <p className="font-medium text-gray-700">{label}</p>
                      <p className="text-gray-600">{payload[0]?.value}% Playoff</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="playoff"
                stroke={team.colors.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
