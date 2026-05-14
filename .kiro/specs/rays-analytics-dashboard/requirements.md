# 요구사항 문서

## 소개

Tampa Bay Rays 분석 대시보드는 Toronto Blue Jays 대시보드(jays.baby)를 모델로 한 단일 페이지 웹 애플리케이션이다. 이 대시보드는 공개 야구 데이터 API에서 데이터를 가져와 Tampa Bay Rays 팀의 플레이오프 확률, 시즌 기록 비교, 선수 성적(MLB 및 마이너리그), 시즌 종료 예측 페이스, 일정, 그리고 상대팀 스카우팅 정보를 시각적으로 표시한다.

## 용어집

- **Dashboard**: Tampa Bay Rays 분석 대시보드 웹 애플리케이션
- **Playoff_Odds_Panel**: Fangraphs 플레이오프 확률을 표시하는 대시보드 섹션
- **Record_Tracker**: 시즌 간 기록 비교를 표시하는 대시보드 섹션
- **Hot_Cold_MLB_Panel**: MLB 로스터 선수의 최근 성적을 표시하는 대시보드 섹션
- **Hot_Cold_MiLB_Panel**: 마이너리그 산하 팀 선수의 최근 성적을 표시하는 대시보드 섹션
- **Pace_Panel**: 현재 페이스 기반 시즌 종료 예측 통계를 표시하는 대시보드 섹션
- **Schedule_Panel**: 예정된 경기의 선발 투수 및 상대팀 강도를 표시하는 대시보드 섹션
- **Scouting_Panel**: 상대팀 40인 로스터의 최근 성적을 표시하는 대시보드 섹션
- **wOBA**: Weighted On-Base Average, 타자의 공격 기여도를 측정하는 가중 지표
- **FIP**: Fielding Independent Pitching, 수비 영향을 제거한 투수 성적 지표
- **wRC_Plus**: Weighted Runs Created Plus, 리그 평균 대비 타자 생산성 지표 (100 = 리그 평균)
- **ERA**: Earned Run Average, 투수의 9이닝당 자책점
- **OPS**: On-base Plus Slugging, 출루율과 장타율의 합
- **PA**: Plate Appearances, 타석 수
- **IP**: Innings Pitched, 투구 이닝 수
- **Sparkline**: 시간에 따른 추세를 보여주는 소형 인라인 차트
- **Quality_Gate**: 통계적 유의성을 보장하기 위한 최소 표본 크기 기준
- **Trailing_Window**: 현재 날짜로부터 역산한 특정 기간 (예: 7일, 14일, 30일)
- **Linear_Extrapolation**: 현재까지의 비율을 시즌 전체로 확장하는 예측 방법
- **AL_East**: American League East 디비전 (Tampa Bay Rays 소속 디비전)

## 요구사항

### 요구사항 1: 대시보드 애플리케이션 구조

**사용자 스토리:** 사용자로서, 단일 페이지에서 Tampa Bay Rays의 모든 분석 정보를 확인하고 싶다. 이를 통해 여러 사이트를 방문하지 않고도 팀 현황을 종합적으로 파악할 수 있다.

#### 인수 조건

1. THE Dashboard SHALL 단일 페이지 웹 애플리케이션으로 구현되어 페이지 새로고침 없이 모든 섹션을 표시한다
2. THE Dashboard SHALL 다음 7개 섹션을 순서대로 포함한다: Playoff_Odds_Panel, Record_Tracker, Hot_Cold_MLB_Panel, Hot_Cold_MiLB_Panel, Pace_Panel, Schedule_Panel, Scouting_Panel
3. THE Dashboard SHALL 반응형 레이아웃을 제공하여 데스크톱 및 모바일 화면에서 가독성을 유지한다
4. WHEN 데이터 로딩이 진행 중일 때, THE Dashboard SHALL 각 섹션에 로딩 상태 표시기를 표시한다
5. IF 데이터 API 호출이 실패하면, THEN THE Dashboard SHALL 해당 섹션에 오류 메시지를 표시하고 나머지 섹션은 정상적으로 표시한다

### 요구사항 2: Fangraphs 플레이오프 확률

**사용자 스토리:** 사용자로서, Tampa Bay Rays의 현재 플레이오프 진출 확률과 최근 1주간 추세를 확인하고 싶다. 이를 통해 팀의 포스트시즌 전망을 빠르게 파악할 수 있다.

