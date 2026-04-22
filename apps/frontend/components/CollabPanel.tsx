import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'

const CollabPanel: React.FC = () => {
  const [text, setText] = useState('')
  const comments = useStore(s => s.comments)
  const addComment = useStore(s => s.addComment)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments.length])

  return (
    <div className="p-3 border-t border-zinc-800 mt-2">
      <div className="sidebar-title mb-2">协作日志</div>
      <textarea 
        className="input" 
        placeholder="记录协作日志..." 
        value={text} 
        onChange={e=>setText(e.target.value)} 
        style={{ minHeight:60, fontSize: 13 }}
      />
      <button 
        className="btn btn-primary mt-2 w-full" 
        onClick={()=>{ if(text.trim()){ addComment(text.trim()); setText(''); } }}
        disabled={!text.trim()}
      >
        添加日志
      </button>
      
      {comments.length > 0 && (
        <div ref={listRef} className="mt-3 space-y-2 max-h-40 overflow-y-auto" style={{ maxHeight: 160 }}>
          {comments.slice().reverse().map(c => (
            <div key={c.id} className="bg-zinc-800/30 rounded p-2 border border-zinc-700/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-400">{c.author}</span>
                <span className="text-xs text-gray-500">{new Date(c.ts).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-gray-300">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CollabPanel
