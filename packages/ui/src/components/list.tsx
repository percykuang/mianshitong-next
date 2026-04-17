'use client'

import { List as AntList } from 'antd'
import type { ListProps as AntListProps } from 'antd'
import type { ListItemMetaProps, ListItemProps } from 'antd/es/list/Item'

export type ListProps<T> = AntListProps<T>
export type { ListItemMetaProps, ListItemProps }

export const ListItem = AntList.Item
export const ListItemMeta = AntList.Item.Meta

export function List<T>(props: ListProps<T>) {
  return <AntList<T> {...props} />
}
