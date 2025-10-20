import { type RiskRegisterSection } from '@/lib/risk-register'

type Props = {
  value: RiskRegisterSection
  onChange?: (section: RiskRegisterSection) => void
  disabled?: boolean
}

const EMPTY_ROW = {
  category: '',
  description: '',
  priority: '',
  probability: '',
  owner: '',
  status: '',
  dueDate: '',
  mitigation: '',
}

export function RiskRegisterForm({ value, onChange, disabled }: Props) {
  const section = value ?? { title: '', summary: '', rows: [] }

  const update = (patch: Partial<RiskRegisterSection>) => {
    onChange?.({ ...section, ...patch })
  }

  const updateRow = (index: number, patch: Partial<(typeof section.rows)[number]>) => {
    const rows = [...(section.rows ?? [])]
    rows[index] = { ...rows[index], ...patch }
    update({ rows })
  }

  const addRow = () => {
    update({ rows: [...(section.rows ?? []), { ...EMPTY_ROW }] })
  }

  const removeRow = (index: number) => {
    update({ rows: (section.rows ?? []).filter((_, idx) => idx !== index) })
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
            placeholder="Risk Register – FY25 Q1"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#5B6B7C]">
          Summary
          <textarea
            className="mt-1 h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={section.summary}
            onChange={(event) => update({ summary: event.target.value })}
            disabled={disabled}
            placeholder="Narrative context for the register."
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[#d6dbe7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#123c73]">Risk Register Detail</h4>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={addRow}
            disabled={disabled}
          >
            + Add Risk
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse text-sm text-[#1f2a44]">
            <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
              <tr>
                <th className="px-3 py-2 text-left">Risk Category</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Priority</th>
                <th className="px-3 py-2 text-left">DU/DL Prob.</th>
                <th className="px-3 py-2 text-left">Owner</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Due Date</th>
                <th className="px-3 py-2 text-left">Mitigation Plan / Action</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {!section.rows?.length && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-xs text-[#5b6b7c]">
                    No risks captured yet. Use “Add Risk” to document open items.
                  </td>
                </tr>
              )}
              {(section.rows ?? []).map((row, index) => (
                <tr key={index} className="border-t border-[#e2e7f2]">
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.category}
                      onChange={(event) => updateRow(index, { category: event.target.value })}
                      disabled={disabled}
                      placeholder="Outdated firmware"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      className="h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.description}
                      onChange={(event) => updateRow(index, { description: event.target.value })}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.priority}
                      onChange={(event) => updateRow(index, { priority: event.target.value })}
                      disabled={disabled}
                      placeholder="P1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.probability}
                      onChange={(event) => updateRow(index, { probability: event.target.value })}
                      disabled={disabled}
                      placeholder="Yes / No"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.owner}
                      onChange={(event) => updateRow(index, { owner: event.target.value })}
                      disabled={disabled}
                      placeholder="CRDB / TTCS"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.status}
                      onChange={(event) => updateRow(index, { status: event.target.value })}
                      disabled={disabled}
                      placeholder="Registered"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.dueDate}
                      onChange={(event) => updateRow(index, { dueDate: event.target.value })}
                      disabled={disabled}
                      placeholder="Q1 FY25"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      className="h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      value={row.mitigation}
                      onChange={(event) => updateRow(index, { mitigation: event.target.value })}
                      disabled={disabled}
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
    </div>
  )
}
