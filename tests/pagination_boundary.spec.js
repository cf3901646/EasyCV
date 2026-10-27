const { test, expect } = require('@playwright/test');

test('pagination boundary precision: preview pages matches exported PDF pages around boundary', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://127.0.0.1:8765');
    await page.evaluate(() => document.fonts.ready);

    const defaultData = await page.evaluate(() => resumeApp.getData());
    const baseSummary = defaultData.info.summary;

    // Test a range of summary lengths around the single/two page boundary
    for (const extra of [35, 40, 45, 48, 50, 52, 54, 58]) {
        await page.evaluate(({ extra, base }) => {
            const d = resumeApp.getData();
            d.settings.template = 'tpl-classic';
            d.settings.paddingY = 12;
            d.info.summary = base + '\n\n' + '扩展文本段落用于测试精准边界高度控制。'.repeat(extra);
            resumeApp.setData(d);
            adjustPreviewScale();
        }, { extra, base: baseSummary });
        await page.evaluate(() => document.fonts.ready);

        const previewPages = await page.evaluate(() => Number(document.getElementById('resume-page').dataset.pages));
        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
        const pdfPages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;

        // Preview pages must strictly match PDF exported pages
        expect(previewPages, `At extra=${extra}, preview said ${previewPages} pages but PDF generated ${pdfPages} pages`).toBe(pdfPages);
    }
});
