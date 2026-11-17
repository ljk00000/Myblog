# 博客后台精简与源码裁剪

适用当前 `master-jdk25` 基线及本仓库 Docker Compose 环境。当前保留 gateway、system、infra、MySQL、Redis、Nacos；无关企业业务源码已物理移除。以下导航迁移与验收记录最初完成于第一阶段，当时仅隐藏入口。源码删除不清理现有业务表、按钮权限或角色授权。

本阶段不实现文章、分类标签、评论、友链、SEO 或博客运营统计，也不创建这些功能的空菜单。

## 导航保留清单

- 工作台：欢迎信息，按账号权限和可用路由显示文件、个人资料及日志快捷入口。
- 媒体资源：文件管理。
- 系统管理：管理员账号、角色与权限、登录日志、操作日志。
- 开发运维：菜单管理、字典、参数配置、文件存储配置、代码生成、数据源配置、API 访问/错误日志、Nacos 控制台。进入工作台时保持折叠。
- 原项目资源：唯一的原项目推广入口，位于全部导航最后。

第一阶段将其余目录和页面用 `visible=0` 隐藏。定时任务 API 在当前部署中返回业务码 404；API 文档聚合接口存在原依赖兼容错误；独立监控依赖未部署，因此这些入口保持隐藏。多租户及现有登录底座保留。后续源码裁剪已经删除无关页面；数据库仍保留原菜单记录和授权，不代表相应源码仍在当前版本中。

## 菜单迁移

`menu.apply.sql` 先验证当前环境的 18 个关键菜单，再保存菜单、角色授权和租户套餐快照。数据修改在事务中执行，失败自动回滚；当前实例中再次执行已应用的迁移不会修改数据或重复插入菜单。

复用原文件目录 ID 193 作为媒体目录。菜单管理和字典移动到开发运维时，使用绝对子路径保留原地址。前端 `routerHelper.ts` 支持绝对子路径；`menuRoute.ts` 和 `Menu.vue` 优先匹配真实子菜单，再回退到 URL 前缀，确保文件存储、菜单和字典展开正确父目录。

第一阶段保留页面的完整地址如下；当前源码保留其中 13 个业务页，API 文档前端实现已在源码裁剪时移除：

| 页面 | 地址 |
| --- | --- |
| 文件管理 | `/infra/file/file` |
| 文件存储配置 | `/infra/file/file-config` |
| 管理员账号、角色与权限 | `/system/user`、`/system/role` |
| 菜单管理、字典管理 | `/system/menu`、`/system/dict` |
| 登录日志、操作日志 | `/system/log/login-log`、`/system/log/operate-log` |
| 参数配置、代码生成、数据源配置 | `/infra/config`、`/infra/codegen`、`/infra/data-source-config` |
| API 文档（导航隐藏）、访问日志、错误日志 | `/infra/swagger`、`/infra/log/api-access-log`、`/infra/log/api-error-log` |

只有必要的父目录授权和新 Nacos 入口授权可能新增。Nacos 入口仅补给原有参数配置管理者及对应套餐，使用现有 `infra:config:query` 标识，不增加业务权限。原有角色菜单记录不改写、不删除。

### 在当前 Compose 环境执行

在仓库根目录的 PowerShell 中执行，无需在命令中填写数据库密码：

```powershell
docker cp .\script\blog-admin\menu.apply.sql myblog-mysql-1:/tmp/blog-admin-menu.apply.sql
docker exec myblog-mysql-1 sh -c 'export MYSQL_PWD=$MYSQL_ROOT_PASSWORD; exec mysql -uroot --default-character-set=utf8mb4 $MYSQL_DATABASE < /tmp/blog-admin-menu.apply.sql'
```

脚本默认的 Nacos 浏览器地址是 `http://127.0.0.1:18080/#/configurationManagement`，只适用于当前本机体验环境。部署到其他环境时，在同一 MySQL 会话先执行 `SET @blog_nacos_url = 'https://实际控制台地址/';`，再 `SOURCE /tmp/blog-admin-menu.apply.sql;`。已应用后调整地址应使用后台菜单管理；不要通过重复执行迁移覆盖后续配置。

迁移保存六张 `blog_admin_*_20261115` 表：菜单变更前/后快照、原角色菜单、套餐变更前/后快照及迁移状态。快照只供管理员恢复使用。成功回滚后可以重新应用，届时快照会刷新为该次应用前的状态。

### 菜单缓存刷新

后端登录权限信息从现有菜单表和授权表生成。SQL 绕过了服务层缓存注解，因此需删除这次新增菜单相关的缓存键，不使用 `FLUSHDB` 或 `FLUSHALL`。当前配置使用 Redis database 1，当前 Nacos 菜单 ID 为 25345：

