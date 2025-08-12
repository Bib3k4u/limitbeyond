import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Search, Copy, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { Workout } from '@/types/workout';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const WorkoutList = () => {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; workoutId: string | null; workoutName: string }>({
    open: false,
    workoutId: null,
    workoutName: ''
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        let response;
        if (dateRange?.from && dateRange?.to) {
          response = await workoutApi.getByDateRange(
            format(dateRange.from, 'yyyy-MM-dd'),
            format(dateRange.to, 'yyyy-MM-dd')
          );
        } else {
          response = await workoutApi.getAll();
        }
        if (response?.data) {
          setWorkouts(response.data as any);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load workouts', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [dateRange, toast]);

  const handleDelete = async () => {
    if (!deleteDialog.workoutId) return;
    
    try {
      await workoutApi.delete(deleteDialog.workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== deleteDialog.workoutId));
      toast({ title: 'Success', description: 'Workout deleted successfully' });
      setDeleteDialog({ open: false, workoutId: null, workoutName: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete workout', variant: 'destructive' });
    }
  };

  const openDeleteDialog = (workoutId: string, workoutName: string) => {
    setDeleteDialog({ open: true, workoutId, workoutName });
  };

  const filteredWorkouts = (workouts as any[]).filter((workout: any) => 
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Manage your workout sessions</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/workouts/templates">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Use Templates
            </Button>
          </Link>
          <Link to="/dashboard/workouts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workouts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <DateRangePicker onChange={setDateRange as any} />
      </div>

      <div className="grid gap-4">
        {filteredWorkouts.map((workout: any) => (
          <Card key={workout.id} className="p-4 hover:bg-accent/5 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{workout.name}</h3>
                  {workout.completed && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{workout.scheduledDate ? format(new Date(workout.scheduledDate), 'PPP') : '-'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{workout.sets.length} sets</p>
                  {workout.exercises?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vol: {workout.exercises.reduce((sum: number, e: any) => sum + (e.totalVolume || 0), 0)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link to={`/dashboard/workouts/${workout.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                  <Link to={`/dashboard/workouts/${workout.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(workout.id, workout.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.workoutName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutList;
