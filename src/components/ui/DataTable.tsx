'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  serverPagination?: {
    page: number
    totalPages: number
    totalCount: number
    onPageChange: (page: number) => void
  }
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  loading?: boolean
  rowKey: (item: T) => string
  onRowClick?: (item: T) => void
  selectedRows?: Set<string>
  onSelectRows?: (selected: Set<string>) => void
  bulkActions?: React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  serverPagination,
  emptyMessage = 'No data found',
  emptyIcon,
  loading = false,
  rowKey,
  onRowClick,
  selectedRows,
  onSelectRows,
  bulkActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')
  const [localPage, setLocalPage] = React.useState(1)
  const [searchQuery, setSearchQuery] = React.useState('')

  const isSelectable = !!onSelectRows

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Sort data (client-side)
  const sortedData = React.useMemo(() => {
    if (!sortKey || serverPagination) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [data, sortKey, sortDir, serverPagination])

  // Client-side pagination
  const page = serverPagination ? serverPagination.page : localPage
  const totalPages = serverPagination
    ? serverPagination.totalPages
    : Math.ceil(sortedData.length / pageSize)
  const totalCount = serverPagination ? serverPagination.totalCount : sortedData.length

  const paginatedData = serverPagination
    ? sortedData
    : sortedData.slice((page - 1) * pageSize, page * pageSize)

  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages))
    if (serverPagination) {
      serverPagination.onPageChange(clamped)
    } else {
      setLocalPage(clamped)
    }
  }

  // Select all on current page
  const allPageKeys = paginatedData.map(rowKey)
  const allSelected = isSelectable && allPageKeys.length > 0 && allPageKeys.every(k => selectedRows?.has(k))

  const toggleSelectAll = () => {
    if (!onSelectRows || !selectedRows) return
    const next = new Set(selectedRows)
    if (allSelected) {
      allPageKeys.forEach(k => next.delete(k))
    } else {
      allPageKeys.forEach(k => next.add(k))
    }
    onSelectRows(next)
  }

  const toggleSelectRow = (key: string) => {
    if (!onSelectRows || !selectedRows) return
    const next = new Set(selectedRows)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    onSelectRows(next)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setLocalPage(1)
  }

  const handleSearchSubmit = () => {
    onSearch?.(searchQuery)
  }

  return (
    <div>
      {/* Top bar: search + bulk actions */}
      {(searchable || (isSelectable && (selectedRows?.size ?? 0) > 0)) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          {searchable && (
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                placeholder={searchPlaceholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {isSelectable && (selectedRows?.size ?? 0) > 0 && bulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedRows?.size} selected</span>
              {bulkActions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isSelectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (isSelectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (isSelectable ? 1 : 0)} className="px-6 py-12 text-center">
                  {emptyIcon && <div className="flex justify-center mb-3">{emptyIcon}</div>}
                  <p className="text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map(item => {
                const key = rowKey(item)
                return (
                  <tr
                    key={key}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${selectedRows?.has(key) ? 'bg-blue-50' : ''}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {isSelectable && (
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows?.has(key) ?? false}
                          onChange={() => toggleSelectRow(key)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm ${col.className || ''}`}>
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let num: number
              if (totalPages <= 5) num = i + 1
              else if (page <= 3) num = i + 1
              else if (page >= totalPages - 2) num = totalPages - 4 + i
              else num = page - 2 + i
              return (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`px-3 py-1 rounded text-sm ${
                    num === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {num}
                </button>
              )
            })}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
