'use client'

import { type Dispatch, type SetStateAction } from 'react'
import {
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
  type ConversationMessage,
} from '@/components'

export interface UseChatReplyStateOptions {
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
  persistenceEnabled: boolean
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface PreparedReplySession {
  activeSession: ChatSessionPreview
  activeSessionId: string
  optimisticSession: ChatSessionPreview
  optimisticSessionId: string
}

export interface PrepareReplySessionOptions {
  input: string
  persistenceEnabled: boolean
  selectedModelId: ChatModelId
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface HydrateReplySessionOptions {
  optimisticSessionId: string
  persistenceEnabled: boolean
  sessionId: string | null
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface UpdateAssistantDraftOptions {
  content: string
  fallbackSession: ChatSessionPreview
  messageId: string
  sessionId: string
}

export interface AppendFallbackMessageOptions {
  fallbackMessage: ConversationMessage
  fallbackSession: ChatSessionPreview
  sessionId: string
}
