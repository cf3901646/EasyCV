/* Small, shared popovers. Native model fields retain import/export compatibility. */
const EasyCVControls = (() => {
    const closeIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>';
    const chevron = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
    const selects = new WeakMap();
    let active = null, menu, colorPanel, colorTrigger, colorModel, hsv = {h:0,s:0,v:0}, serial = 0;
    let selectedIndex = 0, menuSelect, search = '', searchTimer;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function close(restore = false) {
        if (!active) return;
        const {panel, trigger} = active;
        active = null;
        search = ''; clearTimeout(searchTimer);
        if (panel.hidePopover) panel.hidePopover(); else panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (restore && trigger.isConnected) trigger.focus({preventScroll:true});
    }
    function position() {
        if (!active) return;
        const {panel, trigger} = active;
        if (!trigger.isConnected) { close(); return; }
        const rect = trigger.getBoundingClientRect();
        const viewport = window.visualViewport;
        const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
        const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
        panel.style.maxHeight = `${Math.max(80, height - 24)}px`;
        panel.style.maxWidth = `${width - 24}px`;
        if (panel === menu) panel.style.width = `${Math.max(168, rect.width)}px`;
        const box = panel.getBoundingClientRect();
        const y = rect.bottom + 8 + box.height <= top + height - 12 ? rect.bottom + 8 : rect.top - box.height - 8;
        panel.style.left = `${clamp(rect.right - box.width, left + 12, left + width - box.width - 12)}px`;
        panel.style.top = `${clamp(y, top + 12, top + height - box.height - 12)}px`;
    }
    function open(panel, trigger) {
        if (active?.trigger === trigger) { close(true); return false; }
        close();
        active = {panel, trigger};
        trigger.setAttribute('aria-expanded', 'true');
        if (panel.showPopover) panel.showPopover(); else panel.hidden = false;
        position();
        return true;
    }
    function prepare(panel) {
        panel.setAttribute('popover', 'manual');
        if (!panel.showPopover) panel.hidden = true;
        panel.classList.add('workspace-popover', 'no-print');
        document.body.appendChild(panel);
    }
    function highlight(index) {
        const options = [...menu.querySelectorAll('[role=option]')];
        selectedIndex = clamp(index, 0, options.length - 1);
        options.forEach((option, i) => option.classList.toggle('is-highlighted', i === selectedIndex));
        menu.setAttribute('aria-activedescendant', options[selectedIndex].id);
        options[selectedIndex].scrollIntoView({block:'nearest'});
    }
    function choose(index) {
        const option = menu.querySelectorAll('[role=option]')[index], select = menuSelect;
        if (!option || !select?.isConnected) return;
        close(true);
        select.value = option.dataset.value;
        select.dispatchEvent(new Event('change', {bubbles:true}));
        syncSelect(select);
    }
    function openSelect(select, trigger, direction = 0) {
        menuSelect = select;
        menu.replaceChildren();
        for (const option of select.options) {
            if (option.disabled || option.hidden) continue;
            const row = document.createElement('div');
            row.id = `choice-${++serial}`; row.role = 'option'; row.dataset.value = option.value;
            row.setAttribute('aria-selected', String(option.selected));
            row.textContent = option.textContent;
            menu.appendChild(row);
        }
        menu.setAttribute('aria-label', trigger.dataset.label);
        if (!open(menu, trigger)) return;
        const index = [...menu.children].findIndex(row => row.dataset.value === select.value);
        highlight(direction === 1 ? 0 : direction === -1 ? menu.children.length - 1 : Math.max(0, index));
        menu.focus({preventScroll:true});
    }
    function syncSelect(select) {
        let trigger = selects.get(select);
        if (!trigger) {
            trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'select-trigger';
            select.id ||= `setting-choice-${++serial}`;
            trigger.id = `${select.id}-trigger`; trigger.dataset.selectId = select.id;
            trigger.dataset.label = select.labels?.[0]?.textContent || select.getAttribute('aria-label') || '选项';
            trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-controls', 'workspace-select-menu'); trigger.setAttribute('aria-expanded', 'false');
            trigger.innerHTML = `<span></span>${chevron}`;
            select.hidden = true; select.setAttribute('aria-hidden', 'true'); select.tabIndex = -1;
            select.insertAdjacentElement('afterend', trigger);
            if (select.labels?.[0]) select.labels[0].htmlFor = trigger.id;
            trigger.addEventListener('click', () => openSelect(select, trigger));
            trigger.addEventListener('keydown', event => {
                if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
                    event.preventDefault(); openSelect(select, trigger, event.key === 'Home' ? 1 : event.key === 'End' ? -1 : 0);
                }
            });
            select.addEventListener('change', () => syncSelect(select));
            selects.set(select, trigger);
        }
        const text = select.selectedOptions[0]?.textContent || '请选择';
        trigger.querySelector('span').textContent = text;
        trigger.setAttribute('aria-label', `${trigger.dataset.label}：${text}`);
        trigger.disabled = select.disabled;
    }
    function rgbToHSV(hex) {
        const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16) / 255);
        const max = Math.max(...rgb), min = Math.min(...rgb), delta = max - min;
        let h = hsv.h;
        if (delta) {
            const [r,g,b] = rgb;
            h = max === r ? (g-b)/delta : max === g ? (b-r)/delta+2 : (r-g)/delta+4;
            h = (h * 60 + 360) % 360;
        }
        return {h,s:max ? delta/max : 0,v:max};
    }
    function hsvToHex() {
        const {h,s,v} = hsv, chroma = v*s, x = chroma*(1-Math.abs((h/60)%2-1)), m = v-chroma;
        const rgb = h < 60 ? [chroma,x,0] : h < 120 ? [x,chroma,0] : h < 180 ? [0,chroma,x] : h < 240 ? [0,x,chroma] : h < 300 ? [x,0,chroma] : [chroma,0,x];
        return '#' + rgb.map(c => Math.round((c+m)*255).toString(16).padStart(2,'0')).join('');
    }
    function paintColor() {
        const hex = colorModel.value;
        colorTrigger.style.setProperty('--picked-color', hex);
        colorTrigger.querySelector('.color-value').textContent = hex.toUpperCase();
        colorPanel.style.setProperty('--picked-color', hex);
        colorPanel.style.setProperty('--hue-color', `hsl(${hsv.h} 100% 50%)`);
        const dot = colorPanel.querySelector('.color-point');
        dot.style.left = `calc(8px + (100% - 16px) * ${hsv.s})`;
        dot.style.top = `calc(8px + (100% - 16px) * ${1-hsv.v})`;
        document.getElementById('color-hue').value = hsv.h;
        document.getElementById('color-hue').setAttribute('aria-valuetext', `${Math.round(hsv.h)} 度`);
        document.getElementById('color-hex').value = hex.toUpperCase();
        ['r','g','b'].forEach((key,i) => { document.getElementById(`color-${key}`).value = parseInt(hex.slice(1+i*2,3+i*2),16); });
        colorPanel.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
        document.getElementById('color-error').textContent = '';
    }
    function commitColor(hex, fromHSV = false) {
        colorModel.value = hex.toLowerCase();
        if (!fromHSV) hsv = rgbToHSV(hex);
        paintColor();
        colorModel.dispatchEvent(new Event('input', {bubbles:true}));
    }
    function initColor() {
        colorModel = document.getElementById('custom-accent-color');
        colorTrigger = document.getElementById('custom-color-trigger');
        colorPanel = document.createElement('div'); colorPanel.id = 'color-popover'; colorPanel.className = 'color-popover';
        colorPanel.role = 'dialog'; colorPanel.setAttribute('aria-labelledby','color-picker-title');
        colorPanel.innerHTML = `<div class="popover-heading"><h3 id="color-picker-title">自定义强调色</h3><button type="button" class="icon-close" aria-label="关闭调色盘">${closeIcon}</button></div>
            <div class="color-plane" aria-hidden="true"><span class="color-point"></span></div>
            <div class="color-hue-row"><span class="color-current" aria-hidden="true"></span><label class="sr-only" for="color-hue">色相</label><input class="color-hue" id="color-hue" type="range" min="0" max="359" step="1"><button type="button" class="eyedropper-btn" aria-label="从屏幕拾取颜色" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4 4 4M11 5l-7 7v4h4l7-7M13 3l1-1 4 4-1 1"/></svg></button></div>
            <div class="color-fields"><label class="hex-field" for="color-hex">HEX<input id="color-hex" spellcheck="false" maxlength="7" autocomplete="off" aria-describedby="color-error"></label><label for="color-r">R<input id="color-r" type="number" min="0" max="255" aria-label="红色" aria-describedby="color-error"></label><label for="color-g">G<input id="color-g" type="number" min="0" max="255" aria-label="绿色" aria-describedby="color-error"></label><label for="color-b">B<input id="color-b" type="number" min="0" max="255" aria-label="蓝色" aria-describedby="color-error"></label></div>
            <p class="color-error" id="color-error" role="status"></p><p class="popover-note">拖动选色，或输入色值。实时应用到简历。</p>`;
        prepare(colorPanel);
        colorTrigger.addEventListener('click', () => {
            syncColor();
            if (open(colorPanel, colorTrigger)) colorPanel.querySelector('.icon-close').focus({preventScroll:true});
        });
        colorPanel.querySelector('.icon-close').addEventListener('click', () => close(true));
        const plane = colorPanel.querySelector('.color-plane');
        const pick = event => {
            const rect = plane.getBoundingClientRect();
            hsv.s = clamp((event.clientX-rect.left-8)/(rect.width-16),0,1);
            hsv.v = 1-clamp((event.clientY-rect.top-8)/(rect.height-16),0,1);
            commitColor(hsvToHex(), true);
        };
        plane.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            event.preventDefault(); plane.setPointerCapture(event.pointerId); plane.classList.add('is-dragging'); pick(event);
        });
        plane.addEventListener('pointermove', event => { if (plane.hasPointerCapture(event.pointerId)) pick(event); });
        for (const event of ['pointerup','pointercancel','lostpointercapture']) plane.addEventListener(event, () => plane.classList.remove('is-dragging'));
        const hueSlider = document.getElementById('color-hue');
        hueSlider.addEventListener('input', event => { hsv.h = event.target.valueAsNumber; commitColor(hsvToHex(), true); });
        hueSlider.addEventListener('pointerdown', () => hueSlider.classList.add('is-dragging'));
        for (const event of ['pointerup','pointercancel','lostpointercapture','blur']) hueSlider.addEventListener(event, () => hueSlider.classList.remove('is-dragging'));
        document.getElementById('color-hex').addEventListener('input', event => {
            let hex = event.target.value.trim(); if (!hex.startsWith('#')) hex = '#' + hex;
            if (/^#[a-f\d]{6}$/i.test(hex)) commitColor(hex);
        });
        document.getElementById('color-hex').addEventListener('change', event => {
            let hex = event.target.value.trim(); if (!hex.startsWith('#')) hex = '#' + hex;
            if (/^#[a-f\d]{3}$/i.test(hex)) hex = '#' + [...hex.slice(1)].map(c => c+c).join('');
            if (/^#[a-f\d]{6}$/i.test(hex)) commitColor(hex);
            else { event.target.setAttribute('aria-invalid','true'); document.getElementById('color-error').textContent = '请输入 3 位或 6 位十六进制色值。'; }
        });
        for (const key of ['r','g','b']) document.getElementById(`color-${key}`).addEventListener('change', event => {
            if (!Number.isFinite(event.target.valueAsNumber)) { event.target.setAttribute('aria-invalid','true'); document.getElementById('color-error').textContent = 'RGB 色值需要填写 0–255 的数字。'; return; }
            const values = ['r','g','b'].map(channel => clamp(Math.round(document.getElementById(`color-${channel}`).valueAsNumber),0,255));
            if (values.every(Number.isFinite)) commitColor('#' + values.map(v=>v.toString(16).padStart(2,'0')).join(''));
        });
        const eyedropper = colorPanel.querySelector('.eyedropper-btn');
        eyedropper.hidden = !window.EyeDropper;
        eyedropper.addEventListener('click', async () => {
            try { const result = await new EyeDropper().open(); commitColor(result.sRGBHex); }
            catch (error) { if (error.name !== 'AbortError') document.getElementById('color-error').textContent = '暂时无法拾取屏幕颜色，请使用调色盘。'; }
        });
        syncColor();
    }
    function syncColor() {
        if (!colorModel) return;
        hsv = rgbToHSV(colorModel.value); paintColor();
    }
    function sync() {
        if (!menu) return;
        if (active && !active.trigger.isConnected) close();
        document.querySelectorAll('.editor-sidebar select').forEach(syncSelect);
        syncColor();
    }
    function init() {
        menu = document.createElement('div'); menu.id = 'workspace-select-menu'; menu.className = 'select-menu'; menu.role = 'listbox'; menu.tabIndex = -1;
        prepare(menu); initColor(); sync();
        menu.addEventListener('click', event => { const row = event.target.closest('[role=option]'); if (row) choose([...menu.children].indexOf(row)); });
        menu.addEventListener('pointermove', event => { const row = event.target.closest('[role=option]'); if (row) highlight([...menu.children].indexOf(row)); });
        menu.addEventListener('keydown', event => {
            if (['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)) event.preventDefault();
            if (event.key === 'ArrowDown') highlight((selectedIndex+1) % menu.children.length);
            else if (event.key === 'ArrowUp') highlight((selectedIndex+menu.children.length-1) % menu.children.length);
            else if (event.key === 'Home') highlight(0);
            else if (event.key === 'End') highlight(menu.children.length-1);
            else if (event.key === 'Enter' || event.key === ' ') choose(selectedIndex);
            else if (event.key === 'Tab') close(true);
            else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                search += event.key.toLocaleLowerCase(); clearTimeout(searchTimer); searchTimer = setTimeout(() => { search = ''; },600);
                const index = [...menu.children].findIndex(row => row.textContent.toLocaleLowerCase().startsWith(search));
                if (index >= 0) highlight(index);
            }
        });
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && active) { event.preventDefault(); close(true); } });
        document.addEventListener('pointerdown', event => { if (active && !active.panel.contains(event.target) && !active.trigger.contains(event.target)) close(); });
        document.addEventListener('focusin', event => { if (active && !active.panel.contains(event.target) && !active.trigger.contains(event.target)) close(); });
        window.addEventListener('resize', position);
        window.visualViewport?.addEventListener('resize', position);
        document.addEventListener('scroll', event => { if (active && !active.panel.contains(event.target)) position(); },true);
        window.addEventListener('beforeprint', () => close());
    }
    return {init, sync, close};
})();
