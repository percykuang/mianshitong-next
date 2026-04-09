import type {
  ChatModelId,
  ChatModelOption,
  ChatModelRuntimeInfo,
} from '@mianshitong/providers'

export interface ConversationMessage {
  id: string
  role: 'assistant' | 'user'
  label: string
  timestamp: string
  content: string
  points?: string[]
}

export interface ChatSessionPreview {
  id: string
  title: string
  preview: string
  pinned?: boolean
  messages: ConversationMessage[]
}

export interface ChatUsageSummary {
  used: number
  max: number
}

export type { ChatModelId, ChatModelOption }
export type ChatRuntimeDebugInfo = ChatModelRuntimeInfo

export const mockChatUsageByModel: Record<ChatModelId, ChatUsageSummary> = {
  'deepseek-chat': { used: 12, max: 50 },
  'deepseek-reasoner': { used: 6, max: 20 },
}

export function formatChatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function createChatSessionTitle(input: string) {
  return input.trim().slice(0, 18) || '新的面试对话'
}

export function createMockAssistantReply(input: string): ConversationMessage {
  const normalizedInput = input.trim()
  const timestamp = formatChatTimestamp()

  if (/简历|resume|项目亮点|项目经历|自我介绍/i.test(normalizedInput)) {
    return {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      label: '简历助手',
      timestamp,
      content: `## 简历优化建议

如果这条内容是准备写进简历或面试表达里，建议先把 **背景、动作、结果** 补齐，再决定技术细节写到什么深度。

> 简历不是“做过什么”的堆砌，而是“为什么值得你被约面试”。

你可以先按下面这个结构改一版：

1. 用一句话讲清楚业务背景和目标。
2. 再说明你负责的核心动作和判断。
3. 最后补一个能落地的结果指标。

例如：

\`\`\`md
- 负责首页性能优化，主导首屏资源拆分与图片加载策略调整
- 将 LCP 从 3.8s 降到 2.1s，首页跳出率下降 11%
\`\`\`

也可以顺手检查这条主线是否成立：**“我做了什么” -> “为什么这么做” -> “最后带来了什么结果”**。`,
      points: [
        '先说明业务背景和你负责的边界，避免只堆技术名词。',
        '动作部分优先突出你的判断、权衡和推进过程。',
        '结果最好量化，例如性能提升、效率提升或业务指标变化。',
      ],
    }
  }

  if (/模拟面试|面试|一面|二面|追问/i.test(normalizedInput)) {
    return {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      label: 'AI 面试官',
      timestamp,
      content: `## 模拟面试开始

可以，我们就按真实面试节奏往下走。我会先顺着你的输入追问，并尽量把回答拆成更容易说出口的结构。

### 这一轮我会重点看

- 你能不能把背景讲清楚
- 你做决策时有没有权衡意识
- 结果能不能讲得具体、可信

### 建议你的回答结构

1. 先给一句 20 到 30 秒的总述。
2. 再展开你具体做了什么，为什么这么做。
3. 最后补结果和复盘，方便我继续深挖。

> 如果你准备好了，我们就先从你最近一个最有代表性的项目开始。`,
      points: [
        '先给一句 20 到 30 秒的总述，交代背景和目标。',
        '再展开你具体做了什么，为什么这么做。',
        '最后补结果和复盘，方便后续继续深挖。',
      ],
    }
  }

  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    label: 'AI 面试官',
    timestamp,
    content: `### 我先帮你拆一下

收到，你刚才提到的是“**${normalizedInput.slice(0, 36)}**”。

如果这是你想在面试里表达的内容，我建议先把它整理成更顺的回答结构：

- 先说清楚这件事发生在什么业务场景里
- 再补你做判断时参考了哪些信息和约束
- 最后把结果讲具体，这样更像真实面试表达

如果你愿意，我下一轮可以继续帮你把它整理成一段更像面试现场的回答。`,
    points: [
      '先说清楚这件事发生在什么业务场景里。',
      '再补你做判断时参考了哪些信息和约束。',
      '最后把结果讲具体，这样更像真实面试表达。',
    ],
  }
}

export const quickPrompts = [
  '可以帮我优化简历吗？',
  '开始模拟面试，我是前端工程师 React 技术栈',
  '前端面试时，如何正确的自我介绍',
  '我是前端工程师，如何挖掘简历项目亮点',
] as const

