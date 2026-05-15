import { Component, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTeam } from './context/TeamContext';
import { TEAMS } from './services/teamConfig';
import { PlayoffOddsPanel } from './components/PlayoffOddsPanel';
import { RecordTracker } from './components/RecordTracker';
import { StandingsPanel } from './components/StandingsPanel';
import { SeasonStatsPanel } from './components/SeasonStatsPanel';
import { MiLBNotablePanel } from './components/MiLBNotablePanel';
import { PacePanel } from './components/PacePanel';
import { SchedulePanel } from './components/SchedulePanel';
import { ScoutingPanel } from './components/ScoutingPanel';
import { CollapsiblePanel } from './components/common/CollapsiblePanel';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PanelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="text-sm font-semibold text-red-700">
            {this.props.fallbackLabel ?? 'Panel'} Loading Error
          </h3>
          <p className="mt-1 text-sm text-red-600">
            An error occurred while loading this section.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

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

function App() {
  const { team } = useTeam();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header
        className="text-white shadow-md transition-colors duration-300"
        style={{ backgroundColor: team.colors.primary }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {team.name}
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: team.colors.secondary }}>
                  Analytics Dashboard
                </p>
              </div>
            </div>
            <TeamSelector />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Row 1: Playoff Odds - full width with graph */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="Playoff Odds">
              <CollapsiblePanel title="Playoff Odds">
                <PlayoffOddsPanel />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 2: Record Tracker */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="Record Tracker">
              <CollapsiblePanel title="Record Tracker">
                <RecordTracker />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 2.5: Standings - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="Standings">
              <CollapsiblePanel title="Standings">
                <StandingsPanel />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 3: Season Stats MLB - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="MLB Stats">
              <CollapsiblePanel title="MLB Season Stats">
                <SeasonStatsPanel />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 3: MiLB Notable Players - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="MiLB Stats">
              <CollapsiblePanel title="MiLB Notable Players">
                <MiLBNotablePanel />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 4: Pace - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="Pace Projections">
              <CollapsiblePanel title="2026 Season Pace Projections">
                <PacePanel />
              </CollapsiblePanel>
            </PanelErrorBoundary>
          </div>

          {/* Row 5: Schedule + Scouting side by side on desktop */}
          <PanelErrorBoundary fallbackLabel="Schedule">
            <CollapsiblePanel title="Schedule &amp; Probable Pitchers">
              <SchedulePanel />
            </CollapsiblePanel>
          </PanelErrorBoundary>

          <PanelErrorBoundary fallbackLabel="Scouting">
            <CollapsiblePanel title="Opponent Scouting">
              <ScoutingPanel />
            </CollapsiblePanel>
          </PanelErrorBoundary>
        </div>
      </main>

      {/* Footer — Data Attribution */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
