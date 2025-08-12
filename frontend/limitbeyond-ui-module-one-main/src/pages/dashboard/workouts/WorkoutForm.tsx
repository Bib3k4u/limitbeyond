import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2, Search, Calculator } from 'lucide-react';
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
import userService from '@/services/api/userService';
import { WorkoutRequest } from '@/types/workout';
import { format } from 'date-fns';

// Define interfaces locally since they're not in types directory
interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

interface ExerciseGroup {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    id: string;
    reps: number;
    weight?: number;
    notes?: string;
  }>;
}

interface WorkoutFormData {
  name: string;
  description: string;
  memberId: string;
  scheduledDate: string;
  notes?: string;
  exerciseGroups: ExerciseGroup[];
}

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const form = useForm<WorkoutFormData>({
    defaultValues: {
      name: '',
      description: '',
      memberId: '',
      scheduledDate: '',
      exerciseGroups: [{ exerciseId: '', exerciseName: '', sets: [{ id: `default-${Date.now()}`, reps: 0, weight: 0, notes: '' }] }],
    },
  });

  // Simplified validation rules
  const nameRules = { required: 'Workout name is required' };
  const dateRules = { required: 'Date is required' };
  const memberRules = currentUser?.roles.includes('TRAINER') || currentUser?.roles.includes('ADMIN') 
    ? { required: 'Member is required' } 
    : {};

  // Filter exercises based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      setFilteredExercises(
        exercises.filter(exercise =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, exercises]);

  // Fetch current user, exercises and members data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setDataError(null);
      
      try {
        const [profile, exercisesRes] = await Promise.all([
          userService.getCurrentUserProfile(),
          exerciseTemplatesApi.getAll()
        ]);

        setCurrentUser(profile);
        form.setValue('memberId', profile?.id || '');

        if (exercisesRes?.data) {
          setExercises(exercisesRes.data);
          setFilteredExercises(exercisesRes.data);
        }

        // Only try to fetch members if user is ADMIN or TRAINER
        if (profile?.roles.includes('ADMIN') || profile?.roles.includes('TRAINER')) {
          try {
            const membersRes = await userService.getAllMembers();
            setMembers(membersRes);
          } catch (error) {
            console.log('User not authorized to fetch members list');
            setMembers([]);
          }
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setDataError('Failed to load form data. Please check your connection and try again.');
        toast({
          title: 'Error',
          description: 'Failed to load form data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fetch workout data if editing
  useEffect(() => {
    if (id) {
      const fetchWorkout = async () => {
        try {
          const response = await workoutApi.getById(id);
          if (response?.data) {
            const workout = response.data as any; // Use any for now to avoid type issues
            
            // Group sets by exercise
            const exerciseMap = new Map<string, ExerciseGroup>();
            workout.sets.forEach((set: any, index: number) => {
              const exerciseId = set.exercise.id;
              if (!exerciseMap.has(exerciseId)) {
                exerciseMap.set(exerciseId, {
                  exerciseId,
                  exerciseName: set.exercise.name,
                  sets: []
                });
              }
              exerciseMap.get(exerciseId)!.sets.push({
                id: `set-${index}`,
                reps: set.reps,
                weight: set.weight,
                notes: set.notes,
              });
            });

            form.reset({
              name: workout.name,
              description: workout.description,
              memberId: workout.member?.id || '',
              scheduledDate: workout.scheduledDate,
              notes: workout.notes,
              exerciseGroups: Array.from(exerciseMap.values()),
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
  }, [id, toast]);

  const onSubmit = async (data: WorkoutFormData) => {
    if (exercises.length === 0) {
      toast({
        title: 'Error',
        description: 'No exercises available. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    // Validate exercise groups
    if (!data.exerciseGroups || data.exerciseGroups.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one exercise to the workout.',
        variant: 'destructive',
      });
      return;
    }

    // Validate that all exercise groups have valid exercises and sets
    for (const group of data.exerciseGroups) {
      if (!group.exerciseId) {
        toast({
          title: 'Error',
          description: 'Please select an exercise for all exercise groups.',
          variant: 'destructive',
        });
        return;
      }

      if (!group.sets || group.sets.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one set for each exercise.',
          variant: 'destructive',
        });
        return;
      }

      for (const set of group.sets) {
        if (!set.reps || set.reps <= 0) {
          toast({
            title: 'Error',
            description: 'Please enter valid reps for all sets.',
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Convert exercise groups to sets format
      const sets = data.exerciseGroups.flatMap(group =>
        group.sets.map(set => ({
          exerciseId: group.exerciseId,
          reps: set.reps,
          weight: set.weight,
          notes: set.notes,
        }))
      );

      const payload = {
        ...data,
        sets,
        date: data.scheduledDate ? format(new Date(data.scheduledDate), 'yyyy-MM-dd') : undefined,
      };

      // For regular users, don't send memberId if not set
      if (!currentUser?.roles.includes('TRAINER') && !currentUser?.roles.includes('ADMIN')) {
        delete payload.memberId;
      }

      // Remove the scheduledDate field to avoid confusion
      delete payload.scheduledDate;

      if (id) {
        await workoutApi.update(id, payload);
        toast({
          title: 'Success',
          description: 'Workout updated successfully',
        });
      } else {
        await workoutApi.create(payload);
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
        description: 'Failed to save workout. Please check required fields and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    const currentGroups = form.getValues('exerciseGroups');
    form.setValue('exerciseGroups', [
      ...currentGroups,
      {
        exerciseId: '',
        exerciseName: '',
        sets: [{ id: `new-${Date.now()}`, reps: 0, weight: 0, notes: '' }]
      }
    ]);
  };

  const removeExercise = (exerciseIndex: number) => {
    const currentGroups = form.getValues('exerciseGroups');
    form.setValue('exerciseGroups', currentGroups.filter((_, index) => index !== exerciseIndex));
  };

  const addSet = (exerciseIndex: number) => {
    const currentGroups = form.getValues('exerciseGroups');
    const exercise = currentGroups[exerciseIndex];
    if (exercise && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet = {
        id: `new-${Date.now()}`,
        reps: lastSet.reps,
        weight: lastSet.weight,
        notes: lastSet.notes,
      };
      
      const updatedGroups = [...currentGroups];
      updatedGroups[exerciseIndex].sets.push(newSet);
      form.setValue('exerciseGroups', updatedGroups);
    }
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const currentGroups = form.getValues('exerciseGroups');
    const updatedGroups = [...currentGroups];
    updatedGroups[exerciseIndex].sets = updatedGroups[exerciseIndex].sets.filter((_, index) => index !== setIndex);
    
    // Ensure at least one set remains
    if (updatedGroups[exerciseIndex].sets.length === 0) {
      updatedGroups[exerciseIndex].sets = [{ id: `new-${Date.now()}`, reps: 0, weight: 0, notes: '' }];
    }
    
    form.setValue('exerciseGroups', updatedGroups);
  };

  const updateExerciseId = (exerciseIndex: number, exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      const currentGroups = form.getValues('exerciseGroups');
      const updatedGroups = [...currentGroups];
      updatedGroups[exerciseIndex].exerciseId = exerciseId;
      updatedGroups[exerciseIndex].exerciseName = exercise.name;
      form.setValue('exerciseGroups', updatedGroups);
    }
  };

  const calculateExerciseVolume = (sets: ExerciseGroup['sets']) => {
    return sets.reduce((total, set) => {
      const weight = set.weight || 0;
      return total + (weight * set.reps);
    }, 0);
  };

  const watchExerciseGroups = form.watch('exerciseGroups');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{id ? 'Edit Workout' : 'Create Workout'}</h1>
        <p className="text-muted-foreground">
          {id ? 'Update the workout details below' : 'Fill in the workout details below'}
        </p>
      </div>

      {loadingData && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-lb-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workout data...</p>
          </div>
        </div>
      )}

      {dataError && (
        <Card className="p-6 border-destructive">
          <div className="text-center">
            <p className="text-destructive mb-4">{dataError}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      )}

      {!loadingData && !dataError && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={nameRules}
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

                {(currentUser?.roles.includes('TRAINER') || currentUser?.roles.includes('ADMIN')) && members.length > 0 && (
                  <FormField
                    control={form.control}
                    name="memberId"
                    rules={memberRules}
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
                  rules={dateRules}
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
                  <Button type="button" variant="outline" onClick={addExercise}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                {watchExerciseGroups.map((exerciseGroup, exerciseIndex) => (
                  <div key={exerciseIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`exerciseGroups.${exerciseIndex}.exerciseId`}
                          rules={{ required: 'Exercise is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exercise</FormLabel>
                              <div className="space-y-2">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search exercises..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 mb-2"
                                  />
                                </div>
                                <Select
                                  value={field.value}
                                  onValueChange={(value) => updateExerciseId(exerciseIndex, value)}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select exercise" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredExercises.map((exercise) => (
                                      <SelectItem key={exercise.id} value={exercise.id}>
                                        {exercise.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExercise(exerciseIndex)}
                        disabled={watchExerciseGroups.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {exerciseGroup.exerciseId && (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Sets</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSet(exerciseIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Set
                            </Button>
                          </div>

                          {exerciseGroup.sets.map((set, setIndex) => (
                            <div key={set.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm font-medium">Set {setIndex + 1}</div>
                              
                              <FormField
                                control={form.control}
                                name={`exerciseGroups.${exerciseIndex}.sets.${setIndex}.reps`}
                                rules={{ required: 'Reps are required', min: 1 }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Reps</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Reps"
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`exerciseGroups.${exerciseIndex}.sets.${setIndex}.weight`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Weight (kg)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Weight"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex items-center gap-2">
                                <FormField
                                  control={form.control}
                                  name={`exerciseGroups.${exerciseIndex}.sets.${setIndex}.notes`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel className="text-xs">Notes</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Notes"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                  disabled={exerciseGroup.sets.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Volume</div>
                            <div className="text-lg font-bold text-lb-accent">
                              {calculateExerciseVolume(exerciseGroup.sets)} kg
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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
      )}
    </div>
  );
};

export default WorkoutForm;
