'use client'

import { Table as AntTable } from 'antd'
import type { TableColumnsType, TableProps as AntTableProps } from 'antd'

export type TableProps<RecordType extends object = Record<string, unknown>> =
  AntTableProps<RecordType>

export type { TableColumnsType }

export function Table<RecordType extends object = Record<string, unknown>>(
  props: TableProps<RecordType>
) {
  return <AntTable<RecordType> {...props} />
}
