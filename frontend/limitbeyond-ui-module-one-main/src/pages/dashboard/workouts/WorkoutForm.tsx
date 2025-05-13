import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import { userService } from '@/services/api/userService';
import { ExerciseTemplate } from '@/types/exercise';
import { WorkoutRequest } from '@/types/workout';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/hooks/use-auth';

interface WorkoutFormData extends Omit<WorkoutRequest, 'sets'> {
  sets: Array<{
    exerciseId: string;
    reps: number;
    weight?: number;
    notes?: string;
  }>;
}

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);

  const form = useForm<WorkoutFormData>({
    defaultValues: {
      name: '',
      description: '',
      memberId: user?.roles.includes('MEMBER') ? user?.id : '',
      sets: [{ exerciseId: '', reps: 0 }],
    },
  });

  // Fetch exercises and members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesRes, membersRes] = await Promise.all([
          exerciseTemplatesApi.getAll(),
          user?.roles.includes('TRAINER') || user?.roles.includes('ADMIN')
            ? userService.getAllMembers()
            : null,
        ]);

        if (exercisesRes?.data) {
          setExercises(exercisesRes.data);
        }

        if (membersRes?.data) {
          setMembers(membersRes.data);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [user, toast]);

  // Fetch workout data if editing
  useEffect(() => {
    if (id) {
      const fetchWorkout = async () => {
        try {
          const response = await workoutApi.getById(id);
          if (response?.data) {
            const workout = response.data;
            form.reset({
              name: workout.name,
              description: workout.description,
              memberId: workout.member.id,
              trainerId: workout.trainer?.id,
              scheduledDate: workout.scheduledDate,
              notes: workout.notes,
              sets: workout.sets.map(set => ({
                exerciseId: set.exercise.id,
                reps: set.reps,
                weight: set.weight,
                notes: set.notes,
              })),
            });
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
          toast({
            title: 'Error',
            description: 'Failed to load workout data. Please try again.',
            variant: 'destructive',
          });
        }
      };

      fetchWorkout();
    }
  }, [id, form, toast]);

  const onSubmit = async (data: WorkoutFormData) => {
    setLoading(true);
    try {
      if (id) {
        await workoutApi.update(id, data);
        toast({
          title: 'Success',
          description: 'Workout updated successfully',
        });
      } else {
        await workoutApi.create(data);
        toast({
          title: 'Success',
          description: 'Workout created successfully',
        });
      }
      navigate('/dashboard/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addSet = () => {
    const sets = form.getValues('sets');
    form.setValue('sets', [...sets, { exerciseId: '', reps: 0 }]);
  };

  const removeSet = (index: number) => {
    const sets = form.getValues('sets');
    form.setValue('sets', sets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{id ? 'Edit Workout' : 'Create Workout'}</h1>
        <p className="text-muted-foreground">
          {id ? 'Update the workout details below' : 'Fill in the workout details below'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Workout name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workout name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter workout description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(user?.roles.includes('TRAINER') || user?.roles.includes('ADMIN')) && (
                <FormField
                  control={form.control}
                  name="memberId"
                  rules={{ required: 'Member is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="scheduledDate"
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={date => field.onChange(date?.toISOString())}
                        className="rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Exercises</h2>
                <Button type="button" variant="outline" onClick={addSet}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {form.watch('sets').map((set, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`sets.${index}.exerciseId`}
                      rules={{ required: 'Exercise is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exercise" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {exercises.map((exercise) => (
                                <SelectItem key={exercise.id} value={exercise.id}>
                                  {exercise.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`sets.${index}.reps`}
                      rules={{ required: 'Reps are required', min: 1 }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reps</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter reps"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`sets.${index}.weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="Enter weight"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSet(index)}
                      disabled={form.watch('sets').length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/workouts')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Update Workout' : 'Create Workout'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkoutForm;
