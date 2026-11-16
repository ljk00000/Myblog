<script setup lang="ts">
const view = ref<'application' | 'pages'>('application')
const groups = [
  { title: '公开前台', icon: 'web', tone: 'green', items: [
    { name: 'Nuxt', version: '4.5.0', purpose: '页面路由、服务端渲染与静态导出' },
    { name: 'Vue', version: '3.5.45', purpose: '页面组件与交互' },
    { name: 'TypeScript', version: '5.9.3', purpose: '前台代码与接口类型检查' },
    { name: 'Node.js', version: '24.14.0', purpose: '前台构建与 SSR 运行环境' },
    { name: 'Supabase Auth', version: 'SDK 2.119.0', purpose: '可选的托管站长登录；服务端无公开版本号，公开内容仍无需登录' },
  ] },
  { title: '管理后台', icon: 'admin', tone: 'green', items: [
    { name: 'Vue', version: '3.5.34', purpose: '内容编辑与管理页面' },
    { name: 'Vite', version: '8.1.4', purpose: '后台开发与生产构建' },
    { name: 'Element Plus', version: '2.13.7', purpose: '表单、表格和文件上传组件' },
    { name: 'TypeScript', version: '6.0.3', purpose: '管理端代码与接口类型' },
  ] },
  { title: 'Java 服务', icon: 'service', tone: 'blue', items: [
    { name: 'JDK', version: '25.0.2', purpose: '本地 Java 编译环境，项目编译目标为 Java 25' },
    { name: 'Eclipse Temurin', version: '25.0.5', purpose: 'Java 服务容器使用的运行时' },
    { name: 'Spring Boot', version: '4.1.2', purpose: '服务启动、配置和 HTTP 接口' },
    { name: 'Spring Cloud', version: '2025.1.2', purpose: '网关路由与微服务集成' },
    { name: 'Spring Cloud Gateway', version: '5.0.2', purpose: '公开内容和管理接口的统一网关' },
    { name: 'Spring Cloud Alibaba', version: '2025.1.0.0', purpose: '集成 Nacos 服务发现与配置' },
  ] },
  { title: '数据与服务治理', icon: 'database', tone: 'amber', items: [
    { name: 'MySQL', version: '8.4.13', purpose: '文章、资源、站点设置与系统数据' },
    { name: 'MyBatis-Plus', version: '3.5.17', purpose: 'Java 数据访问与分页查询' },
    { name: 'Redis', version: '7.4.12', purpose: '登录状态与系统缓存' },
    { name: 'Nacos', version: '3.0.3', purpose: '服务注册、发现与配置管理' },
  ] },
  { title: '内容处理', icon: 'markdown', tone: 'blue', items: [
    { name: 'Markdown', version: '规范 0.31.2', purpose: '采用 CommonMark 规范，编辑文章、资源说明与关于页' },
    { name: 'CommonMark Java', version: '0.27.1', purpose: '在 Java 服务中将 Markdown 转为 HTML' },
    { name: 'Jsoup', version: '1.23.2', purpose: '清理 HTML，保留允许的内容与链接' },
  ] },
  { title: '构建与发布', icon: 'deploy', tone: 'purple', items: [
    { name: 'Docker Compose', version: '5.7.0', purpose: '编排前台、Java 服务与基础设施' },
    { name: 'Nginx', version: '1.28.3', purpose: '托管管理后台，转发管理接口' },
    { name: 'GitHub Actions', version: '无公开版本号', purpose: '托管工作流服务；源码检查使用 checkout v7、setup-java v6' },
    { name: 'GitHub Pages', version: '无公开版本号', purpose: '托管静态网页，由 GitHub 持续维护的平台服务' },
  ] },
] as const
useBlogSeo(() => ({ title: '技术栈', description: '这个博客使用的前台、管理后台、Java 微服务、数据库与部署技术，以及完整应用和 GitHub Pages 的架构图。' }))
</script>

