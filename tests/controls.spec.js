const {test,expect} = require('@playwright/test');
const fs = require('node:fs');
test.beforeEach(async ({page}) => {
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#info-name')).toHaveValue('张三');
    fs.mkdirSync('artifacts/control-polish',{recursive:true});
});

test('custom color picker applies HEX, RGB, drag and hue, with validation and persistence',async ({page,browser})=>{
    await page.locator('[data-tab="style-tab"]').click();
    await page.locator('#custom-color-trigger').click();
    await expect(page.locator('#color-popover')).toBeVisible();
    await expect(page.locator('input[type=color]')).toHaveCount(0);
    await page.locator('#color-hex').fill('#2a8c69');
    expect(await page.evaluate(()=>state.settings.accentColor)).toBe('#2a8c69');
    await page.locator('#color-hex').fill('#BAD'); await page.locator('#color-hex').press('Tab');
    expect(await page.evaluate(()=>state.settings.accentColor)).toBe('#bbaadd');
    await page.locator('#color-hex').fill('wrong'); await page.locator('#color-hex').press('Tab');
    await expect(page.locator('#color-hex')).toHaveAttribute('aria-invalid','true');
    expect(await page.evaluate(()=>state.settings.accentColor)).toBe('#bbaadd');
    await page.locator('#color-r').fill('12'); await page.locator('#color-r').press('Tab');
    expect(await page.evaluate(()=>state.settings.accentColor)).toBe('#0caadd');
    const plane = await page.locator('.color-plane').boundingBox();
    await page.mouse.move(plane.x+plane.width*.65,plane.y+plane.height*.3); await page.mouse.down();
    await expect(page.locator('.color-plane')).toHaveClass(/is-dragging/);
    await page.mouse.move(plane.x+plane.width*.8,plane.y+plane.height*.4,{steps:10}); await page.mouse.up();
    const before = await page.evaluate(()=>state.settings.accentColor);
    await page.locator('#color-hue').focus(); await page.locator('#color-hue').press('ArrowRight');
    expect(await page.evaluate(()=>state.settings.accentColor)).not.toBe(before);
    const expected = await page.evaluate(()=>state.settings.accentColor);
    await expect(page.locator('#custom-color-trigger .color-value')).toHaveText(expected.toUpperCase());
    const decoded = await page.evaluate(async()=>EasyCVShare.decode(await EasyCVShare.encode(resumeApp.getData())));
    expect(decoded.settings.accentColor).toBe(expected);
    const color = await page.locator('#resume-page').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent-color').trim());
    expect(color).toBe(expected);
    await page.screenshot({path:'artifacts/control-polish/color-picker.png',animations:'disabled'});
    await page.keyboard.press('Escape'); await expect(page.locator('#color-popover')).toBeHidden();
    await expect(page.locator('#custom-color-trigger')).toBeFocused();
    await page.reload(); expect(await page.evaluate(()=>state.settings.accentColor)).toBe(expected);
});

test('rounded selects support keyboard selection, cancel, tab and dynamic section changes',async ({page})=>{
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#header-align-trigger').focus(); await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('End'); await page.keyboard.press('Enter');
    expect(await page.evaluate(()=>state.settings.headerAlign)).toBe('center');
    await expect(page.locator('#header-align-trigger')).toBeFocused();
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Home'); await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>state.settings.headerAlign)).toBe('center');
    await page.locator('#heading-style-trigger').click(); await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(page.locator('#contact-icons-trigger')).toBeFocused();
    await page.locator('#heading-style-trigger').click();
    await page.screenshot({path:'artifacts/control-polish/select-menu.png',animations:'disabled'});
    await page.getByRole('option',{name:'侧边强调',exact:true}).click();
    await page.locator('[data-tab="style-tab"]').click(); await page.locator('[data-tpl="tpl-split"]').click();
    await page.locator('[data-tab="layout-tab"]').click();
    await page.getByRole('button',{name:'教育背景所在栏：侧栏',exact:true}).click();
    await page.getByRole('option',{name:'主栏',exact:true}).click();
    await expect(page.locator('.split-main #resume-sec-education')).toBeVisible();
    await page.getByRole('button',{name:'教育背景所在栏：主栏',exact:true}).click();
    await page.getByRole('option',{name:'侧栏',exact:true}).click();
    await expect(page.locator('.split-sidebar #resume-sec-education')).toBeVisible();
    expect(await page.locator('select').evaluateAll(els=>els.every(el=>el.hidden))).toBe(true);
});