```powershell
docker exec myblog-redis-1 redis-cli -n 1 DEL permission_menu_ids:infra:config:query menu_role_ids:25345 menu_role_ids:2
```

其他环境应使用迁移输出的 Nacos 菜单 ID。租户套餐在当前实现中直接读取数据库，不需要清空 Redis。前端已有会话需正常退出后重新登录，以刷新 `roleRouters` 等登录缓存。不得删除 Redis 中的全部令牌或业务数据。

### 菜单回滚

```powershell
docker cp .\script\blog-admin\menu.rollback.sql myblog-mysql-1:/tmp/blog-admin-menu.rollback.sql
docker exec myblog-mysql-1 sh -c 'export MYSQL_PWD=$MYSQL_ROOT_PASSWORD; exec mysql -uroot --default-character-set=utf8mb4 $MYSQL_DATABASE < /tmp/blog-admin-menu.rollback.sql'
```

回滚恢复本次修改的导航字段、套餐菜单列表，移除本次新建的 Nacos 菜单和自动新增的授权；保留原业务权限和其他表。回滚后再次执行不会修改数据。回滚后仍需执行上述精确缓存刷新并重新登录。源码裁剪后，菜单回滚本身不能恢复已删除功能；还需恢复对应的旧版源码或产物，再重新构建部署。

如果迁移后已有人工菜单修改、相关套餐修改或 Nacos 入口被重新分配角色，恢复脚本会停止，提示先检查快照，避免覆盖后续操作。此时不要强行整表覆盖。脚本不会回退 AUTO_INCREMENT 计数器；回滚恢复的是记录内容。

## 推广资源维护

资源汇总页的数据位于 `frontend/src/config/project-resources.ts`，页面位于 `frontend/src/views/ProjectResources/Index.vue`。清单共 192 项、六个分类及 17 个功能模块，覆盖 359 个源文件中 398 次 DocAlert 调用提取的 179 个唯一 URL 和 182 个原始标题，另收纳旧侧栏、首页、登录及头像中的 13 项资源。按 URL 去重，其他标题保留为可搜索别名。

业务页 `DocAlert` 统一停止展示，保留原调用接口。没有逐页删除调用，也没有删除许可证、作者注释或必要版权信息。资源页面只在点击时打开外链，不加载第三方 iframe、图片或推广脚本。

资源路由作为受登录保护的静态路由注册；退出清理时保留该路由，菜单顺序单独排在动态目录之后。不会把资源页加入匿名访问白名单。

## 第一阶段 API 文档限制记录

第一阶段中，网关 `/admin-api/infra/v3/api-docs` 和 `/admin-api/system/v3/api-docs` 可以返回 OpenAPI JSON，但 `/v3/api-docs/swagger-config` 请求在现有依赖下抛出 `NoSuchMethodError: java.util.List org.springframework.http.HttpHeaders.get(java.lang.Object)`，导致 Knife4j UI 无法加载。当时只隐藏菜单 ID 20；本轮进一步删除了该前端页面，未升级后端依赖。曾尝试修改的 `url.swagger` 参数已恢复为空值；接口不接受空值，恢复时对该条记录做了值校验后的精确 SQL 更新，最终查询确认已恢复。以后恢复文档入口需先修复兼容性，并恢复和验证对应前端页面。

## 当前本地文件存储

验证时发现原默认文件存储 ID 22 指向外部“七牛存储器（示例）”。本次通过现有文件配置 API 把主存储切换为已有数据库存储 ID 4，其访问域名为本机网关 `http://127.0.0.1:48080`。无需额外对象存储服务，文件数据存入现有 MySQL。原云存储配置未删除、凭据未改写。

该调整与菜单迁移分开恢复：在“开发运维 → 文件存储配置”将原 ID 22 重新设为主配置即可，或由已登录管理员调用 `PUT /admin-api/infra/file-config/update-master?id=22`。恢复示例云存储前应先配置真实可用的云存储信息。更换部署地址时需要相应修改数据库存储配置中的访问域名。

## 构建、部署和验证

生产构建从仓库根目录执行以下命令，输出 `frontend/dist-prod`：

```powershell
node script/blog-admin/build-frontend.cjs
```

脚本使用 Node 子进程传递真正的空字符串，默认同源 `/admin-api`、保留多租户、关闭验证码、清空默认登录账号密码及百度统计。已设置的进程环境变量可以覆盖脚本默认值；部署前应核对 API、验证码、租户及图标加载设置。前端开发环境可从 `frontend/.env.example` 创建本机配置，实际环境变量文件不提交。

