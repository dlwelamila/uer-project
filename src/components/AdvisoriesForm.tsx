import { type AdvisorySection } from '@/lib/advisories'

type Props = {
  value: AdvisorySection[]
  onChange?: (sections: AdvisorySection[]) => void
  disabled?: boolean
}

export function AdvisoriesForm({ value, onChange, disabled }: Props) {
  const sections = Array.isArray(value) && value.length ? value : []

  const update = (index: number, patch: Partial<AdvisorySection>) => {
    if (!onChange) return
    const next = sections.map((section, idx) => (idx === index ? { ...section, ...patch } : section))
    onChange(next)
  }

  const updateNote = (sectionIndex: number, noteIndex: number, nextValue: string) => {
    if (!onChange) return
    const next = sections.map((section, idx) => {
      if (idx !== sectionIndex) return section
      const notes = [...(section.notes ?? [])]
      notes[noteIndex] = nextValue
      return { ...section, notes }
    })
    onChange(next)
  }

  const addNote = (sectionIndex: number) => {
    if (!onChange) return
    const next = sections.map((section, idx) => {
      if (idx !== sectionIndex) return section
      return { ...section, notes: [...(section.notes ?? []), ''] }
    })
    onChange(next)
  }

  const removeNote = (sectionIndex: number, noteIndex: number) => {
    if (!onChange) return
    const next = sections.map((section, idx) => {
      if (idx !== sectionIndex) return section
      const notes = (section.notes ?? []).filter((_, nIdx) => nIdx !== noteIndex)
      return { ...section, notes }
    })
    onChange(next)
  }

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
          <div className="mb-4 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
              Section Title
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={section.title}
                onChange={(event) => update(index, { title: event.target.value })}
                disabled={disabled}
                placeholder="Headline displayed on the advisories page"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
              Subtitle
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={section.subtitle}
                onChange={(event) => update(index, { subtitle: event.target.value })}
                disabled={disabled}
                placeholder="Optional supporting title or advisory identifier"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
              Summary
              <textarea
                className="mt-1 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={section.summary}
                onChange={(event) => update(index, { summary: event.target.value })}
                disabled={disabled}
                placeholder="Narrative description or call-out that accompanies the screenshot."
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Bullet Notes</h4>
              <button
                type="button"
                className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
                onClick={() => addNote(index)}
                disabled={disabled}
              >
                + Add Note
              </button>
            </div>
            {!(section.notes ?? []).length && (
              <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
                Use bullet notes to capture key talking points visible on the advisory screenshots.
              </div>
            )}
            {(section.notes ?? []).map((note, noteIndex) => (
              <div key={noteIndex} className="flex items-start gap-2">
                <textarea
                  className="h-20 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                  value={note}
                  onChange={(event) => updateNote(index, noteIndex, event.target.value)}
                  disabled={disabled}
                  placeholder="Important observation, action item, or status call-out."
                />
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                  onClick={() => removeNote(index, noteIndex)}
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
