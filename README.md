## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
=======
# 物流可视化大屏 (Logistics Visualization Dashboard)

## 项目介绍
基于Vue + ECharts开发的物流/电商订单可视化大屏，展示不同商品全国订单分布、产品销量趋势、买家画像（年龄/性别）、运输方式占比等核心数据，点击产品切换详情。

## 技术栈
- 前端框架：Vue 3 (Setup语法糖)
- 可视化库：ECharts 5.x
- 地图数据：中国省级GeoJSON
- 网络请求：Axios（封装为request工具）
- 样式：原生CSS (Scoped)
- 后端：Python Fastapi

## 演示截图
![物流可视化大屏全貌](screenshots/显示图片.png)

## 快速开始

### 1. 环境要求
- Node.js >= 16.x
- npm/yarn/pnpm

### 2. 安装依赖
```bash
# 克隆仓库（替换为你的仓库地址）
git clone https://github.com/fudian/logistics-visualization-dashboard.git

# 进入项目目录
cd logistics-visualization-dashboard

# 安装依赖
npm install