#### 인수 조건

1. THE Playoff_Odds_Panel SHALL Fangraphs 데이터 소스에서 Tampa Bay Rays의 플레이오프 확률을 백분율로 표시한다
2. THE Playoff_Odds_Panel SHALL 1주 전 대비 확률 변동을 양수 또는 음수 추세값으로 표시한다
3. WHEN 추세값이 양수일 때, THE Playoff_Odds_Panel SHALL 추세값을 긍정적 시각 표시(예: 녹색, 상향 화살표)로 렌더링한다
4. WHEN 추세값이 음수일 때, THE Playoff_Odds_Panel SHALL 추세값을 부정적 시각 표시(예: 적색, 하향 화살표)로 렌더링한다

### 요구사항 3: 시즌 기록 비교 트래커

**사용자 스토리:** 사용자로서, 2025년과 2026년 시즌 기록을 비교하고 싶다. 이를 통해 팀의 성장 추이를 파악할 수 있다.

#### 인수 조건

1. THE Record_Tracker SHALL 2025년과 2026년 시즌의 승-패 기록을 동일 경기 수 기준으로 나란히 표시한다
2. THE Record_Tracker SHALL 각 시즌의 승률을 소수점 셋째 자리까지 표시한다
3. WHEN 사용자가 기록 영역에 마우스를 올리면, THE Record_Tracker SHALL AL_East 디비전 순위표를 툴팁 또는 팝오버로 표시한다
4. THE Record_Tracker SHALL AL_East 순위표에 각 팀의 승, 패, 승률, 게임차를 포함한다

### 요구사항 4: MLB 로스터 선수 성적 (Hot and Cold)

**사용자 스토리:** 사용자로서, Tampa Bay Rays MLB 로스터 선수 중 최근 성적이 좋은 선수와 부진한 선수를 빠르게 식별하고 싶다. 이를 통해 현재 팀 전력 상태를 파악할 수 있다.

#### 인수 조건

1. THE Hot_Cold_MLB_Panel SHALL 7일 및 14일 Trailing_Window 탭을 제공한다
2. THE Hot_Cold_MLB_Panel SHALL 타자를 trailing wOBA 기준 내림차순으로 정렬하여 표시한다
3. THE Hot_Cold_MLB_Panel SHALL 투수를 trailing FIP 기준 오름차순으로 정렬하여 표시한다
4. THE Hot_Cold_MLB_Panel SHALL Cold 목록에 타자를 포함할 때 wOBA가 .290 미만인 선수만 포함한다
5. THE Hot_Cold_MLB_Panel SHALL Cold 목록에 투수를 포함할 때 FIP가 3.75 초과인 선수만 포함한다
6. THE Hot_Cold_MLB_Panel SHALL 동일 선수가 Hot 목록과 Cold 목록에 동시에 표시되지 않도록 한다
7. WHEN 7일 탭이 선택되면, THE Hot_Cold_MLB_Panel SHALL 최근 7일간의 성적 데이터를 표시한다
8. WHEN 14일 탭이 선택되면, THE Hot_Cold_MLB_Panel SHALL 최근 14일간의 성적 데이터를 표시한다

### 요구사항 5: 마이너리그 선수 성적 (Hot and Cold)

**사용자 스토리:** 사용자로서, Tampa Bay Rays 마이너리그 산하 팀 선수들의 최근 성적을 확인하고 싶다. 이를 통해 유망주 현황과 콜업 후보를 파악할 수 있다.

#### 인수 조건

1. THE Hot_Cold_MiLB_Panel SHALL 각 산하 팀(affiliate)을 선택할 수 있는 상단 탭을 제공한다
2. WHEN 특정 산하 팀 탭이 선택되면, THE Hot_Cold_MiLB_Panel SHALL 해당 팀 타자를 wOBA 기준 내림차순으로 정렬하여 표시한다
3. WHEN 특정 산하 팀 탭이 선택되면, THE Hot_Cold_MiLB_Panel SHALL 해당 팀 투수를 ERA 기준 오름차순으로 정렬하여 표시한다
4. THE Hot_Cold_MiLB_Panel SHALL 개별 산하 팀 뷰에서는 Cold 목록 Quality_Gate를 적용하지 않는다

