// 선수 기본 정보
export interface Player {
  id: number;
  fullName: string;
  position: string;
  team: string;
}

// 타자 통계
export interface HitterStats {
  playerId: number;
  name: string;
  position: string;
  pa: number;
  wOBA: number;
  wRCPlus: number;
  ops: number;
  hr: number;
  hits: number;
  rbi: number;
  sb: number;
}

// 투수 통계
export interface PitcherStats {
  playerId: number;
  name: string;
  position: string;
  ip: number;
  fip: number;
  era: number;
  wins: number;
  strikeouts: number;
}

// 시즌 기록
export interface SeasonRecord {
  season: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winPct: number;
}

// 디비전 순위
export interface TeamStanding {
  teamName: string;
  wins: number;
  losses: number;
  winPct: number;
  gamesBehind: number;
}

// 플레이오프 확률
export interface PlayoffOddsData {
  currentOdds: number;
  previousWeekOdds: number;
  trend: number;
}

// 일정 경기 정보
export interface ScheduledGame {
  date: string;
  opponent: string;
  isHome: boolean;
  probablePitcher: ProbablePitcher | null;
  opponentTeamERA: number;
  opponentTeamOPS: number;
}

// 선발 투수 정보
export interface ProbablePitcher {
  name: string;
  lastThreeStarts: PitcherGameLog[];
}

// 투수 경기 기록
export interface PitcherGameLog {
  date: string;
  opponent: string;
  ip: number;
  era: number;
  strikeouts: number;
  result: 'W' | 'L' | 'ND';
}

// 페이스 예측 (타자)
export interface HitterPaceStats {
  player: Player;
  currentStats: { hr: number; hits: number; rbi: number; sb: number; gamesPlayed: number };
  projectedStats: { hr: number; hits: number; rbi: number; sb: number };
}

// 페이스 예측 (투수)
export interface PitcherPaceStats {
  player: Player;
  currentStats: { wins: number; strikeouts: number; ip: number; gamesPlayed: number; gamesStarted?: number };
  projectedStats: { wins: number; strikeouts: number; ip: number };
}

// 스파크라인 데이터 포인트
export interface SparklineDataPoint {
  date: string;
  value: number;
}

// 스카우팅 선수 카드
export interface ScoutingPlayerCard {
  player: Player;
  stat: number;
  sparklineData: SparklineDataPoint[];
  isProbableStarter: boolean;
  colorClass: 'green' | 'red' | 'neutral';
}

// Quality Gate 설정
export interface QualityGate {
  window: 7 | 14 | 30;
  minPA: number;
  minIP: number;
}

// 공통 패널 Props
export interface PanelProps {
  title: string;
  lastUpdated?: Date;
}

// 오류 메시지 Props
export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry: boolean;
}

// Quality Gate 상수
export const QUALITY_GATES: Record<number, QualityGate> = {
  7: { window: 7, minPA: 10, minIP: 2 },
  14: { window: 14, minPA: 15, minIP: 3 },
  30: { window: 30, minPA: 30, minIP: 6 },
};

// Cold 목록 임계값
export const COLD_THRESHOLDS = {
  hitterWOBA: 0.290,
  pitcherFIP: 3.75,
} as const;
