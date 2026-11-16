# Myblog

基于芋道 Cloud `master-jdk25` 的个人博客，保留 JDK 25、Spring Boot 4、Spring Cloud Alibaba、Nacos 和微服务学习能力。

首版提供 Nuxt 4 SSR 公开前台与 Vue 3 管理后台，支持文章、资源分享、分类、标签、Markdown 预览、文件上传和站点设置。访客无需登录；可选的[站长登录](blog-web/AUTH.md)通过 Supabase Auth 接入，支持静态站点，不包含评论、点赞、付费或访客注册。

## 仓库与同步开发

源码主仓库：[ljk00000/Myblog](https://github.com/ljk00000/Myblog)，默认开发分支为 `main`。前台、管理后台、Java 服务、部署脚本和项目文档都在这个仓库持续开发、提交和同步。

本地 `origin` 指向主仓库，`main` 跟踪 `origin/main`。开发前先同步主分支，完成改动及相关检查后，正常提交并推送到 `origin/main`；保留现有提交历史。`upstream` 仅用于查阅上游来源。

在线博客：[ljk00000.github.io](https://ljk00000.github.io/)。[网站发布仓库](https://github.com/ljk00000/ljk00000.github.io) 只保存审核后的静态产物。前台代码或公开内容更新后，按 [前台说明](blog-web/README.md) 重新导出并同步发布；源码提交与网站产物发布分别进行。

## 项目结构

| 目录 | 用途 |
| --- | --- |
| `frontend` | Vue 3 + Element Plus 管理后台源码 |
| `blog-web` | Nuxt 4 + Vue 3 公开前台、SSR 与 SEO |
| `yudao-module-blog` | 博客内容、发布、Markdown 净化与公开 API |
| `yudao-gateway` | API 网关 |
| `yudao-module-system` | 登录鉴权、账号、角色、权限、菜单、字典和日志等系统底座 |
| `yudao-module-infra` | 文件、存储配置、参数、代码生成、数据源及 API 日志 |
| `yudao-framework` | 保留服务依赖的公共框架 |
| `yudao-dependencies` | Maven 依赖管理 |
| `script/docker-compose` | 四个 Java 服务、Nuxt、管理端 Nginx、MySQL、Redis、Nacos 部署 |
| `script/blog-admin` | 后台基础导航迁移、回滚和实施说明 |
| `script/blog` | 博客表结构、内容菜单迁移、接口合同和发布说明 |
| `sql` | 上游数据库初始化脚本；不是本次源码裁剪的数据删除脚本 |

## 已保留的后台入口

- 工作台：登录用户欢迎信息，以及按权限显示的文件、个人资料和日志入口。
- 博客内容：文章管理、资源分享、分类管理、标签管理、站点设置。
- 媒体资源：文件管理。
- 系统管理：管理员账号、角色与权限、登录日志、操作日志。
- 开发运维：菜单、字典、参数、文件存储、代码生成、数据源、API 日志、Nacos。
- 原项目资源：集中收纳 192 项原项目资源，支持搜索和分类展开。

无关企业业务源码已从当前工作树移除。为保持现有登录、鉴权及公共 API 依赖，system 内部的租户、组织、OAuth 等基础实现按依赖保留。已有数据库业务表和数据不随源码清理删除。

## 构建与部署

后端在仓库根目录执行：

```shell
mvn -B validate
mvn -B package -pl yudao-gateway,yudao-module-system/yudao-module-system-server,yudao-module-infra/yudao-module-infra-server,yudao-module-blog -am -DskipTests
```

前端在仓库根目录执行：

```shell
cd frontend
pnpm install --frozen-lockfile
cd ..
node script/blog-admin/build-frontend.cjs
```

生产构建前需核对 API 地址、租户、验证码及统计配置。本机同源 API、关闭默认账号密码和原项目统计的构建命令见 [后台实施说明](script/blog-admin/README.md)。

Nuxt 前台单独安装与构建，使用 Node 24.14.0、pnpm 10.32.1：

```shell
cd blog-web
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

公开页面包括首页、文章、资源、归档、技术栈、关于和搜索；详情使用稳定 slug。配置后台站点 URL 后生成 canonical、Open Graph 与 sitemap。首次发布由服务器记录时间，保存已发布内容立即上线。数据迁移及操作顺序见 [博客实施说明](script/blog/README.md)。

部署步骤见 [Docker Compose 说明](script/docker-compose/README.md)。本机公开前台 `http://127.0.0.1:3000`，后台 `http://127.0.0.1:8080`，网关 `http://127.0.0.1:48080`，Nacos 控制台 `http://127.0.0.1:18080`。发布到公网前应配置域名、HTTPS、公开文件地址及站点 URL，并更换体验账号密码。

首次导入上游 SQL 后依次执行 `script/blog-admin/menu.apply.sql`、`script/blog/schema.sql`、`script/blog/menu.apply.sql`，按说明刷新必要菜单缓存，再正常退出并登录。迁移不删除旧业务表、数据或原有角色授权。仅恢复菜单不能恢复已删除源码。

构建产物、依赖缓存、本机环境变量文件及认证信息不纳入源码仓库。

## 上游来源与许可证

后端来源：芋道 Cloud（`YunaiV/yudao-cloud`），基线提交 `422a95bdbe0e033b03a328efbe690e33f0eb8067`。

前端来源：芋道 Vue 3 管理后台（`yudaocode/yudao-ui-admin-vue3`），基线提交 `c67f134`。

保留原项目 MIT 许可证及必要版权声明，详见根目录 [LICENSE](LICENSE) 和[前端许可证](frontend/LICENSE)。当前项目作为独立开源仓库维护，未使用 GitHub fork。
