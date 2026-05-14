# 구현 계획: Tampa Bay Rays 분석 대시보드

## 개요

React + TypeScript + Vite 기반의 단일 페이지 분석 대시보드를 구현한다. TanStack Query로 데이터 페칭을 관리하고, Tailwind CSS로 반응형 레이아웃을 구성하며, Recharts로 Sparkline 차트를 렌더링한다. 7개 패널(PlayoffOdds, RecordTracker, HotColdMLB, HotColdMiLB, Pace, Schedule, Scouting)을 순차적으로 구현하고, fast-check 속성 기반 테스트와 Vitest 단위 테스트로 정확성을 검증한다.

## Tasks

- [x] 1. 프로젝트 초기 설정 및 공통 인프라 구성
  - [x] 1.1 Vite + React + TypeScript 프로젝트 생성 및 의존성 설치
    - `npm create vite@latest` 으로 React + TypeScript 템플릿 생성
    - TanStack Query, Tailwind CSS, Recharts, fast-check, Vitest, React Testing Library 설치
    - `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts` 설정
    - _Requirements: 1.1_

  - [x] 1.2 디렉토리 구조 및 공통 타입 정의
    - `src/components/common/`, `src/hooks/`, `src/services/`, `src/utils/`, `src/__tests__/` 디렉토리 생성
    - `src/services/types.ts`에 모든 데이터 모델 인터페이스 정의 (Player, HitterStats, PitcherStats, SeasonRecord, TeamStanding, PlayoffOddsData, ScheduledGame, ProbablePitcher, PitcherGameLog, HitterPaceStats, PitcherPaceStats, SparklineDataPoint, ScoutingPlayerCard, QualityGate 등)
    - QUALITY_GATES 상수 및 COLD_THRESHOLDS 상수 정의
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 공통 UI 컴포넌트 구현
    - `LoadingSpinner.tsx`: 로딩 상태 표시기 컴포넌트
    - `ErrorMessage.tsx`: 오류 메시지 및 재시도 버튼 컴포넌트
    - `TrendIndicator.tsx`: 양수(녹색/상향)/음수(적색/하향)/중립 추세 표시 컴포넌트
    - `TabGroup.tsx`: 재사용 가능한 탭 전환 컴포넌트
    - `Sparkline.tsx`: Recharts 기반 소형 인라인 차트 컴포넌트
    - _Requirements: 1.4, 1.5, 2.3, 2.4_

  - [x] 1.4 TanStack Query 프로바이더 및 글로벌 설정
    - QueryClient 생성 (staleTime: 5분, retry: 3, retryDelay: 지수 백오프, timeout: 10초)
    - App 컴포넌트에 QueryClientProvider 래핑
    - _Requirements: 9.1, 9.3, 9.4_

- [x] 2. 유틸리티 함수 구현
  - [x] 2.1 `src/utils/stats.ts` 구현
    - `calculateWinPct(wins, losses)`: 승률 계산 (소수점 셋째 자리 반올림)
    - `calculateTrend(current, previous)`: 추세값 계산 (current - previous)
    - _Requirements: 2.2, 3.2_

  - [ ]* 2.2 속성 테스트: 추세값 계산 정확성
    - **Property 1: 추세값 계산 정확성**
    - fast-check으로 임의의 두 확률값(0-100)에 대해 trend === current - previous 검증
    - **Validates: Requirements 2.2**

  - [ ]* 2.3 속성 테스트: 승률 계산 정확성
    - **Property 3: 승률 계산 정확성**
    - fast-check으로 임의의 유효한 승-패 기록에 대해 승률 === wins/(wins+losses) 반올림 검증
    - **Validates: Requirements 3.2**

  - [x] 2.4 `src/utils/sorting.ts` 구현
    - `sortHittersByWOBA(hitters)`: wOBA 기준 내림차순 정렬
    - `sortPitchersByFIP(pitchers)`: FIP 기준 오름차순 정렬
    - `sortPitchersByERA(pitchers)`: ERA 기준 오름차순 정렬
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 8.2_

  - [ ]* 2.5 속성 테스트: 타자 wOBA 내림차순 정렬
    - **Property 4: 타자 wOBA 내림차순 정렬**
    - fast-check으로 임의의 타자 목록에 대해 정렬 결과가 내림차순인지 검증
    - **Validates: Requirements 4.2, 5.2, 8.2**

  - [ ]* 2.6 속성 테스트: 투수 성적 오름차순 정렬
    - **Property 5: 투수 성적 오름차순 정렬**
    - fast-check으로 임의의 투수 목록에 대해 FIP/ERA 정렬 결과가 오름차순인지 검증
    - **Validates: Requirements 4.3, 5.3**

  - [x] 2.7 `src/utils/filtering.ts` 구현
    - `filterColdHitters(hitters)`: wOBA < 0.290 필터링
    - `filterColdPitchers(pitchers)`: FIP > 3.75 필터링
    - `ensureMutualExclusion(hotList, coldList)`: Hot/Cold 상호 배타성 보장
    - `applyQualityGate(players, window)`: Quality Gate 최소 표본 크기 필터링
    - _Requirements: 4.4, 4.5, 4.6, 8.5, 8.6, 8.7_

  - [ ]* 2.8 속성 테스트: Cold 목록 임계값 필터링
    - **Property 6: Cold 목록 임계값 필터링**
    - fast-check으로 Cold 목록의 모든 타자가 wOBA < 0.290, 모든 투수가 FIP > 3.75인지 검증
    - **Validates: Requirements 4.4, 4.5**

  - [ ]* 2.9 속성 테스트: Hot/Cold 목록 상호 배타성
    - **Property 7: Hot/Cold 목록 상호 배타성**
    - fast-check으로 Hot 목록과 Cold 목록의 교집합이 공집합인지 검증
    - **Validates: Requirements 4.6**

  - [ ]* 2.10 속성 테스트: Quality Gate 필터링
    - **Property 9: Quality Gate 필터링**
    - fast-check으로 각 window별 표시 선수가 최소 PA/IP 기준을 충족하는지 검증
    - **Validates: Requirements 8.5, 8.6, 8.7**

  - [x] 2.11 `src/utils/extrapolation.ts` 구현
    - `extrapolateToFullSeason(currentStat, gamesPlayed, totalGames = 162)`: 선형 외삽 계산
    - 타자 및 투수 페이스 예측 함수
    - _Requirements: 6.1, 6.2_

  - [ ]* 2.12 속성 테스트: 선형 외삽 계산 정확성
    - **Property 8: 선형 외삽 계산 정확성**
    - fast-check으로 임의의 유효한 통계와 경기 수에 대해 예측값 === stat × (162 / gamesPlayed) 검증
    - **Validates: Requirements 6.1, 6.2**

