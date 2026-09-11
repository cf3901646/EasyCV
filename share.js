/* Versioned, self-contained resume snapshots. URL data never needs a backend. */
const EasyCVShare = (() => {
    const PREFIX = '#resume=';
    const MAX_BYTES = 256 * 1024;
    const MAX_URL_LENGTH = 64000;
    const memory = new Map();
    let active = location.hash.startsWith(PREFIX);
    let loadError = '';
    let generation = 0;

    function toBase64URL(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function fromBase64URL(encoded) {
        if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error('链接内容不完整，请重新复制完整链接。');
        const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        if (toBase64URL(bytes) !== encoded) throw new Error('链接内容损坏，请重新生成。');
        return bytes;
    }

    async function readLimited(stream) {
        const reader = stream.getReader();
        const chunks = [];
        let length = 0;
        try {
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                length += value.length;
                if (length > MAX_BYTES) {
                    await reader.cancel();
                    throw new Error('简历数据过大，请使用 JSON 备份传递。');
                }
                chunks.push(value);
            }
        } finally { reader.releaseLock(); }
        const result = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
        return result;
    }

    async function encode(data) {
        const snapshot = normalizeResume(data, {});
        let bytes = new TextEncoder().encode(JSON.stringify({resume: snapshot}));
        if (bytes.length > MAX_BYTES) throw new Error('简历数据过大，请使用“导出备份”传递。');
        let format = '1j';
        if (typeof CompressionStream === 'function') {
            const compressed = await readLimited(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')));
            if (compressed.length < bytes.length) { bytes = compressed; format = '1g'; }
        }
        const token = `${format}.${toBase64URL(bytes)}`;
        if (token.length + PREFIX.length > MAX_URL_LENGTH) throw new Error('简历生成的链接过长，请使用“导出备份”传递。');
        return token;
    }

    async function decode(token) {
        if (token.length > MAX_URL_LENGTH) throw new Error('分享链接过长，请使用 JSON 备份导入。');
        const match = /^(1[gj])\.([A-Za-z0-9_-]+)$/.exec(token);
        if (!match) throw new Error('链接格式无效或版本不支持，请重新生成完整链接。');
        let bytes = fromBase64URL(match[2]);
        if (match[1] === '1g') {
            if (typeof DecompressionStream !== 'function') throw new Error('此浏览器不支持压缩链接，请使用新版浏览器打开。');
            bytes = await readLimited(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
        }
        if (bytes.length > MAX_BYTES) throw new Error('简历数据过大，请使用 JSON 备份导入。');
        const payload = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
        if (!payload || !payload.resume || !payload.resume.settings || Array.isArray(payload.resume.settings)) throw new Error('链接缺少简历或排版数据。');
        // Share defaults are deterministic, never inherited from the recipient's resume.
        return normalizeResume(payload.resume, {});
    }

    async function createURL(data = window.resumeApp.getData()) {
        if (!['https:', 'http:'].includes(location.protocol)) throw new Error('请在已发布的 EasyCV 网站上生成分享链接。直接打开的本地文件地址无法分享给他人。');
        const url = new URL(location.href);
        url.search = '';
        url.hash = PREFIX.slice(1) + await encode(data);
        if (url.href.length > MAX_URL_LENGTH) throw new Error('链接过长，请导出 JSON 备份传递。');
        return url.href;
    }

    async function prepare() {
        const app = document.querySelector('.app-container');
        app.inert = true;
        app.setAttribute('aria-busy', 'true');
        try {
            const resume = await decode(location.hash.slice(PREFIX.length));
            const {settings, ...content} = resume;
            memory.set('easycv_resume_content', JSON.stringify(content));
            memory.set('easycv_resume_settings_a', JSON.stringify(settings));
            memory.set('easycv_resume_current_scheme', 'A');
        } catch (error) {
            active = false;
            memory.clear();
            loadError = error instanceof SyntaxError || error instanceof TypeError
                ? '链接数据损坏或不完整，请向分享者获取新的链接。' : error.message;
            history.replaceState(null, '', location.pathname + location.search);
        } finally {
            app.inert = false;
            app.removeAttribute('aria-busy');
        }
    }

    function initUI() {
        const dialog = document.getElementById('share-dialog');
        const field = document.getElementById('share-url');
        const status = document.getElementById('share-status');
        const copy = document.getElementById('copy-share-link');
        const note = document.getElementById('share-address-note');
        document.querySelectorAll('[data-share-resume]').forEach(button => button.addEventListener('click', async () => {
            const request = ++generation;
            field.value = '';
            copy.disabled = true;
            status.textContent = '正在生成链接…';
            note.hidden = true;
            dialog.showModal();
            try {
                const url = await createURL();
                if (request !== generation || !dialog.open) return;
                field.value = url;
                copy.disabled = false;
                status.textContent = url.length > 8000 ? `链接共 ${url.length.toLocaleString()} 个字符，部分应用可能截断，请确保完整发送。` : `已包含当前内容与排版 · ${url.length.toLocaleString()} 个字符`;
                if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
                    note.hidden = false;
                    note.textContent = '这是本机预览地址。请在已发布的网站上生成可发给他人的链接。';
                }
            } catch (error) { if (request === generation) status.textContent = error.message; }
        }));
        document.getElementById('close-share-dialog').addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => { generation++; });
        field.addEventListener('click', () => field.select());
        copy.addEventListener('click', async () => {
            if (!field.value) return;
            try {
                if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
                await navigator.clipboard.writeText(field.value);
                status.textContent = '链接已复制，可以发给对方了。';
            } catch {
                field.focus();
                field.select();
                status.textContent = '浏览器未允许自动复制，链接已选中，请手动复制。';
            }
        });
        if (active) {
            document.getElementById('shared-resume-banner').hidden = false;
            document.getElementById('return-local-resume').href = location.pathname + location.search;
            document.getElementById('save-status').textContent = '链接简历 · 本次页面暂存';
            document.querySelector('[data-workspace-view="preview"]').click();
            adjustPreviewScale();
        }
        if (loadError) {
            document.getElementById('share-error-message').textContent = loadError;
            document.getElementById('share-error-dialog').showModal();
        }
        window.addEventListener('hashchange', () => {
            if (active || location.hash.startsWith(PREFIX)) location.reload();
        });
    }

    return {get active() { return active; }, encode, decode, createURL, prepare, initUI,
        storage: {
            getItem: key => active ? (memory.get(key) ?? null) : localStorage.getItem(key),
            setItem: (key, value) => active ? memory.set(key, String(value)) : localStorage.setItem(key, value)
        }};
})();
const resumeStorage = EasyCVShare.storage;
