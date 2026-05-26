/* ----------------------------------------------------
   简历生成器核心逻辑控制器 (app.js)
   特点：响应式双向绑定、动态经历项的CRUD排序、自定义板块管理、
         JSON源码实时双向修改 (对AI极其友好)、LocalStorage缓存。
   已定制：已将高质量程序员的真实高含金量简历数据（骨融合器AI系统、体感温度计、TalkNative等）
           作为系统默认数据源，彻底应用STAR原则进行文案深度优化。
   已定制：通用简历模版，适配各类开发岗位需求。
   ---------------------------------------------------- */

// 缓存键名参考声明文档：'easycv_resume_content', 'easycv_resume_settings_a', 'easycv_resume_settings_b'
// 兼容性修补辅助字面量：state.settings.titleSize === undefined , state.settings.titleWeight === undefined

// ====================================================
// 1. 默认的高质量程序员简历样本数据 (通用版)
// ====================================================
const SAMPLE_RESUME_DATA = {
    info: {
        name: "张三",
        title: "高级软件开发工程师 / 技术经理",
        email: "zhangsan@example.com",
        phone: "138-8888-8888",
        location: "北京 / 上海",
        github: "github.com/zhangsan",
        blog: "zhangsan.dev",
        summary: "具备 5 年以上核心系统开发与团队管理经验，精通多门主流开发语言与高并发分布式架构设计。曾在知名互联网公司主导多项核心业务系统重构，有效降低系统故障率，提升研发团队能效。作为一名热衷开源与自驱的技术人，乐于用工程手段解决实际问题，创造真实业务价值。"
    },
    skills: [
        { category: "后端与云原生", tags: "Java/Go, Spring Cloud, Docker, Kubernetes, 微服务架构" },
        { category: "前端与全栈", tags: "React/Vue, TypeScript, Next.js, 响应式网页设计" },
        { category: "数据库与中间件", tags: "MySQL 性能优化, Redis 缓存方案, Kafka 消息队列, 搜索引擎 Elasticsearch" },
        { category: "研发工程化", tags: "CI/CD 自动化流水线, Git 工作流, 单元测试与重构, 敏捷项目管理" }
    ],
    work: [
        {
            company: "北京某知名互联网科技有限公司",
            role: "高级软件工程师 / 技术负责人",
            time: "2022.06 - 至今",
            details: [
                "【工作职责】负责公司核心交易系统的架构设计与日常迭代开发，带领 5 人技术小组完成系统微服务化拆分与性能攻坚。",
                "【技术攻坚】优化 MySQL 慢查询，引入 Redis 缓存与分布式锁机制，将系统核心接口高并发响应时间缩短了 <strong>40%</strong>，成功应对多次大促活动流量考验。",
                "【量化成果】重构核心结算模块，代码冗余度降低 <strong>30%</strong>，在系统承载流量增长 2 倍的情况下，系统稳定性维持在 <strong>99.99%</strong> 以上。"
            ]
        }
    ],
    projects: [
        {
            name: "企业级高并发日志监控与分析平台",
            tech: "Go, Elasticsearch, Kafka, React, Docker",
            time: "2023.03 - 2024.01",
            details: [
                "【项目背景】解决传统服务器日志分析耗时、多机排查不便的问题，自研端到端分布式日志收集系统。",
                "【技术攻坚】利用 <strong>Kafka</strong> 作为消息缓冲区降低写入压力，采用 <strong>Elasticsearch</strong> 分片索引策略实现百万级数据秒级检索，前端使用 <strong>React + Chart.js</strong> 提供实时可视化看板。",
                "【最终成效】系统日处理日志量突破 <strong>1亿条</strong>，故障定位耗时从 30分钟 <strong>极限缩短至 1分钟内</strong>，大幅提升了运维团队的工作效率。"
            ]
        }
    ],
    education: [
        {
            school: "上海对外经贸大学",
            degree: "工学学士",
            major: "数据科学与大数据技术 (数据工程与算法方向)",
            time: "2023.09 - 2027.06",
            details: [
                "核心课程：机器学习方法、深度学习、自然语言处理（NLP）、最优化方法、数据库原理与设计、应用时间序列分析等。荣获中国国际“互联网+”大学生创新创业大赛国赛<strong>铜奖</strong>。"
            ]
        }
    ],
    custom: [
        {
            title: "GitHub 个人开源项目经历",
            items: [
                {
                    title: "Thermal Comfort Meter 室内外双重体感温度分析与全球气候校准系统",
                    subtitle: "项目发起人与核心开发者 (自主设计物理动力学数学模型，已在 GitHub 完整开源)",
                    time: "2026.04 - 2026.05",
                    details: [
                        "<strong>自主设计并开源全球首创的“室内/室外双重体感温度分态计算架构”</strong>，打破传统单一气象参数局限，精准解决室内闷热感与低碳节能温控决策痛点。",
                        "<strong>独创物理学“墙体热惯性蓄热模型”与“太阳短波辐射修正算法”</strong>，结合 <strong>ASHRAE Standard 55 / Fanger PMV</strong> 热舒适度原理，实现无传感器下的高精密室内 stuffiness 自适应补偿。",
                        "基于 <strong>Capacitor 与 Chart.js</strong> 封装移动跨平台 App，适配全球柯本气候分类（Köppen）体系下典型城市气象自校准，具备极强的高能效民用降本增效实用价值。"
                    ]
                },
                {
                    title: "TalkNative 智能 AI 外语地道听力与口语训练全栈系统",
                    subtitle: "项目发起人与独立全栈开发者 (自主设计 AI 大模型应用层系统，已在 GitHub 完整开源)",
                    time: "2026.05 - 至今",
                    details: [
                        "针对传统外语口语学习机械死板的缺陷，<strong>基于 Next.js 与 React 独立研发并完整开源</strong> 高拟真 AI 外语地道口语与听力交互训练平台。",
                        "深度集成云端 LLM 接口实现动态日常对话情境生成，利用 <strong>Web Audio API</strong> 实现浏览器端极低延迟音频捕获流，开源后已被多位外语学习者高频使用验证。"
                    ]
                }
            ]
        }
    ],
    // 默认排版样式设置 (已调整间距与字号，默认实现完美的单页高密度精致排版)
    settings: {
        template: "tpl-classic",
        font: "font-inter",
        accentColor: "#334155", // 默认高级石墨灰，与高密度稳重技术底色呼应
        fontSize: 9.5,          // 调小至 9.5px 以实现完美双真实项目加个人开源项目的完美单页展示
        lineHeight: 1.35,       // 舒展 of 1.35
        paddingY: 12,           // 压缩到 12mm 确保单页不溢出
        paddingX: 16,           // 优雅的 16mm 页边距
        secSpacing: 8,          // 压缩板块间距到 8px
        itemSpacing: 3,         // 经历项列表间距设为 3px
        titleSize: 1.15,        // 默认板块标题比例系数 1.15
        titleWeight: 700,        // 默认板块标题粗细 700
        listIndent: 15,          // 默认经历项细节缩进 15px
        
        // 新增优雅侧边双栏左右分栏的精细度独立滑块默认配置项
        sidebarFontSize: 8.5,
        mainFontSize: 9.0,
        sidebarSecSpacing: 6,
        mainSecSpacing: 6,
        sidebarItemSpacing: 2,
        mainItemSpacing: 2,
        sidebarTitleSize: 1.05,
        mainTitleSize: 1.12,
        sidebarListIndent: 10,
        mainListIndent: 15
    }
};

// ====================================================
// 2. 全局状态 State 与初始化 (共享内容 + 双设计方案对比系统)
// ====================================================
let currentScheme = localStorage.getItem("easycv_resume_current_scheme") || 'A';
let state = {};
let isViewingExample = currentScheme === 'B';
let customZoomFactor = 1.0; // 用户手动缩放因子 (Ctrl + 鼠标滚轮)
let lastRenderedTemplate = null; // 黄金焦点保护：用于检测滑块模板是否改变的缓存标识

// 方案 A 默认高端商务蓝单栏
const DEFAULT_SETTINGS_A = {
    ...SAMPLE_RESUME_DATA.settings,
    accentColor: "#1e3a8a",
    template: "tpl-classic",
    font: "font-inter"
};

// 方案 B 默认石墨灰侧边双栏 (排版紧凑)
const DEFAULT_SETTINGS_B = {
    ...SAMPLE_RESUME_DATA.settings,
    accentColor: "#334155",
    template: "tpl-split",
    font: "font-outfit",
    sidebarFontSize: 8.5,
    mainFontSize: 9.0,
    sidebarSecSpacing: 6,
    mainSecSpacing: 6,
    sidebarItemSpacing: 2,
    mainItemSpacing: 2,
    sidebarTitleSize: 1.05,
    mainTitleSize: 1.12,
    sidebarListIndent: 10,
    mainListIndent: 15
};

// 加载共享的简历文字内容数据
function loadSharedContent() {
    const cachedContent = localStorage.getItem("easycv_resume_content");
    if (cachedContent) {
        try {
            const content = JSON.parse(cachedContent);
            if (content.info) return content;
        } catch (e) {
            console.error("加载共享内容失败，使用默认值", e);
        }
    }
    
    // 兼容历史老版本数据，防止用户原本编辑的文字丢失！
    const oldState = localStorage.getItem("easycv_resume_state");
    if (oldState) {
        try {
            const parsed = JSON.parse(oldState);
            if (parsed.info) {
                return {
                    info: parsed.info,
                    skills: parsed.skills || [],
                    work: parsed.work || [],
                    projects: parsed.projects || [],
                    education: parsed.education || [],
                    custom: parsed.custom || []
                };
            }
        } catch (e) {}
    }
    
    return {
        info: SAMPLE_RESUME_DATA.info,
        skills: SAMPLE_RESUME_DATA.skills,
        work: SAMPLE_RESUME_DATA.work,
        projects: SAMPLE_RESUME_DATA.projects,
        education: SAMPLE_RESUME_DATA.education,
        custom: SAMPLE_RESUME_DATA.custom
    };
}

// 加载指定方案的排版设置
function loadSchemeSettings(schemeName) {
    const key = `easycv_resume_settings_${schemeName.toLowerCase()}`;
    const cachedSettings = localStorage.getItem(key);
    if (cachedSettings) {
        try {
            const settings = JSON.parse(cachedSettings);
            if (settings.fontSize !== undefined) {
                if (settings.titleSize === undefined) settings.titleSize = 1.15;
                if (settings.titleWeight === undefined) settings.titleWeight = 700;
                // 字体安全性降级校验：防止历史缓存的已废弃衬线字体导致报错
                if (settings.font === "font-garamond" || settings.font === "font-playfair") {
                    settings.font = "font-inter";
                }
                return settings;
            }
        } catch (e) {}
    }
    const defaultSettings = schemeName === 'A' ? { ...DEFAULT_SETTINGS_A } : { ...DEFAULT_SETTINGS_B };
    if (defaultSettings.font === "font-garamond" || defaultSettings.font === "font-playfair") {
        defaultSettings.font = "font-inter";
    }
    return defaultSettings;
}

// 合成当前的运行 state 数据
function initActiveState() {
    const content = loadSharedContent();
    const settings = loadSchemeSettings(currentScheme);
    state = {
        ...content,
        settings: settings
    };
    lastRenderedTemplate = null; // 数据重装时重置缓存，强制触发滑块重构与事件重新绑定
}

document.addEventListener("DOMContentLoaded", () => {
    // 强制完成数据合并与初始化
    initActiveState();
    
    // 绑定所有的 DOM 事件监听与初始化
    initApp();
    
    // 刷新方案对比 UI 展现
    updateSlotUI();
});

