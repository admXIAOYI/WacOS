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
   Dock 栏右键菜单（完美版：防溢出 + 访达定制 + 终极关闭）
   ========================================== */
(function() {
    'use strict';

    // 1. 注入 CSS
    const style = document.createElement('style');
    style.textContent = `
        .mac-context-menu {
            position: fixed;
            z-index: 999999;
            min-width: 180px; padding: 5px; border-radius: 10px;
            background: rgba(50, 50, 55, 0.65);
            -webkit-backdrop-filter: blur(24px) saturate(1.8);
            backdrop-filter: blur(24px) saturate(1.8);
            border: 1px solid rgba(255,255,255,.15);
            box-shadow: 0 10px 30px rgba(0,0,0,.4);
            color: #fff; font-size: 13px; display: none; opacity: 0;
            transition: opacity 0.1s;
            max-width: calc(100vw - 16px);
            max-height: calc(100vh - 16px);
            overflow: auto;
        }
        .mac-context-menu.on { display: block; opacity: 1; }
        .mac-context-menu .ctx-item {
            padding: 4px 10px; border-radius: 5px; cursor: default;
            user-select: none; -webkit-user-select: none;
        }
        .mac-context-menu .ctx-item:hover { background: #0a84ff; color: #fff; }
        .mac-context-menu .ctx-sep { height: 1px; background: rgba(255,255,255,.1); margin: 4px 8px; }
    `;
    document.head.appendChild(style);

    // 2. 创建菜单 DOM
    const ctxMenu = document.createElement('div');
    ctxMenu.className = 'mac-context-menu';
    ctxMenu.innerHTML = `
        <div class="ctx-item" data-ctx="options">选项</div>
        <div class="ctx-sep"></div>
        <div class="ctx-item" data-ctx="reveal">在访达中显示</div>
        <div class="ctx-item" data-ctx="showAll">显示所有窗口</div>
        <div class="ctx-sep" id="ctxQuitSep"></div>
        <div class="ctx-item" data-ctx="quit" id="ctxQuitBtn">退出</div>
    `;
    document.body.appendChild(ctxMenu);

    let ctxAppId = null;
    const dock = document.getElementById('dockWrap');

    // 3. 防止菜单溢出屏幕的定位函数
    function placeCtxMenu(x, y) {
        const pad = 8;
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;

        ctxMenu.style.left = '0px';
        ctxMenu.style.top = '0px';
        ctxMenu.classList.add('on');
        
        const rect = ctxMenu.getBoundingClientRect();
        let left = x;
        let top = y;

        if (left + rect.width + pad > vw) left = left - rect.width;
        if (left < pad) left = pad;

        if (top + rect.height + pad > vh) top = top - rect.height;
        if (top < pad) top = pad;

        ctxMenu.style.left = left + 'px';
        ctxMenu.style.top = top + 'px';
    }

    if (dock) {
        // 4. 监听右键事件
        dock.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.dock-item');
            if (!item || item.classList.contains('sep')) return;

            ctxAppId = item.dataset.name || 'Unknown';
            const quitBtn = document.getElementById('ctxQuitBtn');
            const quitSep = document.getElementById('ctxQuitSep');

            // 访达不能退出
            if (ctxAppId === '访达') {
                quitBtn.style.display = 'none';
                quitSep.style.display = 'none';
            } else {
                quitBtn.style.display = 'block';
                quitSep.style.display = 'block';
            }

            placeCtxMenu(e.clientX, e.clientY);
        });

        // 5. 监听菜单项点击事件（核心关闭逻辑）
        ctxMenu.addEventListener('click', (e) => {
            const el = e.target.closest('.ctx-item');
            if (!el) return;
            
            const action = el.dataset.ctx;

            if (action === 'quit' && ctxAppId) {
                // 清理错误弹窗与关于本机
                if (typeof hideAppError === 'function') hideAppError();
                const errorOverlay = document.getElementById('appErrorOverlay');
                if (errorOverlay) errorOverlay.classList.remove('on');
                
                const aboutWin = document.getElementById('aboutWindow');
                if (aboutWin) aboutWin.classList.remove('on');

                // 熄灭 Dock 指示灯
                const light = dock.querySelector(`.dock-item[data-name="${ctxAppId}"] .light`);
                if (light) light.classList.remove('on');

                // 针对 Safari 的终极强杀逻辑
                if (ctxAppId.includes('Safari')) {
                    const safariWindow = document.getElementById('safariWindow') || document.querySelector('.safari-window');
                    if (safariWindow) {
                        // 1. 优先尝试找红绿灯点击（这会走 Safari.js 的原生逻辑）
                        const closeBtn = safariWindow.querySelector('.traffic .close') || safariWindow.querySelector('.safari-close');
                        if (closeBtn) closeBtn.click();

                        // 2. 延迟检查：如果因为放大/遮挡导致点红绿灯没用，直接暴力强杀
                        setTimeout(() => {
                            const styleCheck = window.getComputedStyle(safariWindow);
                            // 如果窗口依然显示，说明卡住了
                            if (styleCheck.display !== 'none' && styleCheck.opacity !== '0') {
                                safariWindow.classList.remove('on');
                                
                                // 清除所有可能导致“放大后卡死”的内联样式
                                safariWindow.style.width = '';
                                safariWindow.style.height = '';
                                safariWindow.style.transform = '';
                                safariWindow.style.top = '';
                                safariWindow.style.left = '';
                                safariWindow.style.borderRadius = '';
                                
                                // 最终隐藏
                                safariWindow.style.display = 'none';
                                safariWindow.style.opacity = '0';
                            }
                        }, 100);
                    }
                }
            }

            // 操作完隐藏菜单
            ctxMenu.classList.remove('on');
            ctxAppId = null;
        });

        // 6. 监听下次点击（解决再次点击无反应的问题）
        // 在点击事件捕获阶段，如果发现之前被强杀了，立刻还原样式，让 Safari.js 能正常工作
        dock.addEventListener('pointerdown', function(e) {
            const item = e.target.closest('.dock-item');
            if (!item) return;
            const appName = item.dataset.name;

            if (appName && appName.includes('Safari')) {
                const sWin = document.getElementById('safariWindow') || document.querySelector('.safari-window');
                if (sWin) {
                    if (sWin.style.display === 'none') sWin.style.display = '';
                    if (sWin.style.opacity === '0') sWin.style.opacity = '';
                }
            }
        }, true);

        // 7. 点击页面其他任意地方，隐藏菜单
        document.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('.mac-context-menu')) {
                ctxMenu.classList.remove('on');
                ctxAppId = null;
            }
        });

        // 窗口尺寸改变时隐藏菜单
        window.addEventListener('resize', () => {
            ctxMenu.classList.remove('on');
            ctxAppId = null;
        });
    }
})();
/* ==========================================
   Spotlight 搜索功能（平滑过渡 + 全屏应用搜索）
   ========================================== */