test('Chinese font choices use distinct embedded Chinese glyphs and preserve legacy links',async ({page})=>{
    test.setTimeout(120000);
    const failures=[]; page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
    await page.locator('[data-tab="style-tab"]').click();
    const hashes=[];
    const fonts=await page.evaluate(()=>RESUME_FONTS.filter(f=>f[0]!=='font-system'));
    for(const [id,, ,family] of fonts){
        await page.locator(`[data-font="${id}"]`).click(); await page.evaluate(()=>document.fonts.ready);
        // Rasterize Chinese only. A changed CSS family is insufficient: fallback glyphs must differ.
        const pixels=await page.evaluate(async family=>{
            await document.fonts.load(`32px "${family}"`,'简历设计，清晰呈现。');
            const canvas=document.createElement('canvas'); canvas.width=500; canvas.height=60;
            const context=canvas.getContext('2d'); context.font=`32px "${family}"`; context.fillText('简历设计，清晰呈现。',0,40);
            return canvas.toDataURL();
        },family);
        hashes.push(pixels);
        await page.locator('#font-sample').screenshot({path:`artifacts/control-polish/${id}.png`});
    }
    expect(new Set(hashes).size).toBe(fonts.length);
    expect(failures).toEqual([]);
    await expect(page.locator('#font-note')).toContainText('中英文');
    await expect(page.locator('#legacy-font-controls')).toBeHidden();
    for(const font of ['font-inter','font-outfit','font-manrope','font-dm-sans','font-roboto','font-jetbrains']){
        const settings=await page.evaluate(async font=>{
            const data=resumeApp.getData(); data.settings.font=font; data.settings.cjkFont='noto'; resumeApp.setData(data);
            return (await EasyCVShare.decode(await EasyCVShare.encode(resumeApp.getData()))).settings;
        },font);
        expect(settings.font).toBe(font); expect(settings.cjkFont).toBe('noto');
        await expect(page.locator('#legacy-font-controls')).toBeVisible();
    }
});

test('share close icon is geometrically centered, with a clipped rounded scroll field',async ({page})=>{
    await page.locator('[data-share-resume]').first().click();
    await expect(page.locator('#share-dialog')).toBeVisible();
    const {button,icon}=await page.locator('#close-share-dialog').evaluate(el=>({button:el.getBoundingClientRect().toJSON(),icon:el.querySelector('svg').getBoundingClientRect().toJSON()}));
    expect(Math.abs(button.x+button.width/2-icon.x-icon.width/2)).toBeLessThan(.5);
    expect(Math.abs(button.y+button.height/2-icon.y-icon.height/2)).toBeLessThan(.5);
    expect(await page.locator('#share-url').evaluate(el=>getComputedStyle(el).resize)).toBe('none');
    expect(await page.locator('.share-link-field').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
    await page.screenshot({path:'artifacts/control-polish/share-dialog.png',animations:'disabled'});
    await page.locator('#close-share-dialog').click(); await expect(page.locator('#share-dialog')).toBeHidden();
});

test('popover surfaces fit mobile and dark mode, and obey reduced motion',async ({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.locator('.mobile-dock [data-mobile-tab="style-tab"]').click(); await page.locator('#custom-color-trigger').click();
    const box=await page.locator('#color-popover').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(12); expect(box.x+box.width).toBeLessThanOrEqual(378);
    expect(box.y).toBeGreaterThanOrEqual(12); expect(box.y+box.height).toBeLessThanOrEqual(832);
    await page.screenshot({path:'artifacts/control-polish/mobile-color.png',animations:'disabled'});
    await page.keyboard.press('Escape'); await page.locator('#mobile-tools-trigger').click(); await page.locator('#mobile-theme-toggle').click();
    await page.locator('#custom-color-trigger').click();
    expect(await page.locator('#color-popover').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(43, 45, 48)');
    await page.screenshot({path:'artifacts/control-polish/dark-color.png',animations:'disabled'});
    await page.keyboard.press('Escape'); await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('#custom-color-trigger').click();
    expect(await page.locator('#color-popover').evaluate(el=>el.getAnimations().length)).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});