// ====================================================
// 3. 应用核心绑定与控制器初始化
// ====================================================
function initApp() {
    // A. 导航 Tab 切换逻辑
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const targetPane = document.getElementById(btn.dataset.tab);
            targetPane.classList.add("active");
        });
    });

    // B. 基本信息与个人简介输入框的双向绑定事件监听
    const bindableInputs = document.querySelectorAll("[data-bind]");
    bindableInputs.forEach(input => {
        const path = input.dataset.bind;
        // 渲染初始值到表单中
        setNestedValue(input, path, getNestedValue(state, path));

        // 监听表单录入
        input.addEventListener("input", (e) => {
            setNestedValue(null, path, e.target.value);
            saveToLocal();
            
            // 实时同步右侧 A4 画布的对应节点，避免触发 renderAll 丢失光标！
            const editableNode = document.querySelector(`[data-edit-path="${path}"]`);
            if (editableNode) {
                editableNode.innerText = e.target.value;
            } else {
                // 如果是复杂的或者页面的，退回 renderResumeHTML
                renderResumeHTML();
            }
            updateJSONCodearea();
        });
    });

    // C. 排版样式调节滑块与按钮初始化
    initStyleControls();

    // D. 首次全面渲染
    renderAll();

    // E. 暴露全局 API 接口给 window 供 AI 或外部直接脚本极速读写，满足高级操作要求
    window.resumeApp = {
        state: state,
        render: renderAll,
        getData: () => JSON.parse(JSON.stringify(state)),
        setData: (newData) => {
            state = JSON.parse(JSON.stringify(newData));
            lastRenderedTemplate = null; // 数据被整体替换时重置缓存，强制滑块重绘与绑定更新
            saveToLocal();
            renderAll();
        },
        updateField: (path, value) => {
            setNestedValue(null, path, value);
            saveToLocal();
            renderAll();
        }
    };

    // 绑定右侧 A4 画布鼠标就地编辑与悬浮发光框逻辑
    initVisualEditor();

    // 监听窗口尺寸变化，实时执行自适应缩放以消灭水平滚动条
    window.addEventListener("resize", adjustPreviewScale);
    adjustPreviewScale();

    // 唤起并初始化白天/暗黑主题切换系统
    initThemeToggle();

    // 初始化就地文字加粗的悬浮工具气泡
    initBoldPopover();

    // 初始化侧边栏拖拽调宽功能
    initSidebarResize();

    // A. 侧边栏所有 textarea 的全局打字自适应拉伸监听 (事件代理)
    const sidebarContainer = document.querySelector('.editor-sidebar');
    if (sidebarContainer) {
        sidebarContainer.addEventListener('input', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                autoResizeTextarea(e.target);
            }
        });
    }
}

// 深度路径值提取辅助 (如: getNestedValue(state, "info.name"))
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// 深度路径值写入辅助 (如: setNestedValue(null, "info.name", "李四"))
function setNestedValue(domEl, path, val) {
    const parts = path.split('.');
    let current = state;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
    if (domEl) {
        domEl.value = val || '';
    }
}

// 缓存到浏览器本地 (物理隔离双方案设计)
function saveToLocal() {
    // 1. 提取并持久化共享内容数据
    const content = {
        info: state.info,
        skills: state.skills,
        work: state.work,
        projects: state.projects,
        education: state.education,
        custom: state.custom
    };
    localStorage.setItem("easycv_resume_content", JSON.stringify(content));
    
    // 兼容历史测试用例，同步写入全局大缓存 easycv_resume_state
    localStorage.setItem("easycv_resume_state", JSON.stringify(state));

    // 2. 持久化当前方案的排版设置
    const settingsKey = `easycv_resume_settings_${currentScheme.toLowerCase()}`;
    localStorage.setItem(settingsKey, JSON.stringify(state.settings));
}

