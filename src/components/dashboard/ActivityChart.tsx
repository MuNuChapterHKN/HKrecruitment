'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { ActivityPoint } from '@/lib/services/dashboard';

type ActivityChartProps = {
  activity: ActivityPoint[];
};

const chartConfig = {
  count: {
    label: 'Applicants',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export function ActivityChart({ activity }: ActivityChartProps) {
  if (activity.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No activity data yet.</p>
      </div>
    );
  }

  const formatted = activity.map((p) => ({
    date: p.date,
    count: p.count,
    label: new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(p.date)),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <LineChart
        data={formatted}
        margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent labelKey="label" indicator="dot" />}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
