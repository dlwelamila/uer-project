import { useMemo } from 'react'

type Props = {
  value: string[]
  onChange?: (notes: string[]) => void
}

export function KeyNotesForm({ value, onChange }: Props) {
  const notes = useMemo(() => value ?? [], [value])

  const update = (index: number, next: string) => {
    if (!onChange) return
    const copy = [...notes]
    copy[index] = next
    onChange(copy)
  }

  const addNote = () => {
    onChange?.([...notes, ''])
  }

  const removeNote = (index: number) => {
    if (!onChange) return
    const copy = notes.filter((_, i) => i !== index)
    onChange(copy.length ? copy : [''])
  }

  return (
    <div className="space-y-3">
      {notes.map((note, index) => (
        <div key={index} className="flex items-start gap-2">
          <textarea
            className="h-20 w-full rounded border px-2 py-1 text-sm"
            value={note}
            onChange={(event) => update(index, event.target.value)}
          />
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600"
            onClick={() => removeNote(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        className="rounded border border-blue-500 px-3 py-1 text-xs text-blue-600"
        onClick={addNote}
      >
        + Add Note
      </button>
    </div>
  )
}

