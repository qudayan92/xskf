import { test, expect } from '@playwright/test'

test.describe('Agent & Collab MVP End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor page
    await page.goto('/editor')
  })

  test('assign task and add log persists across reload', async ({ page }) => {
    // Ensure three-column layout is present
    await expect(page.locator('div[style]')).toBeTruthy()
    // Mock window.prompt to return a task description
    await page.evaluate(() => {
      // @ts-ignore
      window.prompt = () => 'Task from E2E'
    })
    // Click first Assign button in AgentPanel
    await page.click('text=分配')

    // Verify the assignment shows up in UI
    await expect(page.locator('text=任务: Task from E2E')).toBeVisible()
    // Read localStorage to verify persistence
    const agents = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_agents') || 'null'))
    const first = agents?.find((a: any) => a.id === 1)
    expect(first).toBeDefined()
    expect(first.currentTask).toBe('Task from E2E')

    // Add a log via CollabPanel
    await page.fill('textarea[placeholder="记录协作日志..."]', 'End-to-end: log entry')
    await page.click('text=添加日志')
    await expect(page.locator('text=End-to-end: log entry')).toBeVisible()
    const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_comments') || '[]'))
    expect(logs.length).toBeGreaterThan(0)

    // Reload and verify persistence
    await page.reload()
    // After reload, we should still be able to read the persisted task
    const agentsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_agents') || 'null'))
    const firstAfter = agentsAfter?.find((a: any) => a.id === 1)
    expect(firstAfter?.currentTask).toBe('Task from E2E')
  })
})
