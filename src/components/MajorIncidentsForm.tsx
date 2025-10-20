import { useMemo } from 'react'

export type MajorIncidentDraft = {
  id?: string
  system: string
  sn: string
  codeLevel: string
  summary: string
  createdAt: string
  resolvedAt: string
  closedAt: string
  status: string
  impact: string
  resolution: string
  recommendation: string
}

type Props = {
  value: MajorIncidentDraft[]
  onChange?: (incidents: MajorIncidentDraft[]) => void
  disabled?: boolean
}

const EMPTY_INCIDENT: MajorIncidentDraft = {
  system: '',
  sn: '',
  codeLevel: '',
  summary: '',
  createdAt: '',
  resolvedAt: '',
  closedAt: '',
  status: '',
  impact: '',
  resolution: '',
  recommendation: '',
}

export function MajorIncidentsForm({ value, onChange, disabled }: Props) {
  const incidents = useMemo(() => value ?? [], [value])

  const update = (index: number, key: keyof MajorIncidentDraft, next: string) => {
    if (!onChange) return
    const copy = incidents.map((item, i) => (i === index ? { ...item, [key]: next } : item))
    onChange(copy)
  }

  const addIncident = () => {
    if (!onChange) return
    onChange([...incidents, { ...EMPTY_INCIDENT }])
  }

  const removeIncident = (index: number) => {
    if (!onChange) return
    const copy = incidents.filter((_, i) => i !== index)
    onChange(copy)
  }

  return (
    <div className="space-y-4">
      {!incidents.length && (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          No major incidents captured for this engagement. Use “Add Incident” to enter one.
        </div>
      )}

      {incidents.map((incident, index) => (
        <div key={incident.id ?? `draft-${index}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Incident {index + 1}</div>
            <button
              type="button"
              className={`text-xs text-red-600 hover:text-red-700 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
              onClick={() => removeIncident(index)}
              disabled={disabled}
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="System"
              value={incident.system}
              onChange={(val) => update(index, 'system', val)}
              disabled={disabled}
            />
            <Input
              label="Serial / SN#"
              value={incident.sn}
              onChange={(val) => update(index, 'sn', val)}
              disabled={disabled}
            />
            <Input
              label="Installed Code Level"
              value={incident.codeLevel}
              onChange={(val) => update(index, 'codeLevel', val)}
              disabled={disabled}
            />
            <Input
              label="Status"
              value={incident.status}
              onChange={(val) => update(index, 'status', val)}
              disabled={disabled}
            />
            <Input
              label="Created Date"
              type="date"
              value={incident.createdAt}
              onChange={(val) => update(index, 'createdAt', val)}
              disabled={disabled}
            />
            <Input
              label="Resolution Date"
              type="date"
              value={incident.resolvedAt}
              onChange={(val) => update(index, 'resolvedAt', val)}
              disabled={disabled}
            />
            <Input
              label="Closed Date"
              type="date"
              value={incident.closedAt}
              onChange={(val) => update(index, 'closedAt', val)}
              disabled={disabled}
            />
          </div>

          <div className="mt-3 grid gap-3">
            <Textarea
              label="Summary / Problem"
              value={incident.summary}
              onChange={(val) => update(index, 'summary', val)}
              disabled={disabled}
              required
            />
            <Textarea
              label="Impact"
              value={incident.impact}
              onChange={(val) => update(index, 'impact', val)}
              disabled={disabled}
            />
            <Textarea
              label="Resolution"
              value={incident.resolution}
              onChange={(val) => update(index, 'resolution', val)}
              disabled={disabled}
            />
            <Textarea
              label="Recommendations"
              value={incident.recommendation}
              onChange={(val) => update(index, 'recommendation', val)}
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        className={`rounded border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 ${
          disabled ? 'pointer-events-none opacity-40' : ''
        }`}
        onClick={addIncident}
        disabled={disabled}
      >
        + Add Incident
      </button>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date'
  disabled?: boolean
  required?: boolean
}) {
  return (
    <label className="text-xs font-medium text-slate-600">
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
  disabled,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}) {
  return (
    <label className="text-xs font-medium text-slate-600">
      <span className="mb-1 block">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <textarea
        className="h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </label>
  )
}
