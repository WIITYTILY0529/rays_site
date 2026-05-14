import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#8884d8', width = 100, height = 30 }: SparklineProps) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
