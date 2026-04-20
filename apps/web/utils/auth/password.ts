const PASSWORD_PATTERN = /^[\x21-\x7e]+$/

export function validateRegistrationPassword(password: string | undefined) {
  if (!password || password.length < 8) {
    return '密码至少 8 位'
  }

  if (password.length > 16) {
    return '密码长度不能超过 16 位'
  }

  if (!PASSWORD_PATTERN.test(password)) {
    return '密码包含不支持的字符，请使用字母、数字和常见英文符号'
  }

  return null
}
