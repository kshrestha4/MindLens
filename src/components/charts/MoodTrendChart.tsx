"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface CheckInPoint {
  createdAt: string | Date;
  mood: number;
  stress: number;
  energy: number;
  sleepQuality: number;
}

interface MoodTrendChartProps {
  data: CheckInPoint[];
  days?: 7 | 14 | 30;
}

export default function MoodTrendChart({ data, days = 14 }: MoodTrendChartProps) {
  const chartData = data
    .slice(-days)
    .map((c) => ({
      date: format(new Date(c.createdAt), "MMM d"),
      Mood: c.mood,
      Stress: c.stress,
      Energy: c.energy,
      Sleep: c.sleepQuality,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No check-in data yet. Complete your first check-in to see trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Line type="monotone" dataKey="Mood" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Stress" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Energy" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Sleep" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
