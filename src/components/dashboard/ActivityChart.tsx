'use client';

import {
  CartesianGrid,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ReferenceArea,
} from 'recharts';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstFuture = formatted.find((p) => {
    const date = new Date(p.date);
    date.setHours(0, 0, 0, 0);
    return date > today;
  });

  const lastPoint = formatted[formatted.length - 1];

  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart
        data={formatted}
        margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {firstFuture && (
          <ReferenceArea
            x1={firstFuture.label}
            x2={lastPoint.label}
            fill="var(--muted)"
            fillOpacity={0.5}
          />
        )}
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
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          fillOpacity={0.8}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
