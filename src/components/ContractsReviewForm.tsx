
import { type ContractsReviewSection } from '@/lib/contracts-review'

type Props = {
  value: ContractsReviewSection
  onChange?: (section: ContractsReviewSection) => void
  disabled?: boolean
}

export function ContractsReviewForm({ value, onChange, disabled }: Props) {
  const section = value ?? {
    title: '',
    summary: '',
    keyNotes: [],
    statusHighlights: [],
    productHighlights: [],
    screenshotCaption: '',
  }

  const update = (patch: Partial<ContractsReviewSection>) => {
    onChange?.({ ...section, ...patch })
  }

  const updateArrayItem = <T extends 'keyNotes' | 'statusHighlights' | 'productHighlights'>(
    key: T,
    index: number,
    patch: T extends 'keyNotes' ? string : { label: string; value: string },
  ) => {
    const items = [...(section[key] ?? [])]
    items[index] = patch as (typeof items)[number]
    update({ [key]: items } as Partial<ContractsReviewSection>)
  }

  const addArrayItem = <T extends 'keyNotes' | 'statusHighlights' | 'productHighlights'>(key: T) => {
    const items = section[key] ?? []
    const empty =
      key === 'keyNotes'
        ? ''
        : {
            label: '',
            value: '',
          }
    update({ [key]: [...items, empty] } as Partial<ContractsReviewSection>)
  }

  const removeArrayItem = <T extends 'keyNotes' | 'statusHighlights' | 'productHighlights'>(key: T, index: number) => {
    const items = (section[key] ?? []).filter((_, idx) => idx !== index)
    update({ [key]: items } as Partial<ContractsReviewSection>)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Section Title
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.title}
            onChange={(event) => update({ title: event.target.value })}
            disabled={disabled}
            placeholder="Support Contracts Status – January 2024 to date"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Summary
          <textarea
            className="mt-1 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.summary}
            onChange={(event) => update({ summary: event.target.value })}
            disabled={disabled}
            placeholder="Narrative summary for the contracts dashboard."
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Key Notes</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={() => addArrayItem('keyNotes')}
            disabled={disabled}
          >
            + Add Note
          </button>
        </div>
        {!(section.keyNotes ?? []).length && (
          <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
            Add key talking points that will sit beside the contracts screenshot.
          </div>
        )}
        {(section.keyNotes ?? []).map((note, index) => (
          <div key={index} className="mt-2 flex items-start gap-2">
            <textarea
              className="h-16 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              value={note}
              onChange={(event) => updateArrayItem('keyNotes', index, event.target.value)}
              disabled={disabled}
              placeholder="Support contract details captured from January 2023 to date."
            />
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
              onClick={() => removeArrayItem('keyNotes', index)}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Status Highlights</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={() => addArrayItem('statusHighlights')}
            disabled={disabled}
          >
            + Add Status
          </button>
        </div>
        <div className="space-y-3">
          {(section.statusHighlights ?? []).map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)_auto]">
              <input
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={item.label}
                onChange={(event) =>
                  updateArrayItem('statusHighlights', index, { ...item, label: event.target.value })
                }
                disabled={disabled}
                placeholder="Ending within 30 days"
              />
              <input
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={item.value}
                onChange={(event) =>
                  updateArrayItem('statusHighlights', index, { ...item, value: event.target.value })
                }
                disabled={disabled}
                placeholder="36.99%"
              />
              <button
                type="button"
                className="justify-self-end rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                onClick={() => removeArrayItem('statusHighlights', index)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ))}
          {!section.statusHighlights?.length && (
            <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
              Add the headline metrics that summarise contract status buckets.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Product Highlights</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={() => addArrayItem('productHighlights')}
            disabled={disabled}
          >
            + Add Product
          </button>
        </div>
        <div className="space-y-3">
          {(section.productHighlights ?? []).map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)_auto]">
              <input
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={item.label}
                onChange={(event) =>
                  updateArrayItem('productHighlights', index, { ...item, label: event.target.value })
                }
                disabled={disabled}
                placeholder="VxRail"
              />
              <input
                className="rounded border border-slate-300 px-2 py-1 text-sm"
                value={item.value}
                onChange={(event) =>
                  updateArrayItem('productHighlights', index, { ...item, value: event.target.value })
                }
                disabled={disabled}
                placeholder="20 assets require review"
              />
              <button
                type="button"
                className="justify-self-end rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                onClick={() => removeArrayItem('productHighlights', index)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ))}
          {!section.productHighlights?.length && (
            <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
              Summarise the product families shown in the chart and their renewal counts.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Screenshot Caption
          <textarea
            className="mt-1 h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.screenshotCaption}
            onChange={(event) => update({ screenshotCaption: event.target.value })}
            disabled={disabled}
            placeholder="Describe the contracts dashboard screenshot and key callouts."
          />
        </label>
      </div>
    </div>
  )
}
