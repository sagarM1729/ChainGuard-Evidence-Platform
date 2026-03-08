import * as React from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  id?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  disabled = false,
  label,
  id,
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
            !value && 'text-gray-400'
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

// Multi-Select with checkbox dropdown
interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  disabled = false,
  label,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  const selectedLabels = options
    .filter(o => value.includes(o.value))
    .map(o => o.label)

  return (
    <div className={clsx('relative', className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed'
        )}
      >
        <span className={clsx('truncate', value.length === 0 && 'text-gray-400')}>
          {value.length === 0
            ? placeholder
            : selectedLabels.length <= 2
              ? selectedLabels.join(', ')
              : `${selectedLabels.length} selected`}
        </span>
        <ChevronDown className={clsx('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <label
              key={opt.value}
              className={clsx(
                'flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm',
                opt.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => !opt.disabled && toggleOption(opt.value)}
                disabled={opt.disabled}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <div>
                <div>{opt.label}</div>
                {opt.description && (
                  <div className="text-xs text-gray-400">{opt.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
