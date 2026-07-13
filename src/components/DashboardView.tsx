import { useState, type ReactNode, Component } from 'react';
import { DashboardCard } from './common/DashboardCard';
import { PlayoffOddsPanel } from './PlayoffOddsPanel';
import { RecordTracker } from './RecordTracker';
import { TeamRankingsPanel } from './TeamRankingsPanel';
import { StandingsPanel } from './StandingsPanel';
import { SeasonStatsPanel } from './SeasonStatsPanel';
import { MiLBNotablePanel } from './MiLBNotablePanel';
import { PacePanel } from './PacePanel';
import { SchedulePanel } from './SchedulePanel';
import { ScoutingPanel } from './ScoutingPanel';
import { HotColdMLBPanel } from './HotColdMLBPanel';
import { HotColdMiLBPanel } from './HotColdMiLBPanel';
import { TwitterFeedPanel } from './TwitterFeedPanel';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class PanelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
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

// --- Card Definitions ---
export interface CardDefinition {
  id: string;
  title: string;
  icon: string;
  summary: string;
  component: ReactNode;
}

function useCardDefinitions(): CardDefinition[] {
  return [
    {
      id: 'playoff-odds',
      title: 'Playoff Odds',
      icon: '🎯',
      summary: 'Division, Wild Card, and World Series probabilities',
      component: <PlayoffOddsPanel />,
    },
    {
      id: 'record-tracker',
      title: 'Record Tracker',
      icon: '📊',
      summary: 'Year-over-year record comparison and Pythagorean W-L',
      component: <RecordTracker />,
    },
    {
      id: 'standings',
      title: 'Standings',
      icon: '🏆',
      summary: 'Full division standings with advanced splits',
      component: <StandingsPanel />,
    },
    {
      id: 'team-rankings',
      title: 'Team Rankings',
      icon: '📈',
      summary: 'MLB-wide team stat rankings',
      component: <TeamRankingsPanel />,
    },
    {
      id: 'season-stats',
      title: 'Season Stats',
      icon: '⚾',
      summary: 'Hitter and pitcher season statistics',
      component: <SeasonStatsPanel />,
    },
    {
      id: 'pace',
      title: 'Pace Projections',
      icon: '🚀',
      summary: '162-game pace projections for key players',
      component: <PacePanel />,
    },
    {
      id: 'hot-cold-mlb',
      title: 'Hot/Cold (MLB)',
      icon: '🔥',
      summary: 'Recent hot and cold streaks for MLB roster',
      component: <HotColdMLBPanel />,
    },
    {
      id: 'hot-cold-milb',
      title: 'Hot/Cold (MiLB)',
      icon: '🌡️',
      summary: 'Minor league hot and cold performers',
      component: <HotColdMiLBPanel />,
    },
    {
      id: 'milb-notable',
      title: 'MiLB Notable',
      icon: '⭐',
      summary: 'Top minor league prospects and performers',
      component: <MiLBNotablePanel />,
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: '📅',
      summary: 'Upcoming games and probable pitchers',
      component: <SchedulePanel />,
    },
    {
      id: 'scouting',
      title: 'Opponent Scouting',
      icon: '🔍',
      summary: 'Opponent strengths and weaknesses',
      component: <ScoutingPanel />,
    },
    {
      id: 'twitter-feed',
      title: 'Sideline Updates',
      icon: '📡',
      summary: 'Latest news and beat reporter updates',
      component: <TwitterFeedPanel />,
    },
  ];
}

// --- Detail View (full-screen panel) ---
function DetailView({ card, onBack }: { card: CardDefinition; onBack: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-200">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <span aria-hidden="true">←</span>
        Back
      </button>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">{card.icon}</span>
          <h2 className="text-xl font-bold text-gray-800">{card.title}</h2>
        </div>
        <PanelErrorBoundary fallbackLabel={card.title}>
          {card.component}
        </PanelErrorBoundary>
      </div>
    </div>
  );
}

// --- Main Dashboard View ---
export function DashboardView() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const cards = useCardDefinitions();

  const activeCard = cards.find((c) => c.id === activeCardId);

  // Handle browser back button
  // Using a simple state approach — could be extended with URL hash routing later

  if (activeCard) {
    return <DetailView card={activeCard} onBack={() => setActiveCardId(null)} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <DashboardCard
          key={card.id}
          title={card.title}
          icon={card.icon}
          summary={card.summary}
          onClick={() => setActiveCardId(card.id)}
        />
      ))}
    </div>
  );
}
