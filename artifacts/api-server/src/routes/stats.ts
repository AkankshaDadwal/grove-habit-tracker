import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, habitsTable, habitLogsTable } from "@workspace/db";
import {
  GetHabitStatsParams,
  GetHabitGridParams,
  GetHabitStatsResponse,
  GetHabitGridResponse,
  GetDashboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function computeCurrentStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

  const sorted = [...sortedDates].sort().reverse();
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  let streak = 0;
  let current = sorted[0] === todayStr ? today : new Date(today.getTime() - 86400000);

  for (const d of sorted) {
    const expected = current.toISOString().slice(0, 10);
    if (d === expected) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    } else {
      break;
    }
  }
  return streak;
}

function computeLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  const sorted = [...sortedDates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

router.get("/habits/:id/stats", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const params = GetHabitStatsParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [habit] = await db.select().from(habitsTable).where(eq(habitsTable.id, params.data.id));
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const logs = await db
    .select()
    .from(habitLogsTable)
    .where(eq(habitLogsTable.habitId, params.data.id))
    .orderBy(desc(habitLogsTable.date));

  const dates = logs.map(l => l.date);
  const currentStreak = computeCurrentStreak(dates);
  const longestStreak = computeLongestStreak(dates);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const recent = dates.filter(d => d >= thirtyDaysAgo);
  const completionRate30d = Math.round((recent.length / 30) * 100);

  const lastCompletedDate = dates[0] ?? null;

  res.json(GetHabitStatsResponse.parse({
    habitId: params.data.id,
    currentStreak,
    longestStreak,
    totalCompletions: dates.length,
    completionRate30d,
    lastCompletedDate,
  }));
});

router.get("/habits/:id/grid", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const params = GetHabitGridParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [habit] = await db.select().from(habitsTable).where(eq(habitsTable.id, params.data.id));
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const year = new Date().getFullYear();
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const logs = await db
    .select()
    .from(habitLogsTable)
    .where(eq(habitLogsTable.habitId, params.data.id));

  const logSet = new Set(logs.map(l => l.date));

  const grid: { date: string; completed: boolean; level: number }[] = [];
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  const today = new Date().toISOString().slice(0, 10);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    if (dateStr > today) break;
    const completed = logSet.has(dateStr);
    grid.push({ date: dateStr, completed, level: completed ? 4 : 0 });
  }

  res.json(GetHabitGridResponse.parse(grid));
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);

  const habits = await db.select().from(habitsTable).orderBy(habitsTable.createdAt);

  const allLogs = await db.select().from(habitLogsTable);
  const todayLogs = new Set(allLogs.filter(l => l.date === today).map(l => l.habitId));

  const dashboardHabits = habits.map(h => {
    const habitDates = allLogs.filter(l => l.habitId === h.id).map(l => l.date);
    const currentStreak = computeCurrentStreak(habitDates);
    return {
      id: h.id,
      name: h.name,
      color: h.color,
      completedToday: todayLogs.has(h.id),
      currentStreak,
    };
  });

  const longestActiveStreak = dashboardHabits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  res.json(GetDashboardResponse.parse({
    date: today,
    totalHabits: habits.length,
    completedToday: todayLogs.size,
    longestActiveStreak,
    habits: dashboardHabits,
  }));
});

export default router;
