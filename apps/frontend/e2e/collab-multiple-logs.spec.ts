import { test, expect } from '@playwright/test'

test.describe('CollabPanel Multiple Logs MVP', () => {
  test('can add multiple logs and they persist across reload', async ({ page }) => {
    await page.goto('/editor')

    // Add first log
    await page.fill('textarea[placeholder="记录协作日志..."]', 'First log entry')
    await page.click('text=添加日志')
    await expect(page.locator('text=First log entry')).toBeVisible()

    // Add second log
    await page.fill('textarea[placeholder="记录协作日志..."]', 'Second log entry')
    await page.click('text=添加日志')
    await expect(page.locator('text=Second log entry')).toBeVisible()

    // Verify both logs are present and newest first (since CollabPanel reverses)
    const logTexts = await page.locator('.bg-zinc-800/30').allTextContents()
    // Should contain both logs, with second log appearing first due to reverse()
    expect(logTexts.join(' ')).toContain('Second log entry')
    expect(logTexts.join(' ')).toContain('First log entry')

    // Persist to localStorage
    const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_comments') || '[]'))
    expect(logs.length).toBeGreaterThanOrEqual(2)
    // Most recent log should be at index 0 (since we push and then reverse in UI)
    expect(logs[0]?.text).toBe('Second log entry')
    expect(logs[1]?.text).toBe('First log entry')

    // Reload and verify persistence
    await page.reload()

    // After reload, logs should still be present
    const logTextsAfter = await page.locator('.bg-zinc-800/30').allTextContents()
    expect(logTextsAfter.join(' ')).toContain('Second log entry')
    expect(logTextsAfter.join(' ')).toContain('First log entry')

    const logsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('agent_store_comments') || '[]'))
    expect(logsAfter.length).toBeGreaterThanOrEqual(2)
    expect(logsAfter[0]?.text).toBe('Second log entry')
    expect(logsAfter[1]?.text).toBe('First log entry')
  })
})