const MARKDOWN_SHOWCASE_CONTENT = `# Markdown 渲染全量示例

这条消息用来集中验证当前聊天页里的 **Markdown 渲染能力**、代码高亮、表格、任务列表和引用样式。

---

## 1. 文本语义

这是普通段落文本，里面混合了 **粗体**、*斜体*、~~删除线~~、\`行内代码\` 和一个 [外部链接](https://nextjs.org/docs)。

也可以连续写几段：

第一段主要看默认文本样式是否舒展。

第二段主要看段落之间的垂直间距是否合适。

> 这是引用块。
>
> 它通常适合放说明、提示、总结，或者 AI 的补充建议。

---

## 2. 列表

### 无序列表

- 支持一级无序列表
- 支持列表项里的 **强调文本**
- 支持列表项里的 \`inline code\`

### 有序列表

1. 第一步：先描述问题背景
2. 第二步：再解释解决思路
3. 第三步：最后给出结果和复盘

### 任务列表

- [x] Markdown 标题
- [x] 引用块
- [x] 表格
- [x] 代码块
- [ ] 图片渲染
- [ ] 更复杂的嵌套列表样式优化

---

## 3. 表格

| 能力 | 当前状态 | 说明 |
| --- | --- | --- |
| 标题 | 已支持 | h1 / h2 / h3 已接入自定义样式 |
| GFM 表格 | 已支持 | 基于 \`remark-gfm\` |
| 行内代码 | 已支持 | 适合展示变量名、命令和 API |
| 代码块高亮 | 已支持 | 使用 \`shiki\` |
| 复制/下载代码 | 已支持 | 代码块右上角可操作 |

---

## 4. TypeScript 代码块

\`\`\`ts
type CandidateProfile = {
  name: string
  years: number
  stack: string[]
  highlights: string[]
}

const candidate: CandidateProfile = {
  name: 'Percy',
  years: 5,
  stack: ['React', 'Next.js', 'TypeScript'],
  highlights: ['性能优化', '组件设计系统', '工程化建设'],
}

function summarizeCandidate(profile: CandidateProfile) {
  return \`\${profile.name} 有 \${profile.years} 年经验，主栈是 \${profile.stack.join(' / ')}。\`
}

console.log(summarizeCandidate(candidate))
\`\`\`

## 5. JSON 代码块

\`\`\`json
{
  "scene": "mock-interview",
  "persona": "frontend-engineer",
  "questionCount": 8,
  "features": [
    "markdown",
    "syntax-highlight",
    "copy-code",
    "download-code"
  ]
}
\`\`\`

## 6. Bash 代码块

\`\`\`bash
pnpm install
pnpm dev:web
pnpm --filter @mianshitong/web typecheck
\`\`\`

## 7. Markdown 代码块

\`\`\`md
## 面试回答模板

1. 先讲背景
2. 再讲动作
3. 最后讲结果
\`\`\`

---

## 8. 混合内容

如果你要测试一段更像真实 AI 回复的内容，可以看下面这个结构：

1. **结论先行**
   先一句话回答问题，不要先铺垫太久。
2. **补充依据**
   用 2 到 3 个要点解释为什么这么判断。
3. **给出示例**
   最好再给一个简单代码片段或表格。

最后再来一行行内代码收尾：\`useEffectEvent\`、\`startTransition\`、\`useDeferredValue\`。`

const REACT_VS_VUE_CONTENT = `## React vs Vue 核心对比

| 对比维度 | React | Vue |
|---------|-------|-----|
| **定位** | 用于构建用户界面的 JavaScript **库** | 渐进式 JavaScript **框架** |
| **核心思想** | 函数式编程，UI = f(state)，强调不可变性 | 响应式系统，数据驱动视图，基于可变状态 |
| **模板语法** | JSX（JavaScript XML），在 JS 中写 HTML | 基于 HTML 的模板语法，指令系统（v-if, v-for） |
| **状态管理** | 内置 Hooks（useState），生态丰富（Redux, Zustand, Recoil） | 内置响应式系统（ref, reactive），官方推荐 Pinia（Vuex 继任者） |
| **更新机制** | 虚拟 DOM diff，组件函数重新执行 | 响应式依赖追踪，精确更新受影响组件 |
| **学习曲线** | 中等偏陡，需理解 JSX、Hooks、不可变数据 | 相对平缓，模板直观，文档友好 |
| **TypeScript 支持** | 优秀，由 Facebook 团队维护 | Vue 3 原生支持，体验良好 |
| **移动端方案** | React Native（成熟生态） | 官方维护 Vue Native（基于 React Native），社区有 Uni-app |
| **适用场景** | 大型复杂应用、设计系统、跨平台（React Native）、高自定义需求 | 快速原型、中小型项目、渐进式迁移、追求开发效率 |
| **生态特点** | 生态庞大但碎片化，选择多但需自行组合 | 官方维护路由、状态管理、构建工具，集成度更高 |
| **性能优化** | 需手动使用 useMemo、useCallback、React.memo | 自动追踪依赖，computed、watch 内置优化 |
| **社区活跃度** | 极高，全球使用最广，企业采用多 | 很高，国内尤其流行，中文文档完善 |

## 技术实现细节对比

| 技术点 | React | Vue 3 |
|--------|-------|-------|
| **响应式原理** | 手动触发更新（setState），通过虚拟 DOM diff | Proxy 代理，自动依赖收集与触发更新 |
| **组件通信** | Props 向下传递，Context 跨层级，状态提升 | Props + Emit，Provide/Inject，Vuex/Pinia |
| **逻辑复用** | 自定义 Hooks | Composables（类似 Hooks 但基于响应式系统） |
| **SSR 支持** | Next.js（主流方案） | Nuxt.js（主流方案） |
| **构建工具** | Create React App（官方），Vite（社区流行） | Vue CLI（官方），Vite（官方推荐） |
| **代码分割** | React.lazy + Suspense | defineAsyncComponent + Suspense（类似） |

## 选择建议总结

### 选 React 当：
- 团队有 React 经验或偏好函数式编程
- 项目需要高度定制和复杂抽象
- 需要 React Native 开发移动端
- 生态多样性更重要（不介意自行选型组合）

### 选 Vue 当：
- 追求快速上手和开发效率
- 偏好“约定大于配置”，减少决策成本
- 项目需要渐进式迁移（如从 jQuery 升级）
- 团队更看重中文文档和国内生态

---

**下一步建议**：
这个对比表格可以作为面试时的快速参考。如果你想深入某个具体的技术点（比如虚拟DOM差异、响应式原理实现），或者想针对其中一个框架进行模拟面试，我可以继续为你展开。`

