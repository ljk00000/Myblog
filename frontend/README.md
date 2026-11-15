# Myblog 管理后台

本目录是个人博客项目的 Vue 3 + Element Plus 管理后台源码，与后端一起放在根仓库中管理。

当前保留工作台、文件管理、账号角色、系统日志及开发运维页面。文章、分类标签、评论、友链和站点设置尚未开发；原企业业务、演示及无关专用组件已经裁剪。原项目文档与资源集中在登录后的“原项目资源”页面。

## 本地开发

使用 Node.js >= 20.19.0 和 pnpm 10.28.0。在本目录执行：

```shell
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

按实际环境修改 `.env.local` 中的 API 地址、租户及验证码设置。示例默认连接本机网关 `http://127.0.0.1:48080`，不提供默认登录账号密码。本机环境文件不提交。

## 生产构建

在仓库根目录执行：

```shell
node script/blog-admin/build-frontend.cjs
```

默认同源 `/admin-api`、保留多租户、关闭验证码、清空默认登录账号密码及原项目统计，输出 `frontend/dist-prod`。已设置的进程环境变量可以覆盖构建脚本默认值；验证码设置应与后端一致。

部署、菜单迁移、源码恢复和实际验收记录见 [后台实施说明](../script/blog-admin/README.md) 与 [Docker Compose 说明](../script/docker-compose/README.md)。

## 检查与体积分析

```shell
pnpm ts:check
pnpm exec eslint src
```

当前全量类型检查仍有 934 条既有诊断，本轮裁剪没有新增诊断；生产构建及改动文件校验通过，详见实施说明。

默认不生成体积报告。需要分析时，在 PowerShell 中设置 `VITE_USE_BUNDLE_ANALYZER` 后运行根构建脚本：

```powershell
$env:VITE_USE_BUNDLE_ANALYZER='true'
node script/blog-admin/build-frontend.cjs
Remove-Item Env:VITE_USE_BUNDLE_ANALYZER
```

报告位于 `frontend/output/bundle-analyzer/stats.html`，不会进入部署目录，也不会自动打开浏览器；后一次分析会覆盖前一次报告。

## 来源与许可证

源自芋道 Vue 3 管理后台 `yudaocode/yudao-ui-admin-vue3`，基线提交 `c67f134`；采用 Vue Element Plus Admin 相关基础能力。保留原 MIT 许可证及必要版权声明，详见 [LICENSE](LICENSE)。项目总体说明见 [根 README](../README.md)。
