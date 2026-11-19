# Docker Compose 部署（微服务版）

目标：用 Docker Compose V2 快速搭建一套可登录的体验环境，了解各组件之间的依赖关系。

包含：`gateway`、`system-server`、`infra-server`、`blog-server`、Nuxt 公开前台 `blog-web`、管理端 Nginx、MySQL、Redis，以及可选的内置 Nacos。用于本机体验与测试；SkyWalking、XXL-Job 和高可用编排不在本文件中。

## 文件列表

```text
script/docker-compose
├── README.md
├── docker-compose.yml       <-- 编排文件，相对路径均相对于本目录
├── docker-compose.override.yml <-- 本机浏览器访问：gateway 48080、Nacos 控制台 18080，仅绑定 127.0.0.1
├── .env.example             <-- 环境变量示例，复制为 .env 后修改
├── .gitignore               <-- 忽略 .env、web/dist/
├── nginx
│   └── default.conf         <-- 静态资源、history 回退、/admin-api、/app-api、/infra/ws 反向代理到 gateway
└── web
    └── dist                 <-- 需自行放入前端打包产物（不随仓库提供）
```

| 服务 | 镜像 | 说明 |
| --- | --- | --- |
| `mysql` | `mysql:8.4` | 首次启动导入 `sql/mysql/ruoyi-vue-pro.sql`，数据卷 `myblog_mysql-data` |
| `redis` | `redis:7.4-alpine` | 开启密码与 AOF，数据卷 `myblog_redis-data` |
| `nacos` | `nacos/nacos-server:v3.0.3` | 可选（profile `nacos`），单机 + 嵌入式存储，数据卷 `myblog_nacos-data` |
| `gateway` | `myblog-gateway:${GATEWAY_IMAGE_TAG:-${IMAGE_TAG}}` | 网关端口 48080，Nacos 服务名 `gateway-server` |
| `system-server` | `myblog-module-system-server:${IMAGE_TAG}` | 由模块 Dockerfile 构建，端口 48081，Nacos 服务名 `system-server` |
| `infra-server` | `myblog-module-infra-server:${IMAGE_TAG}` | 由模块 Dockerfile 构建，端口 48082，Nacos 服务名 `infra-server` |
| `blog-server` | `myblog-module-blog:${BLOG_IMAGE_TAG}` | 博客内容，端口 48083，Nacos 服务名 `blog-server`，不映射宿主机端口 |
| `blog-web` | `myblog-web:${BLOG_IMAGE_TAG}` | Nuxt SSR，回环绑定 `${BLOG_WEB_PORT}`（默认 3000），Node 24 多阶段构建 |
| `web` | `nginx:1.28-alpine` | 对宿主机开放 `${WEB_PORT}`（默认 8080） |

后台请求链路：浏览器 → `web`（Nginx）→ `gateway` → system、infra 或 blog。公开请求链路：浏览器 → `blog-web`（Nuxt SSR / 受限 GET 代理）→ `gateway` → `blog-server`。服务由 Nacos 发现；`gateway` 不连接 MySQL、Redis。

容器之间通过服务名访问，服务注册到 Nacos 的是容器在 Compose 网络中的 IP，网关可以直接访问。基础编排不向宿主机映射 MySQL、Redis、Nacos 或网关端口；本仓库的 `docker-compose.override.yml` 会自动叠加本机回环地址上的网关 48080 和 Nacos 控制台 18080，供本地浏览器调试。其他环境应按需调整该覆盖文件。

## 前置条件

- Docker Engine + Docker Compose V2.20.2 及以上（`docker compose version` 可查看）。Compose V2.20.2 起支持 `depends_on.required`，清空 `COMPOSE_PROFILES` 复用已部署的 Nacos 时依赖此功能；V2.20.0 在这种情况下启动会报 `no such service: nacos`
- Docker 实际剩余可用内存建议 4GB 以上：Docker Desktop 以分配给 Docker 虚拟机的内存为准（不是宿主机总内存），并扣除已运行容器的占用；内存不足时容器可能被 OOM 终止，可用 `docker info` 查看 `Total Memory`、`docker stats` 查看已有占用
- JDK 25、Maven（与源码根 `pom.xml` 的 `java.version` 一致）
- 已按前端项目的部署说明完成打包

## 1. 打包后端

在**源码根目录**执行：

```shell
mvn clean package -pl myblog-gateway,myblog-module-system/myblog-module-system-server,myblog-module-infra/myblog-module-infra-server,myblog-module-blog -am -Dmaven.test.skip=true
```

产物为各服务 `target` 下对应名称的 JAR，包括 `myblog-module-blog/target/myblog-module-blog.jar`，由模块 Dockerfile 复制进镜像。博客单测命令及迁移说明见 `script/blog/README.md`。

## 2. 准备前端产物

