# logistics-visualization-dashboard
Logistics visualization dashboard based on Vue and ECharts, showing national order distribution, sales trends, user portraits, and transportation mode ratio with real-time update.
# 物流可视化大屏 (Logistics Visualization Dashboard)

## 项目介绍
基于Vue + ECharts开发的物流/电商订单可视化大屏，展示全国订单分布、产品销量趋势、买家画像（年龄/性别）、运输方式占比等核心数据，支持5秒自动更新销量数据、点击产品切换详情。

## 技术栈
- 前端框架：Vue 3 (Setup语法糖)
- 可视化库：ECharts 5.x
- 地图数据：中国省级GeoJSON
- 网络请求：Axios（封装为request工具）
- 样式：原生CSS (Scoped)

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