- [x] 3. 체크포인트 - 유틸리티 함수 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 4. API 서비스 레이어 구현
  - [x] 4.1 `src/services/mlbApi.ts` 구현
    - MLB Stats API 기본 URL 및 fetch 래퍼 구현
    - `getTeamRoster()`: 팀 로스터 조회
    - `getTeamSchedule()`: 팀 일정 조회
    - `getStandings()`: 디비전 순위 조회
    - `getPlayerStats()`: 선수 시즌 통계 조회
    - `getGameLog()`: 선수 경기별 기록 조회
    - 10초 타임아웃 및 오류 처리 로직 포함
    - _Requirements: 9.1, 9.4_

  - [x] 4.2 `src/services/fangraphsApi.ts` 구현
    - Fangraphs 데이터 소스 연결 및 파싱
    - `getPlayoffOdds()`: 플레이오프 확률 데이터 조회
    - `getLeaderboard()`: 리더보드 데이터 조회
    - 10초 타임아웃 및 오류 처리 로직 포함
    - _Requirements: 2.1, 9.1, 9.4_

- [x] 5. 데이터 페칭 훅 및 패널 구현 (1부: PlayoffOdds, RecordTracker)
  - [x] 5.1 `src/hooks/usePlayoffOdds.ts` 훅 구현
    - TanStack Query `useQuery`로 Fangraphs 플레이오프 확률 데이터 페칭
    - 추세값 계산 로직 통합
    - 로딩/에러/성공 상태 반환
    - _Requirements: 2.1, 2.2, 9.3_

  - [x] 5.2 `src/components/PlayoffOddsPanel.tsx` 구현
    - 플레이오프 확률 백분율 표시
    - TrendIndicator 컴포넌트로 1주 전 대비 변동 표시
    - 마지막 갱신 시간 표시
    - 로딩/에러 상태 처리
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.2_

  - [ ]* 5.3 속성 테스트: 추세 표시기 렌더링 정확성
    - **Property 2: 추세 표시기 렌더링 정확성**
    - fast-check으로 양수→녹색/상향, 음수→적색/하향, 0→중립 렌더링 검증
    - **Validates: Requirements 2.3, 2.4**

  - [x] 5.4 `src/hooks/useRecordTracker.ts` 훅 구현
    - TanStack Query로 2025/2026 시즌 기록 및 AL East 순위 데이터 페칭
    - 승률 계산 로직 통합
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.5 `src/components/RecordTracker.tsx` 구현
    - 2025/2026 시즌 승-패 기록 나란히 표시
    - 승률 소수점 셋째 자리 표시
    - 마우스 호버 시 AL East 순위표 팝오버 표시 (승, 패, 승률, 게임차)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.6 속성 테스트: 순위표 데이터 완전성
    - **Property 12: 순위표 데이터 완전성**
    - fast-check으로 렌더링된 순위표에 각 팀의 승, 패, 승률, 게임차가 모두 포함되는지 검증
    - **Validates: Requirements 3.4**