前端源码已纳入本仓库 `frontend`。在源码根目录执行：

```shell
cd frontend
pnpm install --frozen-lockfile
cd ..
node script/blog-admin/build-frontend.cjs
```

脚本默认使用同源 `/admin-api`、保留多租户、关闭验证码、清空默认登录账号密码和原项目统计，输出到 `frontend/dist-prod`。可以通过进程环境变量覆盖部署设置；验证码开关需与后端 `MYBLOG_CAPTCHA_ENABLE` 一致。本机环境变量文件不提交。

单站点部署可以在构建前将 `VITE_APP_FIXED_LOGIN_TENANT` 设为数据库中现有的租户名称。登录页只显示账号、密码和登录按钮，在登录时自动选择该租户。

将 `frontend/dist-prod` 中的内容（包含 `index.html`）复制到 `script/docker-compose/web/dist/`。Windows PowerShell 可在源码根目录执行：

```powershell
New-Item -ItemType Directory -Force script/docker-compose/web/dist | Out-Null
robocopy frontend/dist-prod script/docker-compose/web/dist /MIR
# robocopy 返回码 0–7 表示复制成功，8 及以上表示失败。
```

首次初始化数据库后按顺序执行 `script/blog-admin/menu.apply.sql`、`script/blog/schema.sql`、`script/blog/menu.apply.sql`，再正常退出并登录。已有数据库不要重新导入上游初始化 SQL。具体恢复点、缓存与菜单回滚见 `script/blog/README.md`。

Nuxt 源码位于 `blog-web`，可在该目录执行 `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm build`。Compose 构建 `blog-web` 时会在容器内执行这三项检查，无需复制宿主机 `.output` 或 `node_modules`。

## 3. 配置环境变量

```shell
cd script/docker-compose
cp .env.example .env
```

按需修改 `.env`，至少替换 `MYSQL_ROOT_PASSWORD`、`MYSQL_PASSWORD`、`REDIS_PASSWORD` 三个示例密码；使用内置 Nacos 时同时替换 `NACOS_AUTH_TOKEN`、`NACOS_AUTH_IDENTITY_VALUE`。

已有部署升级时，保留原 `.env` 中的数据库名、账号、密码和令牌，不要用示例文件覆盖。先运行 `docker volume ls`，将原 MySQL、Redis、Nacos 数据卷的名称分别填入 `MYSQL_VOLUME_NAME`、`REDIS_VOLUME_NAME`、`NACOS_VOLUME_NAME`。这三个变量必须显式配置，缺失时 Compose 会停止，不会因项目改名而自动使用空数据库。新部署可以使用示例中的 `myblog_*` 卷名。

Java 自定义配置统一使用 `myblog.*`，环境变量使用 `MYBLOG_*`；已有 Nacos 配置中的旧项目配置前缀也需要同步改为 `myblog`，例如 `myblog.tenant.enable` 和 `myblog.demo`。数据库、Redis、Nacos 连接参数与服务名保持原值。后台默认租户名称留空，请输入现有数据库中的租户名称；也可以在构建时设置 `VITE_APP_DEFAULT_LOGIN_TENANT`。原始 `sql/` 初始化数据、作者署名、许可证和上游来源链接保留。

项目改名会改变 Compose 容器和网络名。升级前先用旧版本编排正常停止旧服务，保留所有数据卷；核对以上卷名、配置前缀及连接参数后再用新版启动。不要同时运行两套连接相同数据卷的数据库容器。

