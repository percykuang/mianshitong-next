export type CareerMessageRole = 'assistant' | 'system' | 'user'

export interface CareerMessage {
  content: string
  role: CareerMessageRole
}
