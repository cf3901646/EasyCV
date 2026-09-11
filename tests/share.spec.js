const {test, expect} = require('@playwright/test');
const {gzipSync} = require('node:zlib');
const BASE = 'http://127.0.0.1:8765/';
const token = (payload, compressed = false) => (compressed ? '1g.' : '1j.') + (compressed ? gzipSync(Buffer.from(JSON.stringify(payload))) : Buffer.from(JSON.stringify(payload))).toString('base64url');

test('share restores Unicode, rich text and all layout values in each template', async ({page, browser}) => {
    await page.goto(BASE);
    for (const template of ['tpl-classic', 'tpl-split', 'tpl-academic']) {
        const snapshot = await page.evaluate(template => {
            const data = resumeApp.getData();
            data.info.name = '林知远 👩🏻‍💻 + / # &';
            data.info.summary = '中文与 émoji <strong>重点经历</strong>\n下一行';
            data.info.github = '';
            data.settings = {...data.settings, template, font:'font-outfit', accentColor:'#156755', fontSize:10.5, lineHeight:1.45, paddingX:17, secSpacing:9, sidebarTitleSize:1.13};
            resumeApp.setData(data);
            return resumeApp.getData();
        }, template);
        const url = await page.evaluate(() => EasyCVShare.createURL());
        expect(url).toMatch(/#resume=1g\.[A-Za-z0-9_-]+$/);
        const recipient = await browser.newPage();
        await recipient.goto(url);
        await expect(recipient.locator('#info-name')).toHaveValue(snapshot.info.name);
        expect(await recipient.evaluate(() => resumeApp.getData())).toEqual(snapshot);
        await expect(recipient.locator('.summary-text strong')).toHaveText('重点经历');
        await expect(recipient.locator('#resume-page .fa-github')).toHaveCount(0);
        await expect(recipient.locator('#shared-resume-banner')).toBeVisible();
        expect(await recipient.locator('#resume-page').getAttribute('class')).toContain(template);
        await recipient.emulateMedia({media:'print'});
        await expect(recipient.locator('#shared-resume-banner')).toBeHidden();
        await expect(recipient.locator('#resume-page')).toBeVisible();
        await recipient.close();
    }
});

test('shared editing, JSON import, scheme switching and pagehide never overwrite local resume', async ({page}) => {
    await page.goto(BASE);
    await page.locator('#info-name').fill('接收方自己的简历');
    await page.locator('#btn-view-example').click();
    const original = await page.evaluate(() => { flushLocalSave(); return {...localStorage}; });
    const url = await page.evaluate(() => {
        const data = resumeApp.getData();
        data.info.name = '分享者的简历';
        data.settings.accentColor = '#aa3300';
        return EasyCVShare.createURL(data);
    });
    await page.goto(url);
    await expect(page.locator('#info-name')).toHaveValue('分享者的简历');
    await page.locator('#info-name').fill('暂时编辑');
    await page.locator('#btn-view-example').click();
    await expect(page.locator('#info-name')).toHaveValue('暂时编辑');
    await page.locator('#btn-view-user').click();
    const backup = await page.evaluate(() => resumeApp.getData());
    backup.info.name = '在分享会话导入备份';
    await page.locator('#json-upload-input').setInputFiles({name:'resume.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(backup))});
    await expect(page.locator('#info-name')).toHaveValue(backup.info.name);
    await page.evaluate(() => { flushLocalSave(); window.dispatchEvent(new Event('pagehide')); });
    expect(await page.evaluate(() => ({...localStorage}))).toEqual(original);
    await page.reload();
    await expect(page.locator('#info-name')).toHaveValue('分享者的简历');
    await page.locator('#return-local-resume').click();
    await expect(page.locator('#info-name')).toHaveValue('接收方自己的简历');
    expect(await page.evaluate(() => ({...localStorage}))).toEqual(original);
});

test('invalid, unsupported, truncated and over-expanded links fall back without writing local data', async ({page}) => {
    await page.goto(BASE);
    await page.locator('#info-name').fill('保留我的简历');
    const original = await page.evaluate(() => { flushLocalSave(); return {...localStorage}; });
    const valid = await page.evaluate(() => resumeApp.getData());
    const broken = [
        '2g.abc', '1j.a', token({resume:{info:{name:'bad'},work:'bad',settings:{}}}),
        token({resume:valid}, true).slice(0, -9),
        token({resume:{...valid, info:{name:'x'.repeat(300000)}}}, true)
    ];
    for (const value of broken) {
        await page.goto(BASE + '#resume=' + value);
        await expect(page.locator('#share-error-dialog')).toBeVisible();
        await expect(page.locator('#info-name')).toHaveValue('保留我的简历');
        expect(await page.evaluate(() => ({...localStorage}))).toEqual(original);
        expect(new URL(page.url()).hash).toBe('');
        await page.locator('#share-error-dialog button').click();
    }
});

test('plain Base64URL fallback and imported markup stay safe', async ({page}) => {
    await page.goto(BASE);
    const data = await page.evaluate(() => resumeApp.getData());
    data.info.name = '<img src=x onerror="window.injected=true">中文';
    data.info.github = 'javascript:alert(1)';
    await page.goto(BASE + '#resume=' + token({resume:data}));
    await expect(page.locator('#info-name')).toHaveValue(data.info.name);
    await expect(page.locator('#resume-page img, #resume-page script')).toHaveCount(0);
    expect(await page.evaluate(() => window.injected)).toBeUndefined();
    await expect(page.locator('#resume-page a').first()).toHaveAttribute('href', '#');
    const roundTrip = await page.evaluate(async () => {
        window.CompressionStream = undefined;
        const encoded = await EasyCVShare.encode(resumeApp.getData());
        return {encoded, decoded:await EasyCVShare.decode(encoded)};
    });
    expect(roundTrip.encoded).toMatch(/^1j\./);
    expect(roundTrip.decoded).toEqual(data);
});

test('share dialog copies snapshot, falls back to manual selection and fits mobile and dark mode', async ({page}) => {
    await page.goto(BASE);
    await page.locator('#info-name').fill('分享按钮测试');
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#copy-share-link')).toBeEnabled();
    await expect(page.locator('#share-address-note')).toContainText('本机预览地址');
    const url = await page.locator('#share-url').inputValue();
    await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async text => { window.copiedShare = text; }}});
    });
    await page.locator('#copy-share-link').click();
    expect(await page.evaluate(() => window.copiedShare)).toBe(url);
    await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async () => { throw Error('denied'); }}});
    });
    await page.locator('#copy-share-link').click();
    await expect(page.locator('#share-status')).toContainText('请手动复制');
    expect(await page.locator('#share-url').evaluate(el => el.selectionEnd - el.selectionStart)).toBe(url.length);
    await page.screenshot({path:'artifacts/share-desktop.png', animations:'disabled'});
    await page.keyboard.press('Escape');
    await page.locator('#theme-toggle-btn').click();
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#copy-share-link')).toBeEnabled();
    await page.screenshot({path:'artifacts/share-dark.png', animations:'disabled'});
    await page.keyboard.press('Escape');
    await page.locator('#theme-toggle-btn').click();
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#copy-share-link')).toBeEnabled();
    const bounds = await page.locator('#share-dialog').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    await page.screenshot({path:'artifacts/share-mobile.png', animations:'disabled'});
});

