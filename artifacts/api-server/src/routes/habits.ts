import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, habitsTable, habitLogsTable } from "@workspace/db";
import {
  GetHabitParams,
  GetHabitResponse,
  UpdateHabitParams,
  UpdateHabitBody,
  UpdateHabitResponse,
  DeleteHabitParams,
  ListHabitsResponse,
  CreateHabitBody,
  ListHabitLogsParams,
  ListHabitLogsResponse,
  LogHabitParams,
  LogHabitBody,
  UnlogHabitParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/habits", async (_req, res): Promise<void> => {
  const habits = await db.select().from(habitsTable).orderBy(habitsTable.createdAt);
  res.json(ListHabitsResponse.parse(habits.map(h => ({
    ...h,
    createdAt: h.createdAt.toISOString(),
  }))));
});

router.post("/habits", async (req, res): Promise<void> => {
  const parsed = CreateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [habit] = await db.insert(habitsTable).values(parsed.data).returning();
  res.status(201).json(GetHabitResponse.parse({ ...habit, createdAt: habit.createdAt.toISOString() }));
});

router.get("/habits/:id", async (req, res): Promise<void> => {
  const params = GetHabitParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [habit] = await db.select().from(habitsTable).where(eq(habitsTable.id, params.data.id));
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.json(GetHabitResponse.parse({ ...habit, createdAt: habit.createdAt.toISOString() }));
});

router.patch("/habits/:id", async (req, res): Promise<void> => {
  const params = UpdateHabitParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [habit] = await db
    .update(habitsTable)
    .set(parsed.data)
    .where(eq(habitsTable.id, params.data.id))
    .returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.json(UpdateHabitResponse.parse({ ...habit, createdAt: habit.createdAt.toISOString() }));
});

router.delete("/habits/:id", async (req, res): Promise<void> => {
  const params = DeleteHabitParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [habit] = await db.delete(habitsTable).where(eq(habitsTable.id, params.data.id)).returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/habits/:id/logs", async (req, res): Promise<void> => {
  const params = ListHabitLogsParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const currentYear = new Date().getFullYear();
  const from = `${currentYear}-01-01`;
  const to = `${currentYear}-12-31`;
  const logs = await db
    .select()
    .from(habitLogsTable)
    .where(
      and(
        eq(habitLogsTable.habitId, params.data.id),
      )
    )
    .orderBy(habitLogsTable.date);

  const filtered = logs.filter(l => l.date >= from && l.date <= to);
  res.json(ListHabitLogsResponse.parse(filtered.map(l => ({
    ...l,
    completedAt: l.completedAt.toISOString(),
  }))));
});

router.post("/habits/:id/logs", async (req, res): Promise<void> => {
  const params = LogHabitParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = LogHabitBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(habitLogsTable)
    .where(
      and(
        eq(habitLogsTable.habitId, params.data.id),
        eq(habitLogsTable.date, body.data.date)
      )
    );

  if (existing) {
    res.status(201).json({
      ...existing,
      completedAt: existing.completedAt.toISOString(),
    });
    return;
  }

  const [log] = await db.insert(habitLogsTable).values({
    habitId: params.data.id,
    date: body.data.date,
  }).returning();

  res.status(201).json({
    ...log,
    completedAt: log.completedAt.toISOString(),
  });
});

router.delete("/habits/:id/logs/:date", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const date = Array.isArray(req.params.date) ? req.params.date[0] : req.params.date;

  const params = UnlogHabitParams.safeParse({ id, date });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(habitLogsTable)
    .where(
      and(
        eq(habitLogsTable.habitId, params.data.id),
        eq(habitLogsTable.date, params.data.date)
      )
    );
  res.sendStatus(204);
});

export default router;
