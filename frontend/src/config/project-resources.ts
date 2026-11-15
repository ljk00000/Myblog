export const resourceCategories = [
  '源码与配套项目',
  'Boot/Cloud 开发文档',
  '作者动态',
  '视频教程与其他资源',
  '咨询服务',
  '各模块功能文档'
] as const

export type ResourceCategory = (typeof resourceCategories)[number]

export interface ProjectResource {
  title: string
  url: string
  category: ResourceCategory
  module?: string
  aliases?: string[]
  keywords?: string[]
}

type DocEntry = [title: string, path: string, aliases?: string[]]

const moduleDocs = (module: string, entries: DocEntry[]): ProjectResource[] =>
  entries.map(([title, path, aliases]) => ({
    title,
    url: `https://doc.iocoder.cn/${path}`,
    category: '各模块功能文档',
    module,
    aliases
  }))

// 从 359 个源文件的 398 个 DocAlert 调用提取，共 179 个唯一 URL。
// 同一 URL 只保留一项，原调用中的其他标题作为 aliases 保留，供筛选与查找。
export const projectResources: ProjectResource[] = [
  {
    title: 'ruoyi-vue-pro · Spring Boot 单体架构',
    url: 'https://github.com/YunaiV/ruoyi-vue-pro',
    category: '源码与配套项目'
  },
  {
    title: 'yudao-cloud · Spring Cloud 微服务架构',
    url: 'https://github.com/YunaiV/yudao-cloud',
    category: '源码与配套项目'
  },
  {
    title: 'yudao-ui-admin-vue3 · Vue3 + Element Plus 管理后台',
    url: 'https://github.com/yudaocode/yudao-ui-admin-vue3',
    category: '源码与配套项目'
  },
  {
    title: 'yudao-ui-admin-vben · Vue3 + vben5 (Ant Design) 管理后台',
    url: 'https://github.com/yudaocode/yudao-ui-admin-vben',
    category: '源码与配套项目'
  },
  {
    title: 'yudao-mall-uniapp · Vue3 + uniapp 商城手机端',
    url: 'https://github.com/yudaocode/yudao-mall-uniapp',
    category: '源码与配套项目'
  },
  {
    title: 'yudao-ui-admin-uniapp · Vue3 + uniapp 管理手机端',
    url: 'https://github.com/yudaocode/yudao-ui-admin-uniapp',
    category: '源码与配套项目'
  },
  {
    title: '原项目 GitHub 组织与更多项目',
    url: 'https://github.com/yudaocode',
    category: '源码与配套项目'
  },
  {
    title: 'Boot 开发文档',
    url: 'https://doc.iocoder.cn/',
    category: 'Boot/Cloud 开发文档',
    aliases: ['开发指南', '萌新必读：开发指南', '头像菜单：文档']
  },
  {
    title: 'Cloud 开发文档',
    url: 'https://cloud.iocoder.cn',
    category: 'Boot/Cloud 开发文档'
  },
  {
    title: '作者动态',
    url: 'https://www.iocoder.cn',
    category: '作者动态'
  },
  {
    title: '视频教程',
    url: 'https://doc.iocoder.cn/video/',
    category: '视频教程与其他资源',
    aliases: ['萌新必读：视频教程']
  },
  {
    title: '面试手册',
    url: 'https://www.iocoder.cn/Interview/good-collection/',
    category: '视频教程与其他资源',
    aliases: ['萌新必读：面试手册']
  },
  {
    title: '外包咨询',
    url: 'http://static.yudao.iocoder.cn/mp/Aix9975.jpeg',
    category: '咨询服务',
    aliases: ['萌新必读：外包咨询']
  },
  ...moduleDocs('系统管理 system', [
    ['用户体系', 'user-center/'],
    ['三方登录', 'social-user/', ['三方登陆']],
    ['Excel 导入导出', 'excel-import-and-export/'],
    ['功能权限', 'resource-permission'],
    ['数据权限', 'data-permission'],
    ['菜单路由', 'vue3/route/'],
    ['系统日志', 'system-log/'],
    ['地区 & IP', 'area-and-ip/'],
    ['SaaS 多租户', 'saas-tenant/'],
    ['短信配置', 'sms/'],
    ['邮件配置', 'mail'],
    ['站内信配置', 'notify/'],
    ['OAuth 2.0（SSO 单点登录)', 'oauth2/']
  ]),
  ...moduleDocs('基础设施 infra', [
    ['上传下载', 'file/'],
    ['配置中心', 'config-center/'],
    ['代码生成（单表）', 'new-feature/'],
    ['代码生成（树表）', 'new-feature/tree/'],
    ['代码生成（主子表）', 'new-feature/master-sub/'],
    ['单元测试', 'unit-test/'],
    ['多数据源（读写分离）', 'dynamic-datasource/'],
    ['接口文档', 'api-doc/'],
    ['定时任务', 'job/'],
    ['异步任务', 'async-task/'],
    ['消息队列', 'message-queue/'],
    ['本地缓存', 'local-cache/'],
    ['Redis 缓存', 'redis-cache/'],
    ['数据库 MyBatis', 'mybatis/'],
    ['服务监控', 'server-monitor/'],
    ['WebSocket 实时通信', 'websocket/']
  ]),
  ...moduleDocs('工作流 BPM', [
    ['工作流手册', 'bpm/'],
    ['流程表达式', 'bpm/expression/'],
    ['执行监听器、任务监听器', 'bpm/listener/'],
    ['流程发起、取消、重新发起', 'bpm/process-instance/'],
    ['审批加签、减签', 'bpm/sign/'],
    ['审批转办、委派、抄送', 'bpm/task-delegation-and-cc/'],
    ['审批通过、不通过、驳回', 'bpm/task-todo-done/'],
    ['审批接入（流程表单）', 'bpm/use-bpm-form/'],
    ['审批接入（业务表单）', 'bpm/use-business-form/']
  ]),
  ...moduleDocs('支付 pay', [
    ['支付功能开启', 'pay/build/'],
    ['支付宝支付接入', 'pay/alipay-pay-demo/'],
    ['支付宝、微信退款接入', 'pay/refund-demo/'],
    ['微信小程序支付接入', 'pay/wx-lite-pay-demo/'],
    ['微信公众号支付接入', 'pay/wx-pub-pay-demo/']
  ]),
  ...moduleDocs('会员 member', [
    ['会员手册（功能开启）', 'member/build/'],
    ['会员等级、积分、签到', 'member/level/'],
    ['会员用户、标签、分组', 'member/user/']
  ]),
  ...moduleDocs('商城 mall', [
    ['商城手册（功能开启）', 'mall/build/'],
    ['【营销】商城装修', 'mall/diy/'],
    ['【商品】商品分类', 'mall/product-category/'],
    ['【商品】商品评价', 'mall/product-comment/'],
    ['【商品】商品属性', 'mall/product-property/'],
    ['【商品】商品 SPU 与 SKU', 'mall/product-spu-sku/'],
    ['【营销】砍价活动', 'mall/promotion-bargain/'],
    ['【营销】拼团活动', 'mall/promotion-combination/'],
    ['【营销】内容管理', 'mall/promotion-content/'],
    ['【营销】优惠劵', 'mall/promotion-coupon/'],
    ['【营销】限时折扣', 'mall/promotion-discount/'],
    ['【营销】积分商城活动', 'mall/promotion-point/'],
    ['【营销】满减送', 'mall/promotion-record/'],
    ['【营销】秒杀活动', 'mall/promotion-seckill/'],
    ['【统计】会员、商品、交易统计', 'mall/statistics/'],
    ['【交易】售后退款', 'mall/trade-aftersale/'],
    ['【交易】分销返佣', 'mall/trade-brokerage/'],
    ['【交易】购物车', 'mall/trade-cart/'],
    ['【交易】快递发货', 'mall/trade-delivery-express/'],
    ['【交易】交易订单', 'mall/trade-order/']
  ]),
  ...moduleDocs('客户关系 CRM', [
    ['【商机】商机管理、商机状态', 'crm/business/'],
    ['【线索】线索管理', 'crm/clue/'],
    ['【合同】合同管理、合同提醒', 'crm/contract/'],
    ['【客户】客户管理、公海客户', 'crm/customer/'],
    ['【通用】跟进记录、待办事项', 'crm/follow-up/'],
    ['【通用】数据权限', 'crm/permission/'],
    ['【产品】产品管理、产品分类', 'crm/product/'],
    ['【回款】回款管理、回款计划', 'crm/receivable/']
  ]),
  ...moduleDocs('进销存 ERP', [
    ['ERP 手册（功能开启）', 'erp/build/'],
    ['【产品】产品信息、分类、单位', 'erp/product/'],
    ['【采购】采购订单、入库、退货', 'erp/purchase/'],
    ['【销售】销售订单、出库、退货', 'erp/sale/'],
    ['【库存】其它入库、其它出库', 'erp/stock-in-out/'],
    ['【库存】库存调拨、库存盘点', 'erp/stock-move-check/'],
    ['【库存】产品库存、库存明细', 'erp/stock/'],
    ['【财务】采购付款、销售收款', 'sale/finance-payment-receipt/']
  ]),
  ...moduleDocs('仓储 WMS', [
    ['WMS 手册（功能开启）', 'wms/build/'],
    ['【库存】库存记录、流水、统计', 'wms/inventory/'],
    ['【基础】商品、SKU、分类、品牌', 'wms/md/item/'],
    ['【基础】往来企业（供应商、客户）', 'wms/md/merchant/'],
    ['【基础】仓库', 'wms/md/warehouse/'],
    ['【单据】盘库', 'wms/order/check/'],
    ['【单据】移库', 'wms/order/movement/'],
    ['【单据】入库', 'wms/order/receipt/'],
    ['【单据】出库', 'wms/order/shipment/']
  ]),
  ...moduleDocs('制造 MES', [
    ['MES 手册（功能开启）', 'mes/build/'],
    ['【排班】排班计划、排班日历', 'mes/cal/calendar/'],
    ['【排班】班组设置、节假日设置', 'mes/cal/team/'],
    ['【设备】点检保养项目、点检保养方案', 'mes/dv/check-plan/'],
    ['【设备】点检记录、保养记录、维修单', 'mes/dv/check-record/'],
    ['【设备】设备类型、设备台账', 'mes/dv/device/'],
    ['【基础】编码规则', 'mes/md/autocode/'],
    ['【基础】客户管理、供应商管理', 'mes/md/client-vendor/'],
    ['【基础】物料产品、分类、计量单位', 'mes/md/product/'],
    ['【基础】车间设置、工作站设置', 'mes/md/workshop/'],
    ['【生产】安灯配置、安灯呼叫', 'mes/pro/andon/'],
    ['【生产】生产报工', 'mes/pro/feedback/'],
    ['【生产】工序设置、工艺流程', 'mes/pro/process-route/'],
    ['【生产】生产排产、工序流转卡', 'mes/pro/schedule-card/'],
    ['【生产】生产工单', 'mes/pro/work-order/'],
    ['【生产】工作记录', 'mes/pro/work-record/'],
    ['【质量】检测项设置、常见缺陷', 'mes/qc/base/'],
    ['【质量】过程检验（IPQC）', 'mes/qc/ipqc/'],
    ['【质量】来料检验（IQC）', 'mes/qc/iqc/'],
    ['【质量】出货检验（OQC）', 'mes/qc/oqc/'],
    ['【质量】待检任务、检验结果、缺陷记录', 'mes/qc/pending-inspect/'],
    ['【质量】退货检验（RQC）', 'mes/qc/rqc/'],
    ['【质量】质检方案', 'mes/qc/template/'],
    ['【工具】工具类型、工装夹具台账', 'mes/tm/tool/'],
    ['【仓库】生产领料、生产退料、物料消耗', 'mes/wm/issue-return/'],
    ['【仓库】其他入库、其他出库', 'mes/wm/misc/'],
    ['【仓库】外协发料、外协入库', 'mes/wm/outsource/'],
    ['【仓库】产品产出、产品入库', 'mes/wm/product-in/'],
    ['【仓库】到货通知、采购入库、采购退货', 'mes/wm/purchase-in/'],
    ['【仓库】发货通知、销售出库、销售退货', 'mes/wm/sales-out/'],
    ['【仓库】批次管理、库存现有量、库存事务', 'mes/wm/stock/'],
    ['【仓库】库存盘点', 'mes/wm/stocktaking/'],
    ['【仓库】调拨单、装箱管理', 'mes/wm/transfer/'],
    ['【仓库】仓库与库区库位、条码赋码、SN码', 'mes/wm/warehouse-setup/']
  ]),
  ...moduleDocs('办公 OA', [
    ['OA 手册（功能开启）', 'oa/build/'],
    ['【行政】会议室、车辆管理', 'oa/administration/meeting-vehicle/'],
    ['【行政】办公用品、用印管理', 'oa/administration/supply-seal/'],
    ['【流程】考勤、请假、加班、转正与离职', 'oa/attendance-application/'],
    ['【协作】公告、讨论、通讯录与笔记', 'oa/collaboration/communication/'],
    ['【协作】日程、任务、计划与汇报', 'oa/collaboration/work/'],
    ['【办公】企业云盘', 'oa/file/'],
    ['【办公】企业邮箱', 'oa/mail/'],
    ['【流程】公文管理', 'oa/official-doc/'],
    ['【流程】出差、费用报销', 'oa/travel-reimbursement/']
  ]),
  ...moduleDocs('人力资源 HRM', [
    ['【考勤】考勤管理', 'hrm/attendance/'],
    ['【员工】员工管理', 'hrm/employee/'],
    ['【社保】社保管理', 'hrm/insurance/'],
    ['【组织】工作台、组织架构', 'hrm/organization/'],
    ['【绩效】绩效考核、绩效档案', 'hrm/performance/assessment/'],
    ['【绩效】绩效模板、绩效计划', 'hrm/performance/template-plan/'],
    ['【招聘】招聘管理', 'hrm/recruit/'],
    ['【薪资】计薪设置、薪资档案、月度工资、工资条', 'hrm/salary/config/'],
    ['【薪资】月度工资、工资条', 'hrm/salary/payroll/']
  ]),
  ...moduleDocs('财务 FMS', [
    ['FMS 手册（功能开启）', 'fms/build/'],
    ['【结账】期末结账', 'fms/closing/'],
    ['【设置】账套管理、财务参数、财务指标', 'fms/config/account-set/'],
    ['【设置】币别、科目、辅助核算、初始余额', 'fms/config/accounting/'],
    ['【设置】凭证字、常用摘要、凭证模板', 'fms/config/voucher/'],
    ['【账簿】账簿管理', 'fms/ledger/'],
    ['【报表】财务报表', 'fms/report/'],
    ['【凭证】凭证管理', 'fms/voucher/']
  ]),
  ...moduleDocs('项目与知识库 PMS', [
    ['PMS 手册（功能开启）', 'pms/build/'],
    ['【PMS】文档与协作', 'pms/kb/document/'],
    ['【PMS】知识库管理', 'pms/kb/library/'],
    ['【PMS】项目中心、工作台与项目管理', 'pms/pm/project/', ['【PMS】项目模板']],
    ['【PMS】项目详情与迭代', 'pms/pm/project/detail/']
  ]),
  ...moduleDocs('公众号 mp', [
    ['公众号接入', 'mp/account/'],
    ['公众号图文', 'mp/article/'],
    ['自动回复', 'mp/auto-reply/'],
    ['公众号素材', 'mp/material/'],
    ['公众号菜单', 'mp/menu/'],
    ['模版消息', 'mp/message-template/'],
    ['公众号标签', 'mp/tag/'],
    ['公众号粉丝', 'mp/user/']
  ]),
  ...moduleDocs('报表 report', [
    ['积木报表', 'report/jimu/', ['积木仪表盘']],
    ['GoView 大屏', 'report/screen/'],
    ['UReport2 报表', 'report/ureport/']
  ]),
  ...moduleDocs('人工智能 AI', [
    ['AI 手册', 'ai/build/'],
    ['AI 对话', 'ai/chat/'],
    ['AI 图片生成', 'ai/image/'],
    ['AI 知识库', 'ai/knowledge/'],
    ['AI 思维导图', 'ai/mindmap/'],
    ['AI 音乐生成', 'ai/music/'],
    ['OCR 文字识别', 'ai/ocr/'],
    ['AI PPT 生成', 'ai/ppt/'],
    ['AI 语音生成', 'ai/speech/'],
    ['AI 工具调用（function calling）', 'ai/tool/'],
    ['AI 写作翻译', 'ai/write/']
  ])
]

// 系统日志为 system / infra 共用文档，统一归档一份，同时支持按两边业务名称检索。
const systemLog = projectResources.find(
  (resource) => resource.url === 'https://doc.iocoder.cn/system-log/'
)
if (systemLog)
  systemLog.keywords = ['基础设施 infra', '登录日志', '操作日志', 'API 访问日志', 'API 异常日志']