const MARKDOWN_EDGE_CASE_CONTENT = `# Markdown 边界输入示例

这条消息专门用来验证 AI 在输出不那么规范的 Markdown 时，我们的渲染是否还能尽量稳定。

## 1. 段落后直接接代码块

下面这个 fenced code 故意紧跟在中文句号后面，没有手动空一行：\`\`\`ts
const profile = {
  name: 'Percy',
  stack: ['React', 'Next.js', 'TypeScript'],
}

console.log(profile)
\`\`\`
代码块结束后这段说明也故意直接贴着。

## 2. 表格后直接接代码块

| 项目 | 状态 |
| --- | --- |
| Markdown 标题 | 正常 |
| 代码块容错 | 重点观察 |
\`\`\`json
{
  "kind": "edge-case",
  "expectation": "still-render-as-block"
}
\`\`\`

## 3. 列表后直接接代码块

1. 先说背景
2. 再说判断
3. 最后给示例
\`\`\`bash
pnpm dev:web
pnpm --filter @mianshitong/web typecheck
\`\`\`

## 4. 引用和普通文本混排

> 这是一段引用，后面紧接着再来一段代码。
\`\`\`md
- [x] 结构稳定
- [x] 代码块不再错误嵌套到段落里
- [ ] 继续补更多边界 case
\`\`\`

最后再补一行普通文本，确认代码块收尾后段落间距仍然正常。`

