import React from 'react'
import { render, fireEvent, waitFor, screen, cleanup } from '@testing-library/react'
import { expect, test, beforeEach, afterEach, vi } from 'vitest'
import AgentPanel from '../components/AgentPanel'

let promptSpy: any
let confirmSpy: any

beforeEach(() => {
  window.localStorage.clear()
  promptSpy = vi.spyOn(window, 'prompt').mockImplementation(() => 'Task A')
  confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)
})

afterEach(() => {
  promptSpy.mockRestore()
  confirmSpy.mockRestore()
  cleanup()
  window.localStorage.clear()
})

test('Agent assignment persists across reload and can be cleared', async () => {
  const { unmount } = render(<AgentPanel />)
  const assignButtons = screen.getAllByText('分配')
  expect(assignButtons.length).toBeGreaterThan(0)
  // Assign to the first agent
  fireEvent.click(assignButtons[0])

  // Wait for task to appear in UI
  await waitFor(() => {
    expect(screen.getByText(/任务:/)).toBeInTheDocument()
  })

  // Check localStorage persistence
  const persisted = JSON.parse(window.localStorage.getItem('agent_store_agents') || 'null')
  expect(persisted).toBeTruthy()
  const firstAgent = persisted.find((a: any) => a.id === 1)
  expect(firstAgent).toBeTruthy()
  expect(firstAgent.currentTask).toBe('Task A')

  // Clear assignment if possible
  const clearButtons = screen.queryAllByText('清除')
  if (clearButtons.length > 0) {
    fireEvent.click(clearButtons[0])
  }

  // Reload by unmounting and remounting
  unmount()
  render(<AgentPanel />)
  const persistedAfterClear = JSON.parse(window.localStorage.getItem('agent_store_agents') || 'null')
  const firstAgentAfterClear = persistedAfterClear.find((a: any) => a.id === 1)
  // currentTask should be undefined after clear
  expect(firstAgentAfterClear?.currentTask).toBeUndefined()
})
