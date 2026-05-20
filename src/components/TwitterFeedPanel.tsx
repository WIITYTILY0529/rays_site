import { useEffect, useState } from 'react';

interface TweetData {
  text: string;
  timestamp: string;
  url: string;
  metrics: {
    replies?: string;
    retweets?: string;
    likes?: string;
  };
  isRetweet: boolean;
  media: string[];
}

interface TwitterFeedData {
  lastUpdated: string;
  user: {
    name: string;
    handle: string;
    description: string;
    profileUrl: string;
  };
  tweets: TweetData[];
}

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TweetCard({ tweet }: { tweet: TweetData }) {
  return (
    <a
      href={tweet.url || `https://x.com/Ry_Bass`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-100 bg-white p-3 transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900">
          <span className="text-xs font-bold text-white">RB</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-semibold text-gray-900 truncate">Ryan Bass</span>
            <svg viewBox="0 0 22 22" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-blue-500">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.634-.131 1.22-.434 1.69-.88.445-.47.75-1.055.88-1.69.131-.634.084-1.292-.139-1.899.584-.274 1.083-.705 1.438-1.244.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
            <span className="text-gray-400">@Ry_Bass</span>
            {tweet.timestamp && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">{formatRelativeTime(tweet.timestamp)}</span>
              </>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 line-clamp-4">
            {tweet.text}
          </p>
          {tweet.media.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
              {tweet.media.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-20 w-full rounded object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {/* Engagement metrics */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            {tweet.metrics.replies && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {tweet.metrics.replies}
              </span>
            )}
            {tweet.metrics.retweets && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {tweet.metrics.retweets}
              </span>
            )}
            {tweet.metrics.likes && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {tweet.metrics.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export function TwitterFeedPanel() {
  const [data, setData] = useState<TwitterFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/twitter-feed.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((json: TwitterFeedData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  if (error || !data) {
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
          트윗 데이터가 아직 수집되지 않았습니다. 다음 스케줄 실행 후 표시됩니다.
        </p>
      </div>
    );
  }

  const userHandle = data.user.handle;

  return (
    <div className="space-y-3">
      {/* Profile header */}
      <a
        href={data.user.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <strong>{data.user.name}</strong>
        <span className="text-gray-400">@{userHandle}</span>
      </a>

      {/* Tweet list */}
      <div className="space-y-2">
        {data.tweets.map((tweet, i) => (
          <TweetCard key={i} tweet={tweet} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Updated: {new Date(data.lastUpdated).toLocaleDateString('ko-KR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </span>
        <a
          href={data.user.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          X에서 더 보기 ↗
        </a>
      </div>
    </div>
  );
}
