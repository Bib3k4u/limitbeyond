export interface Workout {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string;
  completed: boolean;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutRequest {
  name: string;
  description?: string;
  scheduledDate: string;
  sets: WorkoutSetRequest[];
}

export interface WorkoutSetRequest {
  exerciseId: string;
  reps: number;
  weight: number;
}

export interface WorkoutResponse extends Workout {
  createdAt: string;
  updatedAt: string;
  userId: string;
}
