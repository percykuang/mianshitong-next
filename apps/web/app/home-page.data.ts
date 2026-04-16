import { Code, FileText, MessageSquare } from '@mianshitong/ui'

export const HOME_PAGE_CONTENT = {
  cta: {
    buttonLabel: '开始对话',
    description: '立即与 AI 面试官对话，获取专业的面试指导和建议。',
    title: '准备好开始你的面试准备了吗？',
  },
  demos: [
    {
      title: '简历智能分析',
      description: '上传简历，AI 自动分析并提供优化建议。',
    },
    {
      title: '模拟面试场景',
      description: '真实面试对话，实时反馈和评分。',
    },
    {
      title: '面试题详解',
      description: '前端经典面试题目，详细解答和思路分析。',
    },
  ],
  demosSection: {
    description: '看看 AI 面试官如何帮助你准备面试',
    title: '功能演示',
  },
  features: [
    {
      title: '简历优化',
      description: '专业的简历分析和优化建议，帮你打造脱颖而出的简历。',
      icon: FileText,
    },
    {
      title: '模拟面试',
      description: '真实的面试场景模拟，提供即时反馈和改进建议。',
      icon: MessageSquare,
    },
    {
      title: '面试题解答',
      description: '涵盖前端、算法、系统设计等各类编程面试题详解。',
      icon: Code,
    },
  ],
  featuresSection: {
    description: '全方位的面试准备解决方案',
    title: '核心功能',
  },
  footer: {
    copyright: '© 2026 面试通',
  },
  header: {
    badge: '由 AI 驱动的智能面试助手',
    description:
      '专注编程领域，尤其前端开发。提供简历优化、模拟面试、面试题解答等全方位面试辅导服务。',
    primaryActionLabel: '立即开始',
    titleHighlight: ' AI Agent',
    titlePrefix: '你的专属',
    titleSuffix: ' 面试官',
  },
  highlights: [
    '专注前端开发领域',
    '基于最新技术栈',
    'AI 智能分析',
    '即时反馈建议',
  ],
} as const
