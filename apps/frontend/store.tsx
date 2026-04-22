import { create } from 'zustand'
import { getAgents, getCollabLogs, createCollabLog, updateAgent, Agent as ApiAgent, CollabLog as ApiCollabLog } from './lib/api'

export type Agent = {
  id: number
  name: string
  role: string
  status: string
  avatar: string
  currentTask?: string
}

export type Comment = { 
  id: number
  author: string
  text: string
  ts: string 
}

interface StoreState {
  agents: Agent[]
  comments: Comment[]
  isLoading: boolean
  addComment: (text: string) => void
  assign: (id: number, task: string) => void
  clearAssignment?: (id: number) => void
  fetchAgents: () => Promise<void>
  fetchComments: () => Promise<void>
}

const loadPersisted = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

const savePersisted = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const INITIAL_AGENTS: Agent[] = [
  { id: 1, name: '林墨', role: '主角', status: '待命', avatar: '🕶️' },
  { id: 2, name: '姬紫月', role: '助手', status: '待命', avatar: '🌙' },
  { id: 3, name: '风影', role: '顾问', status: '待命', avatar: '🗡️' },
  { id: 4, name: '德洛', role: '顾问', status: '待命', avatar: '🎓' },
  { id: 5, name: '娜塔', role: '专家', status: '待命', avatar: '🪐' },
  { id: 6, name: '艾琳', role: '顾问', status: '待命', avatar: '💡' },
  { id: 7, name: '赵铭', role: '实习', status: '待命', avatar: '🧭' },
]

export const useStore = create<StoreState>((set, get) => {
  const persistedAgents = loadPersisted<Agent[]>('agent_store_agents', INITIAL_AGENTS)
  const persistedComments = loadPersisted<Comment[]>('agent_store_comments', [])

  const initialAgents = persistedAgents ?? INITIAL_AGENTS
  const initialComments = persistedComments ?? []
  savePersisted('agent_store_agents', initialAgents)
  savePersisted('agent_store_comments', initialComments)

  return {
    agents: initialAgents,
    comments: initialComments,
    isLoading: false,
    
    fetchAgents: async () => {
      try {
        set({ isLoading: true })
        const res = await getAgents()
        if (res.data.success && res.data.data.length > 0) {
          const apiAgents: Agent[] = res.data.data.map((a: ApiAgent) => ({
            id: parseInt(a.id.slice(-8), 16) || Math.floor(Math.random() * 1000),
            name: a.name,
            role: a.role,
            status: a.status,
            avatar: a.avatar,
            currentTask: a.currentTask || undefined
          }))
          set({ agents: apiAgents, isLoading: false })
          savePersisted('agent_store_agents', apiAgents)
        } else {
          set({ isLoading: false })
        }
      } catch (err) {
        console.error('Failed to fetch agents from API:', err)
        set({ isLoading: false })
      }
    },

    fetchComments: async () => {
      try {
        set({ isLoading: true })
        const res = await getCollabLogs()
        if (res.data.success && res.data.data.length > 0) {
          const apiComments: Comment[] = res.data.data.map((l: ApiCollabLog) => ({
            id: parseInt(l.id.slice(-8), 16) || Date.now(),
            author: l.author,
            text: l.text,
            ts: l.ts
          }))
          set({ comments: apiComments, isLoading: false })
          savePersisted('agent_store_comments', apiComments)
        } else {
          set({ isLoading: false })
        }
      } catch (err) {
        console.error('Failed to fetch comments from API:', err)
        set({ isLoading: false })
      }
    },

    addComment: async (text: string) => {
      const newComment: Comment = { id: Date.now(), author: '你', text, ts: new Date().toISOString() }
      set((state: StoreState) => {
        const updated = [...state.comments, newComment]
        savePersisted('agent_store_comments', updated)
        return { comments: updated }
      })
      try {
        await createCollabLog({ author: '你', text })
      } catch (err) {
        console.error('Failed to save comment to API:', err)
      }
    },

    assign: async (id: number, task: string) => {
      const state = get()
      const agent = state.agents.find(a => a.id === id)
      if (!agent) return
      
      const updatedAgents = state.agents.map(a => a.id === id ? { ...a, currentTask: task, status: '分配中' } : a)
      savePersisted('agent_store_agents', updatedAgents)
      set({ agents: updatedAgents })
      
      try {
        const apiId = agent.id.toString()
        await updateAgent(apiId, { currentTask: task, status: '分配中' })
      } catch (err) {
        console.error('Failed to update agent in API:', err)
      }
    },

    clearAssignment: async (id: number) => {
      const state = get()
      const agent = state.agents.find(a => a.id === id)
      if (!agent) return
      
      const updatedAgents = state.agents.map(a => a.id === id ? { ...a, currentTask: undefined, status: '待命' } : a)
      savePersisted('agent_store_agents', updatedAgents)
      set({ agents: updatedAgents })
      
      try {
        const apiId = agent.id.toString()
        await updateAgent(apiId, { currentTask: null, status: '待命' })
      } catch (err) {
        console.error('Failed to clear agent in API:', err)
      }
    },
  }
})
