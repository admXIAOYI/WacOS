(function() {
    'use strict';

    /* ==========================================
       1. 注入 Safari 窗口及 Dock 隐藏的 CSS
       ========================================== */
    const style = document.createElement('style');
    style.textContent = `
        .safari-window {
            position: fixed; top: 100px; left: 150px;
            width: 900px; height: 600px;
            background: #fff;
            border-radius: 25px;
            box-shadow: 0 24px 60px rgba(0,0,0,.42), 0 0 0 1px rgba(0,0,0,.1);
            display: flex; flex-direction: column;
            z-index: 2000;
            overflow: hidden;
            
            transition: 
                opacity 0.25s ease, 
                transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
                width 0.3s ease,
                height 0.3s ease,
                top 0.3s ease,
                left 0.3s ease,
                border-radius 0.3s ease;
            
            opacity: 0; pointer-events: none;
            transform: scale(0.95);
        }
        .safari-window.on {
            opacity: 1; pointer-events: auto; transform: scale(1);
        }
        .safari-window.minimized { pointer-events: none; }
        
        /* 最大化状态 */
        .safari-window.maximized {
            top: 30px !important;
            left: 0 !important;
            width: 100vw !important;
            height: calc(100vh - 30px) !important;
            border-radius: 0;
        }

        /* Dock 自动隐藏机制 */
        .dockcontainer.auto-hidden {
            transform: translateY(100px);
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .dockcontainer.auto-hidden.show {
            transform: translateY(0);
        }

        /* 底部的透明触发热区 */
        .dock-hotzone {
            position: fixed;
            bottom: 0; left: 0;
            width: 100vw; height: 8px;
            z-index: 2001;
            display: none;
        }
        .dock-hotzone.on { display: block; }

        /* 顶部标题栏 */
        .safari-titlebar {
            height: 52px;
            background: #f2f2f2;
            border-bottom: 1px solid #d1d1d1;
            display: flex; align-items: center;
            padding: 0 16px;
            cursor: grab;
            user-select: none; -webkit-user-select: none;
            gap: 16px;
        }
        .safari-titlebar:active { cursor: grabbing; }
        .safari-window.maximized .safari-titlebar { cursor: default; }

        .safari-nav-left { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
        .safari-traffic { display: flex; gap: 8px; }
        .safari-traffic span { width: 12px; height: 12px; border-radius: 50%; cursor: default; position: relative; }
        .safari-traffic .close { background: #ff5f57; cursor: pointer; }
        .safari-traffic .min   { background: #febc2e; cursor: pointer; }
        .safari-traffic .max   { background: #28c840; cursor: pointer; }

        .nav-btn {
            border: none; background: transparent; cursor: pointer;
            color: #555; display: flex; align-items: center; justify-content: center;
            border-radius: 10px; transition: background 0.15s; padding: 4px;
        }
        .nav-btn:hover { background: rgba(0,0,0,0.06); }
        .nav-btn:active { background: rgba(0,0,0,0.12); }
        .nav-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .safari-nav-center { flex: 1; display: flex; justify-content: center; max-width: 540px; margin: 0 auto; }
        .safari-url-bar {
            display: flex; align-items: center; width: 100%; height: 32px; padding: 0 8px;
            background: rgba(0, 0, 0, 0.05); border-radius: 20px; transition: background 0.2s, box-shadow 0.2s;
        }
        .safari-url-bar:focus-within { background: #fff; box-shadow: 0 0 0 2px #0a84ff; }
        .safari-url-bar .url-icon { display: flex; align-items: center; margin-right: 6px; opacity: 0.4; }
        .safari-url-bar .url-icon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; }
        
        .safari-url {
            flex: 1; background: transparent; border: none; outline: none;
            text-align: center; font-size: 13px; color: #333; font-family: inherit; transition: text-align 0.2s;
        }
        .safari-url:focus { text-align: left; }
        
        .safari-nav-right { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
        .safari-content { flex: 1; background: #fff; position: relative; }
        .safari-content iframe { width: 100%; height: 100%; border: none; }
    `;
    document.head.appendChild(style);


    /* ==========================================
       2. 动态生成 DOM
       ========================================== */
    const hotzone = document.createElement('div');
    hotzone.className = 'dock-hotzone';
    document.body.appendChild(hotzone);

    const safariWin = document.createElement('div');
    safariWin.className = 'safari-window';
    safariWin.innerHTML = `
        <div class="safari-titlebar" id="safariTitlebar">
            <div class="safari-nav-left">
                <div class="safari-traffic">
                    <span class="close" id="safariClose"></span>
                    <span class="min" id="safariMinimize"></span>
                    <span class="max" id="safariMaximize"></span>
                </div>
                <button class="nav-btn" title="侧边栏">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </button>
                <button class="nav-btn" id="safariBack" title="后退">
                    <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button class="nav-btn" id="safariForward" title="前进">
                    <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>

            <div class="safari-nav-center">
                <div class="safari-url-bar">
                    <span class="url-icon">
                        <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type="text" class="safari-url" id="safariUrl" value="https://www.bing.com" spellcheck="false">
                    <button class="nav-btn" id="safariRefresh" title="刷新">
                        <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.4 2.6L21 8"/><path d="M21 3v5h-5"/></svg>
                    </button>
                </div>
            </div>

            <div class="safari-nav-right">
                <button class="nav-btn" title="下载">
                    <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                <button class="nav-btn" title="分享">
                    <svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </button>
                <button class="nav-btn" title="新建标签页">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
            </div>
        </div>
        <div class="safari-content">
            <!-- 移除了 sandbox，允许内部自由跳转 -->
            <iframe id="safariIframe" src="https://www.bing.com"></iframe>
        </div>
    `;
    document.body.appendChild(safariWin);

    const safariIframe = document.getElementById('safariIframe');
    const safariUrlInput = document.getElementById('safariUrl');
    const safariTitlebar = document.getElementById('safariTitlebar');
    
    const safariClose = document.getElementById('safariClose');
    const safariMinimize = document.getElementById('safariMinimize');
    const safariMaximize = document.getElementById('safariMaximize');
    const dockContainerEl = document.querySelector('.dockcontainer'); 


    /* ==========================================
       3. 网页控制逻辑
       ========================================== */
    function loadUrl(url) {
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        safariUrlInput.value = url;
        safariIframe.src = url;
    }
    safariUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loadUrl(safariUrlInput.value.trim());
            safariUrlInput.blur();
        }
    });
    document.getElementById('safariRefresh').addEventListener('click', () => safariIframe.src = safariIframe.src);
    document.getElementById('safariBack').addEventListener('click', () => { try { safariIframe.contentWindow.history.back(); } catch (e) {} });
    document.getElementById('safariForward').addEventListener('click', () => { try { safariIframe.contentWindow.history.forward(); } catch (e) {} });


    /* ==========================================
       4. 窗口状态与交互逻辑
       ========================================== */
    let isMinimized = false;
    let isMaximized = false;
    let preMaxRect = null;

    function toggleDockLight(isOn) {
        const dockItem = document.querySelector('.dock-item[data-name="Safari 浏览器"]');
        if (dockItem) {
            const light = dockItem.querySelector('.light');
            if (light) isOn ? light.classList.add('on') : light.classList.remove('on');
        }
    }

    function openSafari() {
        if (safariWin.classList.contains('on')) return;
        safariWin.classList.add('on');
        if (safariWin.offsetLeft < 0 || safariWin.offsetTop < 30) {
            safariWin.style.left = '150px';
            safariWin.style.top = '100px';
        }
        toggleDockLight(true);
    }

    function resetDockState() {
        if (dockContainerEl) dockContainerEl.classList.remove('auto-hidden', 'show');
        hotzone.classList.remove('on');
    }

    function closeSafari() {
        safariWin.classList.remove('on', 'maximized');
        isMinimized = false;
        isMaximized = false;
        safariWin.style.transform = ''; 
        toggleDockLight(false);
        resetDockState();
    }

    function minimizeSafari() {
        if (isMinimized) return;
        
        const dockItem = document.querySelector('.dock-item[data-name="Safari 浏览器"]');
        if (!dockItem) return;
        
        const dockRect = dockItem.getBoundingClientRect();
        const winRect = safariWin.getBoundingClientRect();
        
        const dx = (dockRect.left + dockRect.width / 2) - (winRect.left + winRect.width / 2);
        const dy = (dockRect.top + dockRect.height / 2) - (winRect.top + winRect.height / 2);
        
        safariWin.style.transform = `translate(${dx}px, ${dy}px) scale(0.05)`;
        safariWin.style.opacity = '0';
        safariWin.classList.add('minimized');
        isMinimized = true;

        if (isMaximized) resetDockState();
    }

    function restoreSafari() {
        if (!isMinimized) return;
        safariWin.classList.remove('minimized');
        safariWin.style.transform = ''; 
        safariWin.style.opacity = '1';
        isMinimized = false;
    }

    function toggleMaximize() {
        if (isMinimized) restoreSafari();

        if (isMaximized) {
            isMaximized = false;
            safariWin.classList.remove('maximized');
            if (preMaxRect) {
                safariWin.style.left = preMaxRect.left + 'px';
                safariWin.style.top = preMaxRect.top + 'px';
                safariWin.style.width = preMaxRect.width + 'px';
                safariWin.style.height = preMaxRect.height + 'px';
            }
            resetDockState();
        } else {
            isMaximized = true;
            const rect = safariWin.getBoundingClientRect();
            preMaxRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
            
            safariWin.style.left = '';
            safariWin.style.top = '';
            safariWin.style.width = '';
            safariWin.style.height = '';
            safariWin.classList.add('maximized');

            if (dockContainerEl) {
                dockContainerEl.classList.add('auto-hidden');
                dockContainerEl.classList.remove('show');
                hotzone.classList.add('on');
            }
        }
    }

    safariClose.addEventListener('pointerdown', (e) => { e.stopPropagation(); closeSafari(); });
    safariMinimize.addEventListener('pointerdown', (e) => { e.stopPropagation(); minimizeSafari(); });
    safariMaximize.addEventListener('pointerdown', (e) => { e.stopPropagation(); toggleMaximize(); });

    safariTitlebar.addEventListener('dblclick', (e) => {
        if (e.target.closest('.traffic') || e.target.closest('.nav-btn') || e.target.closest('input')) return;
        toggleMaximize();
    });


    /* ==========================================
       5. 拦截 Dock 栏点击与底部热区交互
       ========================================== */
    const dockWrap = document.getElementById('dockWrap');
    const dockContainer = document.querySelector('.dock');

    if (dockWrap && dockContainer) {
        hotzone.addEventListener('pointerenter', () => {
            if (isMaximized && dockContainerEl) dockContainerEl.classList.add('show');
        });

        dockContainerEl.addEventListener('pointerleave', () => {
            if (isMaximized) dockContainerEl.classList.remove('show');
        });

        dockWrap.addEventListener('click', (e) => {
            const item = e.target.closest('.dock-item');
            if (item && item.dataset.name === 'Safari 浏览器') {
                e.stopPropagation();
                e.preventDefault();
                
                const img = item.querySelector('img');
                if (img) {
                    img.classList.remove('opening');
                    void img.offsetWidth;
                    img.classList.add('opening');
                }
                
                if (isMinimized) {
                    restoreSafari();
                } else if (!safariWin.classList.contains('on')) {
                    openSafari();
                }
            }
        }, true); 
    }


    /* ==========================================
       6. 窗口拖拽逻辑
       ========================================== */
    let dragging = false;
    let dragStartX = 0, dragStartY = 0;
    let winStartX = 0, winStartY = 0;

    safariTitlebar.addEventListener('pointerdown', e => {
        if (isMaximized) return;
        if (e.target.closest('.traffic') || e.target.closest('.nav-btn') || e.target.closest('input')) return;
        if (e.button !== 0) return;

        e.preventDefault();
        dragging = true;
        
        winStartX = safariWin.offsetLeft;
        winStartY = safariWin.offsetTop;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        safariTitlebar.setPointerCapture(e.pointerId);
    });

    safariTitlebar.addEventListener('pointermove', e => {
        if (!dragging) return;
        let nx = winStartX + (e.clientX - dragStartX);
        let ny = winStartY + (e.clientY - dragStartY);
        
        const topbar = document.querySelector('.topbar');
        const topbarHeight = topbar ? topbar.offsetHeight : 30;
        ny = Math.max(topbarHeight, ny); 
        
        safariWin.style.left = nx + 'px';
        safariWin.style.top  = ny + 'px';
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        safariTitlebar.releasePointerCapture(e.pointerId);
    }
    safariTitlebar.addEventListener('pointerup', endDrag);
    safariTitlebar.addEventListener('pointercancel', endDrag);


    /* ==========================================
       7. 拦截 Launchpad 里的 Safari 点击
       ========================================== */
    document.addEventListener('click', (e) => {
        const appEl = e.target.closest('.lp-app');
        if (appEl && appEl.dataset.name && appEl.dataset.name.includes('safari')) {
            e.stopPropagation();
            e.preventDefault();
            
            // 手动关闭 Launchpad
            const lpOverlay = document.querySelector('.lp-overlay');
            const lpWin = document.querySelector('.launchpad');
            if (lpOverlay) lpOverlay.classList.remove('on');
            if (lpWin) lpWin.classList.remove('on');
            
            // 打开 Safari
            openSafari();
        }
    }, true); 

})();