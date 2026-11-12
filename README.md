# UMBRA® — A Visual Index

一个匿名的个人视觉主页：深色画布、生成式光场、超大动态字体，以及一套克制的滚动叙事。

## 特点

- 纯静态：一个 `index.html` + 一份 CSS + 两个 JS 文件，零依赖、无构建
- 生成式首屏：WebGL 噪声光场，随滚动与指针轻微变化；不支持时回退到 CSS 光斑
- 内容与代码分离：所有文案、作品、原则、日志都在 `js/config.js`
- 无追踪、无表单、无个人信息、无外部请求
- 响应式、可键盘操作、支持 `prefers-reduced-motion`

## 结构

```
index.html
css/style.css
js/config.js      内容配置
js/main.js        渲染、交互、WebGL
assets/fonts/     Instrument Serif / Geist / Geist Mono（自托管）
assets/favicon.svg
```

## 本地预览

```bash
npx serve .
```

打开终端里给出的地址即可。

## 设计说明

- 单一强调色 `#c9f24d`，其余全部交给黑白灰与留白
- 字体：Geist（无衬线）+ Instrument Serif Italic（强调词）+ Geist Mono（技术注脚）
- 动效只做三件事：出现、跟随、退出；不做无意义的循环装饰