(function() {
    'use strict';

    // 1. 整合所有应用数据
    const allApps = [
        { name: '系统设置', icon: 'System Settings.png' },
        { name: 'Game', icon: 'xboxpcapp.png' },
        { name: 'App Store', icon: 'App Store.png' },
        { name: '日历', icon: 'Calendar.png' },
        { name: '通讯录', icon: 'Contacts.png' },
        { name: '预览', icon: 'Preview.png' },
        { name: '时间机器', icon: 'Time-Machine.png' },
        { name: '图书', icon: 'Books.png' },
        { name: 'Keynote 讲演', icon: 'Keynote.png' },
        { name: 'Pages 文稿', icon: 'Pages.png' },
        { name: 'Numbers 表格', icon: 'Numbers.png' },
        { name: '备忘录', icon: 'Notes.png' },
        { name: '提醒事项', icon: 'Reminders.png' },
        { name: '查找', icon: 'Find My.png' },
        { name: '计算器', icon: 'Calculator.png' },
        { name: '时钟', icon: 'Clock.png' },
        { name: '密码', icon: 'Passwords.png' },
        { name: '终端', icon: 'Terminal.png' },
        { name: '测距仪', icon: 'Measure.png' },
        { name: '翻译', icon: 'Translate.png' },
        { name: '语音备忘录', icon: 'Voice Memos.png' },
        { name: '隔空投送', icon: 'Airdrop.png' },
        { name: '活动监视器', icon: 'Systemtray.png' },
        { name: '任务管理器', icon: 'Taskmgr.png' },
        { name: '网络', icon: 'Network.png' },
        { name: '文本编辑', icon: 'notepad.png' },
        { name: '待办事项', icon: 'todo.png' },
        { name: '音乐', icon: 'applemusic.png' },
        { name: 'Apple TV', icon: 'Apple TV.png' },
        { name: '播客', icon: 'Podcasts.png' },
        { name: 'Photo Booth', icon: 'Photo Booth.png' },
        { name: '照片', icon: 'Photos.png' },
        { name: 'QuickTime Player', icon: 'QuickTime Player.png' },
        { name: 'iMovie 剪辑', icon: 'iMovie.png' },
        { name: 'Final Cut Pro', icon: 'Final Cut Pro.png' },
        { name: '无边记', icon: 'Freeform.png' },
        { name: 'Lyricify', icon: 'Lyricify for Spotify.png' },
        { name: 'iTunes', icon: 'itunes.png' },
        { name: '邮件', icon: 'Mail.png' },
        { name: '信息', icon: 'Messages.png' },
        { name: 'FaceTime 通话', icon: 'FaceTime.png' },
        { name: '地图', icon: 'Maps.png' },
        { name: '电话', icon: 'Phone.png' },
        { name: 'Safari 浏览器', icon: 'Safari.png' },
        { name: '邮件', icon: 'olk.png' },
        { name: 'FaceTime 通话', icon: 'ms-teams.png' },
        { name: '相机', icon: 'Camera.png' },
        { name: '健身', icon: 'Fitness.png' },
        { name: '健康', icon: 'Health.png' },
        { name: '家庭', icon: 'Home.png' },
        { name: '钱包', icon: 'Wallet.png' },
        { name: 'Watch', icon: 'Watch.png' },
        { name: '天气', icon: 'Weather.png' },
        { name: '股市', icon: 'Stocks.png' },
    ];

    const spotInput = document.getElementById('spotlightInput');
    const spotBar = document.querySelector('.spotlight-bar');
    const spotlightOverlay = document.getElementById('spotlightOverlay');

    if (!spotInput || !spotBar) return;

    // 2. 注入展开与收缩所需的 CSS
    const style = document.createElement('style');
    style.textContent = `
        /* ===== 容器过渡动画 ===== */
        .spotlight-bar {
            transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), 
                        height 0.35s cubic-bezier(0.22, 1, 0.36, 1), 
                        background 0.3s ease, 
                        border-radius 0.3s ease, 
                        box-shadow 0.3s ease,
                        border 0.3s ease;
            border-radius: 999px;
            background: transparent;
            border: 1px solid transparent;
        }

        /* ===== 搜索激活状态（全宽大面板） ===== */
        .spotlight-bar.searching {
            width: 580px;
            height: 450px;
            background: rgba(255, 255, 255, 0.85);
            -webkit-backdrop-filter: blur(30px) saturate(1.8);
            backdrop-filter: blur(30px) saturate(1.8);
            border: 1px solid rgba(255,255,255,.6);
            box-shadow: 0 20px 50px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,1);
            border-radius: 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            overflow: hidden;
        }

        /* ===== 搜索状态下隐藏右侧四个按钮 ===== */
        .spotlight-bar.searching .spotlight-actions {
            display: none;
        }

        /* ===== 搜索状态下顶部输入框适配 ===== */
        .spotlight-bar.searching .spotlight-field {
            width: 100%;
            height: 60px;
            min-width: 0;
            border-radius: 0;
            border: none;
            background: transparent;
            box-shadow: none;
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
            border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        /* ===== 结果列表基础样式 ===== */
        .spotlight-results {
            position: absolute;
            top: 54px; left: 0; width: 100%;
            border-radius: 12px; 
            background: rgba(255,255,255,.85);
            -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px rgba(0,0,0,.15);
            display: none; overflow: hidden; padding: 6px;
            max-height: 350px; overflow-y: auto;
            z-index: 20001;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .spotlight-results.on { 
            display: block; 
            opacity: 1;
        }

        /* ===== 搜索状态下结果列表展开 ===== */
        .spotlight-bar.searching .spotlight-results {
            position: static;
            width: 100%;
            flex: 1;
            height: 0;
            max-height: none;
            background: transparent;
            box-shadow: none;
            border-radius: 0;
            padding: 8px;
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
        }

        /* ===== 结果项样式 ===== */
        .spotlight-result-item {
            display: flex; align-items: center; gap: 12px;
            padding: 8px 12px; border-radius: 8px; color: #1c1c1e;
            font-size: 14px; cursor: default; transition: background 0.1s;
            user-select: none; -webkit-user-select: none;
        }
        .spotlight-result-item:hover, .spotlight-result-item.selected { 
            background: #0a84ff; color: #fff; 
        }
        .spotlight-result-item img {
            width: 28px; height: 28px; object-fit: contain;
            pointer-events: none;
        }
        .spotlight-result-item .app-name {
            flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            pointer-events: none;
        }
        .spotlight-result-item .app-action {
            font-size: 12px; opacity: 0.5; display: none; pointer-events: none;
        }
        .spotlight-result-item:hover .app-action, .spotlight-result-item.selected .app-action {
            display: block;
        }
    `;
    document.head.appendChild(style);

    // 3. 创建结果容器，直接挂在 spotlight-bar 下面以支持 flex 布局
    const resultsBox = document.createElement('div');
    resultsBox.className = 'spotlight-results';
    spotBar.appendChild(resultsBox);

    // 4. 打开应用逻辑
    function launchApp(appName, appIcon) {
        // 关闭并重置 Spotlight
        resetSpotlight();

        const dockItem = document.querySelector(`.dock-item[data-name="${appName}"]`);
        if (dockItem) {
            dockItem.click();
        } else {
            if (typeof showAppError === 'function') {
                showAppError({
                    name: appName,
                    icon: `./assets/icons/${appIcon}`
                });
            }
        }
    }

    // 5. 渲染搜索结果
    let selectedIndex = -1;
    function renderResults(matches) {
        resultsBox.innerHTML = '';
        selectedIndex = -1;

        if (matches.length === 0) {
            const el = document.createElement('div');
            el.className = 'spotlight-result-item';
            el.innerHTML = `<span style="opacity:.5">未找到相关应用</span>`;
            resultsBox.appendChild(el);
            resultsBox.classList.add('on');
            return;
        }

        matches.forEach((app, index) => {
            const el = document.createElement('div');
            el.className = 'spotlight-result-item';
            el.innerHTML = `
                <img src="./assets/icons/${app.icon}" alt="${app.name}" draggable="false">
                <span class="app-name">${app.name}</span>
                <span class="app-action">打开</span>
            `;
            el.addEventListener('click', () => launchApp(app.name, app.icon));
            
            el.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelection();
            });

            resultsBox.appendChild(el);
        });
        resultsBox.classList.add('on');
    }

    function updateSelection() {
        const items = resultsBox.querySelectorAll('.spotlight-result-item');
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 6. 重置 Spotlight 状态（用于关闭或清空时）
    function resetSpotlight() {
        spotBar.classList.remove('searching');
        resultsBox.classList.remove('on');
        spotInput.value = '';
        selectedIndex = -1;
        if (spotlightOverlay) spotlightOverlay.classList.remove('on');
    }

    // 7. 监听输入事件
    spotInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        
        // 【核心】如果输入了内容，展开大窗口；如果清空，收缩回胶囊
        if (val.length > 0) {
            spotBar.classList.add('searching');
        } else {
            spotBar.classList.remove('searching');
            resultsBox.classList.remove('on');
            return;
        }

        const matches = allApps.filter(app => 
            app.name.toLowerCase().includes(val)
        );

        renderResults(matches);
    });

    // 8. 键盘操作支持
    spotInput.addEventListener('keydown', (e) => {
        const items = resultsBox.querySelectorAll('.spotlight-result-item');
        const hasResults = resultsBox.classList.contains('on') && items.length > 0 && !items[0].textContent.includes('未找到');

        if (e.key === 'Escape') {
            resetSpotlight();
            return;
        }

        if (!hasResults) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
            items[targetIndex].click();
        }
    });

    // 9. 关闭 Spotlight（点击遮罩层）
    if (spotlightOverlay) {
        spotlightOverlay.addEventListener('click', (e) => {
            if (!e.target.closest('.spotlight-bar')) {
                resetSpotlight();
            }
        });
    }

})();
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
