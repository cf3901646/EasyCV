const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#resume-render-target')).toContainText('张三');
});

test('desktop editing, persistence, shared schemes and templates', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.locator('#info-name').fill('林知远');
    await expect(page.locator('.header-name')).toHaveText('林知远');
    await page.locator('#btn-view-example').click();
    await expect(page.locator('.header-name')).toHaveText('林知远');
    await expect(page.locator('#resume-page')).toHaveClass(/tpl-split/);
    await page.locator('[data-tab="style-tab"]').click();
    await page.locator('[data-tpl="tpl-academic"]').click();
    await expect(page.locator('#resume-page')).toHaveClass(/tpl-academic/);
    await page.locator('#btn-view-user').click();
    await expect(page.locator('#resume-page')).toHaveClass(/tpl-classic/);
    await page.reload();
    await expect(page.locator('.header-name')).toHaveText('林知远');
    await expect(page.locator('body')).toHaveClass(/light-theme/);
    await page.locator('#theme-toggle-btn').click();
    await expect(page.locator('body')).not.toHaveClass(/light-theme/);
    expect(errors).toEqual([]);
});

test('JSON without settings, atomic invalid import, HTML safety and public API', async ({ page }) => {
    await page.evaluate(() => {
        const data = resumeApp.getData();
        delete data.settings;
        delete data.custom;
        data.info.name = '<img src=x onerror="window.injected=true">';
        data.work[0].company = '\" autofocus onfocus=\"window.injected=true';
        data.info.summary = '<strong>可保留加粗</strong><script>window.injected=true</script>';
        resumeApp.setData(data);
    });
    await expect(page.locator('#resume-page img, #resume-page script')).toHaveCount(0);
    await expect(page.locator('.summary-text strong')).toHaveText('可保留加粗');
    expect(await page.evaluate(() => window.injected)).toBeUndefined();
    expect(await page.evaluate(() => resumeApp.state === state)).toBe(true);
    expect(await page.evaluate(() => {
        const old = JSON.stringify(resumeApp.getData());
        try { resumeApp.setData({info:{name:'无效'}, work:'invalid'}); } catch {}
        return old === JSON.stringify(resumeApp.getData());
    })).toBe(true);
    expect(await page.evaluate(() => sanitizeHTMLKeepBold('<strong onclick="alert(1)">安全</strong>'))).toBe('<strong>安全</strong>');
});

test('mobile layout, keyboard controls, zoom and print', async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await expect(page.locator('#info-name')).toBeVisible();
    await page.locator('#sec-work .accordion-header').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#sec-work .accordion-header')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('[data-workspace-view="preview"]').click();
    await expect(page.locator('#resume-page')).toBeVisible();
    const bounds = await page.locator('#resume-page').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(391);
    await page.locator('#zoom-out').click();
    await page.locator('#zoom-reset').click();
    await page.emulateMedia({media:'print'});
    await expect(page.locator('.workspace-header')).toBeHidden();
    expect(await page.locator('#resume-page').evaluate(el => getComputedStyle(el).transform)).toBe('none');
});

