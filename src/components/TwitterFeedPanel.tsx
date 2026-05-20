import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTimeline: (
          source: { sourceType: string; screenName: string },
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
      ready: (cb: () => void) => void;
    };
  }
}

/**
 * Embeds the @Ry_Bass (Ryan Bass) Twitter timeline using the official widget.
 * Falls back to a direct link card if the widget fails to load.
 */
export function TwitterFeedPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetFailed, setWidgetFailed] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const createWidget = () => {
      if (!containerRef.current || !window.twttr) return;

      // Clear any previous content
      containerRef.current.innerHTML = '';

      window.twttr.widgets
        .createTimeline(
          { sourceType: 'profile', screenName: 'Ry_Bass' },
          containerRef.current,
          {
            height: 560,
            chrome: 'noheader nofooter',
            dnt: true,
            tweetLimit: 5,
          }
        )
        .then((el) => {
          if (!el) setWidgetFailed(true);
        })
        .catch(() => {
          setWidgetFailed(true);
        });
    };

    // Set a timeout — if widget doesn't load in 8s, show fallback
    timeout = setTimeout(() => {
      if (containerRef.current && containerRef.current.children.length === 0) {
        setWidgetFailed(true);
      }
    }, 8000);

    // Load the Twitter widget script
    if (window.twttr && window.twttr.widgets) {
      createWidget();
    } else {
      const existingScript = document.getElementById('twitter-wjs');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = () => {
          if (window.twttr) {
            window.twttr.ready(createWidget);
          }
        };
        script.onerror = () => setWidgetFailed(true);
        document.head.appendChild(script);
      } else {
        // Script exists but twttr not ready yet
        const check = setInterval(() => {
          if (window.twttr && window.twttr.widgets) {
            clearInterval(check);
            createWidget();
          }
        }, 500);
        setTimeout(() => clearInterval(check), 10000);
      }
    }

    return () => clearTimeout(timeout);
  }, []);

  // Fallback: direct link card to the profile
  if (widgetFailed) {
    return (
      <div className="space-y-3">
        <a
          href="https://x.com/Ry_Bass"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black">
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">Ryan Bass</p>
            <p className="text-sm text-gray-500">@Ry_Bass</p>
            <p className="mt-0.5 text-xs text-gray-400">Rays Sideline Reporter • MLB TV</p>
          </div>
          <svg className="ml-auto h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <p className="text-center text-xs text-gray-400">
          X 타임라인 위젯을 로드할 수 없습니다. 위 링크를 클릭해 직접 확인하세요.
        </p>
      </div>
    );
  }

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

      <div
        ref={containerRef}
        className="min-h-[200px] overflow-hidden rounded-lg border border-gray-200"
      />

      <p className="text-xs text-gray-400">
        <a
          href="https://x.com/Ry_Bass"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          X에서 직접 보기 ↗
        </a>
      </p>
    </div>
  );
}
