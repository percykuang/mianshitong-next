export interface DbAdminSessionResult {
  expiresAt: Date
  maxAgeSeconds: number
  sessionToken: string
}
