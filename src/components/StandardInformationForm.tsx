import { type StandardInformationSection } from '@/lib/standard-information'

type Props = {
  value: StandardInformationSection
  onChange?: (section: StandardInformationSection) => void
  disabled?: boolean
}

const EMPTY_CONTACT = {
  tier: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  notes: '',
}

export function StandardInformationForm({ value, onChange, disabled }: Props) {
  const section = value ?? { title: '', summary: '', contacts: [], additionalNotes: [] }

  const update = (patch: Partial<StandardInformationSection>) => {
    onChange?.({ ...section, ...patch })
  }

  const updateContact = (index: number, patch: Partial<(typeof section.contacts)[number]>) => {
    const contacts = [...(section.contacts ?? [])]
    contacts[index] = { ...contacts[index], ...patch }
    update({ contacts })
  }

  const addContact = () => {
    update({ contacts: [...(section.contacts ?? []), { ...EMPTY_CONTACT }] })
  }

  const removeContact = (index: number) => {
    update({ contacts: (section.contacts ?? []).filter((_, idx) => idx !== index) })
  }

  const updateNote = (index: number, note: string) => {
    const notes = [...(section.additionalNotes ?? [])]
    notes[index] = note
    update({ additionalNotes: notes })
  }

  const addNote = () => {
    update({ additionalNotes: [...(section.additionalNotes ?? []), ''] })
  }

  const removeNote = (index: number) => {
    update({ additionalNotes: (section.additionalNotes ?? []).filter((_, idx) => idx !== index) })
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
            placeholder="Dell EMC Support – Escalation Matrix"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Summary
          <textarea
            className="mt-1 h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.summary}
            onChange={(event) => update({ summary: event.target.value })}
            disabled={disabled}
            placeholder="Overview of the escalation path."
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#123c73]">Escalation Contacts</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={addContact}
            disabled={disabled}
          >
            + Add Contact
          </button>
        </div>
        <div className="space-y-4">
          {(section.contacts ?? []).map((contact, index) => (
            <div key={index} className="rounded border border-[#e2e7f2] bg-[#f5f8ff] p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Tier / Escalation Step
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.tier}
                    onChange={(event) => updateContact(index, { tier: event.target.value })}
                    disabled={disabled}
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Name
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.name}
                    onChange={(event) => updateContact(index, { name: event.target.value })}
                    disabled={disabled}
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Role
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.role}
                    onChange={(event) => updateContact(index, { role: event.target.value })}
                    disabled={disabled}
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Email
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.email}
                    onChange={(event) => updateContact(index, { email: event.target.value })}
                    disabled={disabled}
                    placeholder="name@domain.com"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Phone
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.phone}
                    onChange={(event) => updateContact(index, { phone: event.target.value })}
                    disabled={disabled}
                    placeholder="+255 700 000000"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
                  Notes
                  <textarea
                    className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={contact.notes}
                    onChange={(event) => updateContact(index, { notes: event.target.value })}
                    disabled={disabled}
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-[#c62828] hover:border-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                  onClick={() => removeContact(index)}
                  disabled={disabled}
                >
                  Remove Contact
                </button>
              </div>
            </div>
          ))}
          {!section.contacts?.length && (
            <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
              Add escalation contacts in the order they should be engaged.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">Additional Notes</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={addNote}
            disabled={disabled}
          >
            + Add Note
          </button>
        </div>
        {(section.additionalNotes ?? []).map((note, index) => (
          <div key={index} className="mt-2 flex items-start gap-2">
            <textarea
              className="h-16 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              value={note}
              onChange={(event) => updateNote(index, event.target.value)}
              disabled={disabled}
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
        {!section.additionalNotes?.length && (
          <div className="rounded border border-dashed border-[#c5d0e0] bg-[#f5f8ff] px-3 py-4 text-xs text-[#5b6b7c]">
            Note any escalation handling instructions or reminders.
          </div>
        )}
      </div>
    </div>
  )
}
