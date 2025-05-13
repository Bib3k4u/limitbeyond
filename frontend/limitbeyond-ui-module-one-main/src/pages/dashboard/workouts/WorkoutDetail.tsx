import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Copy,
  Dumbbell,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { Workout, WorkoutResponse } from '@/types/workout';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<WorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Calculate completion progress
  const completedSetsCount = workout?.sets.filter(set => set.completed).length ?? 0;
  const totalSetsCount = workout?.sets.length ?? 0;
  const progress = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  // Fetch workout data
  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await workoutApi.getById(id);
        if (response?.data) {
          setWorkout(response.data);
        }
      } catch (error) {
        console.error('Error fetching workout:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id, toast]);

  // Handle completing a set
  const handleCompleteSet = async (setId: string) => {
    if (!workout) return;
    try {
      await workoutApi.completeSet(workout.id, setId);
      // Update local state
      setWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sets: prev.sets.map((set) =>
            set.id === setId ? { ...set, completed: true } : set
          ),
        };
      });
      toast({
        title: 'Success',
        description: 'Set completed successfully',
      });
    } catch (error) {
      console.error('Error completing set:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete set. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle completing the entire workout
  const handleCompleteWorkout = async () => {
    if (!workout || completing) return;
    setCompleting(true);
    try {
      await workoutApi.completeWorkout(workout.id);
      // Update local state
      setWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          completed: true,
          completedDate: new Date().toISOString(),
          sets: prev.sets.map((set) => ({ ...set, completed: true })),
        };
      });
      toast({
        title: 'Success',
        description: 'Workout completed! Great job!',
      });
    } catch (error) {
      console.error('Error completing workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  // Handle copying workout
  const handleCopyWorkout = async () => {
    if (!workout || !selectedDate) return;
    try {
      await workoutApi.copyWorkout(workout.id, selectedDate.toISOString());
      toast({
        title: 'Success',
        description: 'Workout copied successfully',
      });
      setShowCopyDialog(false);
      navigate('/dashboard/workouts');
    } catch (error) {
      console.error('Error copying workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy workout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Workout not found</h2>
        <p className="text-muted-foreground mb-4">
          The workout you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/dashboard/workouts')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Workouts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/workouts')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
          </div>
          {workout.description && (
            <p className="text-muted-foreground mt-1">{workout.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!workout.completed && (
            <Button
              variant="outline"
              onClick={() => setShowCopyDialog(true)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Workout
            </Button>
          )}
          {!workout.completed && progress === 100 && (
            <Button onClick={handleCompleteWorkout} disabled={completing}>
              {completing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Complete Workout
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Scheduled Date</p>
              <p className="text-sm text-muted-foreground">
                {workout.scheduledDate
                  ? format(new Date(workout.scheduledDate), 'PPP')
                  : 'Not scheduled'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sets Completed</p>
              <p className="text-sm text-muted-foreground">
                {completedSetsCount} of {totalSetsCount} sets
              </p>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant={workout.completed ? 'default' : 'secondary'}>
              {workout.completed ? 'Completed' : 'In Progress'}
            </Badge>
            {workout.completed && workout.completedDate && (
              <span className="text-sm text-muted-foreground">
                on {format(new Date(workout.completedDate), 'PPP')}
              </span>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exercises</h2>
        <div className="space-y-4">
          {workout.sets.map((set) => (
            <div
              key={set.id}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center p-4 rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{set.exercise.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {set.exercise.description}
                </p>
              </div>
              <div className="text-sm">
                <span className="font-medium">{set.reps} reps</span>
                {set.weight && (
                  <span className="text-muted-foreground"> @ {set.weight}kg</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {set.notes}
              </div>
              <div className="flex justify-end">
                {set.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteSet(set.id)}
                    disabled={workout.completed}
                  >
                    <Circle className="h-4 w-4 mr-2" />
                    Complete Set
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {workout.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-2">Additional Notes</h3>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </div>
        )}
      </Card>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Workout</DialogTitle>
            <DialogDescription>
              Select a date for the new workout.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyWorkout}>
              Copy Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutDetail;
