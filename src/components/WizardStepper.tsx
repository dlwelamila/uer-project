import React from 'react'

export const WIZARD_STEPS = [
  'Top 5 Products',
  'Trend',
  'Severity',
  'Channels',
  'Key Notes',
  'Spare Parts',
  'Code Currency',
  'Connectivity',
  'Capacity Review',
  'Contracts Review',
  'Risk Register',
  'Action Summary',
  'Standard Information',
  'Advisories',
  'FCO & TSE',
  'Major Incidents',
] as const

export function WizardStepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-2 text-xs text-slate-600">
      {WIZARD_STEPS.map((label, index) => {
        const completed = index < step
        const current = index === step
        const baseClasses = 'rounded border px-2 py-1'
        const stateClasses = current
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : completed
            ? 'border-green-400 bg-green-50 text-green-700'
            : 'border-slate-200 bg-white text-slate-600'
        return (
          <li key={label} className={`${baseClasses} ${stateClasses}`}>
            {index + 1}. {label}
          </li>
        )
      })}
    </ol>
  )
}
