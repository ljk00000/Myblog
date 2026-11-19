# GitHub Pages 自动发布

`https://ljk00000.github.io/` 是公开站点。管理后台继续使用原有 SSH 隧道。后台的发布、编辑已发布内容、下架和站点设置都会改变公开快照。保存草稿不会发布。

天翼云每两分钟从 `127.0.0.1:8080` 的匿名博客接口生成快照。GitHub Actions 每五分钟检查一次；有内容或前台源码变化时才在 GitHub 构建并部署。排队、构建和缓存会增加等待时间。公开仓库连续 60 天没有活动时，GitHub 可能停用定时工作流；可在仓库的 **Actions → Publish Myblog** 重新启用，并用 **Run workflow** 手动同步。

同步只复制公开正文、关于页面、封面、头像和资源引用的本地附件，并将下载链接改为站点内的 `/pages-media/` 路径。外部链接保留原地址。可直接提供常用图片、PDF、Office 文档、文本、ZIP；其他类型以 ZIP 提供，内嵌预览使用 PNG、JPEG 等位图。导出上限为每个附件 25 MiB、整站附件 200 MiB。删除或下架后，下一次成功部署会移除对应页面和不再引用的附件。已经下载的内容和外部缓存无法收回。

## 安装与维护

1. 服务器用无登录 shell 的 `myblog-pages` 系统用户运行收集器，目录 `/var/lib/myblog-pages` 模式为 `0750`、归属 `myblog-pages:myblog-pages`。把 `collect.py`、`sync.sh`、`read.sh` 放在 `/usr/local/lib/myblog-pages/`，由 root 管理，`read.sh` 需可执行。复制 `.service` 和 `.timer` 到 `/etc/systemd/system/`，执行 `systemctl daemon-reload`、`systemctl start myblog-pages.service` 和 `systemctl enable --now myblog-pages.timer`。
2. 创建专用系统用户 `myblog-pages-read`，shell 为 `/bin/sh`，不设密码，使用组 `myblog-pages` 读取快照。其主目录 `/var/lib/myblog-pages-read`、`.ssh/authorized_keys` 由 root 管理。为 Actions 单独创建 Ed25519 密钥对，公钥行的前缀必须是 `restrict,command="/usr/local/lib/myblog-pages/read.sh" `。只允许 `public-snapshot` 命令。私钥存入发布仓库的 Actions secret `MYBLOG_PAGES_READ_KEY`，已验证的 SSH 主机公钥行存入变量 `MYBLOG_PAGES_HOST_KEY`。不要复用管理员密钥。
3. 把 `myblog-pages.yml` 复制到发布仓库 `main` 的 `.github/workflows/myblog-pages.yml`。在 **Settings → Pages** 选 **GitHub Actions**。工作流从主仓库 `Myblog/main` 构建，它只拿到公开快照，无需后台令牌或服务器上的 GitHub 写入权限。

服务器日志：`journalctl -u myblog-pages.service -n 30 --no-pager`。查看计时器：`systemctl list-timers myblog-pages.timer`。导出或构建失败时，线上保留上一版。修正问题后可手动启动收集服务，再在 Actions 中运行工作流。临时停止自动发布时，禁用对应工作流；若要停止收集，同时执行 `systemctl disable --now myblog-pages.timer`。
