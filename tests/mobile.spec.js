const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width:390, height:844 });
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#info-name')).toHaveValue('张三');
    fs.mkdirSync('artifacts/mobile', { recursive:true });
});

test('mobile editing uses the screen height, with live preview above style and layout controls', async ({ page }) => {
    await expect(page.locator('.editor-sidebar .editor-footer')).toHaveCount(0);
    const editor = await page.locator('.tab-content-container').boundingBox();
    expect(editor.height).toBeGreaterThan(600);
    await page.locator('#info-name').fill('移动端编辑');
    await page.locator('#info-title').fill('产品设计师');
    await expect(page.locator('.mobile-header #save-status')).toHaveText('已保存到本机');
    await page.screenshot({ path:'artifacts/mobile/content.png' });
    await page.locator('.mobile-dock [data-mobile-tab="style-tab"]').click();
    await expect(page.locator('#resume-page')).toBeVisible();
    const preview = await page.locator('.preview-container').boundingBox();
    const controls = await page.locator('.editor-sidebar').boundingBox();
    expect(preview.y + preview.height).toBeLessThanOrEqual(controls.y);
    expect(controls.height).toBeGreaterThan(350);
    await page.locator('[data-tpl="tpl-banner"]').click();
    await expect(page.locator('#resume-page')).toHaveClass(/tpl-banner/);
    await expect(page.locator('.header-name')).toHaveText('移动端编辑');
    await page.screenshot({ path:'artifacts/mobile/style.png' });
    await page.locator('#val-font-size').fill('12');
    await page.locator('#val-font-size').press('Tab');
    const scroll = await page.locator('.tab-content-container').evaluate(el => el.scrollTop);
    expect(scroll).toBeGreaterThan(100);
    await page.locator('.mobile-dock [data-mobile-tab="layout-tab"]').click();
    expect(await page.locator('.tab-content-container').evaluate(el => el.scrollTop)).toBe(0);
    await page.locator('#mobile-preview-toggle').click();
    await expect(page.locator('.preview-container')).toBeHidden();
    expect((await page.locator('.tab-content-container').boundingBox()).height).toBeGreaterThan(600);
    await page.locator('#mobile-preview-toggle').click();
    await page.locator('#header-align-trigger').click();
    await page.getByRole('option', { name:'居中', exact:true }).click();
    await page.screenshot({ path:'artifacts/mobile/layout.png' });
    await page.locator('.mobile-dock [data-mobile-tab="style-tab"]').click();
    expect(await page.locator('.tab-content-container').evaluate(el => el.scrollTop)).toBeCloseTo(scroll, 0);
    await page.locator('[data-workspace-view="preview"]').click();
    await expect(page.locator('.editor-sidebar')).toBeHidden();
    await expect(page.locator('#page-count')).toBeInViewport();
    await page.screenshot({ path:'artifacts/mobile/preview.png' });
    await page.locator('[data-workspace-view="edit"]').click();
    await expect(page.locator('#info-name')).toHaveValue('移动端编辑');
    expect(await page.evaluate(() => state.settings.fontSize)).toBe(12);
    expect(await page.evaluate(() => state.settings.headerAlign)).toBe('center');
});

test('mobile tools reuse existing actions and restore the desktop footer on resize', async ({ page }) => {
    await page.locator('#mobile-tools-trigger').click();
    await expect(page.locator('#mobile-tools-dialog')).toBeVisible();
    await page.screenshot({ path:'artifacts/mobile/tools.png', animations:'disabled' });
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name:'导出备份', exact:true }).click();
    const exported = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
    expect(exported.info.name).toBe('张三');
    exported.info.name = '手机导入成功';
    await page.locator('#mobile-tools-trigger').click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name:'导入备份', exact:true }).click();
    await (await chooser).setFiles({ name:'mobile.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(exported)) });
    await expect(page.locator('#info-name')).toHaveValue('手机导入成功');
    await page.locator('#mobile-tools-trigger').click();
    await page.locator('#mobile-theme-toggle').click();
    await expect(page.locator('body')).not.toHaveClass(/light-theme/);
    await page.locator('#mobile-tools-trigger').click();
    await page.locator('#mobile-tools-dialog [data-share-resume]').click();
    await expect(page.locator('#mobile-tools-dialog')).not.toBeVisible();
    await expect(page.locator('#share-dialog')).toBeVisible();
    await expect(page.locator('#copy-share-link')).toBeEnabled();
    await page.locator('#close-share-dialog').click();
    await page.locator('#mobile-tools-trigger').click();
    await page.locator('[data-mobile-tab="json-tab"]').click();
    await expect(page.locator('#raw-json-textarea')).toBeVisible();
    await expect(page.locator('#mobile-editor-title')).toHaveText('JSON 与 AI 助手');
    await page.locator('#mobile-tools-trigger').click();
    await page.setViewportSize({ width:1440, height:1000 });
    await expect(page.locator('#mobile-tools-dialog')).not.toBeVisible();
    await expect(page.locator('.editor-sidebar .editor-footer')).toBeVisible();
    await expect(page.locator('.editor-footer #save-status')).toBeVisible();
    await expect(page.locator('.editor-tabs')).toBeVisible();
    await expect(page.locator('#resume-page')).toBeVisible();
    await expect(page.locator('.mobile-dock')).toBeHidden();
    await page.setViewportSize({ width:390, height:844 });
    await page.locator('.mobile-dock [data-mobile-tab="layout-tab"]').click();
    await page.screenshot({ path:'artifacts/mobile/dark-layout.png' });
});

test('narrow screens keep controls reachable and a simulated keyboard gives space to input', async ({ page }) => {
    for (const width of [320,390,430,760]) {
        await page.setViewportSize({ width, height:844 });
        await page.locator('.mobile-dock [data-mobile-tab="style-tab"]').click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
        const dock = await page.locator('.mobile-dock').boundingBox();
        expect(dock.y + dock.height).toBeLessThanOrEqual(844);
        await expect(page.locator('#page-count')).toBeInViewport();
        await expect(page.locator('#mobile-tools-trigger')).toBeInViewport();
    }
    await page.setViewportSize({ width:390, height:844 });
    await page.locator('[data-workspace-view="edit"]').click();
    await page.locator('#info-name').focus();
    // Desktop automation cannot open a phone keyboard; exercise its visualViewport contract.
    await page.evaluate(() => {
        Object.defineProperty(visualViewport, 'height', { configurable:true, value:420 });
        visualViewport.dispatchEvent(new Event('resize'));
    });
    await expect(page.locator('body')).toHaveClass(/mobile-keyboard/);
    await expect(page.locator('.mobile-dock')).toBeHidden();
    await expect(page.locator('#info-name')).toBeInViewport();
    expect((await page.locator('.app-container').boundingBox()).height).toBe(420);
    await page.locator('#info-name').fill('键盘编辑正常');
    await page.evaluate(() => {
        delete visualViewport.height;
        document.activeElement.blur();
        visualViewport.dispatchEvent(new Event('resize'));
    });
    await expect(page.locator('.mobile-dock')).toBeVisible();
    await expect(page.locator('#info-name')).toHaveValue('键盘编辑正常');
    await page.locator('[data-workspace-view="preview"]').click();
    await page.emulateMedia({ media:'print' });
    await expect(page.locator('.mobile-header')).toBeHidden();
    await expect(page.locator('.mobile-dock')).toBeHidden();
    expect(await page.locator('.app-container').evaluate(el => getComputedStyle(el).position)).toBe('static');
    await page.pdf({ path:'artifacts/mobile/export.pdf', preferCSSPageSize:true, printBackground:true });
});