- [x] 6. 데이터 페칭 훅 및 패널 구현 (2부: HotColdMLB, HotColdMiLB)
  - [x] 6.1 `src/hooks/useHotColdMLB.ts` 훅 구현
    - TanStack Query로 MLB 로스터 선수 최근 성적 데이터 페칭
    - 7일/14일 trailing window 지원
    - sorting, filtering 유틸리티 통합
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.2 `src/components/HotColdMLBPanel.tsx` 구현
    - 7일/14일 탭 전환 UI
    - Hot 타자 목록 (wOBA 내림차순)
    - Cold 타자 목록 (wOBA < 0.290 필터링)
    - Hot 투수 목록 (FIP 오름차순)
    - Cold 투수 목록 (FIP > 3.75 필터링)
    - Hot/Cold 상호 배타성 보장
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 6.3 `src/hooks/useHotColdMiLB.ts` 훅 구현
    - TanStack Query로 마이너리그 산하 팀 선수 성적 데이터 페칭
    - 산하 팀별 데이터 분리
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.4 `src/components/HotColdMiLBPanel.tsx` 구현
    - 산하 팀 선택 탭 UI
    - 타자 wOBA 내림차순 정렬 표시
    - 투수 ERA 오름차순 정렬 표시
    - Quality Gate 미적용 (개별 산하 팀 뷰)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. 데이터 페칭 훅 및 패널 구현 (3부: Pace, Schedule, Scouting)
  - [x] 7.1 `src/hooks/usePace.ts` 훅 구현
    - TanStack Query로 선수 현재 시즌 누적 통계 페칭
    - extrapolation 유틸리티 통합
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 `src/components/PacePanel.tsx` 구현
    - 타자 예상 홈런, 안타, 타점, 도루 표시
    - 투수 예상 승리, 탈삼진, 이닝 표시
    - 현재 실제 통계와 예측 통계 함께 표시
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.3 `src/hooks/useSchedule.ts` 훅 구현
    - TanStack Query로 향후 10경기 일정 및 선발 투수 데이터 페칭
    - 선발 투수 최근 3경기 성적 조회
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.4 `src/components/SchedulePanel.tsx` 구현
    - 향후 10경기 목록 표시
    - 각 경기 선발 투수 및 최근 3경기 성적 표시
    - 상대팀 시즌 ERA 및 OPS 표시
    - 미정 선발 투수 "TBD" 표시
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 7.5 속성 테스트: 미정 선발 투수 TBD 표시
    - **Property 11: 미정 선발 투수 TBD 표시**
    - fast-check으로 probablePitcher가 null인 경기에 "TBD"가 표시되는지 검증
    - **Validates: Requirements 7.5**

  - [x] 7.6 `src/hooks/useScouting.ts` 훅 구현
    - TanStack Query로 상대팀 40인 로스터 성적 데이터 페칭
    - 7일/14일/30일 trailing window 지원
    - Quality Gate 필터링 적용
    - _Requirements: 8.1, 8.5, 8.6, 8.7_

  - [x] 7.7 `src/components/ScoutingPanel.tsx` 구현
    - 7일/14일/30일 뷰 탭 전환
    - Hot/Cold 정렬 및 표시 (HotColdMLBPanel과 동일 방식)
    - 예상 선발 투수 별표(*) 표시
    - 30일 뷰에서 wRC+ 및 FIP Sparkline 차트 표시
    - Quality Gate 기준 적용 (7일: 10PA/2IP, 14일: 15PA/3IP, 30일: 30PA/6IP)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 7.8 속성 테스트: 예상 선발 투수 별표 표시
    - **Property 10: 예상 선발 투수 별표 표시**
    - fast-check으로 isProbableStarter가 true인 선수에 별표(*)가 포함되는지 검증
    - **Validates: Requirements 8.3**

- [x] 8. 체크포인트 - 패널 구현 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 9. 대시보드 통합 및 레이아웃 완성
  - [x] 9.1 `src/App.tsx` 대시보드 레이아웃 구성
    - 7개 패널을 순서대로 배치 (PlayoffOdds → RecordTracker → HotColdMLB → HotColdMiLB → Pace → Schedule → Scouting)
    - 반응형 레이아웃 (Tailwind CSS 그리드/플렉스)
    - 각 패널에 React Error Boundary 적용
    - 대시보드 헤더 및 Tampa Bay Rays 브랜딩
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 9.2 반응형 디자인 및 모바일 최적화
    - 데스크톱: 다단 레이아웃
    - 모바일: 단일 컬럼 스택 레이아웃
    - 터치 친화적 탭 및 인터랙션
    - _Requirements: 1.3_

  - [ ]* 9.3 단위 테스트: 대시보드 통합 렌더링
    - 모든 7개 패널이 정상 렌더링되는지 확인
    - 개별 패널 오류 시 나머지 패널 정상 표시 확인
    - 로딩 상태 표시기 확인
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 10. 최종 체크포인트 - 전체 통합 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

## 참고 사항

- `*` 표시된 태스크는 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있다
- 각 태스크는 추적 가능성을 위해 특정 요구사항을 참조한다
- 체크포인트는 점진적 검증을 보장한다
- 속성 테스트는 보편적 정확성 속성을 검증한다
- 단위 테스트는 특정 예시 및 엣지 케이스를 검증한다