<template>
  <div class="stack-page">
    <header class="page-heading"><h1>技术栈</h1><p>这个博客的前端、后端和部署方式。</p></header>

    <section class="architecture" aria-labelledby="architecture-title">
      <div class="architecture-toolbar">
        <h2 id="architecture-title">系统架构</h2>
        <div class="architecture-switch" role="group" aria-label="选择架构图">
          <button type="button" :aria-pressed="view === 'application'" aria-controls="application-diagram" @click="view = 'application'">完整应用</button>
          <button type="button" :aria-pressed="view === 'pages'" aria-controls="pages-diagram" @click="view = 'pages'">当前公网</button>
        </div>
      </div>
      <p class="architecture-description">{{ view === 'application' ? '前台负责展示，Java 服务负责内容、权限和数据。' : '构建时读取公开内容，访问时由 GitHub Pages 提供静态页面。' }}</p>

      <figure v-show="view === 'application'" id="application-diagram" class="architecture-figure" aria-labelledby="application-caption">
        <div class="diagram-canvas">
          <div class="layer-caption"><span class="legend-dot tone-green" />前端</div>
          <div class="node-grid node-grid-two">
            <div class="stack-node tone-green">
              <div class="node-heading"><span class="node-icon"><StackGlyph name="web" /></span><span class="node-type">公开前台</span></div>
              <h3>Nuxt + Vue</h3><p>文章阅读、搜索、筛选与 SEO</p><span class="node-tag">Nuxt 4.5.0 · Vue 3.5.45<br>SSR / 静态导出</span>
            </div>
            <div class="stack-node tone-green">
              <div class="node-heading"><span class="node-icon"><StackGlyph name="admin" /></span><span class="node-type">管理后台</span></div>
              <h3>Vue + Element Plus</h3><p>内容编辑、文件上传与站点设置</p><span class="node-tag">Vue 3.5.34 · Element Plus 2.13.7<br>Vite 8.1.4 · Nginx 1.28.3</span>
            </div>
          </div>
          <div class="flow-connector"><i aria-hidden="true" /><span>公开内容请求 / 后台管理请求</span></div>
          <div class="backend-group">
            <div class="backend-heading"><span class="layer-caption"><span class="legend-dot tone-blue" />Java 微服务</span><span class="backend-runtime">Java 25.0.5 · Spring Boot 4.1.2</span></div>
            <div class="stack-node gateway-node tone-blue">
              <span class="node-icon"><StackGlyph name="gateway" /></span><div><h3>Spring Cloud Gateway</h3><p>统一 API 入口，按路径路由到对应服务</p><span class="node-tag">5.0.2</span></div>
            </div>
            <div class="service-branches" aria-hidden="true"><span /><span /><span /></div>
            <div class="node-grid service-grid">
              <div class="stack-node tone-blue"><h3>博客内容</h3><code>blog-server</code><p>文章、资源、分类、标签与公开接口</p></div>
              <div class="stack-node tone-blue"><h3>系统管理</h3><code>system-server</code><p>登录、用户、角色与权限</p></div>
              <div class="stack-node tone-blue"><h3>基础功能</h3><code>infra-server</code><p>文件上传、存储配置与日志</p></div>
            </div>
            <div class="registry-node tone-amber"><span class="node-icon"><StackGlyph name="registry" /></span><div><h3>Nacos <span>3.0.3</span></h3><p>向 Gateway 和各服务提供注册发现与配置管理</p></div><span class="registry-kind">服务治理</span></div>
          </div>
          <div class="flow-connector"><i aria-hidden="true" /><span>数据读写 / 系统缓存</span></div>
          <div class="node-grid node-grid-two data-grid">
            <div class="stack-node data-node tone-amber"><span class="node-icon"><StackGlyph name="database" /></span><div><h3>MySQL <span>8.4.13</span></h3><p>内容与系统数据</p></div></div>
            <div class="stack-node data-node tone-amber"><span class="node-icon"><StackGlyph name="cache" /></span><div><h3>Redis <span>7.4.12</span></h3><p>登录状态与系统缓存</p></div></div>
          </div>
        </div>
        <figcaption id="application-caption">完整应用通过 Docker Compose 5.7.0 部署。网关、博客、系统和基础服务分别运行。</figcaption>
      </figure>

      <figure v-show="view === 'pages'" id="pages-diagram" class="architecture-figure" aria-labelledby="pages-caption">
        <div class="diagram-canvas pages-canvas">
          <div class="publish-stage">
            <div class="layer-caption"><span class="legend-dot tone-blue" />构建阶段</div>
            <div class="publish-step tone-blue"><span class="node-icon"><StackGlyph name="service" /></span><div><h3>Java 公开接口</h3><p>Spring Boot 4.1.2，提供已公开的文章、资源和站点设置</p></div><span class="step-label">内容来源</span></div>
            <div class="flow-connector"><i aria-hidden="true" /><span>匿名读取公开内容</span></div>
            <div class="publish-step tone-green"><span class="node-icon"><StackGlyph name="export" /></span><div><h3>Nuxt 4.5.0 静态导出</h3><p>预渲染 HTML，生成 CSS、JavaScript 和公开内容快照</p></div><span class="step-label">本地构建</span></div>
          </div>
          <div class="flow-connector publish-boundary"><i aria-hidden="true" /><span>提交静态产物，由 GitHub Actions 发布</span></div>
          <div class="publish-stage">
            <div class="layer-caption"><span class="legend-dot tone-purple" />访问阶段</div>
            <div class="publish-step tone-purple"><span class="node-icon"><StackGlyph name="pages" /></span><div><h3>GitHub Pages</h3><p>托管服务，无公开版本号；通过 HTTPS 提供网页与静态资源</p></div><span class="step-label">公网托管</span></div>
            <div class="flow-connector"><i aria-hidden="true" /><span>读取页面与同源 JSON 快照</span></div>
            <div class="publish-step tone-green"><span class="node-icon"><StackGlyph name="browser" /></span><div><h3>读者浏览器</h3><p>显示正文，并在本地完成搜索、筛选和分页</p></div><span class="step-label">阅读与交互</span></div>
          </div>
        </div>
        <figcaption id="pages-caption">公开内容不连接本机 API。可选的站长登录由浏览器直连 Supabase Auth；后台内容更新后仍需重新导出并发布。</figcaption>
      </figure>
      <div class="architecture-note"><StackGlyph name="pages" /><p>当前公网站点使用 <strong>GitHub Pages</strong>。切换“当前公网”可查看它与完整应用的区别。</p></div>
    </section>

    <section class="stack-inventory" aria-labelledby="inventory-title">
      <div class="inventory-heading"><h2 id="inventory-title">使用的技术</h2><p>版本来自项目依赖与当前部署；托管服务单独标注。</p></div>
      <div class="technology-grid">
        <section v-for="group in groups" :key="group.title" class="technology-group" :class="`tone-${group.tone}`">
          <h3><span class="group-icon"><StackGlyph :name="group.icon" /></span>{{ group.title }}</h3>
          <dl><div v-for="item in group.items" :key="item.name" class="technology-row"><dt>{{ item.name }}<span class="tech-version">{{ item.version }}</span></dt><dd>{{ item.purpose }}</dd></div></dl>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack-page { --line: #4a5360; --green: #8bc5ac; --blue: #9db9dc; --amber: #d7b783; --purple: #b7aad9; }
.tone-green { --tone: var(--green); }
.tone-blue { --tone: var(--blue); }
.tone-amber { --tone: var(--amber); }
.tone-purple { --tone: var(--purple); }
.architecture { border: 1px solid var(--border); border-radius: 10px; overflow: clip; }
.architecture-toolbar { padding: 22px 24px 0; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.architecture-toolbar h2, .inventory-heading h2 { font-size: 20px; }
.architecture-switch { display: flex; gap: 4px; padding: 4px; background: #121417; border: 1px solid var(--border); border-radius: 7px; flex-shrink: 0; }
.architecture-switch button { min-height: 36px; padding: 6px 14px; border: 1px solid transparent; border-radius: 4px; color: var(--muted); background: transparent; font-size: 13px; }
.architecture-switch button[aria-pressed='true'] { background: var(--surface-raised); border-color: #48515e; color: var(--ink); }
.architecture-switch button:hover { color: var(--ink); }
.architecture-description { margin: 12px 24px 0; color: var(--muted); font-size: 14px; }
.architecture-figure { margin: 0; }
.diagram-canvas { padding: 28px 32px 24px; }
.layer-caption { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 12px; }
.legend-dot { width: 6px; height: 6px; background: var(--tone); border-radius: 50%; flex-shrink: 0; }
.node-grid { display: grid; gap: 16px; min-width: 0; }
.node-grid-two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stack-node { position: relative; min-width: 0; padding: 18px 20px; border: 1px solid var(--border); border-top: 2px solid var(--tone); border-radius: 7px; background: var(--surface); }
.node-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.node-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: #17191c; border: 1px solid var(--border); border-radius: 7px; color: var(--tone); flex-shrink: 0; }
.node-icon svg { width: 22px; height: 22px; }
.node-type { font-size: 12px; color: var(--muted); }
.stack-node h3, .publish-step h3, .registry-node h3 { font-size: 16px; font-weight: 600; }
.stack-node p, .publish-step p, .registry-node p { font-size: 13px; line-height: 1.7; color: var(--muted); margin-top: 4px; }
.node-tag { display: inline-block; margin-top: 12px; font-size: 11px; color: var(--tone); }
.flow-connector { position: relative; display: flex; align-items: center; justify-content: center; min-height: 54px; padding: 8px 0; }
.flow-connector i { position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: var(--line); }
.flow-connector i::after { content: ''; position: absolute; bottom: 1px; left: -3px; width: 7px; height: 7px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); transform: rotate(45deg); }
.flow-connector > span { position: relative; color: var(--muted); font-size: 11px; line-height: 1.6; padding: 3px 10px; background: var(--bg); text-align: center; }
.backend-group { padding: 18px 20px 20px; border: 1px solid #3b4859; border-radius: 8px; background: #1b1f25; }
.backend-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.backend-heading .layer-caption { margin: 0; }
.backend-runtime { color: var(--muted); font-size: 11px; }
.gateway-node { max-width: 470px; margin-inline: auto; display: flex; gap: 14px; align-items: center; }
.service-branches { height: 32px; position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.service-branches::before { content: ''; position: absolute; height: 16px; width: 1px; left: 50%; top: 0; background: var(--line); }
.service-branches::after { content: ''; position: absolute; top: 16px; left: calc(100% / 6); right: calc(100% / 6); height: 1px; background: var(--line); }
.service-branches span { position: relative; }
.service-branches span::after { content: ''; position: absolute; bottom: 0; left: 50%; height: 16px; width: 1px; background: var(--line); }
.service-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.service-grid .stack-node { padding: 16px; }
.service-grid h3 { font-size: 14px; }
.service-grid code { font-family: var(--mono); font-size: 11px; color: var(--tone); }
.service-grid p { margin-top: 8px; font-size: 12px; }
.registry-node { display: flex; gap: 12px; align-items: center; margin-top: 16px; padding: 12px 14px; border: 1px dashed #665941; border-radius: 6px; }
.registry-node h3 { font-size: 14px; }
.registry-node h3 span, .data-node h3 span { font-family: var(--mono); font-size: 12px; font-weight: 400; color: var(--muted); margin-left: 6px; }
.registry-node p { font-size: 12px; }
.registry-kind { font-size: 11px; color: var(--amber); margin-left: auto; flex-shrink: 0; }
.data-node { display: flex; align-items: center; gap: 14px; }
.architecture-figure figcaption { padding: 0 24px 20px; font-size: 12px; color: var(--muted); }
.architecture-note { display: flex; align-items: center; gap: 12px; padding: 14px 24px; border-top: 1px solid var(--border); background: var(--surface); }
.architecture-note > svg { color: var(--purple); width: 20px; height: 20px; flex-shrink: 0; }
.architecture-note p { color: var(--muted); font-size: 12px; }
.architecture-note strong { color: var(--ink); font-weight: 500; }
.pages-canvas { max-width: 820px; margin-inline: auto; }
.publish-stage { border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
.publish-step { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-left: 2px solid var(--tone); border-radius: 6px; }
.publish-step > div { min-width: 0; }
.step-label { font-size: 11px; color: var(--tone); margin-left: auto; flex-shrink: 0; }
.publish-stage .flow-connector { min-height: 44px; }
.publish-boundary { min-height: 66px; }
.stack-inventory { margin-top: 40px; }
.inventory-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding-bottom: 16px; }
.inventory-heading p { color: var(--muted); font-size: 12px; }
.technology-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.technology-group { min-width: 0; padding: 20px; border: 1px solid var(--border); border-radius: 8px; }
.technology-group > h3 { display: flex; align-items: center; gap: 10px; font-size: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.group-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; background: var(--surface); color: var(--tone); }
.group-icon svg { width: 18px; height: 18px; }
.technology-group dl { margin: 0; }
.technology-row { margin-top: 16px; }
.technology-row dt { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; font-size: 14px; font-weight: 500; }
.tech-version { font-family: var(--mono); font-size: 11px; font-weight: 400; color: var(--tone); flex-shrink: 0; }
.technology-row dd { font-size: 12px; color: var(--muted); margin: 3px 0 0; line-height: 1.7; }
@media (max-width: 720px) {
  .architecture-toolbar { padding: 18px 18px 0; }
  .architecture-toolbar h2, .inventory-heading h2 { font-size: 18px; }
  .architecture-description { margin-inline: 18px; font-size: 13px; }
  .diagram-canvas { padding: 22px 18px 18px; }
  .stack-node { padding: 16px; }
  .backend-group { padding: 16px; }
  .backend-heading { flex-wrap: wrap; gap: 6px; }
  .service-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; padding-left: 18px; margin-top: 20px; position: relative; }
  .service-grid::before { content: ''; position: absolute; left: 0; width: 1px; background: var(--line); top: -20px; bottom: 50px; }
  .service-grid .stack-node::before { content: ''; position: absolute; top: calc(50% - 1px); left: -19px; width: 18px; height: 1px; background: var(--line); }
  .service-branches { display: none; }
  .service-grid .stack-node { padding: 12px 14px; }
  .service-grid p { margin-top: 4px; }
  .registry-node { padding: 12px; }
  .registry-kind { display: none; }
  .architecture-figure figcaption { padding-inline: 18px; }
  .architecture-note { padding: 14px 18px; align-items: start; }
  .architecture-note > svg { margin-top: 2px; }
  .publish-stage { padding: 16px; }
  .publish-step { padding: 14px; }
  .step-label { display: none; }
  .technology-grid { gap: 16px; }
  .technology-group { padding: 16px; }
  .inventory-heading { align-items: start; flex-direction: column; gap: 4px; }
}
@media (max-width: 540px) {
  .architecture-toolbar { flex-direction: column; align-items: start; gap: 12px; }
  .architecture-switch { width: 100%; }
  .architecture-switch button { flex: 1; min-height: 40px; }
  .node-grid-two, .technology-grid { grid-template-columns: minmax(0, 1fr); }
  .node-grid-two { gap: 12px; }
  .node-heading { margin-bottom: 8px; }
  .stack-node h3, .publish-step h3 { font-size: 15px; }
  .node-tag { margin-top: 8px; }
  .gateway-node { align-items: start; }
  .gateway-node .node-icon { display: none; }
  .registry-node { align-items: start; gap: 10px; }
  .registry-node .node-icon { width: 28px; height: 28px; }
  .registry-node .node-icon svg { width: 18px; height: 18px; }
  .publish-step { align-items: start; gap: 10px; }
  .publish-step .node-icon { width: 30px; height: 30px; }
  .publish-step .node-icon svg { width: 19px; height: 19px; }
  .publish-step p { font-size: 12px; }
  .publish-stage { padding: 14px; }
  .publish-boundary > span { max-width: 90%; }
  .stack-inventory { margin-top: 28px; }
}
</style>