export const sessionPreviews: ChatSessionPreview[] = [
  {
    id: 'react-vs-vue',
    title: 'React vs Vue 对比',
    preview:
      '用于验证双表格、分节标题、强调文本和建议区块的 Markdown 渲染效果。',
    pinned: true,
    messages: [
      {
        id: 'react-vs-vue-1',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '刚刚',
        content: REACT_VS_VUE_CONTENT,
      },
    ],
  },
  {
    id: 'markdown-showcase',
    title: 'Markdown 渲染全量示例',
    preview: '集中验证标题、引用、表格、任务列表、代码块和高亮效果。',
    pinned: true,
    messages: [
      {
        id: 'md-1',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '刚刚',
        content: MARKDOWN_SHOWCASE_CONTENT,
      },
    ],
  },
  {
    id: 'markdown-edge-cases',
    title: 'Markdown 边界输入',
    preview:
      '验证 AI 输出不规范 Markdown 时，代码块前后空行和块级结构是否仍然稳定。',
    pinned: true,
    messages: [
      {
        id: 'edge-md-1',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '刚刚',
        content: MARKDOWN_EDGE_CASE_CONTENT,
      },
    ],
  },
  {
    id: 'frontend-first-round',
    title: '前端一面模拟模拟模拟模拟模拟模拟拟模拟模拟模拟模',
    preview: '围绕最近项目经历，追问你如何定位首屏性能瓶颈与拆解优化方案。',
    pinned: true,
    messages: [
      {
        id: 'm1',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '19:42',
        content: `# 前端一面热身

这轮我们按真实前端一面的节奏来。我会更关注你是否能把 **背景、动作和结果** 讲顺，而不是单纯堆技术名词。

## 开场建议

- 先用 30 秒交代项目背景、业务目标和你的角色边界。
- 讲优化动作时优先说为什么做，再说怎么做。
- 结果最好量化，例如首屏时间、转化率或研发效率变化。

> 你不用急着把所有技术细节一次讲完，先把主线讲稳最重要。`,
        points: [
          '先用 30 秒交代项目背景、业务目标和你的角色边界。',
          '讲优化动作时优先说为什么做，再说怎么做。',
          '结果最好量化，例如首屏时间、转化率或研发效率变化。',
        ],
      },
      {
        id: 'm2',
        role: 'user',
        label: '你',
        timestamp: '19:44',
        content:
          '我最近做的是一个 Next.js 驱动的内容平台，主要负责首页体验优化和通用组件体系建设。',
      },
      {
        id: 'm3',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '19:45',
        content: `很好。那如果面试官继续追问 **“你是怎么定位首页慢的问题的？”**，你可以按下面这个顺序回答：

1. **先说现象**
   页面慢具体表现在哪里，是首屏白屏、图片加载慢，还是接口返回慢。
2. **再说定位方法**
   比如你看了 Performance 面板、Lighthouse、埋点数据，还是线上监控。
3. **最后说优化动作**
   哪些动作是快速见效的，哪些动作是后续系统性治理。

\`\`\`ts
const optimizationChecklist = [
  '确认瓶颈是在接口、资源加载还是渲染阶段',
  '用真实页面数据验证问题，而不是只看本地体感',
  '每做一项优化都回看指标是否真的改善',
]
\`\`\``,
      },
    ],
  },
  {
    id: 'resume-review',
    title: '简历项目深挖简历项目深挖简历项目深挖简历项目深挖',
    preview: '把“做了什么”改成“为什么做、如何权衡、结果如何量化”。',
    messages: [
      {
        id: 'r1',
        role: 'assistant',
        label: '简历助手',
        timestamp: '昨天',
        content: `# 简历项目深挖

你现在的项目描述信息量不少，但 **“负责了什么”** 太多，**“为什么值得写”** 太少。建议每段项目都至少保留一个可量化结果。

可以重点补这三类信息：

| 维度 | 现在的问题 | 更好的写法 |
| --- | --- | --- |
| 背景 | 只有技术名词 | 说明业务场景和目标 |
| 动作 | 只写“负责开发” | 写清楚你的判断和推进 |
| 结果 | 没有量化 | 给出性能、效率或业务指标 |

> 面试官真正想追问的，通常不是你“会不会某个技术”，而是你有没有解决过真实问题。`,
      },
      {
        id: 'r2',
        role: 'user',
        label: '你',
        timestamp: '昨天',
        content: '我想强调自己做过性能优化和组件抽象，但又怕写得太虚。',
      },
      {
        id: 'r3',
        role: 'assistant',
        label: '简历助手',
        timestamp: '昨天',
        content: `那就把抽象背后的业务触发条件说清楚，这样“组件抽象”就不会显得虚。

比如你可以这样写：

- 为什么会出现重复页面和重复逻辑
- 当时团队协作或交付效率碰到了什么问题
- 你为什么决定做组件标准化，而不是继续页面内复制
- 最后组件体系带来了什么收益

如果你要一句更像简历的话，可以参考：

\`\`\`md
基于多业务线重复页面和交付效率低的问题，推动搭建通用业务组件体系，统一表单、表格和弹窗模式，提升新页面开发效率并降低样式与交互不一致问题。
\`\`\``,
      },
    ],
  },
  {
    id: 'algorithm-warmup',
    title: '算法热身',
    preview: '更偏基础节奏，适合正式面试前快速找回答题状态。',
    messages: [
      {
        id: 'a1',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '刚刚',
        content: `## 算法热身题

我们先来一道不那么长、但很适合看基本功的题：

### 题目

给定一个字符串，只包含 \`(\`、\`)\`、\`[\`、\`]\`、\`{\`、\`}\`，请判断它是否是有效括号序列。

### 你可以先讲思路

1. 为什么想到用栈。
2. 入栈和出栈分别在什么时机发生。
3. 时间复杂度和空间复杂度是多少。

> 如果你已经有答案，我下一轮可以继续追问你边界条件和实现细节。`,
      },
      {
        id: 'a2',
        role: 'user',
        label: '你',
        timestamp: '刚刚',
        content:
          '我第一反应是用栈，遇到左括号入栈，遇到右括号就看栈顶能不能匹配。',
      },
      {
        id: 'a3',
        role: 'assistant',
        label: 'AI 面试官',
        timestamp: '刚刚',
        content: `这个方向是对的。你可以把回答再压成更像面试现场的版本：

\`\`\`ts
function isValid(s: string) {
  const stack: string[] = []
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  }

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
      continue
    }

    if (stack.pop() !== pairs[char]) {
      return false
    }
  }

  return stack.length === 0
}
\`\`\`

下一步你可以继续补两点：

- 如果字符串为空，结果应该是什么
- 为什么最后还要检查一次 \`stack.length === 0\``,
      },
    ],
  },
]
