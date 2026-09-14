const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test.beforeEach(async({page})=>{
    await page.goto('http://127.0.0.1:8765');
    await expect(page.locator('#info-name')).toHaveValue('张三');
    await page.evaluate(()=>document.title='BROWSER_HEADER_MUST_NOT_APPEAR');
    fs.mkdirSync('artifacts/print-fix',{recursive:true});
});

test('all templates keep preview coordinates and suppress browser margins in PDF output',async({page})=>{
    test.setTimeout(90000);
    for(const template of await page.evaluate(()=>RESUME_TEMPLATES.map(t=>t[0]))){
        await page.evaluate(template=>{const d=resumeApp.getData();Object.assign(d.settings,{template,paddingX:20,paddingY:18});resumeApp.setData(d)},template);
        await page.evaluate(()=>document.fonts.ready);
        const preview=await page.evaluate(()=>{
            const sheet=document.getElementById('resume-page');
            const rect=sheet.getBoundingClientRect(),name=sheet.querySelector('.header-name').getBoundingClientRect();
            const scale=new DOMMatrixReadOnly(getComputedStyle(sheet).transform).a;
            return {x:(name.x-rect.x)/scale,y:(name.y-rect.y)/scale,width:name.width/scale};
        });
        await page.emulateMedia({media:'print'});
        const print=await page.evaluate(()=>{
            const paper=document.querySelector('.print-frame').getBoundingClientRect();
            const name=document.querySelector('.header-name').getBoundingClientRect();
            return {x:name.x-paper.x,y:name.y-paper.y,width:name.width};
        });
        for(const key of ['x','y','width']) expect(Math.abs(preview[key]-print[key]),`${template}: ${key}`).toBeLessThan(1);
        await expect(page.locator('#page-guides')).toBeHidden();
        expect(await page.locator('#print-page-settings').textContent()).toContain('@page {size:A4;margin:0}');
        await page.pdf({path:`artifacts/print-fix/${template}-single.pdf`,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true});
        await page.emulateMedia({media:'screen'});
    }
});

test('long single and double columns repeat internal page insets, including mobile editor export',async({page})=>{
    test.setTimeout(60000);
    const original=await page.evaluate(()=>resumeApp.getData());
    for(const template of ['tpl-classic','tpl-split']){
        await page.evaluate(({original,template})=>{
            Object.assign(original.settings,{template,paddingY:18});
            original.work=Array.from({length:12},(_,i)=>({...original.work[0],company:`MAIN_RECORD_${i+1}`,details:['工作职责与成果。'.repeat(60)]}));
            original.education=Array.from({length:10},(_,i)=>({...original.education[0],school:`SIDE_RECORD_${i+1}`,details:['学习经历与专业能力。'.repeat(25)]}));
            resumeApp.setData(original);
        },{original,template});
        await page.evaluate(()=>document.fonts.ready);
        const pdf=await page.pdf({path:`artifacts/print-fix/${template}-long.pdf`,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true});
        expect((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length).toBeGreaterThan(1);
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-workspace-view="edit"]').click();
    await expect(page.locator('.preview-container')).toBeHidden();
    await page.pdf({path:'artifacts/print-fix/mobile-long.pdf',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true});
});