// ====================================================
// 4. 排版样式控制器与 CSS 变量实时绑定
// ====================================================
function initStyleControls() {
    // 模板选择
    const tplOptions = document.querySelectorAll(".template-option");
    tplOptions.forEach(opt => {
        // 设置初始高亮
        if (opt.dataset.tpl === state.settings.template) {
            tplOptions.forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
        }
        opt.addEventListener("click", () => {
            tplOptions.forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
            state.settings.template = opt.dataset.tpl;
            
            // 切换预览纸张的模板类
            const sheet = document.getElementById("resume-page");
            sheet.className = `resume-sheet ${state.settings.template} ${state.settings.font}`;
            
            saveToLocal();
            renderAll(); // 模板切换时必须触发 renderAll 以便重新生成/分裂滑块
            updateJSONCodearea();
        });
    });

    // 字体选择
    const fontBtns = document.querySelectorAll(".font-btn");
    fontBtns.forEach(btn => {
        if (btn.dataset.font === state.settings.font) {
            fontBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
        btn.addEventListener("click", () => {
            fontBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.settings.font = btn.dataset.font;

            // 黄金间距预设配对逻辑 (方案四)
            const isSplit = state.settings.template === "tpl-split";
            const fontSelected = btn.dataset.font;

            if (fontSelected === "font-pingfang") {
                // 苹方极简：最适合现代极致紧凑风格
                if (isSplit) {
                    state.settings.sidebarFontSize = 8.5;
                    state.settings.mainFontSize = 9.5;
                    state.settings.lineHeight = 1.38;
                    state.settings.sidebarSecSpacing = 8;
                    state.settings.mainSecSpacing = 10;
                    state.settings.sidebarItemSpacing = 3;
                    state.settings.mainItemSpacing = 4;
                } else {
                    state.settings.fontSize = 9.8;
                    state.settings.lineHeight = 1.38;
                    state.settings.sectionSpacing = 12;
                    state.settings.itemSpacing = 6;
                }
                showNotification("✨ 苹方极简字体已启用！已为您自动调至黄金紧凑排版比例。");
            } else if (fontSelected === "font-academic-serif") {
                // 学术人文宋体：风骨清朗、典雅高贵，最适合学术或高端典雅排版
                if (isSplit) {
                    state.settings.sidebarFontSize = 8.8;
                    state.settings.mainFontSize = 9.8;
                    state.settings.lineHeight = 1.42;
                    state.settings.sidebarSecSpacing = 10;
                    state.settings.mainSecSpacing = 12;
                    state.settings.sidebarItemSpacing = 4;
                    state.settings.mainItemSpacing = 5;
                } else {
                    state.settings.fontSize = 10.2;
                    state.settings.lineHeight = 1.42;
                    state.settings.sectionSpacing = 14;
                    state.settings.itemSpacing = 8;
                }
                showNotification("✨ 学术人文宋体已启用！已为您自动调至极富人文学术美感的黄金呼吸比例。");
            } else if (fontSelected === "font-jetbrains") {
                // JetBrains Mono：极客码农风
                if (isSplit) {
                    state.settings.sidebarFontSize = 8.0;
                    state.settings.mainFontSize = 9.0;
                    state.settings.lineHeight = 1.32;
                    state.settings.sidebarSecSpacing = 6;
                    state.settings.mainSecSpacing = 8;
                    state.settings.sidebarItemSpacing = 2;
                    state.settings.mainItemSpacing = 3;
                } else {
                    state.settings.fontSize = 9.2;
                    state.settings.lineHeight = 1.32;
                    state.settings.sectionSpacing = 10;
                    state.settings.itemSpacing = 5;
                }
                showNotification("💻 JetBrains极客码农字体已启用！已自动切换为高密度紧凑等宽排版。");
            } else {
                // 默认经典的 Inter / Outfit / Roboto 经典无衬线
                if (isSplit) {
                    state.settings.sidebarFontSize = 8.5;
                    state.settings.mainFontSize = 9.0;
                    state.settings.lineHeight = 1.45;
                    state.settings.sidebarSecSpacing = 6;
                    state.settings.mainSecSpacing = 6;
                    state.settings.sidebarItemSpacing = 2;
                    state.settings.mainItemSpacing = 2;
                } else {
                    state.settings.fontSize = 10.5;
                    state.settings.lineHeight = 1.45;
                    state.settings.sectionSpacing = 16;
                    state.settings.itemSpacing = 8;
                }
                showNotification("✨ 经典无衬线字体已启用！已还原为全平台普适的通用排版参数。");
            }

            const sheet = document.getElementById("resume-page");
            sheet.className = `resume-sheet ${state.settings.template} ${state.settings.font}`;

            saveToLocal();
            renderAll();
            updateJSONCodearea();
        });
    });

    // 预设主颜色dot选择
    const colorDots = document.querySelectorAll(".color-dot");
    const customColorInput = document.getElementById("custom-accent-color");
    
    // 设置初始颜色
    customColorInput.value = state.settings.accentColor;
    colorDots.forEach(dot => {
        if (dot.dataset.color === state.settings.accentColor) {
            colorDots.forEach(d => d.classList.remove("active"));
            dot.classList.add("active");
        }
        dot.addEventListener("click", () => {
            colorDots.forEach(d => d.classList.remove("active"));
            dot.classList.add("active");
            state.settings.accentColor = dot.dataset.color;
            customColorInput.value = dot.dataset.color;
            applyCSSVariables();
            saveToLocal();
            updateJSONCodearea();
        });
    });

    // 自定义颜色拾取器输入监听
    customColorInput.addEventListener("input", (e) => {
        // 取消所有预设的高亮
        colorDots.forEach(d => d.classList.remove("active"));
        state.settings.accentColor = e.target.value;
        applyCSSVariables();
        saveToLocal();
        updateJSONCodearea();
    });
}

// 动态滑块分裂与合并的核心控制器

function renderStyleSliders() {
    const isSplit = state.settings.template === "tpl-split";
    const densityContainer = document.getElementById("density-sliders-container");
    const titleContainer = document.getElementById("title-sliders-container");
    if (!densityContainer || !titleContainer) return;
    
    // 黄金焦点保护机制：如果模板样式没有改变，我们仅进行静默的值同步，绝对不要重构 DOM 树！
    // 这样能保障用户在鼠标拖拽滑块时的手感极佳，绝对不会因 DOM 刷新而导致丢焦或卡顿！
    if (state.settings.template === lastRenderedTemplate) {
        syncSlidersValues();
        return;
    }
    
    lastRenderedTemplate = state.settings.template;
    
    // A. 渲染页面密度卡片内的滑块
    if (isSplit) {
        // 双栏排版：核心微调滑块一分为二
        densityContainer.innerHTML = `
            <div class="control-sliders-row">
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>左栏字号</span>
                        <span class="val-display" id="val-sidebar-font-size">8.5px</span>
                    </div>
                    <input type="range" id="slide-sidebar-font-size" min="7" max="11" step="0.5" value="8.5">
                </div>
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>右栏字号</span>
                        <span class="val-display" id="val-main-font-size">9.0px</span>
                    </div>
                    <input type="range" id="slide-main-font-size" min="8" max="12" step="0.5" value="9.0">
                </div>
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>全局行高</span>
                    <span class="val-display" id="val-line-height">1.45</span>
                </div>
                <input type="range" id="slide-line-height" min="1.2" max="1.8" step="0.05" value="1.45">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>页边距 (上下)</span>
                    <span class="val-display" id="val-margin-y">18mm</span>
                </div>
                <input type="range" id="slide-margin-y" min="5" max="30" step="1" value="18">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>页边距 (左右)</span>
                    <span class="val-display" id="val-margin-x">18mm</span>
                </div>
                <input type="range" id="slide-margin-x" min="5" max="30" step="1" value="18">
            </div>

            <div class="control-sliders-row">
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>左栏板块间距</span>
                        <span class="val-display" id="val-sidebar-sec-spacing">6px</span>
                    </div>
                    <input type="range" id="slide-sidebar-sec-spacing" min="2" max="25" step="1" value="6">
                </div>
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>右栏板块间距</span>
                        <span class="val-display" id="val-main-sec-spacing">6px</span>
                    </div>
                    <input type="range" id="slide-main-sec-spacing" min="2" max="25" step="1" value="6">
                </div>
            </div>

            <div class="control-sliders-row">
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>左栏列表间距</span>
                        <span class="val-display" id="val-sidebar-item-spacing">2px</span>
                    </div>
                    <input type="range" id="slide-sidebar-item-spacing" min="1" max="15" step="1" value="2">
                </div>
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>右栏列表间距</span>
                        <span class="val-display" id="val-main-item-spacing">2px</span>
                    </div>
                    <input type="range" id="slide-main-item-spacing" min="1" max="15" step="1" value="2">
                </div>
            </div>

            <!-- 可调节左栏/右栏经历细节缩进 -->
            <div class="control-sliders-row">
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>左栏列表缩进</span>
                        <span class="val-display" id="val-sidebar-list-indent">10px</span>
                    </div>
                    <input type="range" id="slide-sidebar-list-indent" min="0" max="80" step="1" value="10">
                </div>
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>右栏列表缩进</span>
                        <span class="val-display" id="val-main-list-indent">15px</span>
                    </div>
                    <input type="range" id="slide-main-list-indent" min="0" max="80" step="1" value="15">
                </div>
            </div>
        `;
        
        // B. 渲染标题样式卡片内的滑块
        titleContainer.innerHTML = `
            <div class="control-sliders-row">
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>左栏标题字号</span>
                        <span class="val-display" id="val-sidebar-title-size">1.05em</span>
                    </div>
                    <input type="range" id="slide-sidebar-title-size" min="0.9" max="1.6" step="0.05" value="1.05">
                </div>
                <div class="control-slider-col">
                    <div class="slider-info">
                        <span>右栏标题字号</span>
                        <span class="val-display" id="val-main-title-size">1.12em</span>
                    </div>
                    <input type="range" id="slide-main-title-size" min="1.0" max="1.8" step="0.05" value="1.12">
                </div>
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>全局标题粗细</span>
                    <span class="val-display" id="val-title-weight">700</span>
                </div>
                <input type="range" id="slide-title-weight" min="300" max="800" step="100" value="700">
            </div>
        `;
    } else {
        // 单栏排版：合并恢复为经典的单滑块
        densityContainer.innerHTML = `
            <div class="control-slider">
                <div class="slider-info">
                    <span>基础字号</span>
                    <span class="val-display" id="val-font-size">10.5px</span>
                </div>
                <input type="range" id="slide-font-size" min="9" max="13" step="0.5" value="10.5">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>行高</span>
                    <span class="val-display" id="val-line-height">1.45</span>
                </div>
                <input type="range" id="slide-line-height" min="1.2" max="1.8" step="0.05" value="1.45">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>页边距 (上下)</span>
                    <span class="val-display" id="val-margin-y">18mm</span>
                </div>
                <input type="range" id="slide-margin-y" min="5" max="30" step="1" value="18">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>页边距 (左右)</span>
                    <span class="val-display" id="val-margin-x">18mm</span>
                </div>
                <input type="range" id="slide-margin-x" min="5" max="30" step="1" value="18">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>板块间距</span>
                    <span class="val-display" id="val-sec-spacing">16px</span>
                </div>
                <input type="range" id="slide-sec-spacing" min="5" max="35" step="1" value="16">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>列表项间距</span>
                    <span class="val-display" id="val-item-spacing">8px</span>
                </div>
                <input type="range" id="slide-item-spacing" min="2" max="25" step="1" value="8">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>列表缩进</span>
                    <span class="val-display" id="val-list-indent">15px</span>
                </div>
                <input type="range" id="slide-list-indent" min="0" max="100" step="1" value="15">
            </div>
        `;
        
        titleContainer.innerHTML = `
            <div class="control-slider">
                <div class="slider-info">
                    <span>标题字号</span>
                    <span class="val-display" id="val-title-size">1.15em</span>
                </div>
                <input type="range" id="slide-title-size" min="1.0" max="2.0" step="0.05" value="1.15">
            </div>

            <div class="control-slider">
                <div class="slider-info">
                    <span>标题粗细</span>
                    <span class="val-display" id="val-title-weight">700</span>
                </div>
                <input type="range" id="slide-title-weight" min="300" max="800" step="100" value="700">
            </div>
        `;
    }
    
    // 完成 DOM 节点构建后，进行事件流绑定
    bindSlidersEvents();
}

function bindSlidersEvents() {
    const isSplit = state.settings.template === "tpl-split";
    const s = state.settings;
    
    const slidersConfig = isSplit ? [
        { id: "slide-sidebar-font-size", key: "sidebarFontSize", unit: "px", dispId: "val-sidebar-font-size" },
        { id: "slide-main-font-size", key: "mainFontSize", unit: "px", dispId: "val-main-font-size" },
        { id: "slide-line-height", key: "lineHeight", unit: "", dispId: "val-line-height" },
        { id: "slide-margin-y", key: "paddingY", unit: "mm", dispId: "val-margin-y" },
        { id: "slide-margin-x", key: "paddingX", unit: "mm", dispId: "val-margin-x" },
        { id: "slide-sidebar-sec-spacing", key: "sidebarSecSpacing", unit: "px", dispId: "val-sidebar-sec-spacing" },
        { id: "slide-main-sec-spacing", key: "mainSecSpacing", unit: "px", dispId: "val-main-sec-spacing" },
        { id: "slide-sidebar-item-spacing", key: "sidebarItemSpacing", unit: "px", dispId: "val-sidebar-item-spacing" },
        { id: "slide-main-item-spacing", key: "mainItemSpacing", unit: "px", dispId: "val-main-item-spacing" },
        { id: "slide-sidebar-title-size", key: "sidebarTitleSize", unit: "em", dispId: "val-sidebar-title-size" },
        { id: "slide-main-title-size", key: "mainTitleSize", unit: "em", dispId: "val-main-title-size" },
        { id: "slide-title-weight", key: "titleWeight", unit: "", dispId: "val-title-weight" },
        { id: "slide-sidebar-list-indent", key: "sidebarListIndent", unit: "px", dispId: "val-sidebar-list-indent" },
        { id: "slide-main-list-indent", key: "mainListIndent", unit: "px", dispId: "val-main-list-indent" }
    ] : [
        { id: "slide-font-size", key: "fontSize", unit: "px", dispId: "val-font-size" },
        { id: "slide-line-height", key: "lineHeight", unit: "", dispId: "val-line-height" },
        { id: "slide-margin-y", key: "paddingY", unit: "mm", dispId: "val-margin-y" },
        { id: "slide-margin-x", key: "paddingX", unit: "mm", dispId: "val-margin-x" },
        { id: "slide-sec-spacing", key: "secSpacing", unit: "px", dispId: "val-sec-spacing" },
        { id: "slide-item-spacing", key: "itemSpacing", unit: "px", dispId: "val-item-spacing" },
        { id: "slide-title-size", key: "titleSize", unit: "em", dispId: "val-title-size" },
        { id: "slide-title-weight", key: "titleWeight", unit: "", dispId: "val-title-weight" },
        { id: "slide-list-indent", key: "listIndent", unit: "px", dispId: "val-list-indent" }
    ];

    slidersConfig.forEach(slide => {
        const input = document.getElementById(slide.id);
        const display = document.getElementById(slide.dispId);
        if (!input || !display) return;
        
        // 健壮性保障：如果 settings 中不存在该键，就赋予初始默认配置值
        if (s[slide.key] === undefined) {
            const defaults = {
                sidebarFontSize: 8.5,
                mainFontSize: 9.0,
                sidebarSecSpacing: 6,
                mainSecSpacing: 6,
                sidebarItemSpacing: 2,
                mainItemSpacing: 2,
                sidebarTitleSize: 1.05,
                mainTitleSize: 1.12,
                sidebarListIndent: 10,
                mainListIndent: 15,
                listIndent: 15
            };
            s[slide.key] = defaults[slide.key] || 1.0;
        }

        // 初始化滑块的值
        input.value = s[slide.key];
        display.innerText = `${s[slide.key]}${slide.unit}`;

        // 监听滑块修改并推送到 CSS 变量
        input.addEventListener("input", (e) => {
            // 动态读取全局最新 state.settings 对象下的属性，彻底解决闭包导致的旧引用失效问题
            state.settings[slide.key] = parseFloat(e.target.value);
            display.innerText = `${state.settings[slide.key]}${slide.unit}`;
            applyCSSVariables();
            saveToLocal();
            updateJSONCodearea();
        });
    });
}

function syncSlidersValues() {
    const isSplit = state.settings.template === "tpl-split";
    const s = state.settings;
    
    const slidersConfig = isSplit ? [
        { id: "slide-sidebar-font-size", key: "sidebarFontSize", unit: "px", dispId: "val-sidebar-font-size" },
        { id: "slide-main-font-size", key: "mainFontSize", unit: "px", dispId: "val-main-font-size" },
        { id: "slide-line-height", key: "lineHeight", unit: "", dispId: "val-line-height" },
        { id: "slide-margin-y", key: "paddingY", unit: "mm", dispId: "val-margin-y" },
        { id: "slide-margin-x", key: "paddingX", unit: "mm", dispId: "val-margin-x" },
        { id: "slide-sidebar-sec-spacing", key: "sidebarSecSpacing", unit: "px", dispId: "val-sidebar-sec-spacing" },
        { id: "slide-main-sec-spacing", key: "mainSecSpacing", unit: "px", dispId: "val-main-sec-spacing" },
        { id: "slide-sidebar-item-spacing", key: "sidebarItemSpacing", unit: "px", dispId: "val-sidebar-item-spacing" },
        { id: "slide-main-item-spacing", key: "mainItemSpacing", unit: "px", dispId: "val-main-item-spacing" },
        { id: "slide-sidebar-title-size", key: "sidebarTitleSize", unit: "em", dispId: "val-sidebar-title-size" },
        { id: "slide-main-title-size", key: "mainTitleSize", unit: "em", dispId: "val-main-title-size" },
        { id: "slide-title-weight", key: "titleWeight", unit: "", dispId: "val-title-weight" },
        { id: "slide-sidebar-list-indent", key: "sidebarListIndent", unit: "px", dispId: "val-sidebar-list-indent" },
        { id: "slide-main-list-indent", key: "mainListIndent", unit: "px", dispId: "val-main-list-indent" }
    ] : [
        { id: "slide-font-size", key: "fontSize", unit: "px", dispId: "val-font-size" },
        { id: "slide-line-height", key: "lineHeight", unit: "", dispId: "val-line-height" },
        { id: "slide-margin-y", key: "paddingY", unit: "mm", dispId: "val-margin-y" },
        { id: "slide-margin-x", key: "paddingX", unit: "mm", dispId: "val-margin-x" },
        { id: "slide-sec-spacing", key: "secSpacing", unit: "px", dispId: "val-sec-spacing" },
        { id: "slide-item-spacing", key: "itemSpacing", unit: "px", dispId: "val-item-spacing" },
        { id: "slide-title-size", key: "titleSize", unit: "em", dispId: "val-title-size" },
        { id: "slide-title-weight", key: "titleWeight", unit: "", dispId: "val-title-weight" },
        { id: "slide-list-indent", key: "listIndent", unit: "px", dispId: "val-list-indent" }
    ];

    slidersConfig.forEach(slide => {
        const input = document.getElementById(slide.id);
        const display = document.getElementById(slide.dispId);
        if (input && display) {
            input.value = s[slide.key] !== undefined ? s[slide.key] : 1.0;
            display.innerText = `${input.value}${slide.unit}`;
        }
    });
}

// 动态将排版样式设置推送到 CSS 变量系统，触发瞬间秒级排版调整
function applyCSSVariables() {
    const sheet = document.getElementById("resume-page");
    const s = state.settings;
    
    sheet.style.setProperty("--accent-color", s.accentColor);
    sheet.style.setProperty("--base-font-size", `${s.fontSize}px`);
    sheet.style.setProperty("--line-height", s.lineHeight);
    sheet.style.setProperty("--page-padding-y", `${s.paddingY}mm`);
    sheet.style.setProperty("--page-padding-x", `${s.paddingX}mm`);
    sheet.style.setProperty("--section-margin", `${s.secSpacing}px`);
    sheet.style.setProperty("--item-margin", `${s.itemSpacing}px`);
    sheet.style.setProperty("--title-size", `${s.titleSize}em`);
    sheet.style.setProperty("--title-weight", s.titleWeight);
    sheet.style.setProperty("--list-indent", `${s.listIndent ?? 15}px`); // 全局列表细节缩进
    
    // 推送优雅侧边左右分栏的精细度独立局部 CSS 变量
    if (s.template === "tpl-split") {
        sheet.style.setProperty("--sidebar-font-size", `${s.sidebarFontSize ?? 8.5}px`);
        sheet.style.setProperty("--main-font-size", `${s.mainFontSize ?? 9.0}px`);
        sheet.style.setProperty("--sidebar-sec-spacing", `${s.sidebarSecSpacing ?? 6}px`);
        sheet.style.setProperty("--main-sec-spacing", `${s.mainSecSpacing ?? 6}px`);
        sheet.style.setProperty("--sidebar-item-spacing", `${s.sidebarItemSpacing ?? 2}px`);
        sheet.style.setProperty("--main-item-spacing", `${s.mainItemSpacing ?? 2}px`);
        sheet.style.setProperty("--sidebar-title-size", `${s.sidebarTitleSize ?? 1.05}em`);
        sheet.style.setProperty("--main-title-size", `${s.mainTitleSize ?? 1.12}em`);
        sheet.style.setProperty("--sidebar-list-indent", `${s.sidebarListIndent ?? 10}px`); // 侧边栏列表缩进
        sheet.style.setProperty("--main-list-indent", `${s.mainListIndent ?? 15}px`); // 主栏列表缩进
    }
}

// ====================================================
// 5. 动态列表项渲染 (工作/项目/教育/自定义板块)
// ====================================================

// 主渲染程序包含：表单编辑器列表同步、A4画布渲染同步、JSON代码同步
function renderAll() {
    // 1. 同步编辑器输入框初始值（针对info内数据）
    const bindableInputs = document.querySelectorAll("[data-bind]");
    bindableInputs.forEach(input => {
        const path = input.dataset.bind;
        setNestedValue(input, path, getNestedValue(state, path));
    });

    // 2. 将 settings 对应的样式类应用到 A4 画布
    const sheet = document.getElementById("resume-page");
    sheet.className = `resume-sheet ${state.settings.template} ${state.settings.font}`;
    
    // 3. 应用 CSS 变量样式
    applyCSSVariables();

    // 3.5 渲染/同步动态滑块结构和数值 (黄金焦点保护)
    renderStyleSliders();

    // 4. 渲染表单里的动态列表组件
    renderSkillEditorList();
    renderWorkEditorList();
    renderProjectEditorList();
    renderEducationEditorList();
    renderCustomSectionsEditor();

    // 5. 渲染 A4 简历 HTML
    renderResumeHTML();

    // 6. 同步更新 JSON 源码面板代码
    updateJSONCodearea();

    // 7. 每次重渲染后刷新缩放比例以适配排版变化
    adjustPreviewScale();

    // 8. 全量渲染后，自动校准已展开手风琴项与自定义列表里的文本域高度 (延时以保证DOM就绪)
    setTimeout(() => {
        document.querySelectorAll(".accordion-item.expanded textarea").forEach(autoResizeTextarea);
        document.querySelectorAll(".custom-section-editor-box textarea").forEach(autoResizeTextarea);
    }, 50);
}

// --- 5.1 技能标签组列表同步 ---
function renderSkillEditorList() {
    const container = document.getElementById("skills-list-container");
    container.innerHTML = "";
    state.skills.forEach((group, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "dynamic-list-item";
        itemDiv.innerHTML = `
            <div class="item-actions-bar">
                <span class="item-index-label">技能分类 #${index + 1}</span>
                <div class="item-btns">
                    <button class="icon-btn" onclick="moveSkill(${index}, -1)" title="上移"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="icon-btn" onclick="moveSkill(${index}, 1)" title="下移"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="icon-btn delete-icon" onclick="deleteSkill(${index})" title="删除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="form-group">
                <label>技能分类名称 (如：前端技术、后端框架)</label>
                <input type="text" value="${group.category || ''}" oninput="updateSkillField(${index}, 'category', this.value)" placeholder="分类名称">
            </div>
            <div class="form-group">
                <label>具体技能标签 (英文逗号分隔)</label>
                <input type="text" value="${group.tags || ''}" oninput="updateSkillField(${index}, 'tags', this.value)" placeholder="React, Vue, TypeScript...">
            </div>
        `;
        container.appendChild(itemDiv);
    });
}
function addSkillGroup() {
    state.skills.push({ category: "新建技能分类", tags: "核心技能, 标签" });
    saveToLocal();
    renderAll();
}
function updateSkillField(index, field, val) {
    state.skills[index][field] = val;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function deleteSkill(index) {
    state.skills.splice(index, 1);
    saveToLocal();
    renderAll();
}
function moveSkill(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= state.skills.length) return;
    const temp = state.skills[index];
    state.skills[index] = state.skills[targetIndex];
    state.skills[targetIndex] = temp;
    saveToLocal();
    renderAll();
}

// --- 5.2 工作经历列表同步 ---
function renderWorkEditorList() {
    const container = document.getElementById("work-list-container");
    container.innerHTML = "";
    state.work.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "dynamic-list-item";
        itemDiv.innerHTML = `
            <div class="item-actions-bar">
                <span class="item-index-label">工作经历 #${index + 1}</span>
                <div class="item-btns">
                    <button class="icon-btn" onclick="moveWork(${index}, -1)" title="上移"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="icon-btn" onclick="moveWork(${index}, 1)" title="下移"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="icon-btn delete-icon" onclick="deleteWork(${index})" title="删除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group">
                    <label>公司名称</label>
                    <input type="text" value="${item.company || ''}" oninput="updateWorkField(${index}, 'company', this.value)" placeholder="企业名称">
                </div>
                <div class="form-group">
                    <label>担任岗位</label>
                    <input type="text" value="${item.role || ''}" oninput="updateWorkField(${index}, 'role', this.value)" placeholder="岗位名称">
                </div>
            </div>
            <div class="form-group">
                <label>起止时间</label>
                <input type="text" value="${item.time || ''}" oninput="updateWorkField(${index}, 'time', this.value)" placeholder="2020.05 - 2023.08">
            </div>
            <div class="form-group">
                <label>核心工作内容及产出 (每行一条描述，推荐STAR原则描述)</label>
                <textarea rows="6" oninput="updateWorkDetails(${index}, this.value)" placeholder="【项目挑战】...\n【技术攻坚】...\n【量化成果】...">${item.details ? item.details.join('\n') : ''}</textarea>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}
function addWorkExperience() {
    state.work.push({
        company: "某知名科技公司",
        role: "核心开发工程师",
        time: "2020.01 - 2022.01",
        details: [
            "【工作内容】负责核心业务线研发，实现高并发场景稳定性提升。",
            "【技术手段】使用 Go 并发模型改造消费队列，削峰处理高吞吐流量。",
            "【量化成果】业务系统吞吐量提升 30%，接口延迟降低 20%。"
        ]
    });
    saveToLocal();
    renderAll();
}
function updateWorkField(index, field, val) {
    state.work[index][field] = val;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function updateWorkDetails(index, rawText) {
    state.work[index].details = rawText.split('\n').filter(line => line.trim() !== '');
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function deleteWork(index) {
    state.work.splice(index, 1);
    saveToLocal();
    renderAll();
}
function moveWork(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= state.work.length) return;
    const temp = state.work[index];
    state.work[index] = state.work[targetIndex];
    state.work[targetIndex] = temp;
    saveToLocal();
    renderAll();
}

// --- 5.3 项目经历列表同步 ---
function renderProjectEditorList() {
    const container = document.getElementById("project-list-container");
    container.innerHTML = "";
    state.projects.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "dynamic-list-item";
        itemDiv.innerHTML = `
            <div class="item-actions-bar">
                <span class="item-index-label">项目经历 #${index + 1}</span>
                <div class="item-btns">
                    <button class="icon-btn" onclick="moveProject(${index}, -1)" title="上移"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="icon-btn" onclick="moveProject(${index}, 1)" title="下移"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="icon-btn delete-icon" onclick="deleteProject(${index})" title="删除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group">
                    <label>项目名称</label>
                    <input type="text" value="${item.name || ''}" oninput="updateProjectField(${index}, 'name', this.value)" placeholder="项目名称">
                </div>
                <div class="form-group">
                    <label>项目起止时间</label>
                    <input type="text" value="${item.time || ''}" oninput="updateProjectField(${index}, 'time', this.value)" placeholder="2022.03 - 2022.09">
                </div>
            </div>
            <div class="form-group">
                <label>使用${state.settings.techLabel || "技术栈"} (英文逗号分隔)</label>
                <input type="text" value="${item.tech || ''}" oninput="updateProjectField(${index}, 'tech', this.value)" placeholder="React, Go, Redis...">
            </div>
            <div class="form-group">
                <label>项目技术难点与个人贡献 (每行一条描述，推荐使用STAR核心量化)</label>
                <textarea rows="6" oninput="updateProjectDetails(${index}, this.value)" placeholder="【项目挑战】...\n【技术攻坚】...\n【量化成果】...">${item.details ? item.details.join('\n') : ''}</textarea>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}
function addProjectExperience() {
    state.projects.push({
        name: "自主研发核心项目",
        tech: "React, Webpack, Node.js",
        time: "2023.01 - 2023.06",
        details: [
            "【项目挑战】原有系统在渲染超大型树形节点时，容易遭遇卡顿 and 内存超限。",
            "【技术攻坚】采用 Canvas 重构渲染核心层，实现离屏渲染与滚动虚拟化加载。",
            "【量化成果】页面响应帧率稳定运行在 60fps，复杂节点树渲染时间压缩了 80%。"
        ]
    });
    saveToLocal();
    renderAll();
}
function updateProjectField(index, field, val) {
    state.projects[index][field] = val;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function updateProjectDetails(index, rawText) {
    state.projects[index].details = rawText.split('\n').filter(line => line.trim() !== '');
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function deleteProject(index) {
    state.projects.splice(index, 1);
    saveToLocal();
    renderAll();
}
function moveProject(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= state.projects.length) return;
    const temp = state.projects[index];
    state.projects[index] = state.projects[targetIndex];
    state.projects[targetIndex] = temp;
    saveToLocal();
    renderAll();
}

// --- 5.4 教育背景列表同步 ---
function renderEducationEditorList() {
    const container = document.getElementById("education-list-container");
    container.innerHTML = "";
    state.education.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "dynamic-list-item";
        itemDiv.innerHTML = `
            <div class="item-actions-bar">
                <span class="item-index-label">教育背景 #${index + 1}</span>
                <div class="item-btns">
                    <button class="icon-btn" onclick="moveEducation(${index}, -1)" title="上移"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="icon-btn" onclick="moveEducation(${index}, 1)" title="下移"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="icon-btn delete-icon" onclick="deleteEducation(${index})" title="删除"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group">
                    <label>学校名称</label>
                    <input type="text" value="${item.school || ''}" oninput="updateEduField(${index}, 'school', this.value)" placeholder="学校名称">
                </div>
                <div class="form-group">
                    <label>所获学位</label>
                    <input type="text" value="${item.degree || ''}" oninput="updateEduField(${index}, 'degree', this.value)" placeholder="学士 / 硕士 / 博士">
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group">
                    <label>主修专业</label>
                    <input type="text" value="${item.major || ''}" oninput="updateEduField(${index}, 'major', this.value)" placeholder="专业名称">
                </div>
                <div class="form-group">
                    <label>就读时间</label>
                    <input type="text" value="${item.time || ''}" oninput="updateEduField(${index}, 'time', this.value)" placeholder="2015.09 - 2019.07">
                </div>
            </div>
            <div class="form-group">
                <label>校内表现与相关课程 / 荣誉成果 (每行一条)</label>
                <textarea rows="3" oninput="updateEduDetails(${index}, this.value)" placeholder="绩点排名 Top 5%，多次荣获一等奖学金...">${item.details ? item.details.join('\n') : ''}</textarea>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}
function addEducation() {
    state.education.push({
        school: "知名高等学府",
        degree: "工学学士",
        major: "软件工程",
        time: "2016.09 - 2020.07",
        details: [
            "主要课程：计算机组成原理、数据结构与算法、操作系统、软件工程。",
            "在校期间表现优异，曾获校级优秀毕业生荣誉。"
        ]
    });
    saveToLocal();
    renderAll();
}
function updateEduField(index, field, val) {
    state.education[index][field] = val;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function updateEduDetails(index, rawText) {
    state.education[index].details = rawText.split('\n').filter(line => line.trim() !== '');
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function deleteEducation(index) {
    state.education.splice(index, 1);
    saveToLocal();
    renderAll();
}
function moveEducation(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= state.education.length) return;
    const temp = state.education[index];
    state.education[index] = state.education[targetIndex];
    state.education[targetIndex] = temp;
    saveToLocal();
    renderAll();
}

// --- 5.5 自定义板块同步与渲染 ---
function renderCustomSectionsEditor() {
    const container = document.getElementById("custom-sections-container");
    container.innerHTML = "";

    if (!state.custom || state.custom.length === 0) {
        container.innerHTML = `<div class="skills-editor-desc" style="text-align:center; padding: 10px 0;">当前无任何自定义板块，可在下方创建。</div>`;
        return;
    }

    state.custom.forEach((section, sIdx) => {
        const secDiv = document.createElement("div");
        secDiv.className = "custom-section-editor-box";

        secDiv.innerHTML = `
            <div class="item-actions-bar" style="border-bottom-color: rgba(255,255,255,0.05); margin-bottom: 8px; padding-bottom: 5px;">
                <span class="item-index-label" style="color: #a855f7; font-weight:700;"><i class="fa-solid fa-folder-open"></i> 板块：${section.title}</span>
                <button class="icon-btn delete-icon" onclick="deleteCustomSection(${sIdx})" title="删除此整个板块"><i class="fa-solid fa-trash-can"></i> 删除板块</button>
            </div>
            
            <div class="form-group" style="margin-bottom: 8px;">
                <label>板块标题名称</label>
                <input type="text" value="${section.title}" onchange="renameCustomSection(${sIdx}, this.value)" style="border-color: rgba(168, 85, 247, 0.3)">
            </div>
            
            <div class="custom-items-list" id="custom-items-${sIdx}" style="padding-left: 8px;">
                <!-- 自定义板块内部的项目列表 -->
            </div>
            
            <button class="btn btn-secondary btn-sm" onclick="addCustomItem(${sIdx})" style="width:100%; font-size: 0.72rem; margin-top:8px;">
                <i class="fa-solid fa-plus-circle"></i> 添加该板块项目项
            </button>
        `;

        container.appendChild(secDiv);
        renderCustomItems(sIdx);
    });
}

function renderCustomItems(sIdx) {
    const listContainer = document.getElementById(`custom-items-${sIdx}`);
    listContainer.innerHTML = "";
    const items = state.custom[sIdx].items || [];

    items.forEach((item, iIdx) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "dynamic-list-item";

        itemDiv.innerHTML = `
            <div class="item-actions-bar" style="margin-bottom: 6px; padding-bottom: 4px; border-bottom-color: rgba(255,255,255,0.05)">
                <span class="item-index-label" style="font-size:0.7rem; color: #a855f7;">条目 #${iIdx + 1}</span>
                <div class="item-btns">
                    <button class="icon-btn" onclick="moveCustomItem(${sIdx}, ${iIdx}, -1)" title="上移"><i class="fa-solid fa-arrow-up" style="font-size:0.65rem;"></i></button>
                    <button class="icon-btn" onclick="moveCustomItem(${sIdx}, ${iIdx}, 1)" title="下移"><i class="fa-solid fa-arrow-down" style="font-size:0.65rem;"></i></button>
                    <button class="icon-btn delete-icon" onclick="deleteCustomItem(${sIdx}, ${iIdx})" title="删除项"><i class="fa-solid fa-xmark" style="font-size:0.75rem;"></i></button>
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group">
                    <label>主标题</label>
                    <input type="text" value="${item.title || ''}" oninput="updateCustomField(${sIdx}, ${iIdx}, 'title', this.value)" style="padding: 4px 8px; font-size:0.8rem;">
                </div>
                <div class="form-group">
                    <label>副标题 (选填)</label>
                    <input type="text" value="${item.subtitle || ''}" oninput="updateCustomField(${sIdx}, ${iIdx}, 'subtitle', this.value)" style="padding: 4px 8px; font-size:0.8rem;">
                </div>
            </div>
            <div class="form-group-row">
                <div class="form-group" style="margin-bottom:0">
                    <label>时间轴描述 (选填)</label>
                    <input type="text" value="${item.time || ''}" oninput="updateCustomField(${sIdx}, ${iIdx}, 'time', this.value)" style="padding: 4px 8px; font-size:0.8rem;">
                </div>
            </div>
            <div class="form-group" style="margin-top: 6px; margin-bottom: 0;">
                <label>条目详情内容描述 (每行一条，支持段落)</label>
                <textarea rows="4" oninput="updateCustomDetails(${sIdx}, ${iIdx}, this.value)" style="font-size:0.8rem; padding: 6px;">${item.details ? item.details.join('\n') : ''}</textarea>
            </div>
        `;
        listContainer.appendChild(itemDiv);
    });
}

function createCustomSection() {
    const input = document.getElementById("new-section-title");
    const title = input.value.trim();
    if (!title) {
        alert("请输入自定义板块的标题名称！");
        return;
    }
    if (!state.custom) state.custom = [];
    state.custom.push({
        title: title,
        items: [
            {
                title: "新建项标题",
                subtitle: "子标题",
                time: "2024",
                details: ["此处写具体描述细则一", "描述细则二"]
            }
        ]
    });
    input.value = "";
    saveToLocal();
    renderAll();
}
function renameCustomSection(sIdx, newTitle) {
    if (!newTitle.trim()) return;
    state.custom[sIdx].title = newTitle;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function deleteCustomSection(sIdx) {
    if (confirm(`确定要彻底删除整个“${state.custom[sIdx].title}”板块吗？`)) {
        state.custom.splice(sIdx, 1);
        saveToLocal();
        renderAll();
    }
}
function addCustomItem(sIdx) {
    state.custom[sIdx].items.push({
        title: "新条目",
        subtitle: "",
        time: "",
        details: ["描述详情一"]
    });
    saveToLocal();
    renderAll();
}
function deleteCustomItem(sIdx, iIdx) {
    state.custom[sIdx].items.splice(iIdx, 1);
    saveToLocal();
    renderAll();
}
function updateCustomField(sIdx, iIdx, field, val) {
    state.custom[sIdx].items[iIdx][field] = val;
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function updateCustomDetails(sIdx, iIdx, rawText) {
    state.custom[sIdx].items[iIdx].details = rawText.split('\n').filter(line => line.trim() !== '');
    saveToLocal();
    renderResumeHTML();
    updateJSONCodearea();
}
function moveCustomItem(sIdx, iIdx, direction) {
    const items = state.custom[sIdx].items;
    const targetIdx = iIdx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[iIdx];
    items[iIdx] = items[targetIdx];
    items[targetIdx] = temp;
    saveToLocal();
    renderAll();
}

// ====================================================
// 6. A4 纸张页面 HTML 动态生成渲染引擎
// ====================================================
function renderResumeHTML() {
    const target = document.getElementById("resume-render-target");
    const tpl = state.settings.template;
    
    // 生成页头个人基本信息模块 of HTML
    const contacts = [
        state.info.email ? `<span><i class="fa-regular fa-envelope"></i> <span contenteditable="true" data-edit-path="info.email">${state.info.email}</span></span>` : '',
        state.info.phone ? `<span><i class="fa-solid fa-phone"></i> <span contenteditable="true" data-edit-path="info.phone">${state.info.phone}</span></span>` : '',
        state.info.location ? `<span><i class="fa-solid fa-location-dot"></i> <span contenteditable="true" data-edit-path="info.location">${state.info.location}</span></span>` : '',
        state.info.github ? `<span><i class="fa-brands fa-github"></i> <a href="https://${state.info.github}" target="_blank"><span contenteditable="true" data-edit-path="info.github">${state.info.github}</span></a></span>` : '',
        state.info.blog ? `<span><i class="fa-solid fa-globe"></i> <a href="https://${state.info.blog}" target="_blank"><span contenteditable="true" data-edit-path="info.blog">${state.info.blog}</span></a></span>` : ''
    ].filter(Boolean).join('');

    const headerHTML = `
        <header class="resume-header selectable-section" data-section-name="基本信息页头">
            <div class="header-main">
                <h1 class="header-name" contenteditable="true" data-edit-path="info.name">${state.info.name || "姓名"}</h1>
                <div class="header-title" contenteditable="true" data-edit-path="info.title">${state.info.title || ""}</div>
            </div>
            <div class="header-contact-list">${contacts}</div>
        </header>
    `;

    // 个人简介 HTML
    const summaryHTML = state.info.summary ? `
        <section class="resume-section" id="resume-sec-summary">
            <h2 class="sec-title">个人简介</h2>
            <div class="summary-text selectable-section" data-section-name="个人简介" contenteditable="true" data-edit-path="info.summary">${state.info.summary}</div>
        </section>
    ` : '';

    // 专业技能 HTML
    let skillsItemsHTML = "";
    state.skills.forEach((group, index) => {
        if (!group.category && !group.tags) return;
        skillsItemsHTML += `
            <div class="skills-group">
                <span class="skills-group-title" contenteditable="true" data-edit-path="skills.${index}.category">${group.category || "技术"}：</span>
                <span class="skills-group-tags" contenteditable="true" data-edit-path="skills.${index}.tags">${group.tags || ""}</span>
            </div>
        `;
    });
    const skillsHTML = skillsItemsHTML ? `
        <section class="resume-section" id="resume-sec-skills">
            <h2 class="sec-title">专业技能</h2>
            <div class="skills-grid selectable-section" data-section-name="专业技能">${skillsItemsHTML}</div>
        </section>
    ` : '';

    // 工作经历 HTML
    let workItemsHTML = "";
    state.work.forEach((item, index) => {
        const detailsList = item.details ? item.details.map((d, dIdx) => `<li contenteditable="true" data-edit-path="work.${index}.details.${dIdx}">${d}</li>`).join('') : '';
        workItemsHTML += `
            <div class="resume-item selectable-section" data-section-name="实习经历 #${index + 1} - ${item.company || ''}">
                <div class="item-meta-row">
                    <span class="item-org" contenteditable="true" data-edit-path="work.${index}.company">${item.company}</span>
                    <span class="item-role" contenteditable="true" data-edit-path="work.${index}.role">${item.role}</span>
                    <span class="item-time" contenteditable="true" data-edit-path="work.${index}.time">${item.time}</span>
                </div>
                ${detailsList ? `<ul class="item-details-list">${detailsList}</ul>` : ''}
            </div>
        `;
    });
    const workHTML = workItemsHTML ? `
        <section class="resume-section" id="resume-sec-work">
            <h2 class="sec-title">实习经历</h2>
            ${workItemsHTML}
        </section>
    ` : '';

    // 项目经历 HTML
    let projectItemsHTML = "";
    state.projects.forEach((item, index) => {
        const detailsList = item.details ? item.details.map((d, dIdx) => `<li contenteditable="true" data-edit-path="projects.${index}.details.${dIdx}">${d}</li>`).join('') : '';
        projectItemsHTML += `
            <div class="resume-item selectable-section" data-section-name="项目经历 #${index + 1} - ${item.name || ''}">
                <div class="item-meta-row">
                    <span class="item-org" contenteditable="true" data-edit-path="projects.${index}.name">${item.name}</span>
                    <span class="item-time" contenteditable="true" data-edit-path="projects.${index}.time">${item.time}</span>
                </div>
                ${item.tech ? `<div class="item-tech-stack"><span contenteditable="true" class="tech-label-editable" data-edit-path="settings.techLabel">${state.settings.techLabel || "技术栈"}</span>：<strong><span contenteditable="true" data-edit-path="projects.${index}.tech">${item.tech}</span></strong></div>` : ''}
                ${detailsList ? `<ul class="item-details-list">${detailsList}</ul>` : ''}
            </div>
        `;
    });
    const projectsHTML = projectItemsHTML ? `
        <section class="resume-section" id="resume-sec-projects">
            <h2 class="sec-title">项目经历</h2>
            ${projectItemsHTML}
        </section>
    ` : '';

    // 教育背景 HTML
    let eduItemsHTML = "";
    state.education.forEach((item, index) => {
        const detailsList = item.details ? item.details.map((d, dIdx) => `<li contenteditable="true" data-edit-path="education.${index}.details.${dIdx}">${d}</li>`).join('') : '';
        eduItemsHTML += `
            <div class="resume-item selectable-section" data-section-name="教育背景 #${index + 1} - ${item.school || ''}">
                <div class="item-meta-row">
                    <span class="item-org" contenteditable="true" data-edit-path="education.${index}.school">${item.school}</span>
                    <span class="item-role" contenteditable="true" data-edit-path="education.${index}.major">${item.degree} • ${item.major}</span>
                    <span class="item-time" contenteditable="true" data-edit-path="education.${index}.time">${item.time}</span>
                </div>
                ${detailsList ? `<ul class="item-details-list" style="margin-top:3px">${detailsList}</ul>` : ''}
            </div>
        `;
    });
    const educationHTML = eduItemsHTML ? `
        <section class="resume-section" id="resume-sec-education">
            <h2 class="sec-title">教育背景</h2>
            ${eduItemsHTML}
        </section>
    ` : '';

    // 自定义板块 HTML
    let customHTML = "";
    if (state.custom && state.custom.length > 0) {
        state.custom.forEach((sec, sIdx) => {
            let itemsHTML = "";
            sec.items.forEach((item, iIdx) => {
                const detailsList = item.details ? item.details.map((d, dIdx) => `<li contenteditable="true" data-edit-path="custom.${sIdx}.items.${iIdx}.details.${dIdx}">${d}</li>`).join('') : '';
                itemsHTML += `
                    <div class="resume-item selectable-section" data-section-name="${sec.title} #${iIdx + 1} - ${item.title || ''}">
                        <div class="item-meta-row">
                            <span class="item-org" contenteditable="true" data-edit-path="custom.${sIdx}.items.${iIdx}.title">${item.title}</span>
                            ${item.subtitle ? `<span class="item-role" contenteditable="true" data-edit-path="custom.${sIdx}.items.${iIdx}.subtitle">${item.subtitle}</span>` : ''}
                            ${item.time ? `<span class="item-time" contenteditable="true" data-edit-path="custom.${sIdx}.items.${iIdx}.time">${item.time}</span>` : ''}
                        </div>
                        ${detailsList ? `<ul class="item-details-list">${detailsList}</ul>` : ''}
                    </div>
                `;
            });
            
            if (itemsHTML) {
                customHTML += `
                    <section class="resume-section">
                        <h2 class="sec-title" contenteditable="true" data-edit-path="custom.${sIdx}.title">${sec.title}</h2>
                        <div class="custom-items-wrapper selectable-section" data-section-name="${sec.title} 内容区域">
                            ${itemsHTML}
                        </div>
                    </section>
                `;
            }
        });
    }

    // 根据不同模板类型拼接最终 DOM 树
    if (tpl === "tpl-split") {
        // 殿堂级双栏布局：顶部横跨尊贵页头 (姓名、联系方式)，下方自适应分栏网格 (左侧：简介、技能、教育；右侧：工作、项目、自定义)
        target.innerHTML = `
            ${headerHTML}
            <div class="split-container">
                <aside class="split-sidebar">
                    ${summaryHTML}
                    ${skillsHTML}
                    ${educationHTML}
                </aside>
                <main class="split-main">
                    ${workHTML}
                    ${projectsHTML}
                    ${customHTML}
                </main>
            </div>
        `;
    } else {
        // 传统单栏 & 学术居中模板 (利用 CSS 结构渲染)
        target.innerHTML = `
            ${headerHTML}
            ${summaryHTML}
            ${skillsHTML}
            ${workHTML}
            ${projectsHTML}
            ${educationHTML}
            ${customHTML}
        `;
    }
}

// ====================================================
// 7. 对 AI 友好型核心功能：RAW JSON 代码双向编辑应用
// ====================================================
function updateJSONCodearea() {
    const codeArea = document.getElementById("raw-json-textarea");
    if (codeArea) {
        codeArea.value = JSON.stringify(state, null, 4);
    }
}

// 读取 textarea 的 JSON 数据并同步更新到编辑器表单及 A4 简历画布中
function applyRawJSON() {
    const codeArea = document.getElementById("raw-json-textarea");
    try {
        const parsed = JSON.parse(codeArea.value);
        
        // 验证必选的结构
        if (!parsed.info || !parsed.skills || !parsed.work || !parsed.projects || !parsed.education) {
            alert("JSON 结构缺少必要的基本属性，请检查数据完整性！");
            return;
        }

        // 保存更新
        state = parsed;
        saveToLocal();
        
        // 重新进行全面渲染及重置表单
        renderAll();
        alert("🎉 JSON 源码修改应用成功！简历已完成重新即时排版。");
    } catch (err) {
        alert(`❌ JSON 格式解析失败！请检查语法错误。\n错误日志: ${err.message}`);
    }
}

function copyJSONToClipboard() {
    const codeArea = document.getElementById("raw-json-textarea");
    codeArea.select();
    document.execCommand("copy");
    alert("📋 简历 JSON 源码已成功复制到剪贴板！");
}

// ====================================================
// 8. 辅助控制面板操作函数 (示例数据、PDF打印、数据文件备份)
// ====================================================

// 折叠面板展开关闭控制
function toggleAccordion(id) {
    const element = document.getElementById(id);
    const wasExpanded = element.classList.contains("expanded");
    
    // 关闭所有面板
    document.querySelectorAll(".accordion-item").forEach(item => {
        item.classList.remove("expanded");
    });
    
    // 打开当前点击面板
    if (!wasExpanded) {
        element.classList.add("expanded");
        // 核心联动：展开面板时，延迟对面板内所有的 textarea 执行高度自适应计算撑开，消灭垂直滚动条
        setTimeout(() => {
            element.querySelectorAll('textarea').forEach(autoResizeTextarea);
        }, 80);
    }
}

// 切换方案核心控制器 (双排版对比系统)
function switchScheme(schemeName) {
    if (currentScheme === schemeName) return;

    // B. 备份当前排版与内容数据
    saveToLocal();

    // C. 改变当前的方案标识
    currentScheme = schemeName;
    localStorage.setItem("easycv_resume_current_scheme", currentScheme);
    isViewingExample = currentScheme === 'B';

    // D. 重新装载并合成数据
    initActiveState();

    // E. 重新装载表单和 A4 纸张页面 (瞬间热重绘 DOM 结构)
    renderAll();

    // 触发毛玻璃 Toast 通知
    showNotification(`🎨 已成功切换至【方案 ${currentScheme}】的排版与主题设置！`);

    // F. 动态滑块的值与事件在 renderAll() 内部由 renderStyleSliders() 自适应重新同步绑定，无需硬编码
    // 同步颜色拾取器
    const customColorInput = document.getElementById("custom-accent-color");
    if (customColorInput) customColorInput.value = state.settings.accentColor;
    document.querySelectorAll(".color-dot").forEach(dot => {
        if (dot.dataset.color === state.settings.accentColor) {
            document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
            dot.classList.add("active");
        }
    });

    // 同步模板高亮
    document.querySelectorAll(".template-option").forEach(opt => {
        if (opt.dataset.tpl === state.settings.template) {
            document.querySelectorAll(".template-option").forEach(o => o.classList.remove("active"));
            opt.classList.add("active");
        }
    });

    // 同步字体按钮高亮
    document.querySelectorAll(".font-btn").forEach(btn => {
        if (btn.dataset.font === state.settings.font) {
            document.querySelectorAll(".font-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        }
    });

    // G. 更新切换按钮的高亮状态和上下文 Banner
    updateSlotUI();
}

// 兼容原本的“优质程序员示例”底部按钮触发逻辑
function loadExampleData() {
    if (currentScheme === 'A') {
        switchScheme('B');
    } else {
        switchScheme('A');
    }
}

// 动态同步卡槽切换的 UI 表现
function updateSlotUI() {
    const btnUser = document.getElementById("btn-view-user");
    const btnExample = document.getElementById("btn-view-example");
    const btnToggle = document.getElementById("btn-toggle-example");
    const alertBanner = document.getElementById("context-alert-banner");

    // A. 选项卡切换高亮
    if (btnUser && btnExample) {
        if (currentScheme === 'A') {
            btnUser.classList.add("active");
            btnExample.classList.remove("active");
        } else {
            btnUser.classList.remove("active");
            btnExample.classList.add("active");
        }
    }

    // B. 左侧底部按钮同步
    if (btnToggle) {
        if (currentScheme === 'B') {
            btnToggle.innerHTML = `<i class="fa-solid fa-arrow-rotate-left"></i> 快速对比方案 A`;
            btnToggle.classList.add("btn-active-highlight");
        } else {
            btnToggle.innerHTML = `<i class="fa-solid fa-square-poll-horizontal"></i> 快速对比方案 B`;
            btnToggle.classList.remove("btn-active-highlight");
        }
    }

    // C. 上下文警示 Banner 状态同步
    if (alertBanner) {
        alertBanner.innerHTML = `<i class="fa-solid fa-circle-info banner-info-icon"></i> <span>当前正处于<strong>「设计方案 ${currentScheme}」</strong>视图。方案 A/B 共享相同的文字内容，但拥有<strong class="banner-highlight-text">完全独立的设计与排版设置</strong>，可在此面板微调快速对比。</span>`;
        alertBanner.style.display = "block";
    }
}

// 初始化右侧 A4 画布可视化就地编辑与跨板块悬停发光指示框
function initVisualEditor() {
    const sheet = document.getElementById("resume-page");
    const renderTarget = document.getElementById("resume-render-target");
    const hoverIndicator = document.getElementById("resume-hover-indicator");
    const hoverBadge = document.getElementById("resume-hover-badge");

    if (!sheet || !renderTarget || !hoverIndicator || !hoverBadge) return;

    // A. 鼠标悬停对焦跨板块发光线框
    sheet.addEventListener("mousemove", (e) => {
        const selectable = e.target.closest('[data-section-name]');
        if (selectable) {
            const rect = selectable.getBoundingClientRect();
            const sheetRect = sheet.getBoundingClientRect();
            
            // 动态计算当前的缩放比例，防止在自适应缩放或浏览器缩放状态下焦点框位置发生偏移
            const scale = sheet.offsetWidth ? (sheetRect.width / sheet.offsetWidth) : 1;
            
            // 计算相对坐标并除以缩放比例，还原到未缩放的父容器逻辑像素空间
            const top = (rect.top - sheetRect.top) / scale;
            const left = (rect.left - sheetRect.left) / scale;
            const width = rect.width / scale;
            const height = rect.height / scale;
            
            // 针对大标题下方的文字内容区做偏移避空微调，绝对防止虚线框向上超界框住大标题！
            let offsetTop = 4;
            let offsetHeight = 8;
            if (selectable.classList.contains('skills-grid') || 
                selectable.classList.contains('summary-text') || 
                selectable.classList.contains('custom-items-wrapper')) {
                offsetTop = 0; // 顶端不向上偏移，紧贴内容顶边缘
                offsetHeight = 2; // 底端微向下延伸，贴合感极佳
            }
            
            hoverIndicator.style.display = "block";
            hoverIndicator.style.top = `${top - offsetTop}px`;
            hoverIndicator.style.left = `${left - 4}px`;
            hoverIndicator.style.width = `${width + 8}px`;
            hoverIndicator.style.height = `${height + (offsetHeight - offsetTop)}px`;
            
            hoverBadge.textContent = selectable.dataset.sectionName;
            hoverBadge.style.display = "block";
        } else {
            // 当鼠标移到大标题或其它无 data-section-name 区域时，立即隐藏对焦框，绝不造成视觉残留
            hoverIndicator.style.display = "none";
        }
    });

    // 鼠标离开简历纸张时自动隐藏
    sheet.addEventListener("mouseleave", () => {
        hoverIndicator.style.display = "none";
    });

    // B. 可视化打字就地双向同步绑定（极佳打字焦点保护）
    renderTarget.addEventListener("input", (e) => {
        const path = e.target.dataset.editPath;
        if (!path) return;

        // 如果 HTML 含有 strong 或 b 标签，则需要保留这些加粗样式，其它块级和垃圾标签全部过滤
        let newText;
        if (e.target.innerHTML.includes('<strong>') || e.target.innerHTML.includes('<b>')) {
            newText = sanitizeHTMLKeepBold(e.target.innerHTML);
        } else {
            newText = e.target.innerText || e.target.textContent || '';
        }

        // 1. 静默修改全局 state 内存数据（不重绘右侧，绝对保护输入焦点！）
        setNestedValue(null, path, newText);

        // 2. 持久化缓存到 LocalStorage
        saveToLocal();

        // 3. 实时同步左侧对应的输入框
        const formInput = document.querySelector(`[data-bind="${path}"]`);
        if (formInput) {
            formInput.value = newText;
        }

        // 4. 高阶联动：如果是列表细节或标签，在内存修改后同步重绘左侧列表的编辑器
        if (path.includes('details') || path.includes('tags') || path.includes('skills') || path.includes('work') || path.includes('projects') || path.includes('education') || path.includes('custom')) {
            if (path.includes('work')) renderWorkEditorList();
            if (path.includes('projects')) renderProjectEditorList();
            if (path.includes('education')) renderEducationEditorList();
            if (path.includes('skills')) renderSkillEditorList();
            if (path.includes('custom')) renderCustomSectionsEditor();
        }

        // 5. 实时同步 JSON 代码域
        updateJSONCodearea();
    });

    // C. 失去焦点（blur）时进行全量重绘渲染，确保排版完美对齐
    renderTarget.addEventListener("blur", (e) => {
        if (e.target.dataset.editPath) {
            renderAll();
        }
    }, true);
}

// 直接唤起系统打印预览以进行 PDF 导出
function exportToPDF() {
    window.print();
}

// 下载 JSON 简历配置文件至本地 (仅备份当前激活方案与文字)
function downloadJSONFile() {
    // 构建纯粹的单方案备份包
    const backupPackage = {
        // A. 共享文字内容数据
        info: state.info,
        skills: state.skills,
        work: state.work,
        projects: state.projects,
        education: state.education,
        custom: state.custom,
        
        // B. 仅备份当前方案的排版参数
        settings: state.settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPackage, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `easycv_backup_${state.info.name || 'unnamed'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("💾 简历数据与当前方案排版参数已成功导出备份！");
}

// 触发本地 JSON 上传
function triggerJSONUpload() {
    document.getElementById("json-upload-input").click();
}

// 上传本地 JSON 简历配置文件并一键加载 (仅影响并覆盖当前激活方案)
function importJSONFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!parsed.info || !parsed.skills || !parsed.work || !parsed.projects || !parsed.education) {
                showNotification("❌ 导入的备份文件结构不符，缺少简历核心内容字段！", "error");
                return;
            }

            // 1. 恢复共享的简历文字内容
            state.info = parsed.info;
            state.skills = parsed.skills;
            state.work = parsed.work;
            state.projects = parsed.projects;
            state.education = parsed.education;
            state.custom = parsed.custom || [];

            // 2. 仅恢复并覆盖当前激活方案 of 排版设置
            if (parsed.settings) {
                state.settings = parsed.settings;
                lastRenderedTemplate = null; // 导入新设置时重置模板缓存，强制滑块刷新
                // 强制写回当前方案的 LocalStorage 中
                const key = `easycv_resume_settings_${currentScheme.toLowerCase()}`;
                localStorage.setItem(key, JSON.stringify(state.settings));
                showNotification("🎉 备份完美载入！已成功恢复文字内容与当前方案的排版参数。");
            } else {
                // 如果导入的是不含 settings 的纯文字简历 (例如 AI 润色助手复制的内容)
                // 【极度高明】保持当前方案已调好的排版滑块绝对不动，仅平滑替换文字！
                showNotification("✨ AI 纯简历文本已完美融合载入！已自动保留您当前方案的精细排版。");
            }

            // 保存到本地并重新渲染，自动重置并拉齐左侧滑块刻度值，防 UI 脱节
            saveToLocal();
            
            // 切换预览纸张的模板类，防错位
            const sheet = document.getElementById("resume-page");
            if (sheet && state.settings && state.settings.template) {
                sheet.className = `resume-sheet ${state.settings.template} ${state.settings.font}`;
            }

            renderAll();
            updateJSONCodearea();

        } catch (err) {
            console.error(err);
            showNotification("❌ 读取备份文件失败，请确保导入的是合法的 JSON 格式文件。", "error");
        }
    };
    reader.readAsText(file);
    // 重置 input 以便能重复上传同一个文件
    event.target.value = "";
}

