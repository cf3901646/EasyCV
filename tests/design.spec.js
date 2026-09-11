const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
test.beforeEach(async ({page}) => { await page.goto('http://127.0.0.1:8765'); await expect(page.locator('#info-name')).toHaveValue('张三'); });

test('all font choices load locally, and selecting fonts preserves layout settings', async ({page}) => {
    test.setTimeout(120000);
    const failed = [], external = [];
    page.on('response', response => { if(response.status() >= 400) failed.push(response.url()); });
    page.on('request', request => { if(!request.url().startsWith('http://127.0.0.1')) external.push(request.url()); });
    await page.locator('[data-tab="style-tab"]').click();
    const before = await page.evaluate(() => resumeApp.getData().settings);
    const fonts = await page.evaluate(() => RESUME_FONTS);
    for(const [id,, ,family] of fonts) {
        await page.locator(`[data-font="${id}"]`).click();
        await page.evaluate(() => document.fonts.ready);
        const after = await page.evaluate(() => resumeApp.getData().settings);
        expect({...after,font:before.font}).toEqual(before);
        expect(await page.locator('#resume-page').evaluate(el => getComputedStyle(el).fontFamily)).toContain(family);
    }
    await page.evaluate(() => { const data=resumeApp.getData(); data.settings.font='font-inter'; resumeApp.setData(data); });
    await page.locator('#cjk-font-trigger').click();
    await page.getByRole('option',{name:'Noto Sans SC',exact:true}).click();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.locator('#resume-page').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Noto Sans SC');
    expect(failed).toEqual([]); expect(external).toEqual([]);
    await page.pdf({path:'artifacts/ui-upgrade/noto-sans-sc.pdf',preferCSSPageSize:true,printBackground:true});
});

test('layout customization persists, hides without deleting, reorders and shares', async ({page,browser}) => {
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#header-align-trigger').click(); await page.getByRole('option',{name:'居中',exact:true}).click();
    await page.locator('#heading-style-trigger').click(); await page.getByRole('option',{name:'纯文字',exact:true}).click();
    await page.locator('#contact-icons-trigger').click(); await page.getByRole('option',{name:'隐藏',exact:true}).click();
    await page.locator('#label-work').fill('相关经历'); await page.locator('#label-work').press('Tab');
    await page.locator('[data-section-visible="skills"]').uncheck();
    await expect(page.locator('#resume-sec-skills')).toHaveCount(0);
    expect(await page.evaluate(() => state.skills.length)).toBe(4);
    await page.locator('[data-move-section="education"][data-direction="-1"]').click();
    await page.locator('#val-name-size').fill('30'); await page.locator('#val-name-size').press('Tab');
    const expected = await page.evaluate(() => resumeApp.getData());
    await expect(page.locator('#resume-sec-work .sec-title')).toHaveText('相关经历');
    expect(await page.locator('.header-main').evaluate(el=>getComputedStyle(el).textAlign)).toBe('center');
    await expect(page.locator('.header-contact-list i').first()).toBeHidden();
    const order = await page.locator('#resume-render-target > section').evaluateAll(els=>els.map(el=>el.id));
    expect(order.indexOf('resume-sec-education')).toBeLessThan(order.indexOf('resume-sec-projects'));
    const url = await page.evaluate(() => EasyCVShare.createURL());
    const recipient = await browser.newPage(); await recipient.goto(url);
    await expect(recipient.locator('#resume-sec-work .sec-title')).toHaveText('相关经历');
    expect(await recipient.evaluate(() => resumeApp.getData())).toEqual(expected);
    await recipient.close();
    await page.reload();
    expect(await page.evaluate(() => resumeApp.getData())).toEqual(expected);
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('[data-section-visible="skills"]').check();
    await expect(page.locator('#resume-sec-skills')).toBeVisible();
});

test('split layout supports width, gap and section assignment; sliders retain DOM and follow keyboard', async ({page}) => {
    await page.locator('[data-tab="style-tab"]').click();
    await page.locator('[data-tpl="tpl-split"]').click();
    const slider = page.locator('#slide-main-font-size');
    await slider.scrollIntoViewIfNeeded();
    await slider.evaluate(el=>window.originalSlider=el);
    await slider.focus(); await page.keyboard.press('ArrowRight');
    expect(await slider.evaluate(el=>el===window.originalSlider)).toBe(true);
    expect(await page.evaluate(()=>state.settings.mainFontSize)).toBe(9.1);
    await expect(page.locator('#val-main-font-size')).toHaveValue('9.1');
    const rect=await slider.boundingBox();
    await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2); await page.mouse.down();
    await expect(slider).toHaveClass(/is-dragging/);
    await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height/2,{steps:10}); await page.mouse.up();
    await expect(slider).not.toHaveClass(/is-dragging/);
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#val-column-width').fill('40'); await page.locator('#val-column-width').press('Tab');
    await page.locator('#val-column-gap').fill('32'); await page.locator('#val-column-gap').press('Tab');
    await page.getByRole('button',{name:'教育背景所在栏：侧栏',exact:true}).click(); await page.getByRole('option',{name:'主栏',exact:true}).click();
    await expect(page.locator('.split-main #resume-sec-education')).toBeVisible();
    const layout=await page.locator('.split-container').evaluate(el=>({gap:getComputedStyle(el).columnGap,cols:getComputedStyle(el).gridTemplateColumns,width:el.clientWidth}));
    expect(layout.gap).toBe('32px'); expect(parseFloat(layout.cols)).toBeCloseTo(layout.width*.4,0);
});

