# Myblog

基于芋道 Cloud `master-jdk25` 裁剪的个人博客开发底座，保留 JDK 25、Spring Boot 4、Spring Cloud Alibaba 和 Nacos 微服务架构。

当前提供管理后台基础能力，文章、分类标签、评论、友链和站点设置尚未开发。

## 项目结构

| 目录 | 用途 |
| --- | --- |
| `frontend` | Vue 3 + Element Plus 管理后台源码 |
| `yudao-gateway` | API 网关 |
| `yudao-module-system` | 登录鉴权、账号、角色、权限、菜单、字典和日志等系统底座 |
| `yudao-module-infra` | 文件、存储配置、参数、代码生成、数据源及 API 日志 |
| `yudao-framework` | 保留服务依赖的公共框架 |
| `yudao-dependencies` | Maven 依赖管理 |
| `script/docker-compose` | gateway、system、infra、Nginx、MySQL、Redis、Nacos 本机部署 |
| `script/blog-admin` | 后台导航迁移、回滚和实施说明 |
| `sql` | 上游数据库初始化脚本；不是本次源码裁剪的数据删除脚本 |

## 已保留的后台入口

- 工作台：登录用户欢迎信息，以及按权限显示的文件、个人资料和日志入口。
- 媒体资源：文件管理。
- 系统管理：管理员账号、角色与权限、登录日志、操作日志。
- 开发运维：菜单、字典、参数、文件存储、代码生成、数据源、API 日志、Nacos。
- 原项目资源：集中收纳 192 项原项目资源，支持搜索和分类展开。

无关企业业务源码已从当前工作树移除。为保持现有登录、鉴权及公共 API 依赖，system 内部的租户、组织、OAuth 等基础实现按依赖保留。已有数据库业务表和数据不随源码清理删除。

## 构建与部署

后端在仓库根目录执行：

```shell
mvn -B validate
mvn -B package -pl yudao-gateway,yudao-module-system/yudao-module-system-server,yudao-module-infra/yudao-module-infra-server -am -DskipTests
```

前端在仓库根目录执行：

```shell
cd frontend
pnpm install --frozen-lockfile
cd ..
node script/blog-admin/build-frontend.cjs
```

生产构建前需核对 API 地址、租户、验证码及统计配置。本机同源 API、关闭默认账号密码和原项目统计的构建命令见 [后台实施说明](script/blog-admin/README.md)。

部署步骤见 [Docker Compose 说明](script/docker-compose/README.md)。当前本机后台地址为 `http://127.0.0.1:8080`，网关为 `http://127.0.0.1:48080`，Nacos 控制台为 `http://127.0.0.1:18080`。端口绑定与环境变量应按实际部署环境配置。

首次导入上游 SQL 后需执行 `script/blog-admin/menu.apply.sql` 并按说明精确刷新菜单缓存，再正常退出并登录。仅恢复菜单不能恢复已删除源码；恢复旧功能还需从 Git 历史恢复对应代码并重新构建部署。

构建产物、依赖缓存、本机环境变量文件及认证信息不纳入源码仓库。

## 上游来源与许可证

后端来源：芋道 Cloud（`YunaiV/yudao-cloud`），基线提交 `422a95bdbe0e033b03a328efbe690e33f0eb8067`。

前端来源：芋道 Vue 3 管理后台（`yudaocode/yudao-ui-admin-vue3`），基线提交 `c67f134`。

保留原项目 MIT 许可证及必要版权声明，详见根目录 [LICENSE](LICENSE) 和前端许可证。当前项目作为独立私密仓库管理，未使用 GitHub fork。
