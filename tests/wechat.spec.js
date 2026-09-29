const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8765/';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#info-name')).toHaveValue('张三');
});

test('wechat input in basic info binds to resume canvas with WeChat icon and supports two-way editing', async ({ page }) => {
    const wechatInput = page.locator('#info-wechat');
    await expect(wechatInput).toBeVisible();
    await expect(wechatInput).toHaveAttribute('placeholder', '选填，留空隐藏');

    // 1. 默认留空时，画布上不应出现微信图标
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);

    // 2. 填写微信号，画布立即渲染图标与内容
    await wechatInput.fill('wxid_antigravity_888');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);
    const wechatCanvasEl = page.locator('#resume-page [data-edit-path="info.wechat"]');
    await expect(wechatCanvasEl).toHaveText('wxid_antigravity_888');

    // 确保微信号不是 <a> 标签链接，而是纯文本
    await expect(page.locator('#resume-page a:has(.fa-weixin)')).toHaveCount(0);

    // 3. 验证内存数据同步
    const stateData = await page.evaluate(() => resumeApp.getData());
    expect(stateData.info.wechat).toBe('wxid_antigravity_888');

    // 4. 清空输入框，画布上的微信图标与文字完全消失
    await wechatInput.fill('');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveCount(0);

    // 5. 纯空格字符串也应视为留空并隐藏
    await wechatInput.fill('    ');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);
});

test('in-place editing on resume canvas synchronizes to sidebar form and storage', async ({ page }) => {
    const wechatInput = page.locator('#info-wechat');
    await wechatInput.fill('wx_initial');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);

    // 画布就地编辑
    const canvasNode = page.locator('#resume-page [data-edit-path="info.wechat"]');
    await canvasNode.fill('wx_canvas_updated');
    await expect(wechatInput).toHaveValue('wx_canvas_updated');

    const data = await page.evaluate(() => resumeApp.getData());
    expect(data.info.wechat).toBe('wx_canvas_updated');

    // 画布就地清空，立刻移除 DOM 节点
    await canvasNode.fill('');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);
    await expect(wechatInput).toHaveValue('');
});

test('wechat works across templates and respects contact icon toggle', async ({ page }) => {
    await page.locator('#info-wechat').fill('wx_developer_pro');

    const templates = ['tpl-classic', 'tpl-split', 'tpl-academic', 'tpl-card', 'tpl-modern'];
    for (const tpl of templates) {
        await page.locator('[data-tab="style-tab"]').click();
        await page.locator(`[data-tpl="${tpl}"]`).click();
        await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);
        await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_developer_pro');
    }

    // 测试隐藏联系方式图标
    await page.locator('[data-tab="layout-tab"]').click();
    const hideIconsBtn = page.locator('#contact-icons-trigger');
    if (await hideIconsBtn.isVisible()) {
        await hideIconsBtn.click();
        await page.getByRole('option', { name: '隐藏', exact: true }).click();
        await expect(page.locator('#resume-page .fa-weixin')).toBeHidden();
    }
});

test('wechat persists across page reload, JSON import/export and URL sharing', async ({ page, browser }) => {
    // 1. 页面重载持久化测试
    await page.locator('#info-wechat').fill('wx_persistent_101');
    await page.reload();
    await expect(page.locator('#info-wechat')).toHaveValue('wx_persistent_101');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_persistent_101');

    // 2. JSON 导入导出测试
    const currentData = await page.evaluate(() => resumeApp.getData());
    expect(currentData.info.wechat).toBe('wx_persistent_101');

    // 兼容测试：老版本缺少 wechat 字段的 JSON 正常导入，不崩溃且默认置空
    delete currentData.info.wechat;
    currentData.info.name = '无微信号老数据用户';
    await page.evaluate(d => resumeApp.setData(d), currentData);
    await expect(page.locator('#info-name')).toHaveValue('无微信号老数据用户');
    await expect(page.locator('#info-wechat')).toHaveValue('');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);

    // 导入包含新 wechat 字段的数据
    currentData.info.wechat = 'wx_imported_new';
    await page.evaluate(d => resumeApp.setData(d), currentData);
    await expect(page.locator('#info-wechat')).toHaveValue('wx_imported_new');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);

    // 3. 分享链接往返测试 (URL Hash Share)
    const shareUrl = await page.evaluate(() => EasyCVShare.createURL());
    expect(shareUrl).toContain('#resume=');

    const recipient = await browser.newPage();
    await recipient.goto(shareUrl);
    await expect(recipient.locator('#info-wechat')).toHaveValue('wx_imported_new');
    await expect(recipient.locator('#resume-page .fa-weixin')).toHaveCount(1);
    await expect(recipient.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_imported_new');
    const recipientData = await recipient.evaluate(() => resumeApp.getData());
    expect(recipientData.info.wechat).toBe('wx_imported_new');
    await recipient.close();
});

test('wechat field safely escapes malicious HTML', async ({ page }) => {
    const malicious = '<script>window.xss=true</script><img src=x onerror="window.xss=true">';
    await page.locator('#info-wechat').fill(malicious);

    await expect(page.locator('#resume-page script, #resume-page img')).toHaveCount(0);
    expect(await page.evaluate(() => window.xss)).toBeUndefined();
});