Java 包名也已更新。Redis 中此前序列化的对象可能包含旧类名，升级时需要重建这些派生缓存。先备份 Redis，并在旧服务停止后核对 `role:*`、`oauth_client:*`、`oauth2_access_token:*`、`notify_template:*`、`mail_account:*`、`mail_template:*`、`sms_template:*`、`wxa_subscribe_template:*`、`file_config:*` 中使用旧类名的缓存键，再按键删除；新服务会从数据库重新读取，管理员需要重新登录。不要清空 Redis 数据库、消息队列或数据库中的账号和授权记录。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WEB_PORT` | `8080` | 前端访问端口 |
| `IMAGE_TAG` | `local` | 后端镜像 tag |
| `GATEWAY_IMAGE_TAG` | 回退到 `IMAGE_TAG` | 单独更新网关时使用 |
| `BLOG_IMAGE_TAG` | `local` | blog-server、blog-web 镜像 tag |
| `BLOG_WEB_PORT` | `3000` | Nuxt 前台回环访问端口 |
| `BLOG_SITE_TENANT_ID` | `1` | 服务器固定的公开站点租户 |
| `MYSQL_VOLUME_NAME` / `REDIS_VOLUME_NAME` / `NACOS_VOLUME_NAME` | 必填；新部署示例为 `myblog_*` | 已有部署填写原持久化卷名，避免切换到空数据卷 |
| `MYSQL_DATABASE` | `ruoyi-vue-pro` | 数据库名 |
| `MYSQL_ROOT_PASSWORD` | 示例值 | MySQL root 密码，仅供初始化与运维使用 |
| `MYSQL_USER` / `MYSQL_PASSWORD` | `myblog` / 示例值 | 应用使用的账号，只拥有 `MYSQL_DATABASE` 库权限 |
| `REDIS_PASSWORD` | 示例值 | Redis 密码 |
| `SPRING_PROFILES_ACTIVE` | `dev` | 后端 profile，同时决定 Nacos Data ID 后缀 |
| `JAVA_OPTS` | `-Xms512m -Xmx512m` | 四个 Java 服务共用的 JVM 参数 |
| `MYBLOG_CAPTCHA_ENABLE` | `true` | 是否开启登录验证码 |
| `COMPOSE_PROFILES` | `nacos` | 为 `nacos` 时启动内置 Nacos；复用已部署的 Nacos 时清空 |
| `NACOS_SERVER_ADDR` | `nacos:8848` | Nacos 地址，必须是**容器内**可访问的地址 |
| `NACOS_NAMESPACE` | `public` | 命名空间 ID，注册中心与配置中心共用 |
| `NACOS_GROUP` | `DEFAULT_GROUP` | 分组，注册中心与配置中心共用 |
| `NACOS_USERNAME` / `NACOS_PASSWORD` | 空 | Nacos 开启鉴权时填写 |
| `NACOS_AUTH_TOKEN` / `NACOS_AUTH_IDENTITY_KEY` / `NACOS_AUTH_IDENTITY_VALUE` | 示例值 | 内置 Nacos 3.x 启动必填参数 |

`docker-compose.yml` 通过环境变量覆盖 `application-dev.yaml` 中的以下配置，其余配置仍使用 `application.yaml`、`application-dev.yaml`：

- 数据库主库 `master`、从库 `slave`，Redis：指向 Compose 内的 `mysql`、`redis`
- Nacos 地址、账号、命名空间、分组：`spring.cloud.nacos.*`
- `xxl.job.enabled=false`：本编排不提供 XXL-Job 调度中心
- `myblog.demo=false`：`application-dev.yaml` 默认开启的演示模式会禁止写操作

`blog-web` 的私有 `NUXT_API_BASE` 固定为 `http://gateway:48080/app-api/blog`，浏览器只使用 Nuxt 的 GET 白名单代理。发布到域名时，在后台“站点设置”更新规范站点 URL，并配置 HTTPS 与读者可访问的文件存储域名。修改域名不会自动修改以前写入正文的绝对文件地址。

## 4. Nacos 说明

**内置 Nacos（默认）**：`COMPOSE_PROFILES=nacos`，Java 服务等待 Nacos 的 8848、9848 端口可连接后再启动。内置 Nacos 未开启客户端访问鉴权，仅适合本机体验。本仓库覆盖文件将控制台绑定到 `http://127.0.0.1:18080`；首次访问时需要初始化 `nacos` 用户的密码。

**复用已部署的 Nacos**：本分支使用 `spring-cloud-alibaba` 2025.1.0.0，对应 `nacos-client` 3.1.1，建议使用 Nacos 3.x；内置 Nacos 3.0.3 已验证当前客户端的注册、发现与 `public` 命名空间配置读写。在 `.env` 中：

1. 清空 `COMPOSE_PROFILES`（`COMPOSE_PROFILES=`），不再启动内置 Nacos。
2. `NACOS_SERVER_ADDR` 填容器内可访问的地址。容器内的 `127.0.0.1` 指向容器自身；Nacos 部署在本机时使用 `host.docker.internal:8848`（已为 Java 服务配置 `host-gateway`）。客户端同时使用 HTTP 端口和 gRPC 端口（HTTP 端口 + 1000，默认 9848），两个端口都要放通。
3. `NACOS_NAMESPACE` 填命名空间 **ID**，该命名空间需已存在；`NACOS_GROUP` 填分组。
4. Nacos 开启鉴权时，填写 `NACOS_USERNAME`、`NACOS_PASSWORD`。
5. 建议使用独立的命名空间或分组。若同一命名空间、分组下还有本机 IDE 启动的同名服务，网关可能把请求转发到容器无法访问的实例。

**配置优先级**：各服务会加载 Nacos 中命名空间 `NACOS_NAMESPACE`、分组 `NACOS_GROUP` 下的 Data ID `${spring.application.name}-${SPRING_PROFILES_ACTIVE}.yaml`（例如 `gateway-server-dev.yaml`、`system-server-dev.yaml`、`infra-server-dev.yaml`），不存在时忽略。优先级从高到低为：`docker-compose.yml` 中的环境变量 > Nacos Data ID > jar 内的 `application-dev.yaml` > `application.yaml`。因此 Data ID 中的数据库、Redis、Nacos 配置会被上述环境变量覆盖，其他配置项会覆盖 jar 内配置。

