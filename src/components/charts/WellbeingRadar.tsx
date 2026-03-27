"use client";

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface WellbeingRadarProps {
  mood: number;
  stress: number;
  energy: number;
  sleep: number;
}

export default function WellbeingRadar({ mood, stress, energy, sleep }: WellbeingRadarProps) {
  const data = [
    { subject: "Mood", value: mood, fullMark: 10 },
    { subject: "Energy", value: energy, fullMark: 10 },
    { subject: "Sleep", value: sleep, fullMark: 10 },
    // Invert stress so higher = better on radar
    { subject: "Calm", value: 10 - stress, fullMark: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
        <Radar name="Wellbeing" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
