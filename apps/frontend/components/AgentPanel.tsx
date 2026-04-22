import React from 'react'
import { useStore } from '../store'

const AgentPanel: React.FC = () => {
  const agents = useStore(s => s.agents)
  const assign = useStore(s => s.assign)
  const clearAssignment = useStore(s => s.clearAssignment)

  const handleAssign = (id: number) => {
    const task = prompt('请输入要分配的任务描述')
    if (task && task.trim()) assign(id, task.trim())
  }

  const handleClear = (id: number) => {
    if (clearAssignment) clearAssignment(id)
  }

  return (
    <div className="p-3 border-t border-zinc-800 mt-2">
      <div className="sidebar-title mb-2">Agent 面板</div>
      <div className="grid grid-cols-2 gap-2">
        {agents.map(a => (
          <div key={a.id} className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="flex-shrink-0 flex items-center justify-center" 
                style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)' }}
              >
                <span style={{ fontSize: 14 }}>{a.avatar}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{a.name}</div>
                <div className="text-xs text-gray-400">{a.role}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                a.status === '待命' ? 'bg-green-600/20 text-green-400' : 
                a.status === '分配中' ? 'bg-amber-500/20 text-amber-400' :
                'bg-zinc-700/50 text-gray-400'
              }`}>
                {a.status}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="text-xs px-2 py-1 rounded bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300 transition-colors"
                  onClick={()=>handleAssign(a.id)}
                >
                  分配
                </button>
                {a.currentTask && (
                  <button
                    className="text-xs px-2 py-1 rounded bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300 transition-colors"
                    onClick={()=>handleClear(a.id)}
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
            {a.currentTask && (
              <div className="mt-1 text-xs text-gray-400 truncate" title={a.currentTask}>
                任务: {a.currentTask}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentPanel
