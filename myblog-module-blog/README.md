# 博客内容服务

基于现有 Spring Boot 4、JDK 25、MyBatis Plus、Nacos、多租户和权限框架，服务名 `blog-server`，端口 `48083`。Nuxt 负责公开 SSR 页面，本模块保存内容并提供管理和公开 API。

## 内容与发布

- 文章、资源、分类、标签和站点设置；Markdown 原文经 CommonMark 和 Jsoup 统一渲染、净化，预览与保存使用相同规则。
- 状态：`0` 草稿、`1` 发布、`2` 下架。首次发布由服务器填写时间；保存已发布内容立即更新线上版本。
- 发布过的内容不能修改 slug；删除后的 slug 保留，避免旧地址被重新用于其他内容。
- 公开查询只返回已发布且发布时间不晚于当前时间的本租户内容，并限制页大小为 1–100。
- 引用中的分类、标签不能删除。输入 DTO 不允许写入租户、HTML、发布时间或审计字段。
- 不提供访客账号、评论、点赞、付费、修订历史或定时发布。

## API 与安全

接口与 DTO 见 [`script/blog/CONTRACT.md`](../script/blog/CONTRACT.md)。管理路径 `/admin-api/blog/**` 继续使用现有登录和 `blog:*` 权限；公开路径 `/app-api/blog/**` 仅开放合同中的 GET 接口。

公开过滤器在租户解析之前使用服务端 `BLOG_SITE_TENANT_ID`（默认 `1`）覆盖租户，并移除访客身份、令牌和访问租户信息。租户有效性和数据库隔离仍由原框架执行。不要将博客加入全局租户忽略表，也不要全局关闭鉴权。

公开响应为 `Cache-Control: no-store`，首版不缓存内容。站点设置默认 Myblog、博主和本机地址，无示例文章或虚构个人资料；部署到域名后需在后台更新站点 URL，供 canonical、OG 和 sitemap 使用。

## 数据库与运行

先执行 `script/blog/schema.sql` 和 `script/blog/menu.apply.sql`，说明见 [`script/blog/README.md`](../script/blog/README.md)。

```shell
mvn -pl myblog-module-blog -am "-Dtest=Blog*Test" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn -pl myblog-gateway,myblog-module-blog -am -DskipTests package
```

本地直接运行 JAR 时配置 `BLOG_DB_URL`、`BLOG_DB_USERNAME`、`BLOG_DB_PASSWORD`、`REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD`、`NACOS_SERVER_ADDR` 及需要的 Nacos 认证变量。也支持标准 Spring 环境变量，Compose 使用标准变量覆盖连接信息。不要把凭据写入受控文件。

Compose 服务 `blog-server` 不发布宿主机端口，由 gateway 转发。新增服务必须能访问已有 system 服务的租户、OAuth 和权限 RPC；无需复制其业务实现。完整部署见 [`script/docker-compose/README.md`](../script/docker-compose/README.md)。
