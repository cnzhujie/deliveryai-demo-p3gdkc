import { test, expect } from '@playwright/test'

test.describe('首页推荐菜展示 - E2E 验收测试', () => {
  test('REQ-001: 首页推荐菜区域可见且卡片内容正确', async ({ page }) => {
    await page.goto('/')

    // 推荐菜区域标题可见
    await expect(page.getByRole('heading', { name: '今日推荐' })).toBeVisible()

    // 推荐菜卡片：4 道带 badge 的菜品
    const cards = page.locator('section:has(> h2:text("今日推荐")) article')
    await expect(cards).toHaveCount(4)

    // 验证第一张卡片（p1 鎏金番茄鸳鸯锅）内容
    const firstCard = cards.first()
    await expect(firstCard.getByRole('heading')).toHaveText('鎏金番茄鸳鸯锅')
    await expect(firstCard.getByText('¥68.00')).toBeVisible()
    await expect(firstCard.getByText('人气 No.1')).toBeVisible()

    // 验证徽章文案覆盖全部 4 种
    await expect(cards.nth(1).getByText('招牌')).toBeVisible()
    await expect(cards.nth(2).getByText('主厨推荐')).toBeVisible()
    await expect(cards.nth(3).getByText('新品')).toBeVisible()
  })

  test('REQ-002: 点击推荐菜卡片弹出菜品详情弹窗', async ({ page }) => {
    await page.goto('/')

    // 点击第一张推荐菜卡片
    const cards = page.locator('section:has(> h2:text("今日推荐")) article')
    await cards.first().click()

    // 弹窗标题为菜品名称
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: '鎏金番茄鸳鸯锅' })).toBeVisible()

    // 弹窗内展示描述、价格和徽章
    await expect(dialog.getByText('慢熬番茄与醇香牛油，一锅双味')).toBeVisible()
    await expect(dialog.getByText('¥68.00')).toBeVisible()
    await expect(dialog.getByText('人气 No.1')).toBeVisible()

    // 底部有"去点餐"CTA 按钮
    await expect(dialog.getByRole('button', { name: '去点餐' })).toBeVisible()
  })

  test('REQ-002: 点击"去点餐"关闭弹窗并提示选择桌台', async ({ page }) => {
    await page.goto('/')

    // 打开菜品详情弹窗
    const cards = page.locator('section:has(> h2:text("今日推荐")) article')
    await cards.first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 点击"去点餐"
    await dialog.getByRole('button', { name: '去点餐' }).click()

    // 弹窗关闭
    await expect(dialog).not.toBeVisible()

    // 桌台区域出现提示文案"请先选择桌台"
    await expect(page.getByText('请先选择桌台')).toBeVisible()

    // 桌台绑定功能仍然正常可用
    await expect(page.getByRole('button', { name: /A08/ }).first()).toBeVisible()
  })
})
