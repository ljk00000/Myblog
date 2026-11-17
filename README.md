# Myblog

[![Java CI](https://github.com/ljk00000/Myblog/actions/workflows/maven.yml/badge.svg?branch=main)](https://github.com/ljk00000/Myblog/actions/workflows/maven.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Myblog 是一个支持文章发布和资源分享的个人博客系统，包含公开前台、内容管理后台和 Java 内容服务。公开前台支持 Nuxt SSR 与 GitHub Pages 静态发布。

[在线博客](https://ljk00000.github.io/) · [部署指南](script/docker-compose/README.md) · [开发文档](#文档导航) · [问题反馈](https://github.com/ljk00000/Myblog/issues)

## 项目预览

当前公开博客通过 GitHub Pages 发布，文章和资源允许匿名阅读。

| 页面 | 预览 |
| --- | --- |
| 首页 | [最新文章与精选资源](https://ljk00000.github.io/) |
| 文章 | [文章列表与筛选](https://ljk00000.github.io/articles/) |
| 资源 | [链接与文件资源](https://ljk00000.github.io/resources/) |
| 技术栈 | [技术清单与系统架构](https://ljk00000.github.io/tech-stack/) |

内容管理后台随完整应用部署，启动后通过 `http://127.0.0.1:8080` 访问。

## 功能特性

- **文章阅读**：分类、标签、关键词和月份筛选，搜索、归档、分页、标题目录、代码复制与阅读进度。
- **资源分享**：发布链接或文件资源，支持分类、类型筛选、精选推荐与独立详情页。
- **内容管理**：Markdown 编辑与服务端预览，维护摘要、封面和 SEO 信息，支持草稿、发布、编辑与下架。
- **媒体与站点**：上传图片和附件，设置博客标题、作者、关于页、社交链接及页脚。
- **账号与运维**：管理员账号、角色权限、登录与操作日志，以及文件存储、参数、代码生成等开发工具。
- **页面与发布**：响应式布局、SSR 正文、独立页面地址、真实 404、canonical、Open Graph、sitemap 与静态导出。

## 技术栈

| 部分 | 主要技术 |
| --- | --- |
| 公开前台 | Nuxt 4、Vue 3、TypeScript |
| 管理后台 | Vue 3、Element Plus、Vite |
| Java 服务 | JDK 25、Spring Boot 4、Spring Cloud Gateway、Spring Cloud Alibaba、MyBatis-Plus |
| 数据与服务治理 | MySQL 8、Redis 7、Nacos 3 |
| 内容处理 | CommonMark、Jsoup |
| 构建与部署 | Maven、pnpm、Docker Compose、Nginx、GitHub Pages |
| 可选前台登录 | Supabase Auth，仅用于站长身份验证 |

## 快速开始

完整应用使用 JDK 25、Maven 3.9、Node.js 24 和 pnpm 10；两套前端的包管理器版本以各自的 `package.json` 为准。Docker Compose 要求 V2.20.2 或以上，编排包含 MySQL、Redis 和可选的内置 Nacos。

```shell
git clone git@github.com:ljk00000/Myblog.git
cd Myblog
```

首次启动按以下顺序进行：

1. 按[部署指南](script/docker-compose/README.md)准备环境，从 `script/docker-compose/.env.example` 创建本机 `.env`，设置数据库、Redis、Nacos 及数据卷参数。
2. 先启动 MySQL 等基础组件，确认上游数据库初始化完成，再按[博客安装说明](script/blog/README.md#数据库安装)依次应用后台导航、博客表结构和内容菜单迁移。
3. 按部署指南构建 Java 服务和管理后台，将后台产物放入 Nginx 挂载目录，再通过 Compose 构建并启动完整应用。
4. 登录管理后台，填写站点资料，创建分类、标签、文章或资源，并检查公开前台的展示结果。

| 入口 | 默认本机地址 |
| --- | --- |
| 公开前台 | <http://127.0.0.1:3000> |
| 管理后台 | <http://127.0.0.1:8080> |
| API 网关 | <http://127.0.0.1:48080> |
| Nacos 控制台 | <http://127.0.0.1:18080> |

已有部署升级时，按[部署指南的环境配置说明](script/docker-compose/README.md#3-配置环境变量)复用原数据卷、连接参数和账号；保留现有业务库，并处理包名更新后的派生缓存。

## 部署与发布

| 模式 | 运行方式 | 内容更新 |
| --- | --- | --- |
| Nuxt SSR | Nuxt 在访问时调用 Java 公开 API，需要后端与数据库等服务运行 | 保存已发布内容后，后续请求读取新版本 |
| GitHub Pages | 构建时读取匿名公开 API，发布 HTML、静态资源和公开 JSON 快照；读者访问时由 Pages 提供内容 | 后台更新后重新导出并发布，公网页面才会更新 |

完整应用的启动、升级与回滚见 [Docker Compose 部署指南](script/docker-compose/README.md)。GitHub Pages 的导出、检查和发布见[前台静态发布说明](blog-web/README.md#github-pages-静态发布)。静态导出后，如需验证或部署动态 SSR，应重新执行普通 `pnpm build`。

源码由 [Myblog](https://github.com/ljk00000/Myblog) 仓库维护，静态产物发布到 [ljk00000.github.io](https://github.com/ljk00000/ljk00000.github.io) 仓库。提交源码与发布网站产物分别进行。

## 项目结构

| 目录 | 职责 |
| --- | --- |
| `blog-web` | 公开博客，包含 SSR 页面与 Pages 静态导出 |
| `frontend` | 内容管理后台 |
| `myblog-module-blog` | 内容、发布、Markdown 渲染与公开 API |
| `myblog-gateway` | API 网关 |
| `myblog-module-system` | 登录、账号、角色权限与系统日志 |
| `myblog-module-infra` | 文件存储、参数、代码生成与 API 日志 |
| `myblog-framework` / `myblog-dependencies` | 公共框架与 Maven 依赖管理 |
| `script` | 部署编排、博客迁移、接口约定与开发示例 |
| `sql` | 上游数据库初始化脚本 |

## 常见问题

### 在哪里写文章、管理资源？

完整应用启动后，访问管理后台，使用现有租户名称、管理员账号和密码登录。文章、资源、分类、标签和站点设置都在“博客内容”中管理。后台构建默认不填入账号、密码或租户名称，实际账号沿用数据库中的配置。

### 需要配置 Supabase 吗？

阅读博客和管理内容使用现有服务即可。开启公开前台的“站长登录”时才配置 Supabase Auth；该登录目前用于显示站长身份，内容管理仍使用 Java 管理后台账号。配置步骤见[站长登录说明](blog-web/AUTH.md)。

### 为什么后台修改后，GitHub Pages 没有更新？

Pages 展示导出时的内容快照。新增、修改或下架内容后，需要[重新导出并发布](blog-web/README.md#github-pages-静态发布)；推送源码到 `Myblog` 仓库不会自动更新静态产物。

## 文档导航

| 文档 | 内容 |
| --- | --- |
| [公开前台](blog-web/README.md) | 本地开发、路由、SSR、API 代理与静态发布 |
| [管理后台](frontend/README.md) | 内容管理入口、开发、构建与检查 |
| [部署指南](script/docker-compose/README.md) | 环境变量、构建、服务启动、升级与数据卷 |
| [博客安装与维护](script/blog/README.md) | 数据库迁移、内容发布、权限与回滚 |
| [接口约定](script/blog/CONTRACT.md) | Java、公开前台与管理后台共用的 API/DTO 合同 |
| [站长登录配置](blog-web/AUTH.md) | 可选 Supabase 登录的配置与验证 |
| [后台底座与迁移记录](script/blog-admin/README.md) | 导航迁移、恢复方法、已有问题与历史验收记录 |
| [开发约定](AGENTS.md) | 主仓库、分支、提交同步和修改验证要求 |

## 来源与许可证

后端来源：芋道 Cloud（`YunaiV/yudao-cloud`），基线提交 `422a95bdbe0e033b03a328efbe690e33f0eb8067`。

前端来源：芋道 Vue 3 管理后台（`yudaocode/yudao-ui-admin-vue3`），基线提交 `c67f134`。

保留原项目 MIT 许可证及必要版权声明，详见根目录 [LICENSE](LICENSE) 和[前端许可证](frontend/LICENSE)。当前项目作为独立开源仓库维护，未使用 GitHub fork。
