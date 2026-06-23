'use client'

import React, { useState, useCallback } from 'react'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  minWidth?: string
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  selectedRowId?: number | string | null
  isLoading?: boolean
  loadingRowCount?: number
  emptyState?: React.ReactNode
  emptyMessage?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  className?: string
  'aria-label'?: string
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

function SortIcon({ direction }: { direction?: 'asc' | 'desc' | null }) {
  return (
    <svg
      aria-hidden="true"
      className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 group-hover:text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      ) : direction === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 15l4 4 4-4" />
        </>
      )}
    </svg>
  )
}

function SkeletonRow({ columnCount }: { columnCount: number }) {
  return (
    <tr>
      {Array.from({ length: columnCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`animate-pulse bg-gray-200 rounded h-4 ${i === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-1/2' : 'w-2/3'}`} />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  selectedRowId,
  isLoading = false,
  loadingRowCount = 5,
  emptyState,
  emptyMessage = 'No items yet.',
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSort,
  className = '',
  'aria-label': ariaLabel,
}: DataTableProps<T>) {
  const [internalSortCol, setInternalSortCol] = useState<string | null>(null)
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc')

  const activeSortCol = controlledSortColumn ?? internalSortCol
  const activeSortDir = controlledSortDirection ?? internalSortDir

  const handleSort = useCallback(
    (key: string) => {
      const newDir = activeSortCol === key && activeSortDir === 'asc' ? 'desc' : 'asc'
      if (onSort) {
        onSort(key, newDir)
      } else {
        setInternalSortCol(key)
        setInternalSortDir(newDir)
      }
    },
    [activeSortCol, activeSortDir, onSort]
  )

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent, row: T) => {
      if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
        e.preventDefault()
        onRowClick(row)
      }
    },
    [onRowClick]
  )

  const getCellValue = (row: T, accessor: Column<T>['accessor']): React.ReactNode => {
    if (typeof accessor === 'function') return accessor(row)
    const val = row[accessor]
    if (val === null || val === undefined) return '—'
    return String(val)
  }

  const getAccessorKey = (accessor: Column<T>['accessor']): string => {
    if (typeof accessor === 'string' || typeof accessor === 'symbol') return String(accessor)
    return ''
  }

  // Internal sort (uncontrolled)
  let displayData = data
  if (!onSort && internalSortCol) {
    displayData = [...data].sort((a, b) => {
      const aVal = String(a[internalSortCol as keyof T] ?? '')
      const bVal = String(b[internalSortCol as keyof T] ?? '')
      const cmp = aVal.localeCompare(bVal)
      return internalSortDir === 'asc' ? cmp : -cmp
    })
  }

  return (
    <div className={`w-full overflow-x-auto rounded-card shadow-light ${className}`}>
      <table
        role="grid"
        aria-label={ariaLabel ?? 'Data table'}
        className="w-full divide-y divide-neutral-200 text-left"
      >
        <thead className="bg-neutral-50 border-b border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
          <tr role="row">
            {columns.map((col, i) => {
              const key = getAccessorKey(col.accessor)
              const isSorted = activeSortCol === key
              const sortDir = isSorted ? activeSortDir : null

              return (
                <th
                  key={i}
                  scope="col"
                  aria-sort={isSorted ? (activeSortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                  className={[
                    'px-4 py-3 text-tiny font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap',
                    alignClasses[col.align ?? 'left'],
                    col.sortable ? 'cursor-pointer select-none group' : '',
                  ].join(' ')}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 font-semibold text-tiny uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    >
                      {col.header}
                      <SortIcon direction={sortDir} />
                    </button>
                  ) : col.header === 'Actions' ? (
                    <span className="sr-only">Actions</span>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
          {isLoading ? (
            Array.from({ length: loadingRowCount }).map((_, i) => (
              <SkeletonRow key={i} columnCount={columns.length} />
            ))
          ) : displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyState ?? (
                  <div className="text-center py-16 px-6">
                    <svg
                      aria-hidden="true"
                      className="mx-auto w-12 h-12 text-neutral-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">{emptyMessage}</p>
                    <p className="mt-1 text-sm text-neutral-500">Get started by adding your first item.</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            displayData.map((row, rowIdx) => {
              const isSelected = selectedRowId !== undefined && selectedRowId !== null && row.id === selectedRowId
              return (
                <tr
                  key={row.id}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={onRowClick ? isSelected : undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => handleRowKeyDown(e, row)}
                  className={[
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer' : '',
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800'
                      : rowIdx % 2 === 1
                      ? 'bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700'
                      : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700',
                  ].join(' ')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={[
                        'px-4 py-3 text-body-sm text-neutral-900 dark:text-neutral-100 whitespace-nowrap',
                        alignClasses[col.align ?? 'left'],
                      ].join(' ')}
                    >
                      {getCellValue(row, col.accessor)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
