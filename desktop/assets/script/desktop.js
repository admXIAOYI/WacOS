(function () {
    'use strict';

    /* ===== 顶部菜单 ===== */
    const menus = Array.from(document.querySelectorAll('.menu[data-menu]'));
    let openMenu = null;

    function closeAll() {
        if (openMenu) { openMenu.classList.remove('open'); openMenu = null; }
    }
    function openOne(m) {
        if (openMenu === m) return;
        if (openMenu) openMenu.classList.remove('open');
        m.classList.add('open');
        openMenu = m;
    }

    menus.forEach(m => {
        m.addEventListener('click', e => {
            if (e.target.closest('.dropdown .dd-item')) {
                const item = e.target.closest('.dd-item');
                if (item && item.dataset.action === 'about') openAboutWindow();
                closeAll();
                return;
            }
            if (e.target.closest('.dropdown')) return;
            if (m.classList.contains('open')) closeAll();
            else openOne(m);
        });
        m.addEventListener('pointerenter', () => {
            if (openMenu && openMenu !== m) openOne(m);
        });
    });

    document.addEventListener('pointerdown', e => {
        if (e.target.closest('.menu')) return;
        if (e.target.closest('.spotlight-overlay')) return;
        if (e.target.closest('.about-window')) return;
        if (e.target.closest('.control-center')) return;
        if (e.target.closest('#ccToggle')) return;
        closeAll();
    });

    /* ===== Spotlight ===== */
    const spotlightBtn = document.querySelector('[data-action="spotlight"]');
    const spotlightOverlay = document.getElementById('spotlightOverlay');
    const spotlightInput = document.getElementById('spotlightInput');

    function openSpotlight() {
        closeAll();
        closeCC();
        spotlightOverlay.classList.add('on');
        requestAnimationFrame(() => spotlightInput.focus());
    }
    function closeSpotlight() {
        spotlightOverlay.classList.remove('on');
        spotlightInput.value = '';
        spotlightInput.blur();
    }
    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', openSpotlight);
        spotlightBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSpotlight(); }
        });
    }
    if (spotlightOverlay) {
        spotlightOverlay.addEventListener('click', e => {
            if (e.target.closest('.spotlight-bar')) return;
            closeSpotlight();
        });
    }

    /* ===== DOM 引用集中放在最前 ===== */
    const ccToggle      = document.getElementById('ccToggle');
    const controlCenter = document.getElementById('controlCenter');
    const timeText      = document.getElementById('timeText');
    const widgetTime    = document.getElementById('widgetTime');
    const widgetSub     = document.getElementById('widgetSub');
    const calTitle      = document.getElementById('calTitle');
    const calGrid       = document.getElementById('calGrid');

    const WEEK_FULL  = ['日','一','二','三','四','五','六'];
    const WEEK_SHORT = ['周日','周一','周二','周三','周四','周五','周六'];

    /* ===== 时钟：统一一处刷新 ===== */
    function updateAllTime() {
        const now  = new Date();
        const hh   = String(now.getHours()).padStart(2,'0');
        const mm   = String(now.getMinutes()).padStart(2,'0');
        const mon  = now.getMonth() + 1;
        const day  = now.getDate();
        const year = now.getFullYear();
        const wk   = now.getDay();

        if (timeText) {
            timeText.textContent = `${mon}月${day}日 ${WEEK_SHORT[wk]} ${hh}:${mm}`;
        }
        if (widgetTime) widgetTime.textContent = `${hh}:${mm}`;
        if (widgetSub)  widgetSub.textContent  = `${year}年${mon}月${day}日 星期${WEEK_FULL[wk]}`;
    }
    function scheduleTime() {
        updateAllTime();
        const now = new Date();
        const delay = 60000 - now.getSeconds() * 1000 - now.getMilliseconds() + 50;
        setTimeout(scheduleTime, delay);
    }

    /* ===== 控制中心 ===== */
    function openCC() {
        controlCenter.classList.add('on');
        ccToggle.classList.add('open-cc');
        updateAllTime();
    }
    function closeCC() {
        controlCenter.classList.remove('on');
        ccToggle.classList.remove('open-cc');
    }
    function toggleCC() {
        if (controlCenter.classList.contains('on')) closeCC();
        else openCC();
    }

    ccToggle.addEventListener('click', toggleCC);
    ccToggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCC(); }
    });

    document.addEventListener('pointerdown', e => {
        if (!controlCenter.classList.contains('on')) return;
        if (e.target.closest('.control-center')) return;
        if (e.target.closest('#ccToggle')) return;
        closeCC();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeCC();
    });

    /* ===== 卡片点击：切换高亮 ===== */
    controlCenter.querySelectorAll('.cc-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('cc-wifi')) return;
            if (card.classList.contains('cc-music')) return;
            card.classList.toggle('active-soft');
        });
    });

    /* ===== 日历 ===== */
    let calYear  = new Date().getFullYear();
    let calMonth = new Date().getMonth();

    function renderCalendar(year, month) {
        if (!calTitle || !calGrid) return;
        calTitle.textContent = year + '年' + (month + 1) + '月';
        calGrid.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const el = document.createElement('div');
            el.className = 'cal-wd';
            el.textContent = WEEK_FULL[i];
            calGrid.appendChild(el);
        }
        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays    = new Date(year, month, 0).getDate();
        const today       = new Date();
        const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayNum    = today.getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const el = document.createElement('div');
            el.className = 'cal-day other';
            el.textContent = prevDays - i;
            calGrid.appendChild(el);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement('div');
            el.className = 'cal-day';
            if (isThisMonth && d === todayNum) el.classList.add('today');
            el.textContent = d;
            calGrid.appendChild(el);
        }
        const trailing = (7 - ((firstDay + daysInMonth) % 7)) % 7;
        for (let i = 1; i <= trailing; i++) {
            const el = document.createElement('div');
            el.className = 'cal-day other';
            el.textContent = i;
            calGrid.appendChild(el);
        }
    }

    const btnPrev = document.getElementById('calPrev');
    const btnNext = document.getElementById('calNext');
    if (btnPrev) btnPrev.addEventListener('click', () => {
        calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
        renderCalendar(calYear, calMonth);
    });
    if (btnNext) btnNext.addEventListener('click', () => {
        calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
        renderCalendar(calYear, calMonth);
    });

    renderCalendar(calYear, calMonth);
    scheduleTime();

    const clockMenu = document.querySelector('.menu-clock');
    if (clockMenu) {
        clockMenu.addEventListener('click', e => {
            if (e.target.closest('.cal-nav')) return;
            requestAnimationFrame(() => {
                if (!clockMenu.classList.contains('open')) return;
                const now = new Date();
                if (calYear !== now.getFullYear() || calMonth !== now.getMonth()) {
                    calYear  = now.getFullYear();
                    calMonth = now.getMonth();
                    renderCalendar(calYear, calMonth);
                }
                updateAllTime();
            });
        });
    }

    /* ===== 关于本机窗口 ===== */
    const aboutWin     = document.getElementById('aboutWindow');
    const aboutTitle   = document.getElementById('aboutTitlebar');
    const aboutClose   = document.getElementById('aboutClose');
    const aboutMore    = document.getElementById('aboutMore');
    const aboutDetails = document.getElementById('aboutDetails');

    let detailsFilled = false;
    function fillAboutDetails() {
        if (detailsFilled) return;
        detailsFilled = true;
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        set('aboutScreen', `${screen.width} × ${screen.height}`);
        set('aboutDpr',    `${window.devicePixelRatio || 1}x`);
        set('aboutCores',  navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核` : '未知');
        set('aboutLang',   navigator.language || '未知');
        set('aboutTz',     (Intl.DateTimeFormat().resolvedOptions().timeZone) || '未知');
    }
    aboutMore.addEventListener('click', () => {
        const open = aboutDetails.classList.toggle('on');
        aboutMore.textContent = open ? '收起信息' : '更多信息…';
        if (open) fillAboutDetails();
    });

    let isAboutOpen = false;
    let isCentered = true;

    function resetWindowStyles() {
        aboutWin.classList.remove('dragging');
        aboutWin.style.animation = '';
        aboutWin.style.transform = '';
        aboutWin.style.left      = '';
        aboutWin.style.top       = '';
        isCentered = true;
    }

    function openAboutWindow() {
        if (isAboutOpen) return;
        isAboutOpen = true;
        closeCC();
        closeAll();
        resetWindowStyles();
        aboutWin.classList.remove('closing');
        void aboutWin.offsetWidth;
        aboutWin.classList.add('on');
    }
    function closeAboutWindow() {
        if (!isAboutOpen) return;
        isAboutOpen = false;
        aboutWin.classList.add('closing');
        setTimeout(() => {
            aboutWin.classList.remove('on');
            aboutWin.classList.remove('closing');
            resetWindowStyles();
        }, 200);
    }
    aboutClose.addEventListener('click', closeAboutWindow);

    /* 拖拽 */
    let dragging = false;
    let dragStartX = 0, dragStartY = 0;
    let winStartX = 0, winStartY = 0;

    aboutTitle.addEventListener('pointerdown', e => {
        if (e.target.closest('.traffic')) return;
        if (e.button !== 0) return;
        e.preventDefault();

        aboutWin.style.animation = 'none';
        aboutWin.classList.add('dragging');

        const rect = aboutWin.getBoundingClientRect();
        aboutWin.style.transform = 'none';
        aboutWin.style.left = rect.left + 'px';
        aboutWin.style.top  = rect.top  + 'px';

        winStartX  = rect.left;
        winStartY  = rect.top;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        dragging = true;
        isCentered = false;

        try { aboutTitle.setPointerCapture(e.pointerId); } catch (_) {}
    });
    aboutTitle.addEventListener('pointermove', e => {
        if (!dragging) return;
        
        // 计算移动后的坐标
        let nx = winStartX + (e.clientX - dragStartX);
        let ny = winStartY + (e.clientY - dragStartY);
        
        // 动态获取 Finder Bar 的高度（默认 30px）
        const topbar = document.querySelector('.topbar');
        const topbarHeight = topbar ? topbar.offsetHeight : 30;
        
        // 限制：往上拖时，顶部不能超过 Finder Bar 的高度
        // （左右方向和底部不限制，依旧可以溢出屏幕）
        ny = Math.max(topbarHeight, ny); 
        
        aboutWin.style.left = nx + 'px';
        aboutWin.style.top  = ny + 'px';
    });
    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        aboutWin.classList.remove('dragging');
        try { aboutTitle.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    aboutTitle.addEventListener('pointerup', endDrag);
    aboutTitle.addEventListener('pointercancel', endDrag);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isAboutOpen) closeAboutWindow();
    });

    /* ===== Dock ===== */
    const BASE_W = 50, MAX_SCALE = 1.8, HOVER_RANGE = 190;
    const SMOOTH = 0.30, SNAP = 0.002, ICON_BOTTOM = 7, TIP_GAP = 10;

    const tip = document.getElementById('tip');
    const dockWrap = document.getElementById('dockWrap');

    const items = Array.from(dockWrap.children).map(el => {
        const isSep = el.classList.contains('sep');
        return {
            el, isSep,
            img   : isSep ? null : el.querySelector('img'),
            light : isSep ? null : el.querySelector('.light'),
            name  : el.dataset.name || '',
            baseCX: 0, curScale: 1
        };
    });
    const N = items.length;

    let viewportCX = 0, mouseX = null, hoverIdx = -1, rafId = 0, tipH = 20;

    function measure() {
        viewportCX = document.documentElement.clientWidth / 2;
        for (let i = 0; i < N; i++) {
            if (items[i].isSep) continue;
            items[i].el.style.width = BASE_W + 'px';
            items[i].el.style.zIndex = '';
            items[i].curScale = 1;
        }
        void dockWrap.offsetWidth;
        for (let i = 0; i < N; i++) {
            const it = items[i];
            if (it.isSep) continue;
            const r = it.el.getBoundingClientRect();
            it.baseCX = r.left + r.width * 0.5 - viewportCX;
        }
    }

    function updateTip() {
        if (hoverIdx < 0) return;
        const it = items[hoverIdx];
        const r  = it.el.getBoundingClientRect();
        const cx = r.left + r.width * 0.5;
        const iconBottom = r.bottom - ICON_BOTTOM;
        const iconTop = iconBottom - BASE_W * it.curScale;
        const cy = iconTop - TIP_GAP - tipH;
        tip.style.transform =
            `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translateX(-50%)`;
    }

    function tick() {
        rafId = 0;
        const mouseOffset = mouseX === null ? 0 : mouseX - viewportCX;
        let allSettled = true;
        for (let i = 0; i < N; i++) {
            const it = items[i];
            if (it.isSep) continue;
            let target = 1;
            if (mouseX !== null) {
                const d = Math.abs(mouseOffset - it.baseCX);
                if (d < HOVER_RANGE) {
                    const t = d / HOVER_RANGE;
                    const c = Math.cos(t * Math.PI * 0.5);
                    target = 1 + (MAX_SCALE - 1) * c * c;
                }
            }
            const diff = target - it.curScale;
            if (Math.abs(diff) < SNAP) it.curScale = target;
            else { it.curScale += diff * SMOOTH; allSettled = false; }
            it.el.style.width = (BASE_W * it.curScale).toFixed(2) + 'px';
            if (it.curScale > 1.005) it.el.style.zIndex = String(Math.round(it.curScale * 1000));
            else if (it.el.style.zIndex) it.el.style.zIndex = '';
        }
        if (hoverIdx >= 0) updateTip();
        if (!allSettled || mouseX !== null) rafId = requestAnimationFrame(tick);
    }
    function kick() { if (!rafId) rafId = requestAnimationFrame(tick); }

    dockWrap.addEventListener('pointermove', e => { mouseX = e.clientX; kick(); });
    dockWrap.addEventListener('pointerenter', () => {
        viewportCX = document.documentElement.clientWidth / 2; kick();
    });
    dockWrap.addEventListener('pointerleave', () => {
        mouseX = null; hoverIdx = -1; tip.style.display = 'none'; kick();
    });

    items.forEach((it, i) => {
        if (it.isSep) return;
        it.el.addEventListener('pointerenter', () => {
            if (!it.name) return;
            tip.textContent = it.name;
            tip.style.display = 'block';
            tipH = tip.offsetHeight || 20;
            hoverIdx = i;
            updateTip();
            kick();
        });
        it.el.addEventListener('pointerleave', () => {
            tip.style.display = 'none'; hoverIdx = -1;
        });
        it.el.addEventListener('click', () => {
            const img = it.img;
            if (!img) return;
            img.classList.remove('opening');
            void img.offsetWidth;
            img.classList.add('opening');
            if(it.name === '访达'){
                if(it.light){
                    // 原代码此处为 add(on)，on 未定义会抛错，这里修正为字符串 'on'
                    it.light.classList.add('on');
                }
            }
            showAppError({
                name: it.name,
                icon: img.getAttribute('src')
            });
        });
        if (it.img) {
            it.img.addEventListener('animationend', () => it.img.classList.remove('opening'));
        }
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { measure(); kick(); }, 100);
    });
    window.addEventListener('load', () => { measure(); kick(); });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { measure(); kick(); });
    }
    measure();

})();

/* ===== 应用错误弹窗 ===== */
const appErrorOverlay = document.getElementById('appErrorOverlay');
const appErrorIcon    = document.getElementById('appErrorIcon');
const appErrorMessage = document.getElementById('appErrorMessage');
const appErrorOk      = document.getElementById('appErrorOk');

function showAppError(opts) {
    const name = (opts && opts.name) || '此 App';
    const msg  = (opts && opts.message) ||
                 `${name} 仍在开发中\n服务器返回状态码：404`;
    const icon = (opts && opts.icon) || '';

    if (appErrorIcon) {
        if (icon) {
            appErrorIcon.src = icon;
            appErrorIcon.alt = name;
            appErrorIcon.style.display = '';
        } else {
            appErrorIcon.style.display = 'none';
        }
    }
    if (appErrorMessage) appErrorMessage.textContent = msg;

    appErrorOverlay.classList.add('on');
}
function hideAppError() {
    appErrorOverlay.classList.remove('on');
}

if (appErrorOk) appErrorOk.addEventListener('click', hideAppError);
if (appErrorOverlay) {
    appErrorOverlay.addEventListener('click', e => {
        if (e.target === appErrorOverlay) hideAppError();
    });
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideAppError();
});
(function() {
    'use strict';

    /* ==========================================
       动态注入所需的 CSS
       ========================================== */
    const style = document.createElement('style');
    style.textContent = `
        /* 睡眠黑屏层 */
        .mac-blackout {
            position: fixed; inset: 0; background: #000;
            z-index: 999999; opacity: 0; pointer-events: none;
            transition: opacity 0.5s ease; cursor: default;
        }
        .mac-blackout.on { opacity: 1; pointer-events: auto; }

        /* Dock 右键菜单 */
        .mac-context-menu {
            position: absolute; z-index: 10000;
            min-width: 180px; padding: 5px; border-radius: 10px;
            background: rgba(50, 50, 55, 0.65);
            -webkit-backdrop-filter: blur(24px) saturate(1.8);
            backdrop-filter: blur(24px) saturate(1.8);
            border: 1px solid rgba(255,255,255,.15);
            box-shadow: 0 10px 30px rgba(0,0,0,.4);
            color: #fff; font-size: 13px; display: none; opacity: 0;
            transition: opacity 0.1s;
        }
        .mac-context-menu.on { display: block; opacity: 1; }
        .mac-context-menu .ctx-item {
            padding: 4px 10px; border-radius: 5px; cursor: default;
        }
        .mac-context-menu .ctx-item:hover { background: #0a84ff; color: #fff; }
        .mac-context-menu .ctx-sep { height: 1px; background: rgba(255,255,255,.1); margin: 4px 8px; }

        /* Spotlight 搜索结果 */
        .spotlight-results {
            position: absolute; top: 54px; left: 0; width: 100%;
            border-radius: 12px; background: rgba(255,255,255,.85);
            -webkit-backdrop-filter: blur(20px);
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0,0,0,.15);
            display: none; overflow: hidden; padding: 6px;
        }
        .spotlight-results.on { display: block; }
        .spotlight-result-item {
            display: flex; align-items: center; gap: 10px;
            padding: 8px 12px; border-radius: 8px; color: #1c1c1e;
            font-size: 14px; cursor: default;
        }
        .spotlight-result-item:hover { background: #0a84ff; color: #fff; }
    `;
    document.head.appendChild(style);


    /* ==========================================
       功能 1：菜单栏功能拦截（睡眠黑屏 & 页面跳转）
       ========================================== */
    const blackout = document.createElement('div');
    blackout.className = 'mac-blackout';
    document.body.appendChild(blackout);

    // 监听菜单栏点击
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.dd-item');
        if (!item) return;
        const text = item.textContent.trim();

        // 1. 退出登录跳转
        if (text.includes('退出登录 Webintosh')) {
            window.location.href = '../logon/index.html';
            return;
        }

        // 2. 重新启动跳转
        if (text.includes('重新启动')) {
            window.location.href = '../firmware/index.html';
            return;
        }

        // 3. 睡眠模拟（点击黑屏，点击唤醒）
        if (text === '睡眠') {
            blackout.classList.add('on');
            blackout.addEventListener('click', function wake() {
                blackout.classList.remove('on');
                blackout.removeEventListener('click', wake);
            }, { once: true });
            return;
        }

        // 4. 关机模拟（保留原本的黑屏 3 秒后恢复）
        if (text === '关机…') {
            blackout.classList.add('on');
            setTimeout(() => {
                blackout.classList.remove('on');
            }, 3000);
        }
    });


    /* ==========================================
       功能 2：Dock 栏右键菜单
       ========================================== */
    const dock = document.getElementById('dockWrap');
    const ctxMenu = document.createElement('div');
    ctxMenu.className = 'mac-context-menu';
    ctxMenu.innerHTML = `
        <div class="ctx-item">选项</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item">在访达中显示</div>
        <div class="ctx-item">显示所有窗口</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item">退出</div>
    `;
    document.body.appendChild(ctxMenu);

    if (dock) {
        // 阻止 Dock 的默认右键菜单
        dock.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.dock-item');
            if (!item || item.classList.contains('sep')) return;

            // 定位菜单在鼠标位置
            ctxMenu.style.left = e.clientX + 'px';
            ctxMenu.style.top = (e.clientY - 30) + 'px'; 
            ctxMenu.classList.add('on');
        });

        // 点击任意地方隐藏菜单
        document.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('.mac-context-menu')) {
                ctxMenu.classList.remove('on');
            }
        });
    }


    /* ==========================================
       功能 3：Spotlight 搜索输入实时反馈
       ========================================== */
    const spotInput = document.getElementById('spotlightInput');
    const spotField = document.querySelector('.spotlight-field');
    
    // 创建搜索结果容器
    const resultsBox = document.createElement('div');
    resultsBox.className = 'spotlight-results';
    spotField.style.position = 'relative'; // 确保下拉框定位正确
    spotField.appendChild(resultsBox);

    const mockApps = ['访达', '系统设置', 'Safari 浏览器', 'App Store', '备忘录', '音乐', '计算器'];

    if (spotInput) {
        spotInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            resultsBox.innerHTML = '';
            
            if (!val) {
                resultsBox.classList.remove('on');
                return;
            }

            // 简单的模糊搜索
            const matches = mockApps.filter(app => app.toLowerCase().includes(val));
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const el = document.createElement('div');
                    el.className = 'spotlight-result-item';
                    el.innerHTML = `<span>🔍</span> <span>${match}</span>`;
                    el.addEventListener('click', () => {
                        if (typeof showAppError === 'function') {
                            showAppError({ name: match, message: `正在启动 ${match}...\n(这是 Spotlight 扩展功能)` });
                        }
                        document.getElementById('spotlightOverlay').classList.remove('on');
                        spotInput.value = '';
                        resultsBox.classList.remove('on');
                    });
                    resultsBox.appendChild(el);
                });
                resultsBox.classList.add('on');
            } else {
                const el = document.createElement('div');
                el.className = 'spotlight-result-item';
                el.innerHTML = `<span style="opacity:.5">无匹配结果</span>`;
                resultsBox.appendChild(el);
                resultsBox.classList.add('on');
            }
        });

        // 关闭 Spotlight 时清空搜索结果
        document.getElementById('spotlightOverlay').addEventListener('click', (e) => {
            if (!e.target.closest('.spotlight-bar')) {
                resultsBox.classList.remove('on');
            }
        });
    }

})();
(function() {
    'use strict';

    /* ==========================================
       1. 动态注入所需的 CSS
       ========================================== */
    const style = document.createElement('style');
    style.textContent = `
        /* 睡眠黑屏层 */
        .mac-blackout {
            position: fixed; inset: 0; background: #000;
            z-index: 999999; opacity: 0; pointer-events: none;
            transition: opacity 0.5s ease; cursor: default;
        }
        .mac-blackout.on { opacity: 1; pointer-events: auto; }

        /* Dock 右键菜单 */
        .mac-context-menu {
            position: absolute; z-index: 10000;
            min-width: 180px; padding: 5px; border-radius: 10px;
            background: rgba(50, 50, 55, 0.65);
            -webkit-backdrop-filter: blur(24px) saturate(1.8);
            backdrop-filter: blur(24px) saturate(1.8);
            border: 1px solid rgba(255,255,255,.15);
            box-shadow: 0 10px 30px rgba(0,0,0,.4);
            color: #fff; font-size: 13px; display: none; opacity: 0;
            transition: opacity 0.1s;
        }
        .mac-context-menu.on { display: block; opacity: 1; }
        .mac-context-menu .ctx-item {
            padding: 4px 10px; border-radius: 5px; cursor: default;
        }
        .mac-context-menu .ctx-item:hover { background: #0a84ff; color: #fff; }
        .mac-context-menu .ctx-sep { height: 1px; background: rgba(255,255,255,.1); margin: 4px 8px; }

        /* Spotlight 搜索结果 */
        .spotlight-results {
            position: absolute; top: 54px; left: 0; width: 100%;
            border-radius: 12px; background: rgba(255,255,255,.85);
            -webkit-backdrop-filter: blur(20px);
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0,0,0,.15);
            display: none; overflow: hidden; padding: 6px;
        }
        .spotlight-results.on { display: block; }
        .spotlight-result-item {
            display: flex; align-items: center; gap: 10px;
            padding: 8px 12px; border-radius: 8px; color: #1c1c1e;
            font-size: 14px; cursor: default;
        }
        .spotlight-result-item:hover { background: #0a84ff; color: #fff; }

        /* PPT 缩放过渡动画 (仅对桌面层生效，防止缩放导致fixed坐标偏移) */
        .zoom-wrapper {
            position: fixed; inset: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 999998; opacity: 0;
        }
        body.zoom-out-leave .zoom-wrapper {
            pointer-events: auto;
            animation: zoomOutAnim 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
            transform-origin: center center;
        }
        body.zoom-in-load .zoom-wrapper {
            pointer-events: auto;
            animation: zoomInAnim 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            transform-origin: center center;
        }
        body.zoom-out-leave > :not(.zoom-wrapper),
        body.zoom-in-load > :not(.zoom-wrapper) {
            /* 真正缩放的是 body 内的所有元素，但用 transform 会影响定位，所以用包装层最安全 */
        }
        
        /* 直接使用 body 缩放 */
        body.zoom-out-leave {
            animation: zoomOutAnim 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
            transform-origin: center center;
        }
        body.zoom-in-load {
            animation: zoomInAnim 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            transform-origin: center center;
        }
        @keyframes zoomOutAnim {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes zoomInAnim {
            0% { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);


    /* ==========================================
       2. 页面加载时的“放大”过渡效果
       ========================================== */
    // 修复：用正则或 includes 判断路径，忽略相对/绝对路径的差异
    const ref = document.referrer;
    if (ref && (ref.includes('/logon/') || ref.includes('/firmware/'))) {
        document.body.classList.add('zoom-in-load');
        // 动画结束后移除类名，防止影响 fixed 元素的定位计算
        setTimeout(() => {
            document.body.classList.remove('zoom-in-load');
        }, 450);
    }


    /* ==========================================
       3. 菜单栏功能拦截（睡眠黑屏 & 页面跳转与缩放）
       ========================================== */
    const blackout = document.createElement('div');
    blackout.className = 'mac-blackout';
    document.body.appendChild(blackout);

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.dd-item');
        if (!item) return;
        const text = item.textContent.trim();

        // 1. 退出登录跳转（先缩小，再跳转）
        if (text.includes('退出登录 Webintosh')) {
            document.body.classList.add('zoom-out-leave');
            setTimeout(() => {
                window.location.href = '../logon/index.html';
            }, 380);
            return;
        }

        // 2. 重新启动跳转（先缩小，再跳转）
        if (text.includes('重新启动')) {
            document.body.classList.add('zoom-out-leave');
            setTimeout(() => {
                window.location.href = '../firmware/index.html';
            }, 380);
            return;
        }

        // 3. 睡眠模拟（点击黑屏，点击唤醒）
        if (text === '睡眠') {
            blackout.classList.add('on');
            blackout.addEventListener('click', function wake() {
                blackout.classList.remove('on');
                blackout.removeEventListener('click', wake);
            }, { once: true });
            return;
        }

        // 4. 关机模拟
        if (text === '关机…') {
            blackout.classList.add('on');
            setTimeout(() => {
                blackout.classList.remove('on');
            }, 3000);
        }
    });


    /* ==========================================
       4. Dock 栏右键菜单
       ========================================== */
    const dock = document.getElementById('dockWrap');
    const ctxMenu = document.createElement('div');
    ctxMenu.className = 'mac-context-menu';
    ctxMenu.innerHTML = `
        <div class="ctx-item">选项</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item">在访达中显示</div>
        <div class="ctx-item">显示所有窗口</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item">退出</div>
    `;
    document.body.appendChild(ctxMenu);

    if (dock) {
        dock.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.dock-item');
            if (!item || item.classList.contains('sep')) return;

            ctxMenu.style.left = e.clientX + 'px';
            ctxMenu.style.top = (e.clientY - 30) + 'px'; 
            ctxMenu.classList.add('on');
        });

        document.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('.mac-context-menu')) {
                ctxMenu.classList.remove('on');
            }
        });
    }


    /* ==========================================
       5. Spotlight 搜索输入实时反馈
       ========================================== */
    const spotInput = document.getElementById('spotlightInput');
    const spotField = document.querySelector('.spotlight-field');
    
    if (spotInput && spotField) {
        const resultsBox = document.createElement('div');
        resultsBox.className = 'spotlight-results';
        spotField.style.position = 'relative';
        spotField.appendChild(resultsBox);

        const mockApps = ['访达', '系统设置', 'Safari 浏览器', 'App Store', '备忘录', '音乐', '计算器'];

        spotInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            resultsBox.innerHTML = '';
            
            if (!val) {
                resultsBox.classList.remove('on');
                return;
            }

            const matches = mockApps.filter(app => app.toLowerCase().includes(val));
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const el = document.createElement('div');
                    el.className = 'spotlight-result-item';
                    el.innerHTML = `<span>🔍</span> <span>${match}</span>`;
                    el.addEventListener('click', () => {
                        if (typeof showAppError === 'function') {
                            showAppError({ name: match, message: `正在启动 ${match}...\n(这是 Spotlight 扩展功能)` });
                        }
                        const overlay = document.getElementById('spotlightOverlay');
                        if (overlay) overlay.classList.remove('on');
                        spotInput.value = '';
                        resultsBox.classList.remove('on');
                    });
                    resultsBox.appendChild(el);
                });
                resultsBox.classList.add('on');
            } else {
                const el = document.createElement('div');
                el.className = 'spotlight-result-item';
                el.innerHTML = `<span style="opacity:.5">无匹配结果</span>`;
                resultsBox.appendChild(el);
                resultsBox.classList.add('on');
            }
        });

        const overlay = document.getElementById('spotlightOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (!e.target.closest('.spotlight-bar')) {
                    resultsBox.classList.remove('on');
                }
            });
        }
    }

})();
