import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: string; description?: string }) => void;
  title: string;
  defaultValues?: {
    name: string;
    color: string;
    description?: string;
  };
  isLoading?: boolean;
}

const COLORS = [
  "#2E8B57", // Deep Green
  "#3CB371", // Sea Green
  "#6B8E23", // Olive
  "#DDA0DD", // Olive Drab
  "#DAA520", // Goldenrod
  "#CD853F", // Peru
  "#D2691E", // Chocolate
  "#8B4513", // Saddle Brown
  "#A0522D", // Sienna
  "#4682B4", // Steel Blue
  "#5F9EA0", // Cadet Blue
  "#708090", // Slate Gray
];

export function HabitFormDialog({ open, onOpenChange, onSubmit, title, defaultValues, isLoading }: HabitFormDialogProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [color, setColor] = useState(defaultValues?.color || COLORS[0]);

  // Reset form when opened with new defaults
  useEffect(() => {
    if (open && defaultValues) {
      setName(defaultValues.name);
      setDescription(defaultValues.description || "");
      setColor(defaultValues.color);
    } else if (open && !defaultValues) {
      setName("");
      setDescription("");
      setColor(COLORS[0]);
    }
  }, [open, defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, color, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g. Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6 bg-secondary/50 border-border"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Why is this important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none bg-secondary/50 border-border"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Color</Label>
            <div className="grid grid-cols-6 gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform",
                    color === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Saving..." : "Save Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
