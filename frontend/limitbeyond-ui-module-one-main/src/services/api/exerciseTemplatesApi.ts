import { axiosInstance } from './axiosInstance';

export const exerciseTemplatesApi = {
  getAll: async () => {
    try {
      // Try authenticated endpoint first
      return await axiosInstance.get('/exercise-templates');
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        // Fallback to public endpoint if authentication fails
        console.log('Falling back to public exercise templates endpoint');
        return await axiosInstance.get('/exercise-templates/public');
      }
      throw error;
    }
  },

  getById: (id: string) => {
    return axiosInstance.get(`/exercise-templates/${id}`);
  },

  create: (exerciseTemplate: any) => {
    return axiosInstance.post('/exercise-templates', exerciseTemplate);
  },

  update: (id: string, exerciseTemplate: any) => {
    return axiosInstance.put(`/exercise-templates/${id}`, exerciseTemplate);
  },

  delete: (id: string) => {
    return axiosInstance.delete(`/exercise-templates/${id}`);
  },

  bulkCreate: (exerciseTemplates: any[]) => {
    return axiosInstance.post('/exercise-templates/bulk', exerciseTemplates);
  },

  getByMuscleGroup: (muscleGroupId: string) => {
    return axiosInstance.get(`/exercise-templates/by-muscle-group/${muscleGroupId}`);
  }
}; 