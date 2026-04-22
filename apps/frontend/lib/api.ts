import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 通用 API 响应类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 类型定义
export interface Project {
  id: string;
  name: string;
  genre: string;
  stylePref: string;
  targetWordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  wordCount: number;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  personality: string;
  appearance: string;
  avatar: string;
  createdAt: string;
}

export interface WorldItem {
  id: string;
  projectId: string;
  type: string;
  name: string;
  description: string;
  createdAt: string;
}

// 项目相关 API
export const getProjects = () => api.get<ApiResponse<Project[]>>('/api/v1/projects');
export const createProject = (data: Partial<Project>) => api.post<ApiResponse<Project>>('/api/v1/projects', data);
export const getProject = (id: string) => api.get<ApiResponse<Project>>(`/api/v1/projects/${id}`);
export const updateProject = (id: string, data: Partial<Project>) => api.patch<ApiResponse<Project>>(`/api/v1/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/api/v1/projects/${id}`);

// 章节相关 API
export const getChapters = (projectId: string) => api.get<ApiResponse<Chapter[]>>(`/api/v1/projects/${projectId}/chapters`);
export const createChapter = (projectId: string, data: Partial<Chapter>) => api.post<ApiResponse<Chapter>>(`/api/v1/projects/${projectId}/chapters`, data);
export const getChapter = (id: string) => api.get<ApiResponse<Chapter>>(`/api/v1/chapters/${id}`);
export const updateChapter = (id: string, data: Partial<Chapter>) => api.patch<ApiResponse<Chapter>>(`/api/v1/chapters/${id}`, data);

// 角色相关 API
export const getCharacters = (projectId: string) => api.get<ApiResponse<Character[]>>(`/api/v1/projects/${projectId}/characters`);
export const createCharacter = (projectId: string, data: Partial<Character>) => api.post<ApiResponse<Character>>(`/api/v1/projects/${projectId}/characters`, data);

// 世界观相关 API
export const getWorlds = (projectId: string) => api.get<ApiResponse<WorldItem[]>>(`/api/v1/projects/${projectId}/worlds`);
export const createWorld = (projectId: string, data: Partial<WorldItem>) => api.post<ApiResponse<WorldItem>>(`/api/v1/projects/${projectId}/worlds`, data);

// AI 生成相关 API
export const generateOutline = (data: { genre: string; theme: string; style: string }) => api.post('/api/v1/generate/outline', data);
export const generateChapter = (data: { prompt: string; style: string; context: string }) => api.post('/api/v1/generate/chapter', data);
export const generateCharacter = (data: { role: string; genre: string; description: string }) => api.post('/api/v1/generate/character', data);

// 智能体相关 API
export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  currentTask: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getAgents = () => api.get<ApiResponse<Agent[]>>('/api/v1/agents');
export const createAgent = (data: Partial<Agent>) => api.post<ApiResponse<Agent>>('/api/v1/agents', data);
export const updateAgent = (id: string, data: Partial<Agent>) => api.patch<ApiResponse<Agent>>(`/api/v1/agents/${id}`, data);
export const deleteAgent = (id: string) => api.delete(`/api/v1/agents/${id}`);

// 协作日志相关 API
export interface CollabLog {
  id: string;
  author: string;
  text: string;
  projectId: string | null;
  ts: string;
}

export const getCollabLogs = () => api.get<ApiResponse<CollabLog[]>>('/api/v1/collab/logs');
export const createCollabLog = (data: { author: string; text: string; projectId?: string }) => api.post<ApiResponse<CollabLog>>('/api/v1/collab/logs', data);
export const deleteCollabLog = (id: string) => api.delete(`/api/v1/collab/logs/${id}`);

export default api;