# Myblog 开发约定

## 主仓库

- 本项目在 `https://github.com/ljk00000/Myblog` 开源维护，默认开发分支是 `main`。
- 后续前台、管理后台、Java 服务、部署脚本和文档的改动，均在这个仓库开发、提交并同步到 `origin/main`。
- 本地 `origin` 应指向 `git@github.com:ljk00000/Myblog.git`，`main` 跟踪 `origin/main`；开始工作时检查当前分支和用户未提交的改动。
- 保留现有提交历史，正常提交和推送。`upstream` 是只读来源参考，保持其推送地址为 `DISABLED`。

## 网站同步

- `ljk00000/ljk00000.github.io` 是现有博客的静态产物发布仓库，网站地址为 `https://ljk00000.github.io/`。
- 前台界面或公开内容变化后，按 `blog-web/README.md` 从匿名公开接口重新导出、检查并同步产物；只推送源码不会更新公网页面。
- 保留 Nuxt SSR 和 GitHub Pages 两种构建模式，静态导出后需要普通构建才能验证动态 SSR。

## 修改与验证

- 使用项目现有技术栈和文档约定，局部修改，并运行与改动相关的检查。
- 保留 MIT 许可证、上游来源、原有授权和业务数据。
- 凭据、私有环境文件、依赖缓存、构建产物及临时验收文件保留在仓库外或已忽略位置。
- Java 与两套前端的接口以 `script/blog/CONTRACT.md` 为准；部署步骤见 `script/docker-compose/README.md`。
