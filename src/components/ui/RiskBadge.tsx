interface RiskBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ score, label, size = "md" }: RiskBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 70) return "bg-red-100 text-red-700 border-red-200";
    if (s >= 50) return "bg-orange-100 text-orange-700 border-orange-200";
    if (s >= 30) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getLabel = (s: number) => {
    if (s >= 70) return "High";
    if (s >= 50) return "Moderate";
    if (s >= 30) return "Low";
    return "Minimal";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getColor(score)} ${sizeClasses[size]}`}>
      {label && <span className="text-inherit opacity-70">{label}:</span>}
      <span>{score}</span>
      <span className="opacity-70">— {getLabel(score)}</span>
    </span>
  );
}
