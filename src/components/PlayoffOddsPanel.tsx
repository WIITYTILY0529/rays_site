import { usePlayoffOdds } from '../hooks/usePlayoffOdds';
import { TrendIndicator } from './common/TrendIndicator';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';

export function PlayoffOddsPanel() {
  const { data, isLoading, isError, error, refetch } = usePlayoffOdds();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">플레이오프 확률</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">플레이오프 확률</h2>
        <ErrorMessage
          message={error?.message ?? '데이터를 불러오는 중 오류가 발생했습니다.'}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">플레이오프 확률</h2>
      {data && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl font-bold text-gray-900">
            {data.currentOdds}%
          </span>
          <div className="flex items-center gap-2">
            <TrendIndicator value={data.trend} />
            <span className="text-sm text-gray-500">주간 변동</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            마지막 갱신: {new Date().toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}
