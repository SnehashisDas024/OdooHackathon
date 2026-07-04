import { useState } from 'react';
import clsx from 'clsx';

export default function Tabs({ tabs, defaultTab, children, className }) {
  const [active, setActive] = useState(defaultTab || tabs?.[0]?.key);

  return (
    <div className={className}>
      {/* Tab bar */}
      <div
        className="flex gap-3 mb-6 flex-wrap"
        role="tablist"
        aria-label="Page tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={active === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActive(tab.key)}
            className={clsx(
              'px-5 py-2.5 text-sm font-medium rounded-xl transition-all',
              active === tab.key
                ? 'neumorphic-concave text-[--ink-primary]'
                : 'soft-action text-[--ink-muted] hover:text-[--ink-primary]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.key}
          id={`tabpanel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.key}`}
          hidden={active !== tab.key}
        >
          {active === tab.key && children(tab.key)}
        </div>
      ))}
    </div>
  );
}