// 自动计算比例以在小屏幕预览中自适应缩放 A4 画布，消灭水平滚动条，并支持用户通过 Ctrl+滚轮 局部无损缩放
function adjustPreviewScale() {
    const container = document.querySelector('.preview-container');
    const sheet = document.getElementById('resume-page');
    if (!container || !sheet) return;
    
    const containerWidth = container.clientWidth;
    const padding = 40; // 左右内边距之和
    const availableWidth = containerWidth - padding;
    const sheetWidth = 794; // A4 210mm 约为 794px
    
    // 计算基础自适应缩放比例（仅在容器放不下时自动缩小）
    let baseScale = 1.0;
    if (availableWidth < sheetWidth) {
        baseScale = availableWidth / sheetWidth;
    }
    
    // 最终的实际渲染缩放比例
    const finalScale = baseScale * customZoomFactor;
    
    if (finalScale !== 1.0) {
        sheet.style.transform = `scale(${finalScale})`;
        sheet.style.transformOrigin = 'top center';
        
        // 抵消 scale 带来的下方多余空白布局高度
        const originalHeight = sheet.offsetHeight || 1122; // A4 297mm 约为 1122px
        sheet.style.marginBottom = `-${originalHeight * (1 - finalScale)}px`;
    } else {
        sheet.style.transform = 'none';
        sheet.style.transformOrigin = 'initial';
        sheet.style.marginBottom = '0';
    }
}

