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

test('wechat works across all 9 templates and respects contact icon toggle', async ({ page }) => {
    await page.locator('#info-wechat').fill('wx_developer_pro');

    const templates = [
        'tpl-classic', 'tpl-split', 'tpl-academic', 'tpl-minimal',
        'tpl-editorial', 'tpl-studio', 'tpl-timeline', 'tpl-card', 'tpl-banner'
    ];
    for (const tpl of templates) {
        await page.locator('[data-tab="style-tab"]').click();
        await page.locator(`[data-tpl="${tpl}"]`).click();
        await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);
        await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_developer_pro');
    }

    // 测试隐藏联系方式图标
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#contact-icons-trigger').click();
    await page.getByRole('option', { name: '隐藏', exact: true }).click();
    await expect(page.locator('#resume-page .fa-weixin')).toBeHidden();

    // 重新开启图标
    await page.locator('#contact-icons-trigger').click();
    await page.getByRole('option', { name: '显示', exact: true }).click();
    await expect(page.locator('#resume-page .fa-weixin')).toBeVisible();
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

test('wechat supports long strings in split layout and Chinese/special characters', async ({ page }) => {
    // 切换到双栏窄边栏模板 tpl-split
    await page.locator('[data-tab="style-tab"]').click();
    await page.locator('[data-tpl="tpl-split"]').click();

    // 填入中英文混排、含括号的微信号
    await page.locator('[data-tab="content-tab"]').click();
    const mixedWechat = 'wx_test_888 (同手机号)';
    await page.locator('#info-wechat').fill(mixedWechat);
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText(mixedWechat);

    // 填入超长微信号，确保不溢出容器、正常渲染
    const longWechat = 'wxid_very_long_custom_wechat_identifier_1234567890';
    await page.locator('#info-wechat').fill(longWechat);
    const canvasEl = page.locator('#resume-page [data-edit-path="info.wechat"]');
    await expect(canvasEl).toHaveText(longWechat);
    const box = await canvasEl.boundingBox();
    expect(box.width).toBeGreaterThan(0);
});

test('legacy easycv_resume_state in localStorage hydrates cleanly without wechat', async ({ page }) => {
    // 模拟仅存在旧版 easycv_resume_state 缓存的场景
    await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('easycv_resume_state', JSON.stringify({
            info: {
                name: '历史老用户',
                title: '前端工程师',
                email: 'old@example.com',
                phone: '139-0000-0000',
                location: '深圳',
                github: 'github.com/old',
                blog: 'old.me',
                summary: '五年老员工'
            }
        }));
    });
    await page.reload();

    await expect(page.locator('#info-name')).toHaveValue('历史老用户');
    await expect(page.locator('#info-wechat')).toHaveValue('');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);

    const data = await page.evaluate(() => resumeApp.getData());
    expect(data.info.wechat).toBe('');
});

test('wechat field safely escapes malicious HTML', async ({ page }) => {
    const malicious = '<script>window.xss=true</script><img src=x onerror="window.xss=true">';
    await page.locator('#info-wechat').fill(malicious);

    await expect(page.locator('#resume-page script, #resume-page img')).toHaveCount(0);
    expect(await page.evaluate(() => window.xss)).toBeUndefined();
});

test('wechat renders and toggles properly under print emulation', async ({ page }) => {
    await page.locator('#info-wechat').fill('wx_print_test');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);

    // 1. 打印样式模拟下微信图标和文字正常保留
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#resume-page .fa-weixin')).toBeVisible();
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_print_test');

    // 2. 隐藏联系方式图标在打印样式下同步生效
    await page.emulateMedia({ media: 'screen' });
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#contact-icons-trigger').click();
    await page.getByRole('option', { name: '隐藏', exact: true }).click();

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#resume-page .fa-weixin')).toBeHidden();
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_print_test');

    // 3. 恢复显示并在清空后验证打印下完全移除
    await page.emulateMedia({ media: 'screen' });
    await page.locator('#contact-icons-trigger').click();
    await page.getByRole('option', { name: '显示', exact: true }).click();
    await page.locator('[data-tab="content-tab"]').click();
    await page.locator('#info-wechat').fill('');

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(0);
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveCount(0);
    await page.emulateMedia({ media: 'screen' });
});

test('wechat is shared between scheme A and scheme B', async ({ page }) => {
    await page.locator('#info-wechat').fill('wx_shared_scheme');
    await expect(page.locator('#resume-page .fa-weixin')).toHaveCount(1);

    // 切换到方案 B
    await page.locator('#btn-view-example').click();
    await expect(page.locator('#info-wechat')).toHaveValue('wx_shared_scheme');
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_shared_scheme');

    // 切换回方案 A
    await page.locator('#btn-view-user').click();
    await expect(page.locator('#info-wechat')).toHaveValue('wx_shared_scheme');
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_shared_scheme');
});

test('wechat field is accessible and live updates on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const wechatInput = page.locator('#info-wechat');
    await expect(wechatInput).toBeVisible();

    await wechatInput.fill('wx_mobile_lead');

    // 切换到移动端预览
    await page.locator('[data-workspace-view="preview"]').click();
    await expect(page.locator('#resume-page')).toBeVisible();
    await expect(page.locator('#resume-page .fa-weixin')).toBeVisible();
    await expect(page.locator('#resume-page [data-edit-path="info.wechat"]')).toHaveText('wx_mobile_lead');

    // 切换回移动端编辑
    await page.locator('[data-workspace-view="edit"]').click();
    await expect(wechatInput).toHaveValue('wx_mobile_lead');
});

test('editing wechat never mutates SAMPLE_RESUME_DATA in memory', async ({ page }) => {
    const initialSampleWechat = await page.evaluate(() => SAMPLE_RESUME_DATA.info.wechat);
    expect(initialSampleWechat).toBe('');

    await page.locator('#info-wechat').fill('wx_immutable_check');
    const mutatedOrNot = await page.evaluate(() => SAMPLE_RESUME_DATA.info.wechat);
    expect(mutatedOrNot).toBe('');
});
