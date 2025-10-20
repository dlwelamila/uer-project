'use client'
import { useEffect, useState } from 'react'
import { FileDropZone } from '@/components/FileDropZone'

type Incident = {
  id: string
  summary: string
  codeLevel?: string | null
  status: string
  createdAt: string
  closedAt?: string | null
  impact?: string | null
  resolution?: string | null
  recommendation?: string | null
}

type Evidence = { id:string; originalName:string; filePath:string; createdAt:string; extra?: any }

export function IncidentTable({
  rows,
  engagementId,
  onEdit,
  onDelete
}:{
  rows: Incident[]
  engagementId?: string
  onEdit?: (row:Incident)=>void
  onDelete?: (row:Incident)=>void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [attachFor, setAttachFor] = useState<string | null>(null)
  const [chips, setChips] = useState<Record<string, Evidence[]>>({})

  useEffect(() => {
    // prefetch evidence per incident (lightweight)
    async function load() {
      const all: Record<string, Evidence[]> = {}
      for (const r of rows) {
        const q = new URLSearchParams({
          engagementId: engagementId || '',
          sectionKey: '05_Incidents',
          incidentId: r.id
        })
        const res = await fetch(`/api/evidence?${q}`)
        all[r.id] = res.ok ? await res.json() : []
      }
      setChips(all)
    }
    if (engagementId) load()
  }, [rows, engagementId])

  return (
    <table className="w-full text-sm avoid-break">
      <thead>
        <tr className="text-left bg-gray-100">
          <th className="p-2">Problem</th>
          <th className="p-2">Code</th>
          <th className="p-2">Status</th>
          <th className="p-2">Created</th>
          <th className="p-2">Closed</th>
          <th className="p-2 print:hidden">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r=>(
          <FragmentRow key={r.id}
            row={r}
            evidence={chips[r.id] || []}
            isOpen={!!open[r.id]}
            onToggle={()=>setOpen(s=>({ ...s, [r.id]: !s[r.id] }))}
            onAttach={()=>setAttachFor(p=>p===r.id?null:r.id)}
            showAttach={attachFor===r.id}
            engagementId={engagementId}
            onRefreshEvidence={async ()=>{
              if (!engagementId) return
              const q = new URLSearchParams({ engagementId, sectionKey:'05_Incidents', incidentId: r.id })
              const res = await fetch(`/api/evidence?${q}`); const list = res.ok ? await res.json() : []
              setChips(c=>({ ...c, [r.id]: list }))
            }}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

function FragmentRow({
  row, evidence, isOpen, onToggle, onAttach, showAttach, engagementId, onRefreshEvidence, onEdit, onDelete
}: any) {
  return (
    <>
      <tr className="border-b align-top">
        <td className="p-2">
          <div className="font-medium">{row.summary}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {evidence.map((e:any)=>(
              <a key={e.id} href={e.filePath} className="text-xs px-2 py-0.5 bg-slate-100 rounded border" target="_blank" rel="noreferrer">
                {e.originalName}
              </a>
            ))}
            {!!evidence.length && <span className="text-xs text-slate-500">({evidence.length})</span>}
          </div>
        </td>
        <td className="p-2">{row.codeLevel ?? ''}</td>
        <td className="p-2">{row.status}</td>
        <td className="p-2">{row.createdAt}</td>
        <td className="p-2">{row.closedAt ?? ''}</td>
        <td className="p-2 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button className="px-2 py-1 rounded bg-slate-200" onClick={onToggle}>{isOpen?'Hide':'Details'}</button>
            <button className="px-2 py-1 rounded bg-slate-200" onClick={onAttach}>Attach</button>
            {onEdit && <button className="px-2 py-1 rounded bg-slate-200" onClick={()=>onEdit(row)}>Edit</button>}
            {onDelete && <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={()=>onDelete(row)}>Delete</button>}
          </div>
        </td>
      </tr>

      {/* attach mini-uploader (hidden on print) */}
      {showAttach && (
        <tr className="border-b print:hidden">
          <td className="p-2" colSpan={6}>
            {engagementId ? (
              <div className="max-w-md">
                <FileDropZone
                  engagementId={engagementId}
                  sectionKey="05_Incidents"
                  environment="HQ"
                  // @ts-ignore: we forward incidentId via formData in the dropzone
                  extraFields={{ incidentId: row.id }}
                  onUploaded={onRefreshEvidence}
                />
              </div>
            ) : (
              <div className="text-xs text-slate-500">Select an engagement to enable uploads.</div>
            )}
          </td>
        </tr>
      )}

      {/* details block (shown when expanded; prints cleanly if expanded) */}
      {isOpen && (
        <tr className="bg-slate-50 border-b">
          <td className="p-3" colSpan={6}>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Impact</div>
                <div className="whitespace-pre-wrap">{row.impact || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Resolution</div>
                <div className="whitespace-pre-wrap">{row.resolution || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Recommendations</div>
                <div className="whitespace-pre-wrap">{row.recommendation || '—'}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