test('opening a hash link in the existing tab loads the snapshot and supports mobile preview', async ({page}) => {
    await page.goto(BASE);
    const url = await page.evaluate(() => {
        const data = resumeApp.getData();
        data.info.name = '同页链接';
        return EasyCVShare.createURL(data);
    });
    await page.setViewportSize({width:390,height:844});
    await page.goto(url);
    await expect(page.locator('.header-name')).toHaveText('同页链接');
    await expect(page.locator('body')).toHaveClass(/mobile-preview/);
    const bounds = await page.locator('#resume-page').boundingBox();
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    await page.locator('[data-workspace-view="edit"]').click();
    await page.locator('#info-name').fill('移动端修改');
    const newToken = await page.evaluate(() => EasyCVShare.encode(resumeApp.getData()));
    expect(newToken).toMatch(/^1g\./);
});

test('oversized content and file URLs give actionable errors', async ({page}) => {
    await page.goto(BASE);
    await page.evaluate(() => resumeApp.updateField('info.summary', '大'.repeat(90000)));
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#share-status')).toContainText('数据过大');
    await expect(page.locator('#copy-share-link')).toBeDisabled();
    await page.goto(require('node:url').pathToFileURL(require('node:path').resolve('index.html')).href);
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#share-status')).toContainText('本地文件地址无法分享给他人');
    await expect(page.locator('#copy-share-link')).toBeDisabled();
});