## 5. 构建并启动

以下命令均在 `script/docker-compose` 目录执行：

```shell
# 检查配置（变量缺失会直接报错）
docker compose config --quiet

# 构建后端镜像并启动
docker compose up -d --build

# 查看状态与日志
docker compose ps
docker compose logs -f gateway system-server infra-server blog-server blog-web
```

首次启动时 MySQL 需要导入上游 SQL，system、infra、blog 等待数据库、Redis 和内置 Nacos 就绪。按博客说明应用增量表结构与菜单。四个 Java 服务日志应分别出现对应 `Started ...Application`，Nuxt 日志出现 `Listening`，并确认公开 API 成功后访问：

- 公开前台：http://127.0.0.1:3000 （对应 `BLOG_WEB_PORT`）
- 管理后台：http://127.0.0.1:8080 （对应 `WEB_PORT`）

服务刚启动时网关可能短暂返回 503（尚未从 Nacos 拉取到实例），稍等后刷新即可。

## 6. 更新

```shell
# 后端：回到源码根目录重新打包，再回到本目录重建、重启
cd ../..
mvn clean package -pl myblog-gateway,myblog-module-system/myblog-module-system-server,myblog-module-infra/myblog-module-infra-server,myblog-module-blog -am -Dmaven.test.skip=true
cd script/docker-compose
docker compose up -d --build gateway system-server infra-server blog-server blog-web

# 前端：清空 web/dist/ 内的文件（保留 dist 目录本身）后复制新产物，再重启 web；修改 nginx/default.conf 后同样执行
rm -rf web/dist/*
cp -R /path/to/前端打包产物目录/. web/dist/
docker compose restart web
```

只更新某个服务时，只打包与重建对应模块。`GATEWAY_IMAGE_TAG` 可单独指定网关标签，`BLOG_IMAGE_TAG` 指定两个博客镜像标签；system/infra 仍使用 `IMAGE_TAG`。更新前保留旧 tag 与后台静态文件恢复点，回滚需使用彼此匹配的应用、路由和数据库版本。

## 7. 停止与数据

```shell
# 停止并删除容器，保留数据卷
docker compose down
```

**不要执行 `docker compose down -v`**，它会删除 `myblog_mysql-data`、`myblog_redis-data`、`myblog_nacos-data` 数据卷，数据库内容将全部丢失。

## 数据库初始化说明

- SQL 只在 `mysql-data` 数据卷为空（首次启动）时执行一次；之后修改 SQL 文件、`.env` 中的 `MYSQL_*` 账号密码，都不会作用于已有数据库。
- 首次导入中途失败（例如容器被强制停止），数据卷会处于半初始化状态，需要确认数据可丢弃后执行 `docker compose down`、`docker volume rm myblog_mysql-data` 再重新启动。
- 已有数据卷升级到新版本时，SQL 不会自动执行。请先备份，再手动执行对应的升级 SQL，例如：

```shell
docker compose exec -T mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < /path/to/upgrade.sql
```

- 使用外部 MySQL 时：自行导入 `sql/mysql/ruoyi-vue-pro.sql`，删除 `docker-compose.yml` 中的 `mysql` 服务及各服务对它的 `depends_on`，并把 `x-app-env` 中的 `SPRING_DATASOURCE_DYNAMIC_DATASOURCE_MASTER_*`、`SLAVE_*` 改为外部地址；容器内的 `127.0.0.1` 指向容器自身，不是宿主机。

## 其他分支同步替换点

本目录按 JDK 25 + Spring Boot 4.x 分支编写（各模块 Dockerfile 基础镜像 `eclipse-temurin:25-jre`，Redis 使用 `SPRING_DATA_REDIS_*`，`nacos-client` 3.1.1）。与其他分支同步时，只需替换：

| 分支 | 后端 Dockerfile 基础镜像 | Redis 环境变量前缀 |
| --- | --- | --- |
| JDK 8 + Spring Boot 2.x | `eclipse-temurin:8-jre` | `SPRING_REDIS_*`（`spring.redis.*`） |
| JDK 17 + Spring Boot 3.x | `eclipse-temurin:17-jre` | `SPRING_DATA_REDIS_*`（`spring.data.redis.*`） |
| JDK 25 + Spring Boot 4.x | `eclipse-temurin:25-jre` | `SPRING_DATA_REDIS_*`（`spring.data.redis.*`） |

并核对该分支各服务 `application-*.yaml` 的数据源、Redis、Nacos 配置项，`spring-cloud-alibaba` 对应的 `nacos-client` 版本（按服务端对该客户端的兼容性选择 Nacos 镜像版本），以及 `sql/mysql` 下的 SQL 文件名。
