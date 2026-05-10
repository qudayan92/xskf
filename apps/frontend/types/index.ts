export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Project {
  id: number;
  name: string;
  genre: string | null;
  summary: string | null;
  target_word_count: number;
  status: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  project_id: number;
  chapter_no: number;
  title: string;
  content: string;
  word_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: number;
  project_id: number;
  name: string;
  role: string;
  age: string | null;
  gender: string | null;
  personality: string | null;
  appearance: string | null;
  background: string | null;
  goals: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorldItem {
  id: number;
  project_id: number;
  type: string;
  name: string;
  description: string | null;
  icon: string | null;
  attributes: string | null;
  relationships: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  chapterCount: number;
  totalWords: number;
  characterCount: number;
  worldCount: number;
}

export interface AIResult {
  content: string;
  wordCount: number;
  provider: string;
}

export interface AITitlesResult {
  titles: string[];
  provider: string;
}
