'use client'

import { useEffect, useReducer } from 'react'

import { useDebouncedValue } from '@mianshitong/hooks'
import { useRouter } from 'next/navigation'

import type { AdminSessionFilters } from '@/server/session'

import { buildSessionsHref } from './build-sessions-href'

interface SearchInputState {
  pendingQuery: string | null
  syncedQuery: string
  value: string
}

type SearchInputAction =
  | {
      type: 'change'
      value: string
    }
  | {
      type: 'sync'
      query: string
    }
  | {
      type: 'submit'
      query: string
    }

function reduceSearchInputState(
  state: SearchInputState,
  action: SearchInputAction
) {
  if (action.type === 'change') {
    return {
      ...state,
      value: action.value,
    }
  }

  if (action.type === 'submit') {
    return {
      ...state,
      pendingQuery: action.query,
    }
  }

  if (action.query === state.syncedQuery) {
    return state
  }

  if (action.query === state.pendingQuery) {
    return {
      syncedQuery: action.query,
      pendingQuery: null,
      value: state.value.trim() === action.query ? action.query : state.value,
    }
  }

  return {
    syncedQuery: action.query,
    pendingQuery: null,
    value: action.query,
  }
}

export function useSessionListSearch({
  filters,
}: {
  filters: AdminSessionFilters
}) {
  const router = useRouter()
  const [searchInput, dispatchSearchInput] = useReducer(
    reduceSearchInputState,
    {
      pendingQuery: null,
      syncedQuery: filters.query,
      value: filters.query,
    }
  )
  const searchQuery = searchInput.value
  const debouncedSearchQuery = useDebouncedValue(searchQuery)

  useEffect(() => {
    dispatchSearchInput({
      type: 'sync',
      query: filters.query,
    })
  }, [filters.query])

  useEffect(() => {
    const nextQuery = debouncedSearchQuery.trim()

    if (nextQuery !== searchQuery.trim()) {
      return
    }

    if (nextQuery === filters.query) {
      return
    }

    dispatchSearchInput({
      type: 'submit',
      query: nextQuery,
    })

    router.replace(
      buildSessionsHref({
        ...filters,
        page: 1,
        query: nextQuery,
      }),
      {
        scroll: false,
      }
    )
  }, [debouncedSearchQuery, filters, router, searchQuery])

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatchSearchInput({
      type: 'change',
      value: event.target.value,
    })
  }

  const resetSearchQuery = () => {
    dispatchSearchInput({
      type: 'change',
      value: '',
    })
    dispatchSearchInput({
      type: 'submit',
      query: '',
    })
  }

  return {
    handleSearchInputChange,
    resetSearchQuery,
    searchQuery,
  }
}
