import { useListHabits, useCreateHabit, getListHabitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { HabitFormDialog } from "@/components/habit-form";
import { useState } from "react";

export default function HabitsPage() {
  const { data: habits, isLoading } = useListHabits();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createHabit = useCreateHabit();

  const handleCreate = (data: { name: string; color: string; description?: string }) => {
    createHabit.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          setIsCreateOpen(false);
        },
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Habits</h1>
            <p className="text-muted-foreground mt-2">Manage your routines and seeds of growth.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-secondary rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : !habits || habits.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <h2 className="text-xl font-serif font-semibold mb-2">No habits yet</h2>
            <p className="text-muted-foreground mb-6">Create a habit to start tracking your daily progress.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-secondary text-foreground hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <Link
                key={habit.id}
                href={`/habits/${habit.id}`}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all hover:border-primary/20 overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-2 h-full opacity-50" 
                  style={{ backgroundColor: habit.color }} 
                />
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <HabitFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        title="Create New Habit"
        isLoading={createHabit.isPending}
      />
    </Layout>
  );
}
