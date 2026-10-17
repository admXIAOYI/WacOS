# WacOS
An Web Version of macOS Tahoe/一个macOS 的网页版

## 简介
WacOS 是一个纯前端实现的 macOS 网页版体验。完全由原生 HTML/CSS/JS 编写，零框架依赖。
实现了完整的苹果开机自检 (POST) -> 启动动画 -> 锁屏登录 -> 桌面加载逻辑，并在系统内通过 iframe 深度嵌套了一个可交互的 Safari 浏览器。

## 运行环境
- 无需 Node.js / 构建工具
- 直接双击 index.html 即可运行
- 推荐使用 Python 或 Nginx 开启本地静态服务器以获得完整功能
