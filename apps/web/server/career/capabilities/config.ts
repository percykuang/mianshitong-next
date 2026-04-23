import type { CareerIntent } from '../shared'
import { FRONTEND_LEARNING_PROMPT } from './frontend-learning'
import { FRONTEND_OTHER_PROMPT } from './frontend-other'
import { FRONTEND_QA_PROMPT } from './frontend-qa'
import { GENERAL_ANSWER_PROMPT } from './general'
import { MOCK_INTERVIEW_PROMPT } from './mock-interview'
import { PROJECT_HIGHLIGHT_PROMPT } from './project-highlight'
import { RESUME_OPTIMIZE_PROMPT } from './resume-optimize'
import { SELF_INTRO_PROMPT } from './self-intro'
import type { CareerCapabilityConfig } from './types'

export const CAREER_CAPABILITY_CONFIGS = {
  frontend_learning: {
    intent: 'frontend_learning',
    label: '前端学习规划',
    description: '帮助用户学习前端知识点、制定学习路线和理解技术体系。',
    entryGuidance:
      '适用于学习路线、阶段目标、知识体系梳理、学习计划调整和知识点理解。',
    handoffGuidance:
      '当用户从其他任务切换到前端学习规划时，先自然确认切换，然后询问或利用用户当前基础、目标岗位和时间安排，给出学习路线或阶段计划。',
    prompt: FRONTEND_LEARNING_PROMPT,
    initialPhase: 'active',
  },
  frontend_other: {
    intent: 'frontend_other',
    label: '前端求职咨询',
    description: '回答前端求职、职业规划、面试准备等综合问题。',
    entryGuidance:
      '适用于职业选择、投递策略、面试准备、薪资与发展建议等综合咨询。',
    handoffGuidance:
      '当用户从其他任务切换到前端求职咨询时，先自然确认切换，然后围绕职业规划、投递策略、面试准备或薪资发展给出建议。',
    prompt: FRONTEND_OTHER_PROMPT,
    initialPhase: 'active',
  },
  frontend_qa: {
    intent: 'frontend_qa',
    label: '前端面试题解答',
    description: '回答前端面试题、技术原理、工程实践和面试追问。',
    entryGuidance:
      '适用于技术原理、工程实践、八股题、代码题思路、面试表达版回答。',
    handoffGuidance:
      '当用户从其他任务切换到前端面试题解答时，先自然确认切换，然后直接围绕用户的问题给出原理、面试表达和追问准备。',
    prompt: FRONTEND_QA_PROMPT,
    initialPhase: 'active',
  },
  general: {
    intent: 'general',
    label: '通用回答',
    description: '回答普通问题，不进入前端求职任务。',
    entryGuidance: '适用于与前端求职无关的普通问题、常识或闲聊。',
    handoffGuidance: '当用户切到普通问题时，正常回答，不强行进入前端求职任务。',
    prompt: GENERAL_ANSWER_PROMPT,
    initialPhase: 'active',
  },
  mock_interview: {
    intent: 'mock_interview',
    label: '模拟面试',
    description: '进行前端模拟面试、动态追问、点评、补救讲解和总结。',
    entryGuidance:
      '适用于“开始模拟面试”“继续追问我”“点评我的回答”“来下一题”“我不会”“给我标准答案”“先暂停”这类互动式面试场景。',
    handoffGuidance:
      '当用户从其他任务切换到模拟面试时，先自然确认切换，然后直接进入模拟面试开场；若用户没有限定岗位，默认按前端工程师通用面试开始；不要先追问工作年限，第一题固定让用户做自我介绍。',
    prompt: MOCK_INTERVIEW_PROMPT,
    initialPhase: 'opening',
  },
  project_highlight: {
    intent: 'project_highlight',
    label: '项目亮点',
    description: '帮助用户提炼项目亮点、简历表达和面试讲法。',
    entryGuidance: '适用于提炼项目亮点、改写项目经历、准备项目讲法和面试追问。',
    handoffGuidance:
      '当用户从其他任务切换到项目亮点提炼时，先自然确认切换，然后要求用户提供项目背景、个人职责、技术难点、方案与结果；如果已有项目上下文，可以直接开始提炼。',
    prompt: PROJECT_HIGHLIGHT_PROMPT,
    initialPhase: 'awaiting_project_context',
  },
  resume_optimize: {
    intent: 'resume_optimize',
    label: '简历优化',
    description: '帮助用户优化前端简历、提供模板、复审改动、强化项目经历。',
    entryGuidance:
      '适用于简历优化、简历复审、模板参考、项目经历改写、技能描述润色。',
    handoffGuidance:
      '当用户从其他任务切换到简历优化时，先自然确认切换，然后说明需要用户粘贴简历文本或选择先看模板；提醒用户脱敏，不要编造简历内容。',
    prompt: RESUME_OPTIMIZE_PROMPT,
    initialPhase: 'awaiting_entry_choice',
  },
  self_intro: {
    intent: 'self_intro',
    label: '面试自我介绍',
    description: '帮助用户准备前端岗位面试自我介绍。',
    entryGuidance:
      '适用于 30 秒 / 1 分钟 / 3 分钟自我介绍草拟、压缩、改写和岗位适配。',
    handoffGuidance:
      '当用户从其他任务切换到自我介绍时，先自然确认切换，然后要求用户提供岗位方向、工作年限、代表项目和目标时长；如果信息不足，先给最小澄清。',
    prompt: SELF_INTRO_PROMPT,
    initialPhase: 'awaiting_background',
  },
} satisfies Record<CareerIntent, CareerCapabilityConfig>
