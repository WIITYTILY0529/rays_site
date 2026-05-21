/**
 * Displays a link card to @Ry_Bass (Ryan Bass) Twitter profile.
 * X rate-limits and blocks iframe/widget embeds, so we show a clean
 * profile card with a direct link instead.
 */
export function TwitterFeedPanel() {
  return (
    <div className="space-y-3">
      <a
        href="https://x.com/Ry_Bass"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black">
          <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">Ryan Bass</p>
          <p className="text-sm text-gray-500">@Ry_Bass</p>
          <p className="mt-0.5 text-xs text-gray-400">Rays Sideline Reporter · MLB TV · NewsNation</p>
        </div>
        <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      <a
        href="https://x.com/RaysBaseball"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#092C5C]">
          <span className="text-sm font-bold text-white">TB</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">Tampa Bay Rays</p>
          <p className="text-sm text-gray-500">@RaysBaseball</p>
          <p className="mt-0.5 text-xs text-gray-400">Official Team Account</p>
        </div>
        <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
