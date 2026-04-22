import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { test, expect, beforeEach, afterEach } from 'vitest'
import CollabPanel from '../components/CollabPanel'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

test('CollabPanel can add logs and persist', async () => {
  const { getByPlaceholderText, getByText } = render(<CollabPanel />)
  const textarea = getByPlaceholderText('记录协作日志...') as HTMLTextAreaElement
  fireEvent.change(textarea, { target: { value: 'Team sync: all hands at 10' } })
  const addBtn = getByText('添加日志')
  fireEvent.click(addBtn)

  await waitFor(() => {
    expect(screen.getByText('Team sync: all hands at 10')).toBeInTheDocument()
  })

  const logs = JSON.parse(window.localStorage.getItem('agent_store_comments') || '[]')
  expect(logs.length).toBeGreaterThan(0)
  const last = logs[logs.length - 1]
  expect(last.text).toBe('Team sync: all hands at 10')
})
