import { buildHeatmapWeeks } from "@/lib/stats";

function level(count: number): string {
  if (count <= 0) return "bg-slate-100";
  if (count < 3) return "bg-indigo-200";
  if (count < 6) return "bg-indigo-300";
  if (count < 12) return "bg-indigo-500";
  return "bg-indigo-700";
}

export default function StreakHeatmap({
  counts,
}: {
  counts: Map<string, number>;
}) {
  const weeks = buildHeatmapWeeks(counts, 13);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · ${day.count}회`}
                className={`h-3.5 w-3.5 rounded-sm ${level(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400">
        <span>적음</span>
        <div className="h-3 w-3 rounded-sm bg-slate-100" />
        <div className="h-3 w-3 rounded-sm bg-indigo-200" />
        <div className="h-3 w-3 rounded-sm bg-indigo-300" />
        <div className="h-3 w-3 rounded-sm bg-indigo-500" />
        <div className="h-3 w-3 rounded-sm bg-indigo-700" />
        <span>많음</span>
      </div>
    </div>
  );
}
