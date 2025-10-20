import { DEFAULT_CONNECTIVITY_NOTES } from '@/lib/connectivity'

type Props = {
  notes?: string[]
}

export function ConnectivityLegendCard({ notes }: Props) {
  const items = (notes ?? DEFAULT_CONNECTIVITY_NOTES)
    .map((note) => String(note ?? '').trim())
    .filter((note) => note.length > 0)
  const hasNotes = items.length > 0

  return (
    <div className="rounded-2xl border border-[#d6dbe7] bg-[#f5f8ff] p-6 text-sm text-[#1f2a44] shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#123c73]">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-inner">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#0d5cad] text-[#0d5cad]">
            i
          </span>
        </span>
        Key to Note
      </h3>
      <ul className="space-y-3 text-xs leading-5">
        {hasNotes ? (
          items.map((item, index) => <li key={index}>{item}</li>)
        ) : (
          <li className="italic text-[#5b6b7c]">No notes captured for this engagement.</li>
        )}
      </ul>
    </div>
  )
}