test('unified controls, interruptible accordion, zoom feedback and delete confirmation', async ({page}) => {
    await expect(page.locator('.workspace-brand img')).toHaveCount(0);
    expect(await page.locator('#info-name').evaluate(el=>getComputedStyle(el).borderWidth)).toBe('0px');
    await page.evaluate(()=>{toggleAccordion('sec-work');toggleAccordion('sec-projects');toggleAccordion('sec-work');});
    await expect(page.locator('#sec-work')).toHaveClass(/expanded/);
    await page.locator('#sec-work .add-btn').click();
    await page.evaluate(()=>{ for(let i=0;i<100;i++)document.querySelector('.preview-container').dispatchEvent(new WheelEvent('wheel',{deltaY:-120,ctrlKey:true,bubbles:true,cancelable:true})); });
    expect(await page.evaluate(()=>customZoomFactor)).toBe(3);
    await expect(page.locator('.zoom-indicator-toast')).toHaveCount(0);
    await expect(page.locator('.zoom-controls')).toHaveClass(/is-adjusting/);
    await page.locator('#zoom-reset').click(); expect(await page.evaluate(()=>customZoomFactor)).toBe(1);
    await page.locator('#sec-custom .accordion-header').click();
    await page.locator('[title="删除此整个板块"]').click();
    await expect(page.locator('#confirm-dialog')).toBeVisible();
    await page.keyboard.press('Escape'); expect(await page.evaluate(()=>state.custom.length)).toBe(1);
    await page.locator('[title="删除此整个板块"]').click();
    await page.locator('#confirm-dialog [value="confirm"]').click();
    await expect.poll(()=>page.evaluate(()=>state.custom.length)).toBe(0);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('#sec-basic .accordion-header').click();
    expect(await page.locator('#sec-basic .accordion-body').evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('all templates and full workspace visual and print coverage', async ({page}) => {
    test.setTimeout(90000);
    await page.setViewportSize({width:1440,height:1400});
    fs.mkdirSync('artifacts/ui-upgrade',{recursive:true});
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    await page.screenshot({path:'artifacts/ui-upgrade/content.png',animations:'disabled'});
    await page.locator('[data-tab="style-tab"]').click();
    await page.screenshot({path:'artifacts/ui-upgrade/style.png',animations:'disabled'});
    const templates=await page.evaluate(()=>RESUME_TEMPLATES.map(t=>t[0]));
    for(const id of templates){
        await page.locator(`[data-tpl="${id}"]`).click();
        await page.evaluate(()=>document.fonts.ready);
        await page.pdf({path:`artifacts/ui-upgrade/${id}.pdf`,preferCSSPageSize:true,printBackground:true});
        await page.locator('.paper-stage').screenshot({path:`artifacts/ui-upgrade/${id}.png`,animations:'disabled'});
        await expect(page.locator('#resume-sec-work')).toContainText('北京某');
        const url=await page.evaluate(()=>EasyCVShare.createURL());
        const decoded=await page.evaluate(url=>EasyCVShare.decode(new URL(url).hash.slice(8)),url);
        expect(decoded.settings.template).toBe(id);
    }
    await page.locator('[data-tab="layout-tab"]').click();
    await page.screenshot({path:'artifacts/ui-upgrade/layout.png',animations:'disabled'});
    await page.locator('[data-tab="json-tab"]').click();
    await page.locator('.ai-copilot-header').click();
    await page.screenshot({path:'artifacts/ui-upgrade/json.png',animations:'disabled'});
    await page.locator('#theme-toggle-btn').click();
    await page.screenshot({path:'artifacts/ui-upgrade/dark.png',animations:'disabled'});
    await page.locator('#theme-toggle-btn').click();
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-tab="content-tab"]').click();
    await page.screenshot({path:'artifacts/ui-upgrade/mobile-edit.png',animations:'disabled'});
    await page.locator('[data-workspace-view="preview"]').click();
    await page.screenshot({path:'artifacts/ui-upgrade/mobile-preview.png',animations:'disabled'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
    expect(errors).toEqual([]);
});

test('long documents retain all content and repeat print margins', async ({page}) => {
    await page.evaluate(() => {
        const data=resumeApp.getData();
        data.settings.template='tpl-minimal'; data.settings.paddingY=18;
        data.work=Array.from({length:15},(_,i)=>({...data.work[0],company:`Experience ${i+1}`,details:[`Record ${i+1} — `+'完整经历，保留全部内容。'.repeat(35)]}));
        data.custom.push({title:'最后一项',items:[{title:'END OF RESUME',subtitle:'',time:'',details:['最终段落，检查完整性。']}]});
        resumeApp.setData(data);
    });
    await page.evaluate(()=>document.fonts.ready);
    await page.pdf({path:'artifacts/ui-upgrade/long-document.pdf',preferCSSPageSize:true,printBackground:true});
    expect(await page.locator('#print-page-settings').textContent()).toContain('margin:18mm 16mm');
});

test('legacy slider limits survive import and link encoding', async ({page}) => {
    const settings=await page.evaluate(async()=>{
        const data=resumeApp.getData();
        Object.assign(data.settings,{listIndent:100,sidebarListIndent:80,mainListIndent:80,titleWeight:300});
        resumeApp.setData(data);
        return (await EasyCVShare.decode(await EasyCVShare.encode(resumeApp.getData()))).settings;
    });
    expect(settings.listIndent).toBe(100); expect(settings.sidebarListIndent).toBe(80); expect(settings.mainListIndent).toBe(80); expect(settings.titleWeight).toBe(300);
});