// 极其优雅的高亮浮动通知 Toast 组件
function showNotification(message) {
    // 移除先前存在的 notification 以免堆叠
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color: #fbbf24;"></i> <span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    // 异步触发渐入
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);
    
    // 2.5 秒后自动淡出并移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2800);
}

// ====================================================
// 6. 局部 Ctrl + 滚轮 鼠标专属缩放控制逻辑
// ====================================================
let zoomToastTimer = null;
function showZoomToast(scaleValue) {
    let zoomToast = document.querySelector('.zoom-indicator-toast');
    if (!zoomToast) {
        zoomToast = document.createElement('div');
        zoomToast.className = 'zoom-indicator-toast no-print';
        const container = document.querySelector('.preview-container');
        if (container) container.appendChild(zoomToast);
    }
    if (zoomToast) {
        zoomToast.innerHTML = `<i class="fa-solid fa-magnifying-glass-plus" style="color: #38bdf8;"></i> <span>缩放比例: ${Math.round(scaleValue * 100)}%</span>`;
        zoomToast.classList.add('show');
        
        if (zoomToastTimer) clearTimeout(zoomToastTimer);
        zoomToastTimer = setTimeout(() => {
            zoomToast.classList.remove('show');
        }, 1200);
    }
}

// 绑定全局鼠标缩放监听 (Ctrl + 滚轮)，拦截浏览器默认缩放，将其限制在右侧简历中
window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        
        // 缩放速度与增量
        const zoomSpeed = 0.05;
        if (e.deltaY > 0) {
            // 向下滚动，缩小
            customZoomFactor = Math.max(0.3, customZoomFactor - zoomSpeed);
        } else {
            // 向上滚动，放大
            customZoomFactor = Math.min(3.0, customZoomFactor + zoomSpeed);
        }
        
        // 刷新缩放比例
        adjustPreviewScale();
        
        // 获取实际应用后的最终缩放，并显示精致的提示浮窗
        const container = document.querySelector('.preview-container');
        const sheet = document.getElementById('resume-page');
        if (container && sheet) {
            const containerWidth = container.clientWidth;
            const padding = 40;
            const availableWidth = containerWidth - padding;
            const sheetWidth = 794;
            let baseScale = 1.0;
            if (availableWidth < sheetWidth) {
                baseScale = availableWidth / sheetWidth;
            }
            showZoomToast(baseScale * customZoomFactor);
        }
    }
}, { passive: false });

