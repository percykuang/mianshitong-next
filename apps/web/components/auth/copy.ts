export interface AuthPageCopy {
  title: string
  description: string
  submitLabel: string
  passwordPlaceholder: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
}

export const LOGIN_PAGE_COPY: AuthPageCopy = {
  title: '登录',
  description: '使用邮箱和密码登录面试通',
  submitLabel: '登录',
  passwordPlaceholder: '请输入 8-16 位密码',
  footerText: '还没有账号？',
  footerLinkText: '立即注册',
  footerLinkHref: '/register',
}

export const REGISTER_PAGE_COPY: AuthPageCopy = {
  title: '注册',
  description: '使用邮箱和 8-16 位密码创建面试通账号',
  submitLabel: '注册',
  passwordPlaceholder: '请设置 8-16 位登录密码',
  footerText: '已经有账号？',
  footerLinkText: '立即登录',
  footerLinkHref: '/login',
}
