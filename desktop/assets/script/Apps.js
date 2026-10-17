(function() {
    'use strict';

    /* ==========================================
       1. 注入 Launchpad 所需的 CSS
       ========================================== */
    const style = document.createElement('style');
    style.textContent = `
        /* 背景遮罩层（用于点击关闭） */
        .lp-overlay {
            position: fixed; inset: 0; z-index: 19999;
            background: rgba(0, 0, 0, 0.2);
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
        }
        .lp-overlay.on { opacity: 1; pointer-events: auto; }

        /* 主体窗口 */
        .launchpad {
            position: fixed; top: 45%; left: 50%; z-index: 20000;
            width: 580px; height: 450px;
            background: rgba(108, 109, 110, 0.26);
            -webkit-backdrop-filter: blur(10px) saturate(1.7);
            backdrop-filter: blur(8px) saturate(1.7);
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 30px;
            box-shadow: 0 24px 60px rgba(0,0,0,.42), 0 0 1px rgba(0,0,0,.5);
            display: flex; flex-direction: column;
            color: #fff; overflow: hidden;
            
            /* 居中与缩放动画 */
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 0; pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
            
            user-select: none; -webkit-user-select: none;
        }
        .launchpad.on {
            opacity: 1; pointer-events: auto;
            transform: translate(-50%, -50%) scale(1);
        }
        
        /* 顶部搜索栏容器 */
        .lp-search-container {
            position: absolute;
            top: 0; left: 0; width: 100%;
            display: flex; justify-content: center; flex: 0 0 auto;
            padding: 16px 20px 12px;
            z-index: 10;
        }
        /* 搜索框 */
        .lp-search {
            display: flex; align-items: center; gap: 8px;
            width: 570px; height: 36px; padding: 0 14px;
            background: rgba(255, 255, 255, 0.65);
            -webkit-backdrop-filter: blur(16px) saturate(1.2);
            backdrop-filter: blur(16px) saturate(1.2);
            border-radius: 1200px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: background 0.2s;
        }
        .lp-search:focus-within {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }
        .lp-search svg {
            width: 15px; height: 15px; opacity: 0.4; color: #333;
        }
        .lp-search input {
            flex: 1; background: transparent; border: none; outline: none;
            color: #1c1c1e;
            font-size: 13.5px; font-family: inherit;
        }
        .lp-search input::placeholder { color: rgba(0, 0, 0, 0.4); }

        /* 滚动区域与顶部淡出遮罩 */
        .lp-content {
            flex: 1; overflow-y: auto; overflow-x: hidden;
            padding: 64px 20px 20px;
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 35px, black 75px);
            mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 35px, black 75px);
        }
        .lp-content::-webkit-scrollbar { width: 5px; }
        .lp-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        
        .lp-section { margin-bottom: 24px; }
        .lp-section-header {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 12px; font-size: 13px; font-weight: 600;
            padding: 0 2px; color: #fff;
        }
        .lp-show-more {
            font-size: 11px; color: rgba(255,255,255,0.6); cursor: pointer;
        }
        .lp-show-more:hover { color: #fff; }

        /* 每行 4 个图标 */
        .lp-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px 4px;
        }

        /* 应用项 */
        .lp-app {
            display: flex; flex-direction: column; align-items: center;
            cursor: pointer; gap: 6px; transition: transform 0.1s;
        }
        .lp-app:active { transform: scale(0.9); }
        .lp-app-img {
            width: 64px; height: 64px; border-radius: 14px;
            object-fit: cover;
            box-shadow: none;
            pointer-events: none;
            -webkit-user-drag: none;
        }
        .lp-app-name {
            font-size: 12px;
            color: #fff; text-align: center;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            max-width: 100px;
            pointer-events: none; font-weight: 400;
        }
    `;
    document.head.appendChild(style);


    /* ==========================================
       2. 数据定义
       ========================================== */
    const SYS_SETTINGS = { name: 'System Settings', icon: 'System Settings.png' };
    const GAMES = { name: 'Games', icon: 'xboxpcapp.png' };
    const APP_STORE = { name: 'App Store', icon: 'winstore.app.png' };

    const appData = [
        {
            title: 'Suggestions',
            apps: [ SYS_SETTINGS, GAMES, APP_STORE ]
        },
        {
            title: 'Productivity & Finance',
            apps: [
                { name: 'Calendar', icon: 'Calendar.png' },
                { name: 'Contacts', icon: 'Contacts.png' },
                { name: 'Preview', icon: 'Preview.png' },
                { name: 'Time Machine', icon: 'Time-Machine.png' },
                { name: 'Books', icon: 'Books.png' },
                { name: 'Keynote', icon: 'Keynote.png' },
                { name: 'Pages', icon: 'Pages.png' },
                { name: 'Numbers', icon: 'Numbers.png' },
                { name: 'Notes', icon: 'Notes.png' },
                { name: 'Reminders', icon: 'Reminders.png' },
                { name: 'Find My', icon: 'Find My.png' }
            ]
        },
        {
            title: 'Utilities',
            apps: [
                { name: 'Calculator', icon: 'Calculator.png' },
                { name: 'Clock', icon: 'Clock.png' },
                { name: 'Passwords', icon: 'Passwords.png' },
                { name: 'Terminal', icon: 'Terminal.png' },
                { name: 'Measure', icon: 'Measure.png' },
                { name: 'Translate', icon: 'Translate.png' },
                { name: 'Voice Memos', icon: 'Voice Memos.png' },
                { name: 'Airdrop', icon: 'Airdrop.png' },
                { name: 'Activity Monitor', icon: 'Systemtray.png' },
                { name: 'Task Manager', icon: 'Taskmgr.png' },
                { name: 'Network', icon: 'Network.png' },
                { name: 'Notepad', icon: 'notepad.png' },
                { name: 'To Do', icon: 'todo.png' }
            ]
        },
        {
            title: 'Entertainment & Media',
            apps: [
                { name: 'Music', icon: 'applemusic.png' },
                { name: 'Apple TV', icon: 'Apple TV.png' },
                { name: 'Podcasts', icon: 'Podcasts.png' },
                { name: 'Photo Booth', icon: 'Photo Booth.png' },
                { name: 'Photos', icon: 'Photos.png' },
                { name: 'QuickTime Player', icon: 'QuickTimePlayer.png' },
                { name: 'iMovie', icon: 'iMovie.png' },
                { name: 'Final Cut Pro', icon: 'Final Cut Pro.png' },
                { name: 'Freeform', icon: 'Freeform.png' },
                { name: 'Lyricify', icon: 'Lyricify for Spotify.png' },
                { name: 'iTunes', icon: 'itunes.png' }
            ]
        },
        {
            title: 'Communication & Internet',
            apps: [
                { name: 'Mail', icon: 'Mail.png' },
                { name: 'Messages', icon: 'Messages.png' },
                { name: 'FaceTime', icon: 'FaceTime.png' },
                { name: 'Maps', icon: 'Maps.png' },
                { name: 'Phone', icon: 'Phone.png' },
                { name: 'Safari 浏览器', icon: 'Safari.png' },
                { name: 'Outlook', icon: 'olk.png' },
                { name: 'Teams', icon: 'ms-teams.png' }
            ]
        },
        {
            title: 'Others',
            apps: [
                { name: 'Camera', icon: 'Camera.png' },
                { name: 'Fitness', icon: 'Fitness.png' },
                { name: 'Health', icon: 'Health.png' },
                { name: 'Home', icon: 'Home.png' },
                { name: 'Wallet', icon: 'Wallet.png' },
                { name: 'Watch', icon: 'Watch.png' },
                { name: 'Weather', icon: 'Weather.png' },
                { name: 'Stocks', icon: 'Stocks.png' },
                { name: 'Terminal', icon: 'windowsterminal.png' }
            ]
        }
    ];


    /* ==========================================
       3. 动态生成 DOM
       ========================================== */
    // 遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'lp-overlay';
    document.body.appendChild(overlay);

    // 主窗口
    const lp = document.createElement('div');
    lp.className = 'launchpad';
    
    // ⚠️ 在这里融入了你需要的 App Store SVG 和 "Applications" 文字
    lp.innerHTML = `
        <div class="lp-search-container">
            <div class="lp-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
                </svg>
                <input type="text" id="lpSearchInput" placeholder="Applications" autocomplete="off" spellcheck="false">
            </div>
        </div>
        <div class="lp-content" id="lpContent"></div>
    `;
    document.body.appendChild(lp);

    const lpContent = document.getElementById('lpContent');
    const lpInput = document.getElementById('lpSearchInput');
    
    // 渲染网格
    function renderApps() {
        lpContent.innerHTML = '';
        appData.forEach(section => {
            const secEl = document.createElement('div');
            secEl.className = 'lp-section';
            
            let appsHTML = '';
            section.apps.forEach(app => {
                const iconUrl = `./assets/icons/${app.icon.replace(/ /g, '%20')}`;
                appsHTML += `
                    <div class="lp-app" data-name="${app.name.toLowerCase()}" data-icon="${iconUrl}">
                        <img class="lp-app-img" src="${iconUrl}" alt="${app.name}" draggable="false" onerror="this.src='./assets/icons/pad.png'">
                        <div class="lp-app-name">${app.name}</div>
                    </div>
                `;
            });

            secEl.innerHTML = `
                <div class="lp-section-header">
                    <span>${section.title}</span>
                    <span class="lp-show-more">Show More</span>
                </div>
                <div class="lp-grid">${appsHTML}</div>
            `;
            lpContent.appendChild(secEl);
        });
    }
    renderApps();


    /* ==========================================
       4. 交互逻辑
       ========================================== */
    let isLPOpen = false;
    
    function openLP() {
        isLPOpen = true;
        overlay.classList.add('on');
        lp.classList.add('on');
        lpInput.value = '';
        filterApps('');
        if (typeof closeAll === 'function') closeAll();
    }
    
    function closeLP() {
        isLPOpen = false;
        overlay.classList.remove('on');
        lp.classList.remove('on');
    }

    // 点击遮罩层关闭
    overlay.addEventListener('click', closeLP);

    // 按 Esc 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isLPOpen) closeLP();
    });

    // 拦截 Dock 上的 Apps 图标点击
    const dockWrap = document.getElementById('dockWrap');
    if (dockWrap) {
        dockWrap.addEventListener('click', (e) => {
            const item = e.target.closest('.dock-item');
            if (item && item.dataset.name === 'Apps') {
                e.stopPropagation();
                e.preventDefault();
                
                const img = item.querySelector('img');
                if (img) {
                    img.classList.remove('opening');
                    void img.offsetWidth;
                    img.classList.add('opening');
                }
                
                openLP();
            }
        }, true);
    }

    // 点击 App 图标
    lpContent.addEventListener('click', (e) => {
        const appEl = e.target.closest('.lp-app');
        if (appEl) {
            const name = appEl.querySelector('.lp-app-name').textContent;
            const icon = appEl.dataset.icon;
            
            // 1. 先关闭 Apps 资源库窗口
            closeLP();

            // 2. 再弹出应用错误提示
            if (typeof showAppError === 'function') {
                showAppError({ name, icon });
            }
        }
    });

    // 搜索过滤
    lpInput.addEventListener('input', (e) => {
        filterApps(e.target.value.trim().toLowerCase());
    });

    function filterApps(query) {
        const sections = lpContent.querySelectorAll('.lp-section');
        sections.forEach(sec => {
            let hasVisibleApp = false;
            const apps = sec.querySelectorAll('.lp-app');
            
            apps.forEach(app => {
                const name = app.dataset.name;
                if (name.includes(query)) {
                    app.style.display = 'flex';
                    hasVisibleApp = true;
                } else {
                    app.style.display = 'none';
                }
            });
            
            sec.style.display = hasVisibleApp ? 'block' : 'none';
        });
    }

})();