"use client";

import LineChart, { Line } from "@/components/charts/line-chart";
import Grid from "@/components/charts/grid";
import XAxis from "@/components/charts/x-axis";
import ChartTooltip from "@/components/charts/tooltip/chart-tooltip";
import { chartCssVars } from "@/components/charts/chart-context";
import { trendData } from "@/lib/weather-data";

export function ReportsTrendChart() {
  return (
    <LineChart
      data={trendData}
      aspectRatio="2.8 / 1"
      animationDuration={1100}
      margin={{ top: 18, right: 24, bottom: 34, left: 18 }}
    >
      <Grid horizontal numTicksRows={4} />
      <Line
        dataKey="reports"
        stroke={chartCssVars.lineSecondary}
        strokeWidth={2}
        fadeEdges={false}
      />
      <Line
        dataKey="verified"
        stroke={chartCssVars.linePrimary}
        strokeWidth={3}
        showMarkers
        fadeEdges={false}
      />
      <XAxis numTicks={6} />
      <ChartTooltip showDatePill showDots />
    </LineChart>
  );
}
