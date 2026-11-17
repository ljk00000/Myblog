# 博客首版接口与实施约定

状态：2026-11-15 实施约定。公开 Nuxt 前台 + 现有 Vue 管理端 + Spring Boot/Cloud 博客服务。单站点、单人维护；没有访客账号、评论、点赞、付费或复杂统计。

## 目录边界

- `myblog-module-blog/`：独立 `blog-server`（端口 48083），遵循现有 Maven、Security、MyBatis、多租户、Feign、Nacos 约定。现阶段没有其他服务调用博客，不创建无用途的 blog-api。
- `frontend/src/api/blog/`、`frontend/src/views/blog/`：管理端业务；组件路径分别为 `blog/article/index`、`blog/resource/index`、`blog/category/index`、`blog/tag/index`、`blog/site/index`。
- `blog-web/`：Nuxt 4.5.0 + Vue + TypeScript，SSR；独立 lock 和构建。通过受限的 Nuxt GET 代理访问公开 Java 接口，SSR 与浏览器均走同一代理，不转发访客身份或租户头。
- `script/blog/`：建表与菜单迁移、说明、验收约定。网关、根 POM 和 Compose 由集成阶段修改。

## 通用数据规则

所有 Java 接口遵循 `CommonResult<T> = {code:number,data:T,msg:string}`；成功 code=0。分页 data=`{list:T[],total:number}`，pageNo 从 1 开始，pageSize 为 1–100；公开接口禁止无上限分页。未发布或不存在的详情 code=404；Nuxt 页面与代理将其转换为真正 HTTP 404。公开返回字段必须白名单化，不返回 Markdown 原文、审计字段、管理员信息或草稿。

状态 `status`：0=草稿、1=已发布、2=已下架。首次发布由后端填写 publishTime；只允许 publishTime<=当前时间的已发布记录被公开读取。保存已发布内容会更新线上版本，界面明确提示；没有独立修订/定时发布。发布过的文章/资源 slug 固定，不允许更换；slug 小写字母、数字、连字符，最长 120。日期 JSON 按项目现有格式处理，前端兼容字符串或数组。

后台权限前缀 `blog:article`、`blog:resource`、`blog:category`、`blog:tag`，动作 query/create/update/delete；站点 `blog:site:query/update`。预览允许具有任一种博客编辑权限的管理员。服务端校验身份与权限，前端按钮同步使用 v-hasPermi。

公开站点使用配置 `blog.site-tenant-id`，默认 1。公开请求在安全过滤器之前固定租户上下文，不信任 tenant-id、visit-tenant-id、Authorization。管理接口沿用既有租户与权限机制。不得为方便而全局关闭鉴权或多租户。

Markdown 渲染由 Java 统一完成（CommonMark + Jsoup 白名单），禁止脚本/事件处理器/危险 URL；保留代码块、图片、链接及标题锚点。每次写入生成干净 HTML；管理预览调用同一渲染器。标题目录结构 TocEntry=`{id:string,text:string,level:number}`。未配置时不生成假文章、作者履历、访问量或演示统计。

## 数据类型

- Category：`id,name,slug,type,sort`，type=`article|resource`，sort 为整数。删除被内容引用的分类应拒绝并提示。
- Tag：`id,name,slug`。删除仍被文章引用的标签应拒绝并提示。
- Article：`id,title,slug,summary,contentMarkdown,contentHtml,coverUrl,categoryId,categoryName,tagIds:number[],tags:Tag[],status,pinned:boolean,publishTime,createTime,updateTime,seoTitle,seoDescription,toc:TocEntry[],readingMinutes:number`。分类可空，默认标签数组为空；标题必填。列表不携带正文，管理 get 返回全部字段，公开 get 不返回 contentMarkdown/tagIds/status/audit 字段。
- Resource：`id,title,slug,summary,contentMarkdown,contentHtml,type,url,coverUrl,categoryId,categoryName,status,featured:boolean,sort,publishTime,createTime,updateTime,seoTitle,seoDescription,toc:TocEntry[]`。type=`link|file`，url 必填，只允许 HTTP(S) 或本项目根路径（不允许 //）。列表不带正文，公开详情不返回 Markdown/status/audit 字段。
- Site：`title,subtitle,description,authorName,avatarUrl,aboutMarkdown,aboutHtml,siteUrl,githubUrl,email,footerText`。公开接口不返回 aboutMarkdown。初始 title=`Myblog`、subtitle=`记录思考，分享发现`、authorName=`博主`、siteUrl=`http://127.0.0.1:3000`；其余不伪造个人信息。aboutHtml 同样由后端渲染。siteUrl 为规范绝对 HTTP(S) 地址，无末尾斜杠。站点设置按租户唯一。

