# 博客首版安装与发布

`myblog-module-blog` 提供 Java 内容服务，`blog-web` 提供 Nuxt SSR 前台，`frontend/src/views/blog` 提供后台五个内容管理页面。API/DTO 约定见 [CONTRACT.md](CONTRACT.md)。

## 数据库安装

先备份 `system_menu`、`system_role_menu`、`system_tenant_package` 及已有博客数据。使用 MySQL 8 的同一业务库，按顺序执行：

```shell
mysql --default-character-set=utf8mb4 -u <user> -p <database> < script/blog-admin/menu.apply.sql
mysql --default-character-set=utf8mb4 -u <user> -p <database> < script/blog/schema.sql
mysql --default-character-set=utf8mb4 -u <user> -p <database> < script/blog/menu.apply.sql
```

上述重定向示例适用于支持 `<` 的 shell；Windows PowerShell 可通过数据库客户端或容器标准输入执行。命令提示输入密码，不要把真实密码写进脚本或提交到仓库。

`schema.sql` 只创建六张表，不导入示例文章、资源或个人资料。重复执行不会清空内容；已有同名表必须与当前结构一致，后续升级需另写迁移。

`menu.apply.sql` 仅新增 25400–25418 的 19 条内容菜单、按钮，以及迁移状态/快照表。已有角色授权和租户套餐保持原样；遇到占用的 ID、`/blog`、`blog/%` 组件或 `blog:%` 权限会停止。租户 1 的系统超级管理员可直接看到新菜单。其他角色按需分配查询、创建、更新、删除权限，其他租户还需配置其套餐。

退出后重新登录以获取新路由。新权限使用新键，无需清空 Redis。旧导航迁移的缓存处理见 `script/blog-admin/README.md`。若本地已缓存某个新菜单 ID 的角色查询，可仅删除对应 `menu_role_ids:<id>`，不要使用 `FLUSHDB` 或 `FLUSHALL`。

## 构建与部署

在根目录执行博客测试及打包：

```shell
mvn -pl myblog-module-blog -am "-Dtest=Blog*Test" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn -pl myblog-gateway,myblog-module-blog -am -DskipTests package
node script/blog-admin/build-frontend.cjs
```

将后台 `frontend/dist-prod` 同步到 `script/docker-compose/web/dist`。Nuxt 的冻结安装、类型检查和生产构建命令见 `blog-web/README.md`。Compose 的 Nuxt Dockerfile 会在 Node 24 中重新安装、检查及构建。

配置好 Compose 所需数据库、Redis 和 Nacos 环境变量后：

```shell
docker compose -f script/docker-compose/docker-compose.yml -f script/docker-compose/docker-compose.override.yml build gateway blog-server blog-web
docker compose -f script/docker-compose/docker-compose.yml -f script/docker-compose/docker-compose.override.yml up -d gateway blog-server blog-web web
```

首次部署还需构建、启动 system、infra 及基础组件，见 `script/docker-compose/README.md`。本机前台 `http://127.0.0.1:3000`，后台 `http://127.0.0.1:8080`。Nuxt 通过私有 `NUXT_API_BASE=http://gateway:48080/app-api/blog` 请求公开 API，不把凭据或后台接口地址暴露为可配置代理。

`BLOG_SITE_TENANT_ID` 在服务器固定公开站点所属租户，默认 1；访客提交的身份和租户头不能改变公开范围。管理接口仍按当前登录租户与权限工作。

## 内容维护

1. 在“博客内容 → 站点设置”填写真实标题、简介、作者、关于内容和站点 URL。未提供的信息保持为空。
2. 创建文章/资源分类及标签。资源分为链接、文件两种；文件地址可使用既有媒体资源上传结果。
3. 新建内容，编辑 Markdown、摘要、封面和可选 SEO 字段。在“上传图片 / 附件并插入 Markdown”中选择文件，再插入图片或附件链接，可重复添加。编辑器的附件大小上限为 5 MB，文件类型由后端验证。点击“渲染预览”检查服务端净化结果。
4. 保存草稿或确认发布。首次发布时间由服务器生成；发布后的 slug 永久锁定。保存已发布内容会更新公开 API，动态 SSR 在后续请求读取新版本；GitHub Pages 需重新导出并发布。当前没有独立修订或定时发布。
5. 下架后，内容从公开 API 的详情、列表、搜索、归档与 sitemap 中移除；已发布的 Pages 快照需重新导出并发布才会移除相应内容。删除中的分类、标签如仍被引用会被拒绝，先解除引用再删除。

部署到真实域名时，将站点 URL 改为规范 HTTPS 地址，并将文件存储域名配置为读者可访问的 HTTPS 地址。本机 `127.0.0.1` 文件地址不适合公网读者。Nuxt 对相对内容 URL 按站点 URL 解析，需保证同一公开入口能读取该路径；默认 Compose 只代理合同内的博客读取接口，不开放任意附件代理。动态 SSR 没有持久内容缓存，设置和发布变更在后续请求生效；Pages 的导出和同步步骤见[静态发布说明](../../blog-web/README.md#github-pages-静态发布)。

## 回滚

先保留源码、数据库和镜像恢复点。需要移除菜单时执行 `menu.rollback.sql`：只删除本次新增菜单并保留内容表和数据；重复回滚无操作。若安装后菜单字段被修改、出现新增角色授权或子菜单，脚本会停止，先人工核对这些新增内容。不要为回滚而盲删角色授权。

菜单回滚不等于恢复应用版本。应用回退还需使用匹配的 gateway、后台静态文件和镜像，并处理正在访问公开站点的请求。博客表不会自动删除。

## 验证口径

博客单测覆盖 Markdown/URL 安全、分页边界、公开身份隔离和服务发布规则。实际验收应额外覆盖登录后的 CRUD/上传/发布/下架、受限角色按钮与 403、其他租户内容隔离、SSR 原始正文、真实 404、SEO 与移动端布局。测试内容、文件、角色和账号应在完成后清理。

管理后台原有全量类型检查存在 934 条基线诊断；博客新增目录应保持零新增诊断。生产构建通过不等于原项目全量类型检查通过。原有 Knife4j 兼容问题、未部署监控和定时任务限制沿用后台底座说明。