校验包括 `pnpm ts:check`、ESLint、Prettier 和 `git diff --check`。本轮实际结果及既有诊断见文末。

当前 Nginx 挂载目录为 `script/docker-compose/web/dist`。部署前备份该目录，然后将构建输出内容复制到挂载目录；无需重建后端。旧静态产物保存在本次会话 scratch 的 `web-dist-before`，可复制回挂载目录恢复前端。数据库菜单恢复与前端产物恢复需配套执行。

已执行的数据库验证：14 个既有页面的完整 URL 不变（其中 API 文档隐藏）；当前 18 个可见目录/页面、2590 个原按钮记录保留；既有角色菜单记录改写数为 0；重复应用不产生数据变化；回滚后三张相关表的记录校验和与原始数据一致；回滚可拒绝后续人工菜单修改；异常基线被拒绝且不改数据；回滚后可再次应用。临时验证库已删除。

第一阶段于 2026-11-15 完成的实际验收（源码裁剪后的结果见文末）：

- 生产构建成功，静态产物已部署到当前 Nginx；后台地址 `http://127.0.0.1:8080`。
- 新版登录页、工作台、头像菜单和保留业务页无分散的原项目推广；工作台无演示统计、天气及图表。必要版权保留，浏览器未加载百度统计。
- 五个顶层入口依次为工作台、媒体资源、系统管理、开发运维、原项目资源。13 个保留业务页可进入；菜单、字典和文件存储配置沿旧 URL 访问时展开及高亮正确，返回工作台后开发运维折叠。
- 资源页 192 个 URL 均不重复；筛选“上传下载”命中并自动展开分类和模块；无结果提示、直接访问和刷新正常。所有资源外链为新标签打开并包含 `noopener noreferrer`，页面内无第三方嵌入内容。
- 管理员正常退出并重新登录成功，资源页仍可访问；原角色集合及 2554 项权限与实施前完全一致。
- 临时受限角色仅授权文件查询：侧栏只有工作台、媒体资源、原项目资源，工作台仅有文件管理和个人资料；可查询文件，删除按钮不显示，删除 API 返回 403；管理员可以看到删除按钮。
- 文件上传、列表、HTTP 内容读取及删除通过。测试文件、临时账号、临时角色均按原接口删除并查回为 0，测试令牌已退出。
- Nacos 独立控制台可访问，配置列表保留 gateway、system、infra 三项配置。未新增后端业务服务。

检查日志、修改前菜单 SQL 导出、原文件存储/Swagger 配置和前端产物备份保存在本次会话 scratch；菜单迁移前后快照另持久保存在上述六张数据库表中。前端与菜单回滚分别按对应步骤恢复；默认文件存储按上一节单独恢复。

最终检查结果：改动文件 ESLint、Prettier、`git diff --check` 均通过，生产构建退出码 0。全量 `pnpm ts:check` 仍以退出码 2 结束：修改前 15360 条 TypeScript 诊断，最终 15349 条；忽略因删改导致的行号变化后，未发现新增诊断。剩余主要为原有自动导入声明及未启用企业模块类型问题，本期未扩大范围清理。为消除本次检查中暴露的自动导入声明差异，`RouterSearch/index.vue` 只补了 `useRouter` 显式导入。

第一阶段部署曾通过 HTTP 读取 `index.html`，SHA-256 与当时构建产物一致：`A6B6096A80BE1C755C5152BF949F51A04674BE8FB5785E8557542B477DBF08C8`。七个既有容器继续运行，MySQL、Redis、Nacos 健康检查正常。当时尚未创建实施提交；当前裁剪部署结果见下节。

最终会话验证：正常退出后访问 `/project-resources` 被拦截到 `/login?redirect=/project-resources`，静态资源路由仍保留；同一页面会话重新登录后成功返回资源页并显示 192 项资源。最后回到工作台，五个顶层入口顺序正确，开发运维折叠。浏览器截图工具超时，未保存截图；页面验收依据实际 DOM、路由及接口响应完成。

## 2026-11-15 源码裁剪与最终验收

### 删除范围与依赖边界