### 요구사항 6: 2026 시즌 현재 페이스 예측

**사용자 스토리:** 사용자로서, 선수들의 현재 성적 페이스가 시즌 종료까지 유지될 경우의 예상 최종 통계를 확인하고 싶다. 이를 통해 시즌 목표 달성 가능성을 평가할 수 있다.

#### 인수 조건

1. THE Pace_Panel SHALL 각 선수의 현재까지 누적 통계를 기반으로 162경기 시즌 종료 시점의 예상 통계를 표시한다
2. THE Pace_Panel SHALL Linear_Extrapolation 방법을 사용하여 예측값을 계산한다
3. THE Pace_Panel SHALL 타자의 예상 홈런, 안타, 타점, 도루 등 주요 누적 통계를 포함한다
4. THE Pace_Panel SHALL 투수의 예상 승리, 탈삼진, 이닝 등 주요 누적 통계를 포함한다
5. THE Pace_Panel SHALL 현재까지의 실제 통계와 예측 통계를 함께 표시한다

### 요구사항 7: 일정 및 선발 투수 정보

**사용자 스토리:** 사용자로서, 다가오는 경기의 예상 선발 투수와 상대팀 강도를 확인하고 싶다. 이를 통해 향후 경기 전망을 예측할 수 있다.

#### 인수 조건

1. THE Schedule_Panel SHALL 오늘 경기를 포함하여 향후 10경기의 예상 선발 투수를 표시한다
2. THE Schedule_Panel SHALL 각 선발 투수의 최근 3경기 등판 성적(Last Three)을 표시한다
3. THE Schedule_Panel SHALL 각 상대팀의 시즌 팀 ERA를 표시한다
4. THE Schedule_Panel SHALL 각 상대팀의 시즌 팀 OPS를 표시한다
5. WHEN 선발 투수가 아직 미정인 경우, THE Schedule_Panel SHALL 해당 경기에 "TBD" 표시를 한다

### 요구사항 8: 상대팀 스카우팅 정보

**사용자 스토리:** 사용자로서, 다가오는 상대팀 40인 로스터 선수들의 최근 성적을 다양한 기간별로 분석하고 싶다. 이를 통해 상대팀의 현재 전력을 상세히 파악할 수 있다.

#### 인수 조건

1. THE Scouting_Panel SHALL 7일, 14일, 30일 Trailing_Window에 대한 세 가지 뷰를 제공한다
2. THE Scouting_Panel SHALL Hot/Cold 뷰에서 Hot_Cold_MLB_Panel과 동일한 정렬 및 표시 방식을 적용한다
3. THE Scouting_Panel SHALL 예상 선발 투수를 별표(*)로 표시한다
4. THE Scouting_Panel SHALL 30일 Trailing_Window 뷰에서 타자의 wRC_Plus와 투수의 FIP를 Sparkline과 함께 표시한다
5. WHEN 7일 뷰가 선택되면, THE Scouting_Panel SHALL 최소 10 PA 이상인 타자와 최소 2 IP 이상인 투수만 표시한다
6. WHEN 14일 뷰가 선택되면, THE Scouting_Panel SHALL 최소 15 PA 이상인 타자와 최소 3 IP 이상인 투수만 표시한다
7. WHEN 30일 뷰가 선택되면, THE Scouting_Panel SHALL 최소 30 PA 이상인 타자와 최소 6 IP 이상인 투수만 표시한다

### 요구사항 9: 데이터 소싱 및 갱신

**사용자 스토리:** 사용자로서, 대시보드에 표시되는 데이터가 최신 상태임을 확인하고 싶다. 이를 통해 신뢰할 수 있는 정보를 기반으로 분석할 수 있다.

#### 인수 조건

1. THE Dashboard SHALL 공개 야구 데이터 API(예: MLB Stats API, Fangraphs)에서 데이터를 가져온다
2. THE Dashboard SHALL 각 섹션의 데이터가 마지막으로 갱신된 시간을 표시한다
3. WHEN 사용자가 대시보드를 방문하면, THE Dashboard SHALL 자동으로 최신 데이터를 로드한다
4. IF API 응답 시간이 10초를 초과하면, THEN THE Dashboard SHALL 요청을 타임아웃 처리하고 사용자에게 재시도 옵션을 제공한다
