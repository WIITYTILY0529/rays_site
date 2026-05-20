import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTimeline: (
          source: { sourceType: string; screenName: string },
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

/**
 * Embeds the @Ry_Bass (Ryan Bass) Twitter timeline.
 * Ryan Bass is the Rays sideline reporter on MLB TV.
 */
export function TwitterFeedPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadWidget = () => {
      if (window.twttr && containerRef.current) {
        window.twttr.widgets.load(containerRef.current);
      }
    };

    if (!scriptLoaded.current) {
      // Check if script already exists in DOM
      if (!document.getElementById('twitter-wjs')) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = loadWidget;
        document.head.appendChild(script);
      } else {
        loadWidget();
      }
      scriptLoaded.current = true;
    } else {
      loadWidget();
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="inline-block h-5 w-5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
        <span>
          <strong>Ryan Bass</strong> (@Ry_Bass) — Rays Sideline Reporter
        </span>
      </div>

      <div ref={containerRef} className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200">
        <a
          className="twitter-timeline"
          data-height="560"
          data-theme="light"
          data-chrome="noheader nofooter noborders"
          href="https://twitter.com/Ry_Bass"
        >
          Loading tweets by @Ry_Bass...
        </a>
      </div>

      <p className="text-xs text-gray-400">
        Sideline updates from{' '}
        <a
          href="https://x.com/Ry_Bass"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          @Ry_Bass
        </a>
      </p>
    </div>
  );
}
