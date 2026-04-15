'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useStore } from 'zustand'
import { createChatStore } from './core/store'
import {
  type ChatStore,
  type ChatStoreApi,
  type ChatStoreInitialState,
} from './core/types'

const ChatStoreContext = createContext<ChatStoreApi | null>(null)

export function ChatStoreProvider({
  children,
  ...initialState
}: ChatStoreInitialState & {
  children: ReactNode
}) {
  const [store] = useState(() => createChatStore(initialState))

  useEffect(() => {
    return () => {
      store.getState().dispose()
    }
  }, [store])

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  )
}

export function useChatStore<T>(selector: (state: ChatStore) => T) {
  const store = useContext(ChatStoreContext)

  if (!store) {
    throw new Error('useChatStore must be used within ChatStoreProvider')
  }

  return useStore(store, selector)
}

export function useChatStoreApi() {
  const store = useContext(ChatStoreContext)

  if (!store) {
    throw new Error('useChatStoreApi must be used within ChatStoreProvider')
  }

  return store
}
