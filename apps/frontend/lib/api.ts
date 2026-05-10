import axios from 'axios';
import type { ApiResponse, Project, Chapter, Character, WorldItem, ProjectStats, AIResult, AITitlesResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Projects
export const getProjects = () => api.get<ApiResponse<Project[]>>('/api/v1/projects');
export const getProject = (id: number) => api.get<ApiResponse<Project>>(`/api/v1/projects/${id}`);
export const createProject = (data: Partial<Project>) => api.post<ApiResponse<Project>>('/api/v1/projects', data);
export const updateProject = (id: number, data: Partial<Project>) => api.patch<ApiResponse<Project>>(`/api/v1/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/api/v1/projects/${id}`);
export const getProjectStats = (id: number) => api.get<ApiResponse<ProjectStats>>(`/api/v1/projects/${id}/stats`);

// Chapters
export const getChapters = (projectId: number) => api.get<ApiResponse<Chapter[]>>(`/api/v1/projects/${projectId}/chapters`);
export const createChapter = (projectId: number, data: { title: string; content?: string }) =>
  api.post<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters`, data);
export const getChapter = (id: number) => api.get<ApiResponse<Chapter>>(`/api/v1/chapters/${id}`);
export const updateChapter = (id: number, data: Partial<Chapter>) => api.patch<ApiResponse<Chapter>>(`/api/v1/chapters/${id}`, data);
export const deleteChapter = (id: number) => api.delete(`/api/v1/chapters/${id}`);
export const reorderChapters = (projectId: number, chapterIds: number[]) =>
  api.patch(`/api/v1/projects/${projectId}/chapters/reorder`, { chapterIds });

// Characters
export const getCharacters = (projectId: number) => api.get<ApiResponse<Character[]>>(`/api/v1/projects/${projectId}/characters`);
export const createCharacter = (projectId: number, data: Partial<Character>) =>
  api.post<ApiResponse<Character>>(`/api/v1/projects/${projectId}/characters`, data);
export const updateCharacter = (id: number, data: Partial<Character>) => api.patch<ApiResponse<Character>>(`/api/v1/characters/${id}`, data);
export const deleteCharacter = (id: number) => api.delete(`/api/v1/characters/${id}`);

// World Items
export const getWorlds = (projectId: number, type?: string) =>
  api.get<ApiResponse<WorldItem[]>>(`/api/v1/projects/${projectId}/worlds`, { params: type ? { type } : {} });
export const createWorld = (projectId: number, data: Partial<WorldItem>) =>
  api.post<ApiResponse<WorldItem>>(`/api/v1/projects/${projectId}/worlds`, data);
export const updateWorld = (id: number, data: Partial<WorldItem>) => api.patch<ApiResponse<WorldItem>>(`/api/v1/worlds/${id}`, data);
export const deleteWorld = (id: number) => api.delete(`/api/v1/worlds/${id}`);

// AI
export const aiContinue = (data: { text: string; genre?: string; context?: string }) =>
  api.post<ApiResponse<AIResult>>('/api/v1/ai/continue', data);
export const aiPolish = (data: { text: string }) =>
  api.post<ApiResponse<AIResult>>('/api/v1/ai/polish', data);
export const aiExpand = (data: { text: string }) =>
  api.post<ApiResponse<AIResult>>('/api/v1/ai/expand', data);
export const aiTitles = (data: { genre?: string; count?: number }) =>
  api.post<ApiResponse<AITitlesResult>>('/api/v1/ai/titles', data);

export default api;