实体保存参数只接收可编辑字段，拒绝由客户端覆盖 tenantId/publishTime/contentHtml/审计字段。资源 URL、封面、头像、社交链接及 email 按用途校验。新表仅使用 blog_ 前缀，不清理原业务数据。

## 管理 API：前缀 /admin-api/blog

| 方法 | 路径 | 参数/结果 |
| --- | --- | --- |
| GET | /article/page | pageNo,pageSize,keyword?,categoryId?,tagId?,status? → Page<Article> |
| GET | /article/get | id → Article |
| POST / PUT | /article/create / /article/update | Article 可编辑字段（更新带 id）→ id / true |
| DELETE | /article/delete | id → true |
| GET/GET/POST/PUT/DELETE | /resource/page /get /create /update /delete | 同文章；列表筛选 keyword?,categoryId?,type?,status? |
| GET | /category/list | type? → Category[] |
| POST/PUT/DELETE | /category/create /update /delete | Category / Category / id → id / true / true |
| GET | /tag/list | → Tag[] |
| POST/PUT/DELETE | /tag/create /update /delete | Tag / Tag / id → id / true / true |
| GET / PUT | /site/get / /site/update | → Site / Site 可编辑字段 → true |
| POST | /content/preview | {markdown:string} → {html:string,toc:TocEntry[],readingMinutes:number} |

## 公开 API：前缀 /app-api/blog（GET only）

| 路径 | 参数/结果 |
| --- | --- |
| /site/get | → Site 公开字段 |
| /category/list | type? → Category[]（固定站点租户） |
| /tag/list | → Tag[]（固定站点租户） |
| /article/page | pageNo,pageSize,keyword?,categoryId?,tagId?,pinned?,yearMonth?（yyyy-MM） → Page<Article> 公开字段 |
| /article/get | slug → Article 公开详情 |
| /article/archives | → {yearMonth:string,total:number}[]，按月份倒序，仅已发布文章 |
| /resource/page | pageNo,pageSize,keyword?,categoryId?,type?,featured? → Page<Resource> 公开字段 |
| /resource/get | slug → Resource 公开详情 |
| /sitemap | → {path:string,updateTime:string}[]，只含已发布详情；Nuxt 补静态首页/文章/资源/归档/关于页 |

搜索页同时调用两类 page 的 keyword 参数，keyword 最长 200 字符，不引入独立搜索引擎。文章排序 pinned DESC,publishTime DESC,id DESC；资源 featured DESC,sort ASC,publishTime DESC,id DESC。筛选和标签关联必须先于分页，禁止将 Markdown 正文塞入摘要响应。

## Nuxt 页面与行为

页面 `/`、`/articles`、`/articles/[slug]`、`/resources`、`/resources/[slug]`、`/archives`、`/about`、`/search?q=`。文章分类和标签通过 query 筛选，不创建空壳详情。首页展示真实最新文章和精选资源；空库有完整的空状态。浅色阅读风格、深色文字、青绿色强调色；移动端导航、可读正文和资源卡片，禁止虚构作者经历/推荐/统计、无意义大图或管理后台样式搬运。

SSR 页面必须有正文与独立 title/description/canonical/OG 信息；提供真实 404、sitemap.xml、robots.txt。搜索页 noindex。不要 Nuxt Content 文件库、第三方 CMS、付费字体或外部推广脚本。

私有 runtimeConfig `apiBase` 默认 `http://127.0.0.1:48080/app-api/blog`，生产容器值为 `http://gateway:48080/app-api/blog`；公开浏览器只请求本机 `/api/blog/...`。代理只允许上表路径，明确拾取业务 query，不接受任意 URL/透传身份。文章/站点变更须立即可见，首版不持久缓存 HTML 或公开接口。Node 服务生产端口 3000，沿用 Docker Compose。

## 验收

验证管理员创建分类/标签/文章/资源、图片附件上传、预览、发布、编辑、下架；匿名不能管理、受限账号不能越权；草稿/下架/其他租户内容不能从列表、详情、搜索、归档或 sitemap 泄露。验证 SSR 原始 HTML、标题目录、手机布局、URL 刷新与 404，站点设置即时生效。新增后端测试及 Nuxt typecheck/build 应通过；原管理端仅要求新文件/改动无新增类型诊断，保留其既有错误基线。临时验收数据清理，构建产物与凭据不提交。实施完成后提交并推送既有开源主仓库 ljk00000/Myblog 的 main 分支。
