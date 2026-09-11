/* Shared design catalog and layout controls. No runtime dependencies. */
const DESIGN_DEFAULTS = {
    cjkFont: 'system', nameSize: 24, letterSpacing: 0, columnWidth: 32, columnGap: 24,
    headerAlign: 'auto', headingStyle: 'auto', contactIcons: 'show',
    sectionOrder: 'summary,skills,work,projects,education,custom', hiddenSections: '',
    sidebarSections: 'summary,skills,education', summaryTitle: '个人简介', skillsTitle: '专业技能',
    workTitle: '工作经历', projectsTitle: '项目经历', educationTitle: '教育背景', techLabel: '技术栈'
};
const RESUME_TEMPLATES = [
    ['tpl-classic','经典','清晰单栏'], ['tpl-split','双栏','通栏侧边'], ['tpl-academic','居中','对称克制'],
    ['tpl-minimal','留白','轻盈简洁'], ['tpl-editorial','目录','标题侧列'], ['tpl-studio','映色','柔和强调'],
    ['tpl-timeline','时间轴','经历脉络'], ['tpl-card','名片','左右页头'], ['tpl-banner','分节','横向分组']
];
const RESUME_FONTS = [
    ['font-notosanssc-offline','Noto Sans SC','清晰均衡 · 内置中文','Noto Sans SC'],
    ['font-harmonyos-offline','鸿蒙黑体','柔和易读 · 内置中文','HarmonyOS Sans SC Offline'],
    ['font-glow','未来荧黑','简洁明快 · 内置中文','Glow Sans SC Normal'],
    ['font-glow-condensed','未来荧黑 · 紧凑','窄体字形 · 内置中文','Glow Sans SC Condensed'],
    ['font-system','系统黑体','中英文跟随设备','system-ui']
];
// Old links and backups retain their exact font stack until the user changes it.
const LEGACY_FONTS = [
    ['font-inter','Inter'],['font-manrope','Manrope'],['font-dm-sans','DM Sans'],
    ['font-outfit','Outfit'],['font-roboto','Roboto'],['font-jetbrains','JetBrains Mono']
];
const RESUME_COLORS = [
    ['#1e3a8a','深海'],['#334155','石墨'],['#111827','墨黑'],['#065f46','松绿'],
    ['#3f596b','雾蓝'],['#665477','鸢尾'],['#80543a','陶土'],['#881337','莓红']
];
const SECTION_LABELS = {summary:'个人简介',skills:'专业技能',work:'工作经历',projects:'项目经历',education:'教育背景',custom:'自定义板块'};
const SLIDER_SPECS = [
    ['font-size','fontSize','正文字号',7,18,.1,'px','density','single'],
    ['sidebar-font-size','sidebarFontSize','侧栏字号',7,16,.1,'px','density','split'],
    ['main-font-size','mainFontSize','主栏字号',7,18,.1,'px','density','split'],
    ['line-height','lineHeight','行高',1.1,2,.01,'倍','density'],
    ['margin-y','paddingY','上下页边距',5,30,1,'mm','density'],
    ['margin-x','paddingX','左右页边距',5,30,1,'mm','density'],
    ['sec-spacing','secSpacing','板块间距',0,40,1,'px','density','single'],
    ['item-spacing','itemSpacing','经历间距',0,25,1,'px','density','single'],
    ['list-indent','listIndent','列表缩进',0,100,1,'px','density','single'],
    ['sidebar-sec-spacing','sidebarSecSpacing','侧栏板块间距',0,30,1,'px','density','split'],
    ['main-sec-spacing','mainSecSpacing','主栏板块间距',0,30,1,'px','density','split'],
    ['sidebar-item-spacing','sidebarItemSpacing','侧栏经历间距',0,25,1,'px','density','split'],
    ['main-item-spacing','mainItemSpacing','主栏经历间距',0,25,1,'px','density','split'],
    ['sidebar-list-indent','sidebarListIndent','侧栏列表缩进',0,80,1,'px','density','split'],
    ['main-list-indent','mainListIndent','主栏列表缩进',0,80,1,'px','density','split'],
    ['title-size','titleSize','板块标题比例',.9,2,.01,'倍','title','single'],
    ['sidebar-title-size','sidebarTitleSize','侧栏标题比例',.9,2,.01,'倍','title','split'],
    ['main-title-size','mainTitleSize','主栏标题比例',.9,2,.01,'倍','title','split'],
    ['title-weight','titleWeight','标题字重',300,800,100,'','title'],
    ['name-size','nameSize','姓名字号',18,42,1,'px','layout'],
    ['letter-spacing','letterSpacing','正文字距',0,1,.05,'px','layout'],
    ['column-width','columnWidth','侧栏宽度',24,42,1,'%','layout','split'],
    ['column-gap','columnGap','双栏间隔',12,40,1,'px','layout','split']
];
let layoutFrame = 0;
function sectionKeys(value, fallback = '') {
    return [...new Set(String(value ?? fallback).split(',').filter(key => Object.hasOwn(SECTION_LABELS, key)))];
}
function orderedSections() {
    const selected = sectionKeys(state.settings.sectionOrder, DESIGN_DEFAULTS.sectionOrder);
    return [...selected, ...Object.keys(SECTION_LABELS).filter(key => !selected.includes(key))];
}
function renderDesignChoices() {
    document.getElementById('template-count').textContent = `${RESUME_TEMPLATES.length} 款模板`;
    document.getElementById('template-choices').innerHTML = RESUME_TEMPLATES.map(([id,name,desc]) => `<button class="template-option" data-tpl="${id}" aria-pressed="false"><span class="tpl-preview ${id}" aria-hidden="true"><b></b><i></i><i></i><i></i></span><span>${name}</span><small>${desc}</small></button>`).join('');
    document.getElementById('font-choices').innerHTML = RESUME_FONTS.map(([id,name,desc]) => `<button class="font-btn" data-font="${id}" aria-pressed="false"><strong>${name}</strong><small>${desc}</small></button>`).join('');
    document.getElementById('color-choices').innerHTML = RESUME_COLORS.map(([color,name]) => `<button class="color-dot" style="--swatch:${color}" data-color="${color}" title="${name}" aria-label="${name}" aria-pressed="false"><span></span><small>${name}</small></button>`).join('');
}
function initStyleControls() {
    renderDesignChoices();
    EasyCVControls.init();
    for (const [selector, attribute, key] of [['.template-option','tpl','template'],['.font-btn','font','font'],['.color-dot','color','accentColor']]) {
        document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
            state.settings[key] = button.dataset[attribute];
            saveToLocal(); renderAll();
            if (key === 'font') document.fonts.ready.then(adjustPreviewScale);
        }));
    }
    document.getElementById('custom-accent-color').addEventListener('input', event => {
        state.settings.accentColor = event.target.value;
        document.querySelectorAll('.color-dot').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === event.target.value)));
        scheduleLayoutUpdate(); saveToLocal();
        updateJSONCodearea();
    });
    document.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('change', () => {
        state.settings[input.dataset.setting] = input.value;
        saveToLocal(); renderAll();
    }));
    document.querySelectorAll('[data-density]').forEach(button => button.addEventListener('click', () => {
        const values = {
            compact:{fontSize:9.5,lineHeight:1.35,paddingY:12,paddingX:16,secSpacing:8,itemSpacing:3,sidebarFontSize:8.5,mainFontSize:9,sidebarSecSpacing:6,mainSecSpacing:6,sidebarItemSpacing:2,mainItemSpacing:2},
            balanced:{fontSize:10.5,lineHeight:1.5,paddingY:16,paddingX:18,secSpacing:14,itemSpacing:7,sidebarFontSize:9.5,mainFontSize:10.5,sidebarSecSpacing:12,mainSecSpacing:12,sidebarItemSpacing:5,mainItemSpacing:5},
            airy:{fontSize:12,lineHeight:1.65,paddingY:20,paddingX:20,secSpacing:20,itemSpacing:10,sidebarFontSize:10.5,mainFontSize:12,sidebarSecSpacing:18,mainSecSpacing:18,sidebarItemSpacing:8,mainItemSpacing:8}
        };
        Object.assign(state.settings, values[button.dataset.density]);
        saveToLocal(); renderAll(); showNotification('已应用排版预设，可继续微调。');
    }));
    document.getElementById('section-layout-list').addEventListener('click', event => {
        const button = event.target.closest('[data-move-section]');
        if (!button) return;
        const keys = orderedSections(), index = keys.indexOf(button.dataset.moveSection), next = index + Number(button.dataset.direction);
        if (next < 0 || next >= keys.length) return;
        [keys[index],keys[next]] = [keys[next],keys[index]];
        state.settings.sectionOrder = keys.join(','); saveToLocal(); renderAll();
        document.querySelector(`[data-move-section="${button.dataset.moveSection}"][data-direction="${button.dataset.direction}"]`)?.focus();
    });
    document.getElementById('section-layout-list').addEventListener('change', event => {
        const input = event.target;
        if (input.dataset.sectionVisible) {
            const hidden = new Set(sectionKeys(state.settings.hiddenSections));
            input.checked ? hidden.delete(input.dataset.sectionVisible) : hidden.add(input.dataset.sectionVisible);
            state.settings.hiddenSections = [...hidden].join(',');
        } else if (input.dataset.sectionColumn) {
            const sidebar = new Set(sectionKeys(state.settings.sidebarSections));
            input.value === 'sidebar' ? sidebar.add(input.dataset.sectionColumn) : sidebar.delete(input.dataset.sectionColumn);
            state.settings.sidebarSections = [...sidebar].join(',');
        } else return;
        saveToLocal(); renderResumeHTML(); updateJSONCodearea();
    });
}
function visibleSliderSpecs() {
    const mode = state.settings.template === 'tpl-split' ? 'split' : 'single';
    return SLIDER_SPECS.filter(spec => !spec[8] || spec[8] === mode);
}
function renderStyleSliders() {
    if (state.settings.template === lastRenderedTemplate) { syncSlidersValues(); return; }
    lastRenderedTemplate = state.settings.template;
    const specs = visibleSliderSpecs();
    for (const group of ['density','title','layout']) {
        document.getElementById(`${group}-sliders-container`).innerHTML = specs.filter(s => s[7] === group).map(([id,key,label,min,max,step,unit]) => `<div class="control-slider"><div class="slider-info"><label for="slide-${id}">${label}</label><div class="slider-number"><input id="val-${id}" type="number" min="${min}" max="${max}" step="${step}" aria-label="${label}数值"><span>${unit}</span></div></div><input type="range" id="slide-${id}" min="${min}" max="${max}" step="${step}" data-slider-key="${key}" aria-label="${label}"></div>`).join('');
    }
    specs.forEach(([id,key,label,min,max,step,unit]) => {
        const slider = document.getElementById(`slide-${id}`), number = document.getElementById(`val-${id}`);
        const update = (value, final) => {
            if (!Number.isFinite(value)) return;
            value = Math.max(min, Math.min(max, value));
            state.settings[key] = value; slider.value = value; number.value = value;
            paintSlider(slider); slider.setAttribute('aria-valuetext', `${value}${unit}`);
            scheduleLayoutUpdate(); saveToLocal();
            if (final) { flushLayoutUpdate(); updateJSONCodearea(); }
        };
        slider.addEventListener('input', () => update(slider.valueAsNumber, false));
        slider.addEventListener('change', () => update(slider.valueAsNumber, true));
        number.addEventListener('change', () => { update(number.valueAsNumber, true); syncSlidersValues(); });
        slider.addEventListener('pointerdown', () => slider.classList.add('is-dragging'));
        for (const event of ['pointerup','pointercancel','lostpointercapture','blur']) slider.addEventListener(event, () => slider.classList.remove('is-dragging'));
    });
    syncSlidersValues();
}
function paintSlider(input) { input.style.setProperty('--fill', `${100 * (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))}%`); }
function syncSlidersValues() {
    visibleSliderSpecs().forEach(([id,key]) => {
        const slider = document.getElementById(`slide-${id}`), number = document.getElementById(`val-${id}`);
        if (!slider) return;
        slider.value = state.settings[key]; number.value = state.settings[key]; paintSlider(slider);
    });
}
const accordionAnimations = new WeakMap();
function animateAccordion(item, expanded) {
    const body = item.querySelector('.accordion-body');
    const height = body.getBoundingClientRect().height;
    accordionAnimations.get(body)?.cancel();
    item.classList.toggle('expanded', expanded);
    item.querySelector('.accordion-header').setAttribute('aria-expanded', String(expanded));
    body.style.height = expanded ? 'auto' : '0px';
    body.inert = !expanded;
    if (expanded) body.querySelectorAll('textarea').forEach(autoResizeTextarea);
    const targetHeight = expanded ? body.scrollHeight : 0;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const animation = body.animate([{height:`${height}px`,opacity:height?1:0},{height:`${targetHeight}px`,opacity:expanded?1:0}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});
        accordionAnimations.set(body, animation);
    }
}
function scheduleLayoutUpdate() { if (!layoutFrame) layoutFrame = requestAnimationFrame(flushLayoutUpdate); }
function flushLayoutUpdate() { cancelAnimationFrame(layoutFrame); layoutFrame = 0; applyCSSVariables(); adjustPreviewScale(); }
function updatePrintSettings() {
    let rules = document.getElementById('print-page-settings');
    if (!rules) { rules = document.createElement('style'); rules.id = 'print-page-settings'; rules.media = 'print'; document.head.appendChild(rules); }
    // Margin boxes extend the sidebar through each page's otherwise unpaintable margins.
    const s = state.settings, split = s.template === 'tpl-split';
    const band = `linear-gradient(to right,color-mix(in srgb,${s.accentColor} 7%,#f7f8fa) ${s.columnWidth}%,white ${s.columnWidth}%)`;
    const edges = split ? `@top-left {content:"";width:210mm;background:${band}} @bottom-left {content:"";width:210mm;background:${band}}` : '';
    const css = `@page {size:A4;margin:${s.paddingY}mm ${split ? 0 : s.paddingX}mm;${edges}} .resume-sheet {padding:0!important;width:auto!important;min-height:0!important}`;
    if (rules.textContent !== css) rules.textContent = css;
}
function syncDesignUI() {
    document.querySelectorAll('[data-setting]').forEach(input => { input.value = state.settings[input.dataset.setting]; });
    document.querySelectorAll('.template-option,.font-btn,.color-dot').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tpl === state.settings.template || button.dataset.font === state.settings.font || button.dataset.color === state.settings.accentColor)));
    const selected = RESUME_FONTS.find(font => font[0] === state.settings.font);
    const legacy = LEGACY_FONTS.find(font => font[0] === state.settings.font);
    const sample = document.getElementById('font-sample');
    sample.className = `font-sample ${state.settings.font}`;
    document.getElementById('legacy-font-controls').hidden = !legacy;
    document.getElementById('cjk-font').disabled = !legacy;
    document.getElementById('legacy-font-note').textContent = legacy ? `当前沿用旧版 ${legacy[1]} 西文搭配。选择上方中文字体可整体切换。` : '';
    document.getElementById('font-note').textContent = selected?.[0] === 'font-system' ? '使用设备自带黑体，不同设备的字形可能不同。' : selected?.[0] === 'font-harmonyos-offline' ? '中英文均使用鸿蒙黑体。现有字体仅含常规字重，粗体由浏览器合成。' : selected?.[0] === 'font-notosanssc-offline' ? '中英文均使用 Noto Sans SC，支持可变字重，按所需字形加载。' : selected?.[0].startsWith('font-glow') ? '中英文均使用未来荧黑，内置常规与粗体字重，按所需字形加载。' : '上方选项均支持中文，切换后可在此直接对比。';
    const hidden = sectionKeys(state.settings.hiddenSections), sidebar = sectionKeys(state.settings.sidebarSections), split = state.settings.template === 'tpl-split';
    document.getElementById('section-layout-list').innerHTML = orderedSections().map((key,index,keys) => `<div class="section-layout-row"><label class="visibility-toggle"><input type="checkbox" data-section-visible="${key}" ${hidden.includes(key)?'':'checked'}><span>${SECTION_LABELS[key]}</span></label><div class="section-layout-actions">${split ? `<select aria-label="${SECTION_LABELS[key]}所在栏" data-section-column="${key}"><option value="main" ${sidebar.includes(key)?'':'selected'}>主栏</option><option value="sidebar" ${sidebar.includes(key)?'selected':''}>侧栏</option></select>` : ''}<button class="icon-btn" data-move-section="${key}" data-direction="-1" aria-label="上移${SECTION_LABELS[key]}" ${index===0?'disabled':''}>↑</button><button class="icon-btn" data-move-section="${key}" data-direction="1" aria-label="下移${SECTION_LABELS[key]}" ${index===keys.length-1?'disabled':''}>↓</button></div></div>`).join('');
    EasyCVControls.sync();
}
let noticeTimer;
function showNotification(message, type = 'info') {
    let toast = document.getElementById('workspace-notice');
    if (!toast) { toast = document.createElement('div'); toast.id = 'workspace-notice'; toast.className = 'toast-notification no-print'; toast.setAttribute('role','status'); document.body.appendChild(toast); }
    toast.textContent = message.replace(/^[^\p{L}\p{N}]+/u, ''); toast.dataset.type = type;
    toast.classList.add('show'); clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
function confirmAction(title, description) {
    return new Promise(resolve => {
        const dialog = document.getElementById('confirm-dialog');
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-description').textContent = description;
        dialog.returnValue = 'cancel'; dialog.showModal();
        dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true});
    });
}
let zoomFeedbackTimer;
function setPreviewZoom(value) {
    customZoomFactor = Math.min(3, Math.max(.3, value)); adjustPreviewScale();
    const controls = document.querySelector('.zoom-controls');
    controls.classList.add('is-adjusting'); clearTimeout(zoomFeedbackTimer);
    zoomFeedbackTimer = setTimeout(() => controls.classList.remove('is-adjusting'), 650);
}
window.addEventListener('wheel', event => {
    if (event.ctrlKey && event.target.closest('.preview-container')) {
        event.preventDefault(); if (event.deltaY) setPreviewZoom(customZoomFactor + (event.deltaY > 0 ? -.05 : .05));
    }
}, {passive:false});
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pointerup', () => document.querySelectorAll('input.is-dragging').forEach(input => input.classList.remove('is-dragging')));
    document.querySelector('.preview-container').addEventListener('dblclick', event => {
        if (event.target.matches('.preview-container,.paper-stage')) setPreviewZoom(1);
    });
});
window.addEventListener('beforeprint', () => {
    flushLayoutUpdate();
    const preview = document.querySelector('.preview-container');
    preview.scrollTo(0,0);
    // Commit the scroll reset before Chromium snapshots composited text layers.
    preview.getBoundingClientRect();
});
