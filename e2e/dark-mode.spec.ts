import { test, expect, type Page } from '@playwright/test'

/** 从首页绑定 A08 桌台并进入点餐视图（menu），使 TopBar 可见。 */
async function enterMenu(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /A08/ }).first().click() // home → welcome
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click() // welcome → menu
}

/** 等待全局颜色过渡完成（250ms + 余量），避免 computed style 断言在过渡中间态。 */
async function waitForTransition(page: Page) {
  await page.waitForTimeout(400)
}

test.describe('暗黑模式 - E2E 验收测试', () => {
  test('REQ-001: 点击主题切换按钮在暗黑/浅色模式间切换，图标反映当前主题', async ({ page }) => {
    await enterMenu(page)

    // 初始为浅色模式：html 无 dark class
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    // 主题切换按钮可见，aria-label 为"切换暗黑模式"
    const themeBtn = page.getByRole('button', { name: '切换暗黑模式' })
    await expect(themeBtn).toBeVisible()

    // 浅色模式下按钮显示月亮图标（Moon SVG 存在）
    await expect(themeBtn.locator('svg.lucide-moon')).toBeVisible()

    // 点击切换至暗黑模式
    await themeBtn.click()
    await waitForTransition(page)

    // html 添加了 dark class
    await expect(page.locator('html')).toHaveClass(/dark/)

    // 暗黑模式下按钮显示太阳图标（Sun SVG）
    const themeBtnDark = page.getByRole('button', { name: '切换暗黑模式' })
    await expect(themeBtnDark.locator('svg.lucide-sun')).toBeVisible()

    // 页面显示切换提示消息
    await expect(page.getByText('已切换为暗黑模式')).toBeVisible()

    // 再次点击切换回浅色模式
    await themeBtnDark.click()
    await waitForTransition(page)

    // html 移除了 dark class
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    // 浅色模式下按钮恢复月亮图标
    await expect(page.getByRole('button', { name: '切换暗黑模式' }).locator('svg.lucide-moon')).toBeVisible()
  })

  test('REQ-002: 暗黑模式偏好通过 localStorage 持久化，刷新后保持且无闪烁', async ({ page }) => {
    await enterMenu(page)

    // 切换至暗黑模式
    await page.getByRole('button', { name: '切换暗黑模式' }).click()
    await waitForTransition(page)
    await expect(page.locator('html')).toHaveClass(/dark/)

    // localStorage 写入了 dark-mode=true
    const stored = await page.evaluate(() => localStorage.getItem('dark-mode'))
    expect(stored).toBe('true')

    // 刷新页面，暗黑模式应在 React 挂载前由内联脚本恢复，无 FOUC
    await page.reload()
    await waitForTransition(page)

    // 刷新后 html 仍有 dark class（内联脚本在 React 挂载前已添加）
    await expect(page.locator('html')).toHaveClass(/dark/)

    // 页面内容正常加载（菜单标题可见）
    await expect(page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()

    // localStorage 仍为 true
    const storedAfter = await page.evaluate(() => localStorage.getItem('dark-mode'))
    expect(storedAfter).toBe('true')
  })

  test('REQ-003: 暗黑模式样式跨视图一致应用（menu → order）', async ({ page }) => {
    await enterMenu(page)

    // 切换至暗黑模式
    await page.getByRole('button', { name: '切换暗黑模式' }).click()
    await waitForTransition(page)
    await expect(page.locator('html')).toHaveClass(/dark/)

    // menu 视图：主背景使用暗黑色板（night-900）
    const mainBg = page.locator('.bg-night-900').first()
    await expect(mainBg).toBeVisible()

    // 导航至 order 视图
    await page.getByRole('button', { name: /订单|Orders/ }).first().click()
    await waitForTransition(page)

    // order 视图仍保持暗黑模式
    await expect(page.locator('html')).toHaveClass(/dark/)

    // order 视图也有暗黑色板背景元素可见
    await expect(page.locator('.bg-night-900').first()).toBeVisible()

    // 导航回 menu 视图，暗黑模式仍然保持
    await page.getByRole('button', { name: /点餐|Menu/ }).first().click()
    await waitForTransition(page)
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
