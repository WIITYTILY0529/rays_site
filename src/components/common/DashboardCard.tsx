import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon: string;
  summary?: string;
  onClick: () => void;
  children?: ReactNode;
}

export function DashboardCard({ title, icon, summary, onClick }: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98] text-left focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {summary && (
        <p className="text-xs text-gray-500 line-clamp-2">{summary}</p>
      )}
    </button>
  );
}
