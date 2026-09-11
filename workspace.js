/* Small, dependency-free UI helpers and validation shared by every import path. */
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatResumeText(value) {
    return escapeHTML(value).replace(/&lt;(\/?)(strong|b)&gt;/gi, '<$1strong>');
}
function getHTMLState(rich) {
    function encode(value) {
        if (typeof value === 'string') return rich ? formatResumeText(value) : escapeHTML(value);
        if (Array.isArray(value)) return value.map(encode);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)]));
        return value;
    }
    return encode(state);
}
function safeResumeURL(value) {
    // Read the original value: HTML escaping belongs at the attribute boundary.
    const text = document.createElement('textarea');
    text.innerHTML = value;
    const raw = text.value.trim();
    try {
        const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
        return ['https:', 'http:'].includes(url.protocol) ? escapeHTML(url.href) : '#';
    } catch { return '#'; }
}
function normalizeResume(data, baseSettings = state.settings || {}) {
    const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
    if (!object(data) || !object(data.info)) throw new Error('简历需要 info 基本信息对象');
    const strings = (item, keys) => {
        if (!object(item)) throw new Error('经历项目必须是对象');
        return Object.fromEntries(keys.map(key => {
            if (item[key] != null && typeof item[key] !== 'string') throw new Error(`${key} 必须是文字`);
            return [key, item[key] ?? ''];
        }));
    };
    const list = (value, name, fn) => {
        if (value == null) return [];
        if (!Array.isArray(value)) throw new Error(`${name} 必须是数组`);
        return value.map(fn);
    };
    const details = item => list(item.details, 'details', text => {
        if (typeof text !== 'string') throw new Error('details 内容必须是文字');
        return text;
    });
    const experience = keys => item => ({ ...strings(item, keys), details: details(item) });
    const settings = { ...SAMPLE_RESUME_DATA.settings, ...baseSettings };
    if (data.settings != null && !object(data.settings)) throw new Error('settings 必须是对象');
    for (const [key, value] of Object.entries(data.settings || {})) {
        if (!(key in settings) || ['__proto__', 'constructor', 'prototype'].includes(key)) continue;
        if (typeof settings[key] === 'number') {
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1000) throw new Error(`${key} 数值无效`);
        } else if (typeof value !== 'string') throw new Error(`${key} 必须是文字`);
        settings[key] = value;
    }
    if (!RESUME_TEMPLATES.some(template => template[0] === settings.template)) settings.template = 'tpl-classic';
    if (![...RESUME_FONTS,...LEGACY_FONTS].some(font => font[0] === settings.font)) settings.font = 'font-notosanssc-offline';
    if (!/^#[a-f\d]{6}$/i.test(settings.accentColor)) settings.accentColor = '#334155';
    for (const [key, allowed] of Object.entries({cjkFont:['system','noto','harmony'],headerAlign:['auto','left','center'],headingStyle:['auto','clean','line','accent'],contactIcons:['show','hide']})) {
        if (!allowed.includes(settings[key])) settings[key] = DESIGN_DEFAULTS[key];
    }
    for (const key of ['sectionOrder','hiddenSections','sidebarSections']) settings[key] = sectionKeys(settings[key]).join(',');
    for (const [,key,,min,max] of SLIDER_SPECS) settings[key] = Math.min(max, Math.max(min, settings[key]));
    return {
        info: strings(data.info, ['name', 'title', 'email', 'phone', 'location', 'github', 'blog', 'summary']),
        skills: list(data.skills, 'skills', item => strings(item, ['category', 'tags'])),
        work: list(data.work, 'work', experience(['company', 'role', 'time'])),
        projects: list(data.projects, 'projects', experience(['name', 'tech', 'time'])),
        education: list(data.education, 'education', experience(['school', 'degree', 'major', 'time'])),
        custom: list(data.custom, 'custom', section => ({ ...strings(section, ['title']), items: list(section.items, 'items', experience(['title', 'subtitle', 'time'])) })),
        settings
    };
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('resume-render-target').addEventListener('paste', event => {
        if (!event.target.closest('[contenteditable]')) return;
        event.preventDefault();
        const html = event.clipboardData.getData('text/html');
        const text = html ? sanitizeHTMLKeepBold(html) : event.clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, formatResumeText(text));
    });
    document.querySelectorAll('[data-workspace-view]').forEach(button => button.addEventListener('click', () => {
        document.body.classList.toggle('mobile-preview', button.dataset.workspaceView === 'preview');
        document.querySelectorAll('[data-workspace-view]').forEach(item => {
            item.classList.toggle('active', item === button);
            item.setAttribute('aria-pressed', String(item === button));
        });
        adjustPreviewScale();
    }));
    document.querySelectorAll('.accordion-body').forEach(body => {
        const inner = document.createElement('div');
        inner.className = 'accordion-inner';
        while (body.firstChild) inner.appendChild(body.firstChild);
        body.appendChild(inner);
        body.inert = !body.parentElement.classList.contains('expanded');
    });
    const zoom = delta => setPreviewZoom(customZoomFactor + delta);
    document.getElementById('zoom-out').addEventListener('click', () => zoom(-.1));
    document.getElementById('zoom-in').addEventListener('click', () => zoom(.1));
    document.getElementById('zoom-reset').addEventListener('click', () => setPreviewZoom(1));
    document.querySelectorAll('.accordion-header, .template-option, .ai-copilot-header').forEach(element => {
        element.tabIndex = 0;
        element.setAttribute('role', 'button');
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); }
        });
    });
    const syncAccessibility = () => {
        document.querySelectorAll('.accordion-header').forEach(header => header.setAttribute('aria-expanded', String(header.parentElement.classList.contains('expanded'))));
        document.querySelectorAll('.tab-btn').forEach(button => { button.setAttribute('aria-pressed', String(button.classList.contains('active'))); button.setAttribute('aria-controls', button.dataset.tab); });
        document.querySelectorAll('.template-option').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
    };
    document.addEventListener('click', syncAccessibility);
    syncAccessibility();
    document.fonts.ready.then(adjustPreviewScale);
    let resizeFrame;
    new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(adjustPreviewScale);
    }).observe(document.getElementById('resume-page'));
});