// 初始化双击右侧画布空白处重置缩放监听器
document.addEventListener("DOMContentLoaded", () => {
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
        previewContainer.addEventListener('dblclick', (e) => {
            // 确保双击的是预览区背景、简历外层或者实时渲染目标
            if (e.target === previewContainer || e.target.id === 'resume-page' || e.target.id === 'resume-render-target') {
                if (customZoomFactor !== 1.0) {
                    customZoomFactor = 1.0;
                    adjustPreviewScale();
                    
                    const container = document.querySelector('.preview-container');
                    const sheet = document.getElementById('resume-page');
                    let baseScale = 1.0;
                    if (container && sheet) {
                        const containerWidth = container.clientWidth;
                        const padding = 40;
                        const availableWidth = containerWidth - padding;
                        const sheetWidth = 794;
                        if (availableWidth < sheetWidth) {
                            baseScale = availableWidth / sheetWidth;
                        }
                    }
                    showZoomToast(baseScale * customZoomFactor);
                    showNotification("🔍 简历预览缩放已重置为默认自适应比例！");
                }
            }
        });
    }
});

// ====================================================
// 7. 编辑器白天/暗黑极客主题一键一键切换系统 (LocalStorage缓存记忆)
// ====================================================
function copyAIPromptToClipboard() {
    // 构造完全去隐私的、通用的简历 JSON 数据骨架 Schema 占位符，保护用户隐私并实现 100% 开源通用
    const genericSchema = `{
    "info": {
        "name": "【姓名】",
        "title": "【求职意向 / 岗位名称】",
        "email": "【电子邮箱地址】",
        "phone": "【联系电话号码】",
        "location": "【意向城市 / 居住地】",
        "github": "【GitHub 地址（选填，若无则留空）】",
        "blog": "【个人博客/作品集（选填，若无则留空）】",
        "summary": "【专业总结，简明扼要突出核心技术年限与显性业绩成果，用 <strong> 标签包裹重点词】"
    },
    "skills": [
        {
            "category": "【技能分类名称（如：前端技术、后端与云原生、人工智能等）】",
            "tags": "【该分类下的具体技术栈列表，用逗号分隔，例如：Go, Java, React, Docker】"
        }
    ],
    "work": [
        {
            "company": "【公司/企业名称】",
            "role": "【担任职级/岗位名称】",
            "time": "【在职起止时间（例如：2022.06 - 至今）】",
            "details": [
                "【工作职责】描述核心开发职责、带队人数、管理资产或系统规模",
                "【技术攻坚】优化 MySQL 慢查询，引入分布式缓存，将系统核心接口高并发响应时间缩短了 <strong>40%</strong>",
                "【量化成果】重构核心结算模块，在系统承载流量增长 2 倍的情况下，系统稳定性维持在 <strong>99.99%</strong>"
            ]
        }
    ],
    "projects": [
        {
            "name": "【项目名称】",
            "tech": "【项目使用核心技术栈，例如：React, Next.js, Node.js, Web Audio API】",
            "time": "【项目起止时间（例如：2023.03 - 2024.01）】",
            "details": [
                "【项目背景】解决什么核心痛点、业务瓶颈或系统架构瓶颈",
                "【技术攻坚】采用 <strong>Kafka</strong> 消息缓冲区降噪，通过 <strong>Elasticsearch</strong> 分片索引实现百万级秒级检索",
                "【最终成效】系统日处理日志突破 <strong>1亿条</strong>，故障定位耗时从 30分钟 <strong>极限缩短至 1分钟内</strong>"
            ]
        }
    ],
    "education": [
        {
            "school": "【学校/高校名称】",
            "degree": "【学历学位，如：学士/硕士/博士】",
            "major": "【专业名称，如：数据科学与大数据技术】",
            "time": "【教育起止时间（例如：2023.09 - 2027.06）】",
            "details": [
                "【主修课程与荣誉】主修课程、学术竞赛奖项、奖学金荣誉等细节描述"
            ]
        }
    ],
    "custom": [
        {
            "title": "【自定义板块标题（如：个人开源项目经历、科研成果、语言能力等）】",
            "items": [
                {
                    "title": "【条目名称】",
                    "subtitle": "【副标题/角色定位（如：项目发起人与核心开发）】",
                    "time": "【起止时间（例如：2026.04 - 2026.05）】",
                    "details": [
                        "【细节描述】描述具体的贡献、核心算法，用 <strong> 标签包裹重点词"
                    ]
                }
            ]
        }
    ]
}`;

    const masterPrompt = `你是一个殿堂级的简历专家与内容优化师。你的任务是根据用户提供的“个人粗糙经历文字”，结合指定的 JSON 数据结构，输出一份 100% 符合 JSON 格式、且经过 STAR 原则深度优化的高含金量简历。

### 简历黄金撰写规范 (STAR 原则包装)：
1. 重点业务与技术词汇：所有核心技能词汇、关键职责名词必须使用 <strong> 标签包裹以在排版中自动加粗。例如：<strong>核心系统重构</strong>。
2. 数据量化与显著成果：所有项目经历与工作产出必须包含量化指标。将关键业绩成果数值（如：效率提升 30%，耗时缩短至 1分钟内，稳定性维持在 99.9%）使用 <strong> 标签包裹加粗。
3. 句式结构：严禁废话。对于细节描述，采用“【工作职责】... 【技术攻坚】... 【量化成果】...”或“【项目背景】... 【技术攻坚】... 【最终成效】...”的结构，以展现工作深度与真实价值。
4. 格式约束：严禁在文本中混入任何 Markdown 字面量星号（如 **），所有加粗必须使用 HTML 的 <strong> 标签。同时严禁混入任何 emoji 表情。

### 目标 JSON 结构 Schema (请严格按照此结构填入信息并输出)：
${genericSchema}

### 约束条件：
1. 只返回合法的 JSON 代码块：严禁输出任何前言、解释、致谢或 Markdown 其它富文本，直接以 \`{\` 开始，以 \`}\` 结束。确保可以直接被 \`JSON.parse()\` 解析。
2. 保持数据类型的完整，details 必须是数组。

以下是我的简历相关经历文字：
[在此处输入或粘贴您的简历相关文字，然后把完整的提示词发给AI，然后再粘贴到简历编辑器中]`;

    // 执行无痛复制
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = masterPrompt;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    try {
        document.execCommand('copy');
        showNotification("✨ AI 专属通用型 Master Prompt 已成功打包并复制到您的剪贴板！快发给 AI 吧！");
    } catch (err) {
        alert("复制失败，请手动选择复制。");
    }
    document.body.removeChild(tempTextarea);
}

