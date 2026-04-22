import { test, expect } from '@playwright/test'

test.describe('Agent Clear Assignment MVP', () => {
  test('assign then clear should persist and reload', async ({ page }) => {
    await page.goto('/editor')
    // Mock prompt to return a task
    await page.evaluate(() => {
      // @ts-ignore
      window.prompt = () => 'Task to clear'
    })
    // Click first Assign button in AgentPanel
    await page.click('text=分配')
    // Wait for the task to appear in UI
    await expect(page.locator('text=/任务:/')).toBeVisible()
    // Click Clear button when available
    await page.click('text=清除')
    // Ensure no task is shown after clearing
    await expect(page.locator('text=/任务:/')).toHaveCount(0)
    // Persisted state should reflect cleared task after reload
    await page.reload()
    const agents = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_agents') || 'null'))
    const first = agents?.find((a: any) => a.id === 1)
    expect(first?.currentTask).toBeUndefined()
  })
})
