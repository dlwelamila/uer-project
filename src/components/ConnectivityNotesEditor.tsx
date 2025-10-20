type Props = {
  value: string[]
  onChange?: (notes: string[]) => void
  disabled?: boolean
}

export function ConnectivityNotesEditor({ value, onChange, disabled }: Props) {
  const notes = Array.isArray(value) ? value : []

  const update = (index: number, next: string) => {
    if (!onChange) return
    const copy = [...notes]
    copy[index] = next
    onChange(copy)
  }

  const addNote = () => {
    if (!onChange) return
    onChange([...notes, ''])
  }

  const removeNote = (index: number) => {
    if (!onChange) return
    const copy = notes.filter((_, idx) => idx !== index)
    onChange(copy)
  }

  return (
    <div className="rounded-2xl border border-[#d6dbe7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d6dbe7] px-4 py-3">
        <h4 className="text-sm font-semibold text-[#123c73]">Key to Note</h4>
        <button
          type="button"
          className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
          onClick={addNote}
          disabled={disabled}
        >
          + Add Note
        </button>
      </div>
      <div className="space-y-3 px-4 py-4">
        {!notes.length && (
          <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
            No notes captured yet. Use &ldquo;Add Note&rdquo; to highlight key callouts for the connectivity section.
          </div>
        )}
        {notes.map((note, index) => (
          <div key={index} className="flex items-start gap-2">
            <textarea
              className="h-20 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              value={note}
              onChange={(event) => update(index, event.target.value)}
              disabled={disabled}
              placeholder="Describe an insight the customer should know."
            />
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
              onClick={() => removeNote(index)}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
