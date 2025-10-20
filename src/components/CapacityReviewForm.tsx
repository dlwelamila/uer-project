import { type CapacityReviewSection, type CapacitySystemRow } from '@/lib/capacity-review'

type Props = {
  value: CapacityReviewSection
  onChange?: (section: CapacityReviewSection) => void
  disabled?: boolean
}

const EMPTY_ROW: CapacitySystemRow = {
  systemName: '',
  healthScore: '',
  status: '',
  remarks: '',
}

export function CapacityReviewForm({ value, onChange, disabled }: Props) {
  const section = value ?? {
    title: '',
    summary: '',
    highlightBullets: [],
    systems: [],
    screenshotCaption: '',
  }

  const update = (patch: Partial<CapacityReviewSection>) => {
    onChange?.({ ...section, ...patch })
  }

  const updateBullet = (index: number, nextValue: string) => {
    const bullets = [...(section.highlightBullets ?? [])]
    bullets[index] = nextValue
    update({ highlightBullets: bullets })
  }

  const addBullet = () => {
    update({ highlightBullets: [...(section.highlightBullets ?? []), ''] })
  }

  const removeBullet = (index: number) => {
    update({
      highlightBullets: (section.highlightBullets ?? []).filter((_, idx) => idx !== index),
    })
  }

  const updateRow = (index: number, patch: Partial<CapacitySystemRow>) => {
    const rows = [...(section.systems ?? [])]
    rows[index] = { ...rows[index], ...patch }
    update({ systems: rows })
  }

  const addRow = () => {
    update({ systems: [...(section.systems ?? []), { ...EMPTY_ROW }] })
  }

  const removeRow = (index: number) => {
    update({ systems: (section.systems ?? []).filter((_, idx) => idx !== index) })
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
            placeholder="Headline for the capacity review slide"
          />
        </label>

        <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Summary
          <textarea
            className="mt-1 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.summary}
            onChange={(event) => update({ summary: event.target.value })}
            disabled={disabled}
            placeholder="Narrative summary of the overall capacity story."
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Sidebar Highlights</h4>
            <button
              type="button"
              className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
              onClick={addBullet}
              disabled={disabled}
            >
              + Add Highlight
            </button>
          </div>
          {!(section.highlightBullets ?? []).length && (
            <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
              Use highlights to reinforce the callouts visible beside the screenshot (e.g., AIOps value props).
            </div>
          )}
          {(section.highlightBullets ?? []).map((bullet, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                className="h-16 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                value={bullet}
                onChange={(event) => updateBullet(index, event.target.value)}
                disabled={disabled}
                placeholder="Highlight message"
              />
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                onClick={() => removeBullet(index)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#123c73]">System Health Table</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={addRow}
            disabled={disabled}
          >
            + Add System
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-sm text-[#1f2a44]">
            <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
              <tr>
                <th className="px-3 py-2 text-left">System Name</th>
                <th className="px-3 py-2 text-left">Health Score</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Remarks</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {!(section.systems ?? []).length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                    No systems listed yet. Add entries to reflect the capacity chart.
                  </td>
                </tr>
              )}
              {(section.systems ?? []).map((row, index) => (
                <tr key={index} className="border-t border-[#e2e7f2]">
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.systemName}
                      onChange={(event) => updateRow(index, { systemName: event.target.value })}
                      disabled={disabled}
                      placeholder="System name"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.healthScore}
                      onChange={(event) => updateRow(index, { healthScore: event.target.value })}
                      disabled={disabled}
                      placeholder="Score"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.status}
                      onChange={(event) => updateRow(index, { status: event.target.value })}
                      disabled={disabled}
                      placeholder="Status"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      className="h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.remarks}
                      onChange={(event) => updateRow(index, { remarks: event.target.value })}
                      disabled={disabled}
                      placeholder="Key remark"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            placeholder="Describe the accompanying screenshot (e.g., source, insights)."
          />
        </label>
        <p className="mt-2 text-xs text-[#5b6b7c]">
          Upload the actual screenshot via the Evidence panel for this step. This caption will display beneath the image.
        </p>
      </div>
    </div>
  )
}
