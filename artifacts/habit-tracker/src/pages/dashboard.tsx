import { useGetDashboard, useLogHabit, useUnlogHabit, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { format } from "date-fns";
import { Check, Flame, Plus, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function DashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, isLoading } = useGetDashboard();
  const queryClient = useQueryClient();

  const logHabit = useLogHabit();
  const unlogHabit = useUnlogHabit();

  const handleToggle = (habitId: number, isCompleted: boolean) => {
    if (isCompleted) {
      unlogHabit.mutate(
        { id: habitId, date: today },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          },
        }
      );
    } else {
      logHabit.mutate(
        { id: habitId, data: { date: today } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-secondary rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-secondary rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const isAllDone = (data?.totalHabits ?? 0) > 0 && data?.completedToday === data?.totalHabits;

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            {isAllDone ? "All complete." : "Today's Focus"}
          </h1>
          {data && data.totalHabits > 0 && (
            <div className="mt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="bg-secondary px-3 py-1 rounded-full">
                {data.completedToday} / {data.totalHabits} Complete
              </div>
              <div className="bg-secondary px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-4 h-4 text-accent" />
                {data.longestActiveStreak} Day Streak
              </div>
            </div>
          )}
        </header>

        {(!data?.habits || data.habits.length === 0) ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-secondary text-primary rounded-full flex items-center justify-center mb-6">
              <Leaf className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2">Plant your first seed</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Great habits start small. Create your first habit to begin building a routine that lasts.
            </p>
            <Link href="/habits" className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-opacity">
              <Plus className="w-5 h-5" />
              Manage Habits
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  "group flex items-center justify-between p-4 md:p-6 rounded-2xl border transition-all duration-300",
                  habit.completedToday 
                    ? "bg-secondary border-transparent" 
                    : "bg-card border-border hover:border-primary/30 shadow-sm"
                )}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <button
                    onClick={() => handleToggle(habit.id, habit.completedToday)}
                    className={cn(
                      "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-110 active:scale-95",
                      habit.completedToday
                        ? "text-white"
                        : "bg-transparent hover:bg-black/5"
                    )}
                    style={{ 
                      borderColor: habit.color,
                      backgroundColor: habit.completedToday ? habit.color : "transparent"
                    }}
                  >
                    {habit.completedToday && <Check className="w-5 h-5" />}
                  </button>
                  
                  <div>
                    <h3 className={cn(
                      "text-lg md:text-xl font-medium transition-colors",
                      habit.completedToday ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground"
                    )}>
                      {habit.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {habit.currentStreak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium">
                      <Flame className="w-4 h-4" />
                      <span>{habit.currentStreak}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

