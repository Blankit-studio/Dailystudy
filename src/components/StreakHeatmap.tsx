import { buildHeatmapWeeks } from "@/lib/stats";

function level(count: number): string {
  if (count <= 0) return "bg-zinc-800";
  if (count < 3) return "bg-brand/30";
  if (count < 6) return "bg-brand/55";
  if (count < 12) return "bg-brand/80";
  return "bg-brand";
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
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-zinc-500">
        <span>적음</span>
        <div className="h-3 w-3 rounded-sm bg-zinc-800" />
        <div className="h-3 w-3 rounded-sm bg-brand/30" />
        <div className="h-3 w-3 rounded-sm bg-brand/55" />
        <div className="h-3 w-3 rounded-sm bg-brand/80" />
        <div className="h-3 w-3 rounded-sm bg-brand" />
        <span>많음</span>
      </div>
    </div>
  );
}
