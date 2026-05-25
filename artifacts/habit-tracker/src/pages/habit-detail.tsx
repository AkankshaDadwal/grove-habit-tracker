import { useGetHabit, useGetHabitStats, useGetHabitGrid, useDeleteHabit, useUpdateHabit, getListHabitsQueryKey, useListHabitLogs, getGetHabitQueryKey, getGetHabitStatsQueryKey, getGetHabitGridQueryKey, getListHabitLogsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { HabitGrid } from "@/components/habit-grid";
import { Flame, Calendar, Trophy, Trash2, Edit, ChevronLeft, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HabitFormDialog } from "@/components/habit-form";
import { format, parseISO } from "date-fns";

export default function HabitDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: habit, isLoading: habitLoading } = useGetHabit(id, { query: { enabled: !!id, queryKey: getGetHabitQueryKey(id) } });
  const { data: stats, isLoading: statsLoading } = useGetHabitStats(id, { query: { enabled: !!id, queryKey: getGetHabitStatsQueryKey(id) } });
  const { data: grid, isLoading: gridLoading } = useGetHabitGrid(id, { query: { enabled: !!id, queryKey: getGetHabitGridQueryKey(id) } });
  const { data: logs, isLoading: logsLoading } = useListHabitLogs(id, { query: { enabled: !!id, queryKey: getListHabitLogsQueryKey(id) } });

  const deleteHabit = useDeleteHabit();
  const updateHabit = useUpdateHabit();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit? This cannot be undone.")) {
      deleteHabit.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
            setLocation("/habits");
          },
        }
      );
    }
  };

  const handleUpdate = (data: { name: string; color: string; description?: string }) => {
    updateHabit.mutate(
      { id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          setIsEditOpen(false);
        },
      }
    );
  };

  const isLoading = habitLoading || statsLoading || gridLoading || logsLoading;

  if (isLoading || !habit) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-24 bg-secondary rounded" />
          <div className="h-20 bg-secondary rounded-xl w-full" />
          <div className="h-64 bg-secondary rounded-xl w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <Link href="/habits" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Habits
        </Link>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div 
            className="absolute top-0 left-0 w-full h-2" 
            style={{ backgroundColor: habit.color }} 
          />
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-3">{habit.name}</h1>
              {habit.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">{habit.description}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="p-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                title="Edit Habit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-3 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Delete Habit"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Current Streak</p>
              <p className="text-4xl font-serif font-bold text-foreground">{stats.currentStreak} <span className="text-lg font-sans text-muted-foreground font-normal">days</span></p>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Longest Streak</p>
              <p className="text-4xl font-serif font-bold text-foreground">{stats.longestStreak} <span className="text-lg font-sans text-muted-foreground font-normal">days</span></p>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center justify-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">30-Day Rate</p>
              <p className="text-4xl font-serif font-bold text-foreground">{stats.completionRate30d}%</p>
            </div>
          </div>
        )}

        {grid && (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-serif font-semibold mb-6">Year in Review</h3>
            <HabitGrid data={grid} color={habit.color} />
          </div>
        )}

        {logs && logs.length > 0 && (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-serif font-semibold mb-6">Recent Completions</h3>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                    <span className="font-medium">{format(parseISO(log.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(log.completedAt), "h:mm a")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <HabitFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleUpdate}
        title="Edit Habit"
        defaultValues={{
          name: habit.name,
          description: habit.description || undefined,
          color: habit.color,
        }}
        isLoading={updateHabit.isPending}
      />
    </Layout>
  );
}