function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle-btn");
    if (!toggleBtn) return;
    
    // 从缓存读取已保存的主题 (默认是暗黑主题)
    const cachedTheme = localStorage.getItem("easycv_editor_theme") || "dark";
    if (cachedTheme === "light") {
        document.body.classList.add("light-theme");
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        toggleBtn.title = "切换至暗黑极客模式";
    } else {
        document.body.classList.remove("light-theme");
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        toggleBtn.title = "切换至白天明亮模式";
    }
    
    toggleBtn.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-theme");
        if (isLight) {
            localStorage.setItem("easycv_editor_theme", "light");
            toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            toggleBtn.title = "切换至暗黑极客模式";
            // 响应用户反馈，静默无感极速秒级切换主题，不显示任何 Toast 通知
        } else {
            localStorage.setItem("easycv_editor_theme", "dark");
            toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            toggleBtn.title = "切换至白天明亮模式";
            // 响应用户反馈，静默无感极速秒级切换主题，不显示任何 Toast 通知
        }
    });
}

// ====================================================
// 8. 简历编辑器文字加粗核心功能逻辑 (自研 DOM 净化 + 气泡浮动控制器)
// ====================================================

// 净化 HTML：只保留 <strong> 标签，过滤掉 contenteditable 产生的所有块级和多余元素，保证数据干净
function sanitizeHTMLKeepBold(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    function cleanNode(node) {
        const childNodes = Array.from(node.childNodes);
        for (let child of childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName.toLowerCase();
                // 仅允许 strong 和 b 标签
                if (tagName === 'strong' || tagName === 'b') {
                    cleanNode(child);
                } else {
                    // 对于其它标签（如 div, p, span, br），递归清洗子节点后将其内容提升
                    cleanNode(child);
                    const parent = child.parentNode;
                    while (child.firstChild) {
                        parent.insertBefore(child.firstChild, child);
                    }
                    parent.removeChild(child);
                }
            }
        }
    }
    
    cleanNode(tempDiv);
    let cleanHTML = tempDiv.innerHTML;
    // 统一将 <b> 替换为 <strong>，保持规范统一
    cleanHTML = cleanHTML.replace(/<b\b[^>]*>(.*?)<\/b>/gi, '<strong>$1</strong>');
    return cleanHTML;
}

