const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const longSummary = '分页检查：' + '清晰表达专业能力与项目成果。'.repeat(240);

test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#info-name')).toHaveValue('张三');
    await page.evaluate(() => document.fonts.ready);
});

test('live editing shows overflow guides, and shortening removes them without changing the document', async ({ page }) => {
    const original = await page.evaluate(() => resumeApp.getData());
    await expect(page.locator('#pagination-notice')).toBeHidden();
    await expect(page.locator('.page-guide')).toHaveCount(0);
    await page.locator('.summary-text').fill(longSummary);
    await expect(page.locator('#pagination-notice')).toBeVisible();
    await expect(page.locator('#pagination-message')).toContainText('内容已超出 1 页');
    const pages = Number(await page.locator('#resume-page').getAttribute('data-pages'));
    expect(pages).toBeGreaterThan(1);
    await expect(page.locator('.page-guide')).toHaveCount(pages - 1);
    await expect(page.locator('#page-count')).toHaveText(`A4 · 约 ${pages} 页`);
    await expect(page.locator('#resume-page #page-guides')).toHaveCount(0);
    const sizes = await page.evaluate(() => {
        const sheet = document.getElementById('resume-page');
        const height = sheet.scrollHeight;
        for (let i = 0; i < 20; i++) adjustPreviewScale();
        return [height, sheet.scrollHeight];
    });
    expect(sizes[0]).toBe(sizes[1]);
    // The overlay must not intercept clicks or become part of the stored resume.
    expect(await page.locator('#page-guides').evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    await page.locator('.summary-text').fill('简短的个人简介。');
    await expect(page.locator('#pagination-notice')).toBeHidden();
    await expect(page.locator('.page-guide')).toHaveCount(0);
    await expect(page.locator('#page-count')).toHaveText('A4 · 约 1 页');
    const after = await page.evaluate(() => resumeApp.getData());
    expect({ ...after, info: original.info }).toEqual(original);
    expect(after.info.summary).toBe('简短的个人简介。');
});

test('page boundaries track margins, zoom and templates, and overflow remains readable on mobile', async ({ page }) => {
    await page.locator('.summary-text').fill(longSummary);
    await expect(page.locator('#pagination-notice')).toBeVisible();
    await page.locator('[data-tab="style-tab"]').click();
    for (const template of ['tpl-classic', 'tpl-split', 'tpl-editorial']) {
        await page.locator(`[data-tpl="${template}"]`).click();
        for (const padding of [12, 30]) {
            await page.locator('#val-margin-y').fill(String(padding));
            await page.locator('#val-margin-y').press('Tab');
            await expect.poll(() => page.evaluate(() => state.settings.paddingY)).toBe(padding);
            await page.locator('#zoom-in').click();
            const geometry = await page.evaluate(() => {
                const paper = document.getElementById('resume-page');
                const rect = paper.getBoundingClientRect();
                const scale = new DOMMatrixReadOnly(getComputedStyle(paper).transform).a;
                const lines = [...document.querySelectorAll('.page-guide')].map(el => el.getBoundingClientRect().top - rect.top);
                return { scale, lines, width: rect.width, guideWidth: document.getElementById('page-guides').getBoundingClientRect().width };
            });
            expect(geometry.lines.length).toBeGreaterThan(0);
            expect(Math.abs(geometry.lines[0] / geometry.scale - (297 - padding) * 96 / 25.4)).toBeLessThan(1);
            if (geometry.lines.length > 1) expect(Math.abs((geometry.lines[1] - geometry.lines[0]) / geometry.scale - (297 - 2 * padding) * 96 / 25.4)).toBeLessThan(1);
            expect(Math.abs(geometry.width - geometry.guideWidth)).toBeLessThan(1);
            await page.locator('#zoom-reset').click();
        }
    }
    await page.locator('[data-tpl="tpl-classic"]').click();
    const before = Number(await page.locator('#resume-page').getAttribute('data-pages'));
    await page.locator('#val-font-size').fill('18');
    await page.locator('#val-font-size').press('Tab');
    await expect.poll(async () => Number(await page.locator('#resume-page').getAttribute('data-pages'))).toBeGreaterThan(before);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-workspace-view="preview"]').click();
    await expect(page.locator('#pagination-notice')).toBeVisible();
    await expect(page.locator('#pagination-message')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    fs.mkdirSync('artifacts/pagination', { recursive: true });
    await page.screenshot({ path: 'artifacts/pagination/mobile.png' });
});

test('guides and warning are excluded from print, with no extra PDF pages', async ({ page }) => {
    test.setTimeout(60000);
    await page.locator('.summary-text').fill(longSummary);
    await expect(page.locator('#pagination-notice')).toBeVisible();
    fs.mkdirSync('artifacts/pagination', { recursive: true });
    await page.screenshot({ path: 'artifacts/pagination/desktop.png' });
    await page.locator('.preview-container').evaluate(el => { el.scrollTop = 740; });
    await page.screenshot({ path: 'artifacts/pagination/boundary.png' });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#page-guides')).toBeHidden();
    await expect(page.locator('#pagination-notice')).toBeHidden();
    const pdf = await page.pdf({ path: 'artifacts/pagination/overflow.pdf', preferCSSPageSize: true, printBackground: true });
    await page.locator('#page-guides, #pagination-notice').evaluateAll(elements => elements.forEach(el => el.remove()));
    const withoutHelpers = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    const pageCount = buffer => (buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    expect(pageCount(pdf)).toBeGreaterThan(1);
    expect(pageCount(pdf)).toBe(pageCount(withoutHelpers));
});
