import { axiosInstance } from './axiosInstance';
import { Workout, WorkoutRequest } from '@/types/workout';

export const workoutApi = {
  getAll: () => {
    return axiosInstance.get<Workout[]>('/workouts');
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
    return axiosInstance.get<Workout[]>(`/workouts/by-date-range?startDate=${startDate}&endDate=${endDate}`);
  },

  getByMuscleGroup: (muscleGroupId: string) => {
    return axiosInstance.get<Workout[]>(`/workouts/by-muscle-group/${muscleGroupId}`);
  },

  completeSet: (workoutId: string, setId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/sets/${setId}/complete`);
  },

  copyWorkout: (workoutId: string, newDate: string) => {
    return axiosInstance.post<Workout>(`/workouts/${workoutId}/copy?newDate=${newDate}`);
  }
};
