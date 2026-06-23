'use client'

import { ProgressBar } from './ProgressBar'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  details?: string
  fileName?: string
}

interface DocumentChecklistProps {
  items: ChecklistItem[]
  title?: string
  showProgress?: boolean
  onItemToggle?: (itemId: string) => void
  className?: string
}

export function DocumentChecklist({
  items,
  title = 'Documents Needed',
  showProgress = true,
  onItemToggle,
  className = '',
}: DocumentChecklistProps) {
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={['bg-white border border-neutral-300 rounded-card overflow-hidden', className].join(' ')}>
      <div className="p-6 border-b border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-h4 font-serif text-neutral-900">{title}</h3>
          {showProgress && (
            <span className="text-tiny font-semibold text-neutral-600 uppercase tracking-wider">
              {completed} / {total}
            </span>
          )}
        </div>
        {showProgress && <ProgressBar value={percentage} size="md" />}
      </div>

      <div className="divide-y divide-neutral-200">
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              'flex items-start gap-4 p-4 transition-colors',
              item.completed ? 'bg-white' : 'bg-neutral-50',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => onItemToggle?.(item.id)}
              disabled={!onItemToggle}
              aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
              className={[
                'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-1',
                'transition-colors border-2',
                item.completed
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-neutral-300 bg-white hover:border-primary-400',
                !onItemToggle && 'cursor-default',
                onItemToggle && 'cursor-pointer',
              ].join(' ')}
            >
              {item.completed && (
                <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className={['text-body-md font-semibold', item.completed ? 'text-neutral-600 line-through' : 'text-neutral-900'].join(' ')}>
                {item.title}
              </div>
              {item.details && (
                <div className="text-caption text-neutral-500 mt-1">{item.details}</div>
              )}
              {item.fileName && (
                <div className="text-caption text-primary-600 mt-1 flex items-center gap-1">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 16.5a1 1 0 11-2 0 1 1 0 012 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  {item.fileName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