test('list operations, inline edits and JSON file round-trip', async ({ page }) => {
    await page.locator('#sec-skills .accordion-header').click();
    const count = await page.locator('#skills-list-container .dynamic-list-item').count();
    await page.locator('#sec-skills .add-btn').click();
    const item = page.locator('#skills-list-container .dynamic-list-item').last();
    await item.locator('input').first().fill('新技能');
    await item.locator('[title="上移"]').click();
    await expect(page.locator('#skills-list-container .dynamic-list-item').nth(count - 1).locator('input').first()).toHaveValue('新技能');
    await page.locator('#skills-list-container .dynamic-list-item').nth(count - 1).locator('[title="删除"]').click();
    await expect(page.locator('#skills-list-container .dynamic-list-item')).toHaveCount(count);
    await page.locator('.header-name').fill('林知远');
    await page.locator('.workspace-brand').click();
    await expect(page.locator('#info-name')).toHaveValue('林知远');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[onclick="downloadJSONFile()"]').click();
    const download = await downloadPromise;
    const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    expect(backup.info.name).toBe('林知远');
    backup.info.name = '备份恢复';
    delete backup.settings;
    await page.locator('#json-upload-input').setInputFiles({name:'resume.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
    await expect(page.locator('.header-name')).toHaveText('备份恢复');
    await page.locator('[data-tab="json-tab"]').click();
    backup.info.name = 'JSON 修改';
    await page.locator('#raw-json-textarea').fill(JSON.stringify(backup));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[onclick="applyRawJSON()"]').click();
    await expect(page.locator('.header-name')).toHaveText('JSON 修改');
});

test('offline resources, visual snapshots and actual PDF export', async ({ page }) => {
    const external = [];
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1')) external.push(request.url()); });
    await page.route('https://**/*', route => route.abort());
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    expect(external).toEqual([]);
    fs.mkdirSync('artifacts', {recursive:true});
    await page.screenshot({path:'artifacts/desktop-light.png'});
    await page.locator('[data-tab="style-tab"]').click();
    await page.screenshot({path:'artifacts/desktop-style.png'});
    for (const template of ['tpl-classic','tpl-split','tpl-academic']) {
        await page.locator(`[data-tpl="${template}"]`).click();
        const pdf = await page.pdf({path:`artifacts/${template}.pdf`, preferCSSPageSize:true, printBackground:true});
        expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    }
    await page.locator('[data-tpl="tpl-classic"]').click();
    await page.locator('[data-tab="content-tab"]').click();
    await page.locator('#theme-toggle-btn').click();
    await page.screenshot({path:'artifacts/desktop-dark.png', animations:'disabled'});
    await page.locator('#theme-toggle-btn').click();
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'artifacts/mobile-edit.png'});
    await page.locator('[data-workspace-view="preview"]').click();
    await page.screenshot({path:'artifacts/mobile-preview.png'});
    console.log('Local resource bytes:', await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.decodedBodySize, 0)));
    await page.goto(require('node:url').pathToFileURL(require('node:path').resolve('index.html')).href);
    await expect(page.locator('#info-name')).toHaveValue('张三');
    await page.locator('#info-name').fill('离线文件编辑');
    await expect(page.locator('.header-name')).toHaveText('离线文件编辑');
});

test('empty optional contacts disappear completely and restore immediately in all templates', async ({ page }) => {
    for (const template of ['tpl-classic', 'tpl-split', 'tpl-academic']) {
        await page.locator('[data-tab="style-tab"]').click();
        await page.locator(`[data-tpl="${template}"]`).click();
        await page.locator('[data-tab="content-tab"]').click();
        await page.locator('#info-github').fill('');
        await page.locator('#info-blog').fill('   ');
        await expect(page.locator('#resume-page .fa-github, #resume-page .fa-globe')).toHaveCount(0);
        await expect(page.locator('#resume-page a')).toHaveCount(0);
        await page.emulateMedia({media:'print'});
        await expect(page.locator('#resume-page .fa-github, #resume-page .fa-globe')).toHaveCount(0);
        await page.emulateMedia({media:'screen'});
        await page.locator('#info-github').fill('https://github.com/example');
        await page.locator('#info-blog').fill('portfolio.example');
        await expect(page.locator('#resume-page .fa-github, #resume-page .fa-globe')).toHaveCount(2);
        await expect(page.locator('#resume-page a').first()).toHaveAttribute('href', 'https://github.com/example');
        await expect(page.locator('#resume-page a').last()).toHaveAttribute('href', 'https://portfolio.example/');
        await page.locator('[data-edit-path="info.blog"]').fill('');
        await expect(page.locator('#resume-page .fa-globe')).toHaveCount(0);
        await expect(page.locator('#info-blog')).toHaveValue('');
    }
    const sidebar = await page.locator('.editor-sidebar').boundingBox();
    expect(sidebar.x).toBeGreaterThan(0);
    expect(sidebar.y).toBeGreaterThan(0);
    expect(await page.locator('.editor-sidebar').evaluate(el => parseInt(getComputedStyle(el).borderRadius))).toBeGreaterThanOrEqual(24);
    expect((await page.locator('#resume-page').boundingBox()).y).toBeLessThan(100);
});
