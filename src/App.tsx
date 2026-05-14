import { Component, type ReactNode } from 'react';
import { PlayoffOddsPanel } from './components/PlayoffOddsPanel';
import { RecordTracker } from './components/RecordTracker';
import { HotColdMLBPanel } from './components/HotColdMLBPanel';
import { HotColdMiLBPanel } from './components/HotColdMiLBPanel';
import { PacePanel } from './components/PacePanel';
import { SchedulePanel } from './components/SchedulePanel';
import { ScoutingPanel } from './components/ScoutingPanel';

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
            {this.props.fallbackLabel ?? '패널'} 로딩 오류
          </h3>
          <p className="mt-1 text-sm text-red-600">
            이 섹션을 표시하는 중 오류가 발생했습니다.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-[#092C5C] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8FBCE6]">
              <span className="text-lg font-bold text-[#092C5C]">TB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Tampa Bay Rays
              </h1>
              <p className="text-xs text-[#8FBCE6] sm:text-sm">Analytics Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Row 1: Playoff Odds + Record Tracker side by side on desktop */}
          <PanelErrorBoundary fallbackLabel="플레이오프 확률">
            <PlayoffOddsPanel />
          </PanelErrorBoundary>

          <PanelErrorBoundary fallbackLabel="시즌 기록">
            <RecordTracker />
          </PanelErrorBoundary>

          {/* Row 2: Hot/Cold MLB - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="MLB 선수 성적">
              <HotColdMLBPanel />
            </PanelErrorBoundary>
          </div>

          {/* Row 3: Hot/Cold MiLB - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="마이너리그 선수 성적">
              <HotColdMiLBPanel />
            </PanelErrorBoundary>
          </div>

          {/* Row 4: Pace - full width */}
          <div className="md:col-span-2">
            <PanelErrorBoundary fallbackLabel="페이스 예측">
              <PacePanel />
            </PanelErrorBoundary>
          </div>

          {/* Row 5: Schedule + Scouting side by side on desktop */}
          <PanelErrorBoundary fallbackLabel="일정">
            <SchedulePanel />
          </PanelErrorBoundary>

          <PanelErrorBoundary fallbackLabel="스카우팅">
            <ScoutingPanel />
          </PanelErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
