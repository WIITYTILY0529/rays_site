interface TabGroupProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
  return (
    <div role="tablist" className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={tab === activeTab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
            tab === activeTab
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
