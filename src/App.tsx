import { useQueryClient } from '@tanstack/react-query';
import { useTeam } from './context/TeamContext';
import { useStandings } from './hooks/useStandings';
import { TEAMS } from './services/teamConfig';
import { DashboardView } from './components/DashboardView';

function TeamSelector() {
  const { teamKey, setTeamKey } = useTeam();
  const queryClient = useQueryClient();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => queryClient.invalidateQueries()}
        className="rounded-md border border-white/30 bg-white/10 px-2.5 py-1.5 text-sm text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Refresh data"
        title="Refresh all data"
      >
        🔄
      </button>
      <select
        value={teamKey}
        onChange={(e) => setTeamKey(e.target.value)}
        className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Select team"
      >
        {Object.entries(TEAMS).map(([key, t]) => (
          <option key={key} value={key} className="text-gray-900">
            {t.abbreviation} — {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeaderRecord() {
  const { data, isLoading } = useStandings();
  const { team } = useTeam();

  if (isLoading || !data) return null;

  const myTeam = data.find((row) => row.teamAbbr === team.abbreviation);
  if (!myTeam) return null;

  return (
    <span
      className="ml-3 rounded-full px-3 py-0.5 text-sm font-bold"
      style={{ backgroundColor: team.colors.secondary, color: team.colors.primary }}
    >
      {myTeam.W}–{myTeam.L}
    </span>
  );
}

function App() {
  const { team } = useTeam();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header
        className="text-white shadow-md transition-colors duration-300"
        style={{ backgroundColor: team.colors.primary }}
      >
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: team.colors.secondary }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: team.colors.primary }}
                >
                  {team.abbreviation}
                </span>
              </div>
              <div className="flex items-center">
                <div>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {team.name}
                    <HeaderRecord />
                  </h1>
                  <p className="text-xs sm:text-sm" style={{ color: team.colors.secondary }}>
                    Analytics Dashboard
                  </p>
                </div>
              </div>
            </div>
            <TeamSelector />
          </div>
        </div>
      </header>

      {/* Dashboard Content — Card Grid */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardView />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            Data provided by{' '}
            <a href="https://www.mlb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              MLB
            </a>
            ,{' '}
            <a href="https://www.fangraphs.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              FanGraphs
            </a>
            , and{' '}
            <a href="https://baseballsavant.mlb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              Baseball Savant
            </a>
            . This site is not affiliated with or endorsed by Major League Baseball or its clubs.
          </p>
          <p className="mt-1 text-center text-xs text-gray-400">
            MLB data © {new Date().getFullYear()} MLB Advanced Media, L.P. All rights reserved.
            FanGraphs content used under fair use for non-commercial purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
