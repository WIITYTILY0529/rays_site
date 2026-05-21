/**
 * Displays @Ry_Bass (Ryan Bass) Twitter timeline using X's official
 * syndication iframe. This shows the latest tweets in real-time
 * without needing any scraping or API keys.
 */
export function TwitterFeedPanel() {
  return (
    <div className="space-y-2">
      {/* Profile link header */}
      <a
        href="https://x.com/Ry_Bass"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <strong>Ryan Bass</strong>
        <span className="text-gray-400">@Ry_Bass</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400">Rays Sideline Reporter</span>
      </a>

      {/* X Timeline iframe */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <iframe
          src="https://syndication.twitter.com/srv/timeline-profile/screen-name/Ry_Bass?dnt=true&embedId=twitter-widget-0&frame=false&hideBorder=true&hideFooter=true&hideHeader=true&hideScrollBar=false&lang=en&transparent=true&theme=light"
          className="w-full border-0"
          style={{ height: '500px' }}
          title="@Ry_Bass Twitter Timeline"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>

      {/* Footer link */}
      <p className="text-xs text-gray-400">
        <a
          href="https://x.com/Ry_Bass"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          X에서 더 보기 ↗
        </a>
      </p>
    </div>
  );
}
