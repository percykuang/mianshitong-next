'use client'

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'

export interface PopoverProps {
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
  className?: string
  offset?: number
  onOpenChange?: (open: boolean) => void
  open: boolean
  placement?: PopoverPlacement
  style?: CSSProperties
  viewportPadding?: number
  zIndex?: number
}

function clamp(value: number, min: number, max: number) {
  if (max < min) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

function getPopoverCoordinates({
  anchorRect,
  offset,
  panelHeight,
  panelWidth,
  placement,
}: {
  anchorRect: DOMRect
  offset: number
  panelHeight: number
  panelWidth: number
  placement: PopoverPlacement
}) {
  const [vertical, horizontal] = placement.split('-') as [
    'bottom' | 'top',
    'start' | 'end',
  ]

  return {
    left:
      horizontal === 'end' ? anchorRect.right - panelWidth : anchorRect.left,
    top:
      vertical === 'top'
        ? anchorRect.top - panelHeight - offset
        : anchorRect.bottom + offset,
  }
}

function resolvePopoverPosition({
  anchorRect,
  offset,
  panelHeight,
  panelWidth,
  placement,
  viewportHeight,
  viewportPadding,
  viewportWidth,
}: {
  anchorRect: DOMRect
  offset: number
  panelHeight: number
  panelWidth: number
  placement: PopoverPlacement
  viewportHeight: number
  viewportPadding: number
  viewportWidth: number
}) {
  const [vertical, horizontal] = placement.split('-') as [
    'bottom' | 'top',
    'start' | 'end',
  ]
  const oppositeVertical = vertical === 'bottom' ? 'top' : 'bottom'
  const oppositeHorizontal = horizontal === 'start' ? 'end' : 'start'
  const fitsBottom =
    anchorRect.bottom + offset + panelHeight <= viewportHeight - viewportPadding
  const fitsTop = anchorRect.top - offset - panelHeight >= viewportPadding

  let resolvedPlacement = placement

  if (vertical === 'bottom' && !fitsBottom && fitsTop) {
    resolvedPlacement = `${oppositeVertical}-${horizontal}`
  }

  if (vertical === 'top' && !fitsTop && fitsBottom) {
    resolvedPlacement = `${oppositeVertical}-${horizontal}`
  }

  let nextPosition = getPopoverCoordinates({
    anchorRect,
    offset,
    panelHeight,
    panelWidth,
    placement: resolvedPlacement,
  })

  const fitsStart =
    anchorRect.left + panelWidth <= viewportWidth - viewportPadding
  const fitsEnd = anchorRect.right - panelWidth >= viewportPadding

  if (horizontal === 'start' && !fitsStart && fitsEnd) {
    nextPosition = getPopoverCoordinates({
      anchorRect,
      offset,
      panelHeight,
      panelWidth,
      placement:
        `${resolvedPlacement.split('-')[0]}-${oppositeHorizontal}` as PopoverPlacement,
    })
  }

  if (horizontal === 'end' && !fitsEnd && fitsStart) {
    nextPosition = getPopoverCoordinates({
      anchorRect,
      offset,
      panelHeight,
      panelWidth,
      placement:
        `${resolvedPlacement.split('-')[0]}-${oppositeHorizontal}` as PopoverPlacement,
    })
  }

  return {
    left: clamp(
      nextPosition.left,
      viewportPadding,
      viewportWidth - panelWidth - viewportPadding
    ),
    top: clamp(
      nextPosition.top,
      viewportPadding,
      viewportHeight - panelHeight - viewportPadding
    ),
  }
}

export function Popover({
  anchorRef,
  children,
  className,
  offset = 8,
  onOpenChange,
  open,
  placement = 'bottom-start',
  style,
  viewportPadding = 8,
  zIndex = 40,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node

      if (
        anchorRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }

      onOpenChange?.(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorRef, onOpenChange, open])

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    function updatePosition() {
      const anchorRect = anchorRef.current?.getBoundingClientRect()
      const panelRect = panelRef.current?.getBoundingClientRect()

      if (!anchorRect || !panelRect) {
        return
      }

      setPosition(
        resolvePopoverPosition({
          anchorRect,
          offset,
          panelHeight: panelRect.height,
          panelWidth: panelRect.width,
          placement,
          viewportHeight: window.innerHeight,
          viewportPadding,
          viewportWidth: window.innerWidth,
        })
      )
    }

    updatePosition()

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, offset, open, placement, viewportPadding])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      className={className}
      ref={panelRef}
      style={{
        left: `${position.left}px`,
        position: 'fixed',
        top: `${position.top}px`,
        zIndex,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  )
}
