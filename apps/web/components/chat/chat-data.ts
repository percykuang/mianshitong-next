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
      content:
        '如果这条内容是准备写进简历或面试表达里，建议先把“背景、动作、结果”补齐，再决定技术细节写到什么深度。',
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
      content:
        '可以，我们就按真实面试节奏往下走。我会先顺着你的输入追问，并尽量把回答拆成更容易说出口的结构。',
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
    content: `收到，你刚才提到的是“${normalizedInput.slice(
      0,
      36
    )}”。如果这是你想在面试里表达的内容，我建议我们先把它整理成更顺的回答结构。`,
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

export const sessionPreviews: ChatSessionPreview[] = [
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
        content:
          '这轮我们按真实前端一面的节奏来。我会更关注你是否能把背景、动作和结果讲顺，而不是单纯堆技术名词。',
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
        content:
          '很好。那如果面试官继续追问“你是怎么定位首页慢的问题的”，你可以先从诊断思路讲起，再展开具体优化动作。',
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
        content:
          '你现在的项目描述信息量不少，但“负责了什么”太多，“为什么值得写”太少。建议每段项目都至少保留一个可量化结果。',
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
        content:
          '那就把抽象背后的业务触发条件说清楚，例如为什么出现重复页面、为什么组件需要标准化，这样就不会显得虚。',
      },
    ],
  },
  {
    id: 'algorithm-warmup',
    title: '算法热身',
    preview: '更偏基础节奏，适合正式面试前快速找回答题状态。',
    messages: [],
  },
]