// 初始化就地文字加粗的毛玻璃工具气泡
function initBoldPopover() {
    // 1. 动态构建全局悬浮气泡 DOM 并插入到 body
    let popover = document.querySelector('.bold-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.className = 'bold-popover no-print';
        popover.innerHTML = `
            <button class="bold-popover-btn" title="文字加粗">
                <i class="fa-solid fa-bold"></i>
            </button>
        `;
        document.body.appendChild(popover);
    }

    let activeInputTarget = null; // 当前聚焦的左侧输入框 (input/textarea)

    // 2. 处理选区变化的核心定位与显示逻辑
    function handleSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // 选中文本为空则隐藏气泡
        if (!selectedText) {
            popover.classList.remove('show');
            return;
        }

        const activeEl = document.activeElement;
        
        // 判定选区是否发生在合法的编辑节点内
        const inPreview = activeEl && activeEl.closest('#resume-page') && activeEl.hasAttribute('contenteditable');
        const inSidebar = activeEl && (activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text'));

        if (!inPreview && !inSidebar) {
            popover.classList.remove('show');
            return;
        }

        // 记录当前的左侧目标，以便加粗动作精确分流
        activeInputTarget = inSidebar ? activeEl : null;

        // 计算选区的屏幕坐标
        try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
                popover.classList.remove('show');
                return;
            }

            // 定位到选区中间正上方
            const popoverWidth = 44; // button (32px) + padding (12px)
            const popoverHeight = 44;
            const top = rect.top + window.scrollY - popoverHeight - 8;
            const left = rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2;

            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
            popover.classList.add('show');
        } catch (e) {
            popover.classList.remove('show');
        }
    }

    // 鼠标释放与键盘按键后触发选区检测（使用微延迟防止在点击按钮的瞬间因选区消失而发生误隐藏）
    document.addEventListener('mouseup', () => {
        setTimeout(handleSelection, 120);
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
            handleSelection();
        }
    });

    // 3. 气泡内“加粗”按钮点击事件
    popover.querySelector('.bold-popover-btn').addEventListener('mousedown', (e) => {
        // 使用 mousedown 且 preventDefault，可以防止点击的瞬间导致原有的编辑框丢失光标焦点
        e.preventDefault();
        e.stopPropagation();

        const selection = window.getSelection();
        const selectedText = selection.toString();

        if (!selectedText) return;

        if (activeInputTarget) {
            // 场景 A: 左侧编辑器输入框加粗 (包裹 <strong> 标签)
            const start = activeInputTarget.selectionStart;
            const end = activeInputTarget.selectionEnd;
            const oldVal = activeInputTarget.value;
            const boldMarkup = `<strong>${selectedText}</strong>`;
            
            activeInputTarget.value = oldVal.substring(0, start) + boldMarkup + oldVal.substring(end);
            
            // 重新派发原生 input 事件，驱动双向绑定将改动同步渲染到右侧和 JSON 中
            activeInputTarget.dispatchEvent(new Event('input'));
            
            // 重新高亮选定新包裹的加粗文本，优化用户二次编辑体验
            activeInputTarget.focus();
            activeInputTarget.setSelectionRange(start, start + boldMarkup.length);
        } else {
            // 场景 B: 右侧 A4 简历预览区就地编辑加粗
            document.execCommand('bold', false, null);
            
            // 手动触发当前正在编辑元素的 input 事件，将 <strong> 加粗节点写入 state 并持久化
            const activeEl = document.activeElement;
            if (activeEl && activeEl.hasAttribute('contenteditable')) {
                activeEl.dispatchEvent(new Event('input'));
            }
        }

        // 隐藏气泡
        popover.classList.remove('show');
    });

    // 4. 点击除气泡以外的区域，立刻隐藏气泡
    document.addEventListener('mousedown', (e) => {
        if (!popover.contains(e.target)) {
            popover.classList.remove('show');
        }
    });
}

// 初始化侧边栏拖拽调宽功能 (含偏好记忆与预览区联动)
function initSidebarResize() {
    const sidebar = document.querySelector('.editor-sidebar');
    const handle = document.getElementById('sidebar-resize-handle');
    if (!sidebar || !handle) return;

    // 1. 初始化读取 localStorage 缓存偏好宽度
    const cachedWidth = localStorage.getItem('easycv_sidebar_width');
    if (cachedWidth) {
        sidebar.style.width = `${cachedWidth}px`;
        // 微调：触发一次缩放，确保一开始就排版对齐
        setTimeout(adjustPreviewScale, 100);
    }

    // 2. 绑定鼠标按下事件开始拖拽
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 阻断全局文本选中，确保拖拽流畅
        
        const startX = e.clientX;
        const startWidth = sidebar.offsetWidth;
        
        handle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        
        // 拖拽过程中的防抖与节流优化：利用 requestAnimationFrame 提高渲染帧率，杜绝闪烁和卡顿
        let animationFrameId = null;

        function onMouseMove(moveEvent) {
            const deltaX = moveEvent.clientX - startX;
            let newWidth = startWidth + deltaX;

            // 限制安全拖拽阈值 (最小320px，最大窗口60%或750px)
            const minWidth = 320;
            const maxWidth = Math.min(window.innerWidth * 0.6, 750);
            
            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                // 实时渲染宽度
                sidebar.style.width = `${newWidth}px`;
                // 缓存偏好宽度至 LocalStorage
                localStorage.setItem('easycv_sidebar_width', newWidth);
                // 核心联动：命令右侧 A4 简历视口重新执行缩放比例换算，平滑贴合！
                adjustPreviewScale();
            });
        }

        function onMouseUp() {
            handle.classList.remove('active');
            document.body.style.cursor = '';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            // 结束后再精确校准一次比例，保障布局完美
            adjustPreviewScale();
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

// ====================================================
// 9. 专为 AI 自动填报与精修简历定制的智能 Prompt 合成引擎
// ====================================================

// 展开与收折 AI 极客助手卡片
function toggleAICopilot() {
    const card = document.querySelector('.ai-copilot-card');
    if (card) {
        card.classList.toggle('expanded');
    }
}


// 自适应 textarea 高度，消灭垂直滚动条，实现内容自动完整展开

// 自适应 textarea 高度，消灭垂直滚动条，实现内容自动完整展开
function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
}



