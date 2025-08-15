import { axiosInstance } from './axiosInstance';
import { Workout, WorkoutRequest } from '@/types/workout';

export const workoutApi = {
  getAll: (memberId?: string) => {
    // If memberId provided, pass as query param so backend can return that member's workouts
    const config = memberId ? { params: { memberId } } : undefined;
    return axiosInstance.get<Workout[]>('/workouts', config);
  },

  getById: (id: string) => {
    return axiosInstance.get<Workout>(`/workouts/${id}`);
  },

  create: (workout: WorkoutRequest) => {
    return axiosInstance.post<Workout>('/workouts', workout);
  },

  update: (id: string, workout: WorkoutRequest) => {
    return axiosInstance.put<Workout>(`/workouts/${id}`, workout);
  },

  delete: (id: string) => {
    return axiosInstance.delete(`/workouts/${id}`);
  },

  getByDateRange: (startDate: string, endDate: string) => {
    // Backend expects ISO date (yyyy-MM-dd) as LocalDate; normalize in case caller passed full ISO timestamps
    const normalize = (d: string) => {
      if (!d) return d;
      // If contains 'T' (full ISO), take date part before 'T'
      if (d.includes('T')) return d.split('T')[0];
      // If already in yyyy-MM-dd, return as-is
      return d;
    };
    const s = normalize(startDate);
    const e = normalize(endDate);
    return axiosInstance.get<Workout[]>(`/workouts/by-date-range?startDate=${s}&endDate=${e}`);
  },

  getByMuscleGroup: (muscleGroupId: string) => {
    return axiosInstance.get<Workout[]>(`/workouts/by-muscle-group/${muscleGroupId}`);
  },

  completeSet: (workoutId: string, setId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/sets/${setId}/complete`);
  },

  uncompleteSet: (workoutId: string, setId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/sets/${setId}/uncomplete`);
  },

  completeWorkout: (workoutId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/complete`);
  },

  copyWorkout: (workoutId: string, newDate: string) => {
    // newDate should be yyyy-MM-dd for backend
    return axiosInstance.post<Workout>(`/workouts/${workoutId}/copy?newDate=${newDate}`);
  }
};
