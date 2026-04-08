const allowedTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'init',
  'perf',
  'refactor',
  'release',
  'revert',
  'style',
  'test',
]

const allowedScopes = ['web', 'admin', 'tokens', 'icons', 'ui', 'repo', 'db']

// commitlint 的规则数组格式通常是：
// [严重级别, 条件, 规则值]
//
// 严重级别含义：
// 0 = 关闭该规则
// 1 = 警告（warning）
// 2 = 报错（error，校验不通过）
//
// 条件含义：
// 'always' = 必须满足这个规则
// 'never' = 必须不要满足这个规则
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // header 最长 100 个字符，超过会直接报错。
    'header-max-length': [2, 'always', 100],
    // scope 必须是小写，比如 web / admin / repo。
    'scope-case': [2, 'always', 'lower-case'],
    // scope 不允许为空，所以像 `feat: xxx` 会被拦住。
    'scope-empty': [2, 'never'],
    // 如果写了 scope，它必须在允许列表里。
    'scope-enum': [2, 'always', allowedScopes],
    // 关闭 subject 大小写限制，方便写中文提交信息。
    'subject-case': [0],
    // type 必须是允许的提交类型之一。
    'type-enum': [2, 'always', allowedTypes],
  },
}

export default config
