'use client'
import { useForm } from 'react-hook-form'

export function IncidentForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: any
  onSaved?: () => void
  onCancel?: () => void
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      summary: initial?.summary ?? '',
      codeLevel: initial?.codeLevel ?? '',
      createdAt: (initial?.createdAt
        ? new Date(initial.createdAt)
        : new Date()
      ).toISOString().slice(0, 16),
      closedAt: initial?.closedAt
        ? new Date(initial.closedAt).toISOString().slice(0, 16)
        : '',
      impact: initial?.impact ?? '',
      resolution: initial?.resolution ?? '',
      recommendation: initial?.recommendation ?? '',
      status: initial?.status ?? 'Open',
    },
  })

  async function onSubmit(values: any) {
    const payload = {
      ...values,
      createdAt: new Date(values.createdAt).toISOString(),
      closedAt: values.closedAt ? new Date(values.closedAt).toISOString() : null,
    }
    const res = await fetch(initial?.id ? `/api/incidents/${initial.id}` : '/api/incidents', {
      method: initial?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) { alert('Save failed'); return }
    reset()
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 text-sm">
      <label className="block">
        Problem
        <input className="w-full border p-2 rounded" {...register('summary')} />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label className="block col-span-1">
          Code Level
          <input className="w-full border p-2 rounded" {...register('codeLevel')} />
        </label>
        <label className="block col-span-1">
          Created
          <input type="datetime-local" className="w-full border p-2 rounded" {...register('createdAt')} />
        </label>
        <label className="block col-span-1">
          Closed
          <input type="datetime-local" className="w-full border p-2 rounded" {...register('closedAt')} />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="block col-span-1">
          Status
          <select className="w-full border p-2 rounded" {...register('status')}>
            <option>Open</option>
            <option>Closed</option>
            <option>In Progress</option>
          </select>
        </label>
      </div>

      <label className="block">
        Impact
        <textarea rows={3} className="w-full border p-2 rounded" {...register('impact')} />
      </label>

      <label className="block">
        Resolution
        <textarea rows={3} className="w-full border p-2 rounded" {...register('resolution')} />
      </label>

      <label className="block">
        Recommendations
        <textarea rows={3} className="w-full border p-2 rounded" {...register('recommendation')} />
      </label>

      <div className="flex gap-2 pt-2">
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded" type="submit">
          {initial?.id ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" className="px-3 py-1.5 bg-slate-200 rounded" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
