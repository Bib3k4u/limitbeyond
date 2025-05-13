import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { Workout } from '@/types/workout';
import { DateRangePicker } from '@/components/DateRangePicker';

export const WorkoutList = () => {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

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
          setWorkouts(response.data);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load workouts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [dateRange, toast]);

  const filteredWorkouts = workouts.filter(workout => 
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
        <Link to="/dashboard/workouts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workout
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DateRangePicker onChange={setDateRange} />
      </div>

      <div className="grid gap-4">
        {filteredWorkouts.map((workout) => (
          <Link key={workout.id} to={`/dashboard/workouts/${workout.id}`}>
            <Card className="p-4 hover:bg-accent/5 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{workout.name}</h3>
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {format(new Date(workout.scheduledDate), 'PPP')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {workout.sets.length} exercises
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {workout.completed ? 'Completed' : 'In Progress'}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorkoutList;
