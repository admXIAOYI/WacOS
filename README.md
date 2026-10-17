# WacOS
An Web Version of macOS Tahoe/一个macOS 的网页版

## 简介
WacOS 是一个纯前端实现的 macOS 网页版体验。完全由原生 HTML/CSS/JS 编写，零框架依赖。
实现了完整的苹果开机自检 (POST) -> 启动动画 -> 锁屏登录 -> 桌面加载逻辑，并在系统内通过 iframe 深度嵌套了一个可交互的 Safari 浏览器。

## 运行环境
- 无需 Node.js / 构建工具
- 直接双击 index.html 即可运行
- 推荐使用 Python 或 Nginx 开启本地静态服务器以获得完整功能

## 核心模块结构
```text
WacOS/
├── index.html          # 唯一入口文件
├── core/
│   ├── boot.js         # 硬件自检与进度条动画
│   ├── login.js        # 密码校验与会话建立
│   └── window.js       # 窗口拖拽、缩放、Z-index管理
├── apps/
│   ├── finder.js       # 访达虚拟文件系统
│   └── safari.js       # 内嵌浏览器 (标签页/地址栏/历史记录)
└── style/
    ├── glass.css       # 毛玻璃与暗黑模式变量
    └── dock.css        # 底座放大动画
