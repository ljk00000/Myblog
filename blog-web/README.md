# Myblog 公开前台

Nuxt **4.5.0**、Vue、TypeScript、Node **24.14.0**、pnpm **10.32.1**。这是独立 SSR 应用，接口以 `../script/blog/CONTRACT.md` 为准。提供可选的托管站长登录，公开内容仍无需登录；没有 Nuxt Content、CMS、演示内容或访客统计。

## 本地运行

在本目录运行（Windows PowerShell）：

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm dev --port 3000
```

开发模式默认只监听 `127.0.0.1`；局域网调试可显式加 `--host 0.0.0.0`。

生产运行：

```powershell
$env:NUXT_API_BASE = 'http://127.0.0.1:48080/app-api/blog'
$env:HOST = '0.0.0.0'
$env:PORT = '3000'
pnpm start
```

公开内容读取不需要 `.env`、访问令牌或私密配置。可选站长登录只需要 [AUTH.md](AUTH.md) 中的三项公开配置。`NUXT_API_BASE` 是服务端环境变量，不能使用 `NUXT_PUBLIC_` 前缀；默认值已在 `nuxt.config.ts` 中定义。修改该环境变量后需重启 Node 进程。站点标题、描述、作者、关于正文、社交链接、规范网址和页脚从 Java `/site/get` 逐请求获取；客户端路由变化也刷新站点设置。它们不需要重启前台。

## 路由与交互

| 路由 | 内容 |
| --- | --- |
| `/` | 接口排序的最新文章、精选资源 |
| `/articles` | 分类、标签、关键词、月份筛选，分页 |
| `/articles/[slug]` | SSR 正文、目录锚点、代码复制、图片与标签 |
| `/resources` | 分类、链接/文件类型、关键词筛选，分页 |
| `/resources/[slug]` | SSR 说明、目录、有效资源链接 |
| `/archives` | 月度归档，链接到对应月份文章 |
| `/tech-stack` | 前后端技术清单、完整应用与 Pages 架构图，支持桌面和手机 |
| `/about` | Java 渲染的关于正文及真实站点资料 |
| `/search?q=关键词` | 并行搜索文章和资源，两个结果区独立分页，`noindex` |
| `/login` | 可选站长登录、身份状态与退出，`noindex`；配置见 [AUTH.md](AUTH.md) |
| `/sitemap.xml` | 六个静态页面 + Java 返回的已公开详情，兼容字符串/数组日期 |
| `/robots.txt` | 当前站点 sitemap 地址；禁止抓取搜索与代理接口 |

文章列表 query：`categoryId`、`tagId`、`keyword`、`yearMonth`、`page`。资源列表 query：`categoryId`、`type`、`keyword`、`page`。搜索结果分页使用 `articlePage` / `resourcePage`。无匹配结果和未发布内容有明确空状态，后端错误有重试入口，缺失详情和未知页面返回真实 HTTP 404。

正文使用后端 `contentHtml` / `aboutHtml`，直接参与服务端 HTML 渲染；前台不处理原始 Markdown。Java 必须先执行 CommonMark + Jsoup 净化，并生成与 `toc` 一致的标题 ID。代码复制需要浏览器安全上下文（HTTPS 或 localhost），失败会通过可访问提示说明可手动复制。

## 代理与缓存边界

浏览器和 SSR 的数据读取仅使用同源 `/api/blog/...`。代理返回解包后的 `CommonResult.data`，Java 的 `code != 0` 转为 HTTP 错误；404 保留为 HTTP 404，非 HTTP 业务错误与异常响应转为 502。上游原始异常内容不会展示给访客。

- 仅允许合同中的九个公开业务 path 和 GET；其他 path 为 404，非 GET 为 405。
- 按 path 显式校验 query；未知字段、重复字段、非法 ID/布尔值/slug/月格式均为 400。
- 分页默认 `pageNo=1,pageSize=12`，`pageSize` 必须为 1–100；无无限分页。
- 不接受上游 URL 参数，不跟随上游重定向；10 秒超时，不自动重试。
- 构造全新上游请求，只设置 `Accept: application/json`，不复制 Authorization、tenant-id、visit-tenant-id、Cookie 等访客头。
- 不持久缓存 HTML、站点设置或接口；动态响应 `Cache-Control: no-store`。
- sitemap 只接收 `/articles/<slug>` 与 `/resources/<slug>` 的详情路径，不包含搜索、query 或外部 URL。

权限、固定公开租户、状态/发布时间过滤和 DTO 白名单由 Java 公开接口保障；前台不会通过拉取管理接口补内容，也不会对失败请求生成假数据。

## 容器集成

构建上下文必须是 `blog-web/`：

```powershell
docker build -t myblog-web .
docker run --rm -p 3000:3000 -e NUXT_API_BASE=http://gateway:48080/app-api/blog --network YOUR_EXISTING_NETWORK myblog-web
```

`Dockerfile` 使用 Node 24 多阶段构建，冻结 lock 安装，构建阶段执行类型检查与生产构建，运行阶段仅复制 `.output` 并以 `node` 用户启动。`.dockerignore` 排除 `.env*`、依赖、缓存和本地产物。

集成方需要：

1. 网关路由 `/app-api/blog/**` 到博客 Java 服务，保证匿名公开接口按合同固定站点租户。
2. 容器设置 `NUXT_API_BASE=http://gateway:48080/app-api/blog` 并接入相同网络。`HOST=0.0.0.0` / `PORT=3000` 已在镜像中设置。
3. 在站点管理设置真实 `siteUrl`（绝对 HTTP(S)、无末尾斜杠）；canonical、OG、sitemap 和 robots 使用该值，不使用假域名。
4. HTTPS 反向代理将公开站点交给 Nuxt，不覆盖真实 404，不在边缘永久缓存动态 HTML/API。
5. 封面、头像、正文图片与资源链接由后端提供浏览器可达的 HTTP(S) 或项目根路径。若使用附件根路径，应在入口配置相应附件路由；本应用不会将任意文件 URL 加入博客 API 代理。

## GitHub Pages 静态发布

Pages 版本是公开内容的构建时快照，浏览器不连接本机 Java 或 Nuxt API。原 `pnpm build` / Docker 仍使用动态 SSR；静态导出不会修改数据库中的站点网址。后台新增、修改或下架内容后，需要重新导出并发布，已发布的静态内容才会更新。

保持本地博客服务可用，在本目录执行：

```powershell
$env:PAGES_SITE_URL = 'https://ljk00000.github.io'
# 可选；默认即为本机网关的匿名公开博客接口
$env:PAGES_API_BASE = 'http://127.0.0.1:48080/app-api/blog'
pnpm export:pages
```

该命令只读取匿名公开接口，执行静态模式类型检查和页面预渲染，输出 `.pages-output/`。上传时仅发布这个目录的内容，包含 `.nojekyll`、404 页、公开 JSON 快照、sitemap、robots 和许可证；不要上传源码、环境文件、数据库或服务器产物。此目录及中间快照均已加入忽略规则，导出结束会清理 `public/` 中的临时文件。

静态版本保留客户端搜索、分类、标签、月份、类型筛选与分页，搜索范围为公开标题、摘要和渲染后的正文。所有已公开详情都会生成独立 HTML，刷新详情页不依赖 SPA 回退。封面、头像、正文图片和资源目标须可从公网访问；导出会拒绝实际链接中的本机地址，以及未配置公网入口的相对图片路径。

现有 `ljk00000.github.io` 仓库继续只保存公开网页产物；源码在公开主仓库 `Myblog` 的 `main` 开发。只有确认过的公开内容会随网页快照公开。站长登录直接连接配置的 Supabase Auth 服务，使用独立账号，无需向公网暴露本机后台；启用步骤见 [站长登录配置](AUTH.md)。

静态模式已用隔离公开接口数据验证 26 个详情预渲染、32 个响应式页面组合、分类/标签/月份/类型筛选、两类列表分页、直接打开搜索链接与独立搜索分页、代码复制、目录、无 JavaScript 正文和真实 HTTP 404。正式空快照另验证 24 个响应式页面组合，浏览器无本机 API 请求或 hydration 错误；测试内容未进入正式产物。

## 验收现状与边界

已执行冻结依赖安装、`pnpm typecheck` 和 `pnpm build`，Docker 构建阶段也执行同样的安装、类型检查与生产构建。独立合同 fixture 覆盖 SSR 原始正文、八类路由、SEO/404、代理拒绝非法请求、身份头隔离、sitemap/robots、站点即时刷新、错误和空状态；另检查了 1440/768/390/320px 宽度、移动导航、筛选分页、代码复制、键盘焦点与 reduced-motion。临时工具和 fixture 不在应用源码中。

实际 Java、网关与 Nuxt 容器联调已验证管理保存/发布/下架后的公开结果、服务器 Markdown 净化、附件读取、受限角色权限、跨租户隔离、站点设置即时生效及搜索 noindex。3000 端口的原始 SSR HTML、真实 HTTP 404、sitemap/robots、390px 页面布局和移动导航通过，未发现页面异常或 hydration 错误。验收使用的临时内容、账号、角色及文件已清理。

未配置真实个人资料或正式域名时，页面显示站点默认设置和空状态。上线前应在管理后台填写真实资料，配置 HTTPS、规范站点 URL 与读者可访问的文件地址。
