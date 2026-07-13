import { useState, type ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({ title, children, defaultOpen = true }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!isOpen) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between px-6 py-3 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 rounded-lg"
          aria-expanded={false}
        >
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <span className="text-gray-400 text-sm ml-2">▼</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
        aria-expanded={true}
        aria-label={`Collapse ${title}`}
      >
        ▲
      </button>
      {children}
    </div>
  );
}
