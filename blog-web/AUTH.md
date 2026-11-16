# 站长登录配置

博客使用 Supabase Auth 的邮箱密码登录，SDK 固定为 `@supabase/supabase-js 2.119.0`。GitHub Pages 和 Nuxt SSR 使用同一套登录组件；无需公开本机 Java 服务。文章、资源、搜索和其他公开页面始终允许匿名访问。

这是博客前台的站长身份，与现有 Java 管理后台账号分开。当前不增加评论、收藏、写作或管理权限。后续受保护的数据和操作必须由服务端验证身份，并使用 RLS 或接口权限；不能把前端 UID 判断当作业务授权。

## 首次配置

1. 在 Supabase Dashboard 创建 Free 项目。项目的数据库密码由你自行保管，不写入源码、不发送给他人。博客登录不读取这个数据库，也不要求数据库密码。
2. 在 Authentication 的登录配置中保留 Email 登录，关闭 **Allow new users to sign up**。不要开放匿名登录或其他登录提供方。
3. 在 Authentication → Users 中手动创建你的站长账号，设置自己的邮箱、强密码并确认邮箱。之后复制该用户的 **User UID**。当前版本没有注册或找回密码入口；忘记密码时从托管面板重置。
4. 在项目连接信息中复制 **Project URL**，在 API Keys 中复制 **publishable key**（`sb_publishable_` 开头）。也支持旧版 `anon` key。禁止使用 `secret`、`service_role`、数据库密码或个人访问令牌。
5. 将 Authentication 的 Site URL 设为 `https://ljk00000.github.io`。本版本只使用邮箱密码，不使用邮箱链接或 OAuth 回调。

Supabase 免费项目可能在一周低活跃后暂停；暂停时需在 Dashboard 恢复。认证服务不可用不会影响公开内容阅读。免费额度及可用性以托管平台当前政策为准。

## 公开构建配置

以下三项允许出现在浏览器中，不是管理员私钥。它们一起配置；全部留空时不显示导航登录入口，直接访问 `/login` 会说明尚未启用。部分缺失、非 HTTPS 项目地址或高权限密钥会导致构建失败。正式环境不要使用本地测试项目和测试用户。

| 环境变量 | 内容 |
| --- | --- |
| `NUXT_PUBLIC_SUPABASE_URL` | 项目 HTTPS 地址，形如 `https://项目引用.supabase.co` |
| `NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 项目 publishable key；也接受 legacy anon key |
| `NUXT_PUBLIC_OWNER_USER_ID` | Authentication → Users 中站长账号的 UUID |

在当前 PowerShell 进程中设置这三项后，按 [前台说明](README.md#github-pages-静态发布) 执行 `pnpm export:pages` 并发布审核后的产物。静态站点的配置在构建时写入，修改后必须重新导出。不要把本机配置文件提交到源码仓库。

Nuxt 动态模式构建时同样设置这三项；运行时也可通过同名环境变量覆盖。静态导出后重新执行普通 `pnpm build`，再部署 SSR 容器。未配置登录不影响原有动态或静态构建。

## 会话与安全边界

- 页面只有站长邮箱密码登录，不调用注册 API；平台必须关闭注册，仅靠隐藏注册按钮不能阻止账号创建。
- 登录成功后仅接受配置的站长 UID，其他账号立即退出。恢复会话通过 `auth.getUser()` 向认证服务核验，不信任浏览器自行填写的用户信息。
- 密码只用于本次 HTTPS 登录请求，不写入应用存储；提交结束后清空输入框。会话由 SDK 保存在当前标签页的 `sessionStorage`，刷新可恢复，关闭标签页后不主动保留登录。浏览器“恢复标签页”可能恢复会话存储，离开共用设备前请主动退出。
- 退出使用 `scope: local`，清理当前会话，不退出其他设备。网络中断时 SDK 仍先清理本地会话；界面会提示服务端注销未确认。
- SDK 按需加载；没有已存会话的匿名访客不向认证服务发送请求。公开 Java 代理不附带 Supabase token、密码或管理令牌。
- `/login` 预渲染、标记 `noindex`，不进入 sitemap，并在 robots 中排除。静态 HTML 和公开快照不包含会话、密码或用户资料。
- 当前登录只显示站长身份，不授予 Java 后台权限；未来若接入写作功能，应另行设计可信服务端授权。

## 验证

```powershell
pnpm test:auth
pnpm typecheck
pnpm build
```

实际项目启用后，另验收一次真实账号登录、刷新恢复和退出；浏览器模拟认证响应只能验证前台流程，不能替代托管平台实际联调。站长密码和测试会话不得进入日志、截图或公开产物。
