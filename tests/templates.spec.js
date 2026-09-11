const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const dir='artifacts/templates';
test.beforeEach(async({page})=>{
    fs.mkdirSync(dir,{recursive:true});
    await page.setViewportSize({width:1440,height:1400});
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#info-name')).toHaveValue('张三');
});

test('split sidebar occupies the paper edge and full height, with identity and editable columns',async({page})=>{
    await page.locator('[data-tab="style-tab"]').click();
    await page.locator('[data-tpl="tpl-split"]').click();
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.split-sidebar .header-name')).toHaveText('张三');
    await expect(page.locator('#resume-render-target > .resume-header')).toHaveCount(0);
    for(const [columnWidth,paddingX,columnGap] of [[32,16,24],[24,30,40],[42,5,12]]){
        await page.evaluate(values=>{
            const data=resumeApp.getData(); Object.assign(data.settings,values); resumeApp.setData(data);
        },{columnWidth,paddingX,columnGap});
        const rects=await page.evaluate(()=>{
            const paper=document.querySelector('#resume-page'),sidebar=document.querySelector('.split-sidebar');
            return {paper:paper.getBoundingClientRect().toJSON(),sidebar:sidebar.getBoundingClientRect().toJSON(),radius:getComputedStyle(sidebar).borderRadius,
                overflow:[...document.querySelectorAll('.split-sidebar,.split-main')].map(el=>el.scrollWidth-el.clientWidth)};
        });
        expect(Math.abs(rects.sidebar.x-rects.paper.x)).toBeLessThan(.5);
        expect(Math.abs(rects.sidebar.y-rects.paper.y)).toBeLessThan(.5);
        expect(Math.abs(rects.sidebar.height-rects.paper.height)).toBeLessThan(.5);
        expect(rects.sidebar.width/rects.paper.width).toBeCloseTo(columnWidth/100,2);
        expect(rects.radius).toBe('0px'); expect(Math.max(...rects.overflow)).toBeLessThanOrEqual(1);
    }
    await page.evaluate(()=>{const data=resumeApp.getData();Object.assign(data.settings,{columnWidth:32,paddingX:16,columnGap:24});resumeApp.setData(data);});
    await page.locator('.paper-stage').screenshot({path:`${dir}/split-preview.png`,animations:'disabled'});
    await page.pdf({path:`${dir}/split.pdf`,preferCSSPageSize:true,printBackground:true});
    expect(await page.locator('#print-page-settings').textContent()).toContain('margin:12mm 0mm');
    await page.locator('[data-tab="layout-tab"]').click();
    await page.getByRole('button',{name:'教育背景所在栏：侧栏',exact:true}).click();
    await page.getByRole('option',{name:'主栏',exact:true}).click();
    await expect(page.locator('.split-main #resume-sec-education')).toBeVisible();
    await page.locator('.split-sidebar .header-name').fill('新的姓名'); await page.locator('.split-sidebar .header-name').press('Tab');
    expect(await page.evaluate(()=>state.info.name)).toBe('新的姓名');
});

test('three new templates preserve settings, restore from links and export their distinct layouts',async({page,browser})=>{
    test.setTimeout(60000);
    await page.locator('[data-tab="style-tab"]').click();
    await expect(page.locator('#template-count')).toHaveText('9 款模板');
    await expect(page.locator('.template-option')).toHaveCount(9);
    const before=await page.evaluate(()=>resumeApp.getData());
    for(const template of ['tpl-timeline','tpl-card','tpl-banner']){
        await page.locator(`[data-tpl="${template}"]`).click(); await page.evaluate(()=>document.fonts.ready);
        const after=await page.evaluate(()=>resumeApp.getData());
        expect({...after,settings:{...after.settings,template:before.settings.template}}).toEqual(before);
        if(template==='tpl-timeline') expect(await page.locator('.resume-item').first().evaluate(el=>getComputedStyle(el,'::before').content)).toBe('""');
        if(template==='tpl-card') expect(await page.locator('.resume-header').evaluate(el=>getComputedStyle(el).display)).toBe('grid');
        if(template==='tpl-banner') expect(await page.locator('.sec-title').first().evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
        const recipient=await browser.newPage(); await recipient.goto(await page.evaluate(()=>EasyCVShare.createURL()));
        expect(await recipient.evaluate(()=>resumeApp.getData())).toEqual(after); await recipient.close();
        await page.locator('.paper-stage').screenshot({path:`${dir}/${template}.png`,animations:'disabled'});
        await page.pdf({path:`${dir}/${template}.pdf`,preferCSSPageSize:true,printBackground:true});
    }
    await page.locator('[data-tpl="tpl-card"]').click();
    await page.locator('[data-tab="layout-tab"]').click();
    await page.locator('#header-align-trigger').click(); await page.getByRole('option',{name:'居中',exact:true}).click();
    expect(await page.locator('.resume-header').evaluate(el=>getComputedStyle(el).display)).toBe('block');
    expect(await page.locator('.header-main').evaluate(el=>getComputedStyle(el).textAlign)).toBe('center');
});

test('split can paginate long content in both columns with repeated vertical margins',async({page})=>{
    test.setTimeout(60000);
    await page.evaluate(()=>{
        const data=resumeApp.getData();
        Object.assign(data.settings,{template:'tpl-split',paddingY:18,columnWidth:34,sidebarFontSize:10,mainFontSize:11,lineHeight:1.5});
        data.work=Array.from({length:12},(_,i)=>({...data.work[0],company:`MAIN RECORD ${i+1}`,details:[`Main ${i+1}: `+'清晰记录工作职责与项目成果。'.repeat(35)]}));
        data.education=Array.from({length:10},(_,i)=>({...data.education[0],school:`SIDE RECORD ${i+1}`,details:[`Side ${i+1}: `+'学习经历与专业能力。'.repeat(18)]}));
        resumeApp.setData(data);
    });
    await page.evaluate(()=>document.fonts.ready);
    const geometry=await page.evaluate(()=>({side:document.querySelector('.split-sidebar').offsetHeight,paper:document.querySelector('#resume-page').offsetHeight}));
    expect(geometry.side).toBe(geometry.paper);
    await page.pdf({path:`${dir}/split-long.pdf`,preferCSSPageSize:true,printBackground:true});
    const pdf=fs.readFileSync(`${dir}/split-long.pdf`).toString('latin1');
    expect((pdf.match(/\/Type\s*\/Page\b/g)||[]).length).toBeGreaterThan(1);
    expect(await page.locator('#print-page-settings').textContent()).toContain('margin:18mm 0mm');
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-workspace-view="preview"]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});