- 后端删除 member、BPM、pay、report、mp、mall、CRM、ERP、IoT、MES、WMS、IM、AI、HRM、FMS、PMS、OA 共 17 个无关业务模块，以及可选单体入口 `myblog-server` 和 infra 演示控制器、服务及数据访问实现，共 6,858 个原受控文件。
- 前端相对原前端基线删除 2,764 个文件，清除对应业务视图、API、详情路由、演示、监控入口及无引用专用组件和资源；移除 37 个直接依赖，lock 中包条目由 1,197 减至 927，无新增包、无保留依赖版本升级。
- 额外删除未被部署或依赖引用的 `script/livekit-poc` 14 个文件，以及 `myblog-ui` 中 5 个旧前端占位 README。保留 Sentinel、Seata、sharding 等学习示例。
- 根 Maven 聚合、依赖管理和网关路由收敛到 gateway、system、infra 及共享框架。部门、岗位、租户、OAuth、权限、登录、日志、文件等仍被保留页面和公共 API 使用的底座按依赖保留。
- 不删除原业务表、按钮权限、角色授权或既有数据。动态路由先经过 `filterAvailableRoutes()` 过滤，已无组件的叶菜单及空目录不会注册为可访问页面；外链继续保留。
- 前后端纳入单一仓库，`frontend` 为普通源码目录。根目录及前端 MIT 许可证、来源声明和全部 192 项原项目资源保留。本机环境变量、认证信息、依赖缓存、构建产物及 `.pi` 不提交。

### 构建与检查结果

- `mvn validate` 的 27 个 reactor 项目成功。三服务及依赖执行 `clean` 后，`-DskipTests package` 的 25 个项目全部成功；未执行完整后端测试套件。新 JAR 未包含已删业务模块或 infra 演示类。
- 前端剩余 `src` 的 ESLint、修改构建配置的 ESLint、改动文件 Prettier 及生产构建通过。全量 Prettier 仅剩未修改的 `src/views/Login/components/QrCodeForm.vue` 格式问题。
- `pnpm ts:check` 仍以退出码 2 结束，共 934 条既有诊断，其中 930 条为缺少自动导入名称。按文件、错误码和消息与裁剪前 15,349 条结果比较，本轮新增诊断为 0；不将生产构建成功等同于全量类型检查通过。
- 另从 Git 暂存树导出前端及根构建脚本到隔离目录，仅复用已安装的依赖目录；其中只有 `.env.example`，没有本机 `.env`。运行根构建脚本成功，确认构建源码和默认配置已纳入仓库。
- 裁剪版前端部署后静态目录共 233 个文件。构建、Nginx 挂载目录及 HTTP 读取的 `index.html` SHA-256 一致：`B6769703F3C5715EA6B02CF4840D8FDE0008653FB4CFF34905FDFA756AD5D14A`。

### 部署与功能验证

- 三个 Java 服务已换用 `blog-pruned-20261115` 镜像；MySQL、Redis、Nacos、Nginx 沿用原容器及数据卷，七服务继续运行。
- 裁剪后的后端有 12 项保留接口返回 HTTP 200、业务码 0，覆盖权限信息、个人资料、文件、账号、角色、系统日志、参数、代码生成、数据源和 API 日志。文件上传、列表定位、HTTP 内容读取及删除成功，测试文件已清理。
- 重新加载新前端后，五个顶层入口、13 个保留业务页及旧 URL 可用；菜单、字典和文件存储配置高亮、父目录展开正确，回工作台后开发运维折叠。验收期间未捕获到新前端运行错误。
- 资源页保留 192 个唯一外链，全部使用新标签及 `noopener noreferrer`；搜索“上传下载”命中 1 项并展开对应分类，无结果提示正常，无 iframe 或视频嵌入。
- 正常退出后直接访问资源页跳转到 `/login?redirect=/project-resources`，重新登录后返回 192 项资源页。重登后的角色集合和 2,554 项权限与原始基线完全一致。
- BPM、商城、ERP、infra 演示和 Swagger 前端旧地址仅匹配兜底路由，没有注册已删除组件。BPM 模型及 infra 演示后端接口返回业务码 404。

### 恢复与仓库说明

菜单回滚只恢复数据库导航。恢复已删功能时，应先恢复与旧版匹配的前后端源码或产物、依赖及路由，重新构建部署，再按需要回滚菜单和刷新精确缓存。本轮没有删除对应业务表。完整前端原 Git 元数据、后端原 Git 元数据及资源备份保存在本次会话 scratch；前端未裁剪基线为 `c67f134`，后端原基线为 `422a95bdbe0e033b03a328efbe690e33f0eb8067`。

后端原文件树另保存为独立基线提交 `1543a4f`，实施提交记录源码删除和前端纳入。目标仓库是账号 `ljk00000` 自有的独立私密 `Myblog`，不是 GitHub fork。原上游 remote 的 push URL 已禁用，只向自有仓库推送 `main`。

本机恢复点包括三个 Java 旧镜像的 `before-prune-20261115` 标签，以及 scratch 中的 `web-dist-before-prune` 前端静态目录备份。恢复静态目录前先保留现有产物；后端选择旧镜像时须与前端版本和菜单状态配套。
