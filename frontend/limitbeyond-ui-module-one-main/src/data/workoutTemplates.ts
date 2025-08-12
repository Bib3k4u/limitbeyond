export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  days: WorkoutTemplateDay[];
}

export interface WorkoutTemplateDay {
  day: number;
  name: string;
  focus: string;
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExercise {
  exerciseName: string; // Use name instead of ID for matching
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'basic-strength-3day',
    name: 'Basic Strength 3-Day Split',
    description: 'Simple 3-day split focusing on fundamental compound movements',
    days: [
      {
        day: 1,
        name: 'Push Day',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseName: 'Push-ups', sets: 3, reps: 10, weight: 0, notes: 'Bodyweight, focus on form' },
          { exerciseName: 'Dips', sets: 3, reps: 8, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 30-60 seconds' }
        ]
      },
      {
        day: 2,
        name: 'Pull Day',
        focus: 'Back, Biceps',
        exercises: [
          { exerciseName: 'Pull-ups', sets: 3, reps: 5, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Rows', sets: 3, reps: 10, weight: 0, notes: 'Use resistance bands or bodyweight' },
          { exerciseName: 'Superman', sets: 3, reps: 10, weight: 0, notes: 'Bodyweight back exercise' }
        ]
      },
      {
        day: 3,
        name: 'Legs Day',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { exerciseName: 'Squats', sets: 3, reps: 12, weight: 0, notes: 'Bodyweight, focus on depth' },
          { exerciseName: 'Lunges', sets: 3, reps: 10, weight: 0, notes: 'Alternating legs' },
          { exerciseName: 'Calf Raises', sets: 3, reps: 15, weight: 0, notes: 'Bodyweight, full range of motion' }
        ]
      }
    ]
  },
  {
    id: 'full-body-3day',
    name: 'Full Body 3-Day Split',
    description: 'Full body workouts for overall strength and conditioning',
    days: [
      {
        day: 1,
        name: 'Full Body A',
        focus: 'Compound movements, upper body focus',
        exercises: [
          { exerciseName: 'Push-ups', sets: 3, reps: 8, weight: 0, notes: 'Full range of motion' },
          { exerciseName: 'Squats', sets: 3, reps: 15, weight: 0, notes: 'Bodyweight, good form' },
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 45 seconds' },
          { exerciseName: 'Mountain Climbers', sets: 3, reps: 20, weight: 0, notes: 'Alternating legs' }
        ]
      },
      {
        day: 2,
        name: 'Full Body B',
        focus: 'Compound movements, lower body focus',
        exercises: [
          { exerciseName: 'Lunges', sets: 3, reps: 12, weight: 0, notes: 'Alternating legs, good form' },
          { exerciseName: 'Dips', sets: 3, reps: 6, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Glute Bridges', sets: 3, reps: 15, weight: 0, notes: 'Focus on glute activation' },
          { exerciseName: 'Burpees', sets: 3, reps: 8, weight: 0, notes: 'Full movement, controlled pace' }
        ]
      },
      {
        day: 3,
        name: 'Full Body C',
        focus: 'Core and stability',
        exercises: [
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 60 seconds' },
          { exerciseName: 'Side Planks', sets: 3, reps: 1, weight: 0, notes: '30 seconds each side' },
          { exerciseName: 'Bird Dogs', sets: 3, reps: 10, weight: 0, notes: 'Alternating arm and leg' },
          { exerciseName: 'Dead Bugs', sets: 3, reps: 12, weight: 0, notes: 'Controlled movement' }
        ]
      }
    ]
  }
];

export const getTemplateById = (id: string): WorkoutTemplate | undefined => {
  return workoutTemplates.find(template => template.id === id);
};

export const getAllTemplates = (): WorkoutTemplate[] => {
  return workoutTemplates;
}; 