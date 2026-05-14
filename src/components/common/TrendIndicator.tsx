interface TrendIndicatorProps {
  value: number;
}

export function TrendIndicator({ value }: TrendIndicatorProps) {
  if (value > 0) {
    return (
      <span className="text-green-600 font-medium">
        ▲ +{value}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="text-red-600 font-medium">
        ▼ {value}
      </span>
    );
  }

  return (
    <span className="text-gray-500 font-medium">
      — 0
    </span>
  );
}
