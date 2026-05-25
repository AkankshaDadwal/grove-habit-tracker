import { format, subMonths, eachDayOfInterval, startOfWeek, endOfWeek, parseISO, isSameDay } from "date-fns";
import { GridDay } from "@workspace/api-client-react";

interface HabitGridProps {
  data: GridDay[];
  color: string;
}

export function HabitGrid({ data, color }: HabitGridProps) {
  if (!data || data.length === 0) return null;

  // The grid data comes from the server. It should contain up to a year of data.
  // GitHub style grid typically has 7 rows (days of week) and columns for weeks.
  
  const startDate = parseISO(data[0].date);
  const endDate = parseISO(data[data.length - 1].date);
  
  // Pad the grid to start on Sunday and end on Saturday to align properly
  const gridStart = startOfWeek(startDate);
  const gridEnd = endOfWeek(endDate);
  
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  
  // Create a map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d]));
  
  // Organize by weeks (columns)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  allDays.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getOpacityForLevel = (level: number) => {
    if (level === 0) return 0;
    if (level === 1) return 0.3;
    if (level === 2) return 0.5;
    if (level === 3) return 0.8;
    return 1;
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="min-w-[800px]">
        {/* Month Labels */}
        <div className="flex ml-8 mb-2 text-xs font-mono text-muted-foreground">
          {months.map((m, i) => (
            <div key={m} style={{ width: `${(100 / 12)}%` }}>{m}</div>
          ))}
        </div>
        
        <div className="flex gap-1">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 pr-2 text-[10px] font-mono text-muted-foreground mt-1 justify-between py-1">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>
          
          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const gridDay = dataMap.get(dateStr);
                  const isFuture = day > new Date();
                  
                  // GitHub grid specific sizes
                  return (
                    <div
                      key={dateStr}
                      title={gridDay?.completed ? `${dateStr}: Completed` : dateStr}
                      className="w-3 h-3 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10"
                      style={{
                        backgroundColor: gridDay?.completed 
                          ? color 
                          : "var(--color-secondary)",
                        opacity: gridDay ? getOpacityForLevel(gridDay.level) : 1,
                        visibility: isFuture ? "hidden" : "visible" // Hide future days without collapsing grid
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
