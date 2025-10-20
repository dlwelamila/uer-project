type Col = { key: string; header: string }

export function DataTable({ rows, columns, onEdit, onDelete }: {
  rows: any[]; columns: Col[]; onEdit?: (row:any)=>void; onDelete?: (row:any)=>void
}) {
  return (
    <table className="w-full text-sm avoid-break">
      <thead>
        <tr className="text-left bg-gray-100">
          {columns.map(c=>(<th key={c.key} className="p-2">{c.header}</th>))}
          {(onEdit || onDelete) && <th className="p-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i} className="border-b">
            {columns.map(c=>(<td key={c.key} className="p-2">{String(r[c.key] ?? '')}</td>))}
            {(onEdit || onDelete) &&
              <td className="p-2 flex gap-2">
                {onEdit && <button className="px-2 py-1 rounded bg-slate-200" onClick={()=>onEdit(r)}>Edit</button>}
                {onDelete && <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={()=>onDelete(r)}>Delete</button>}
              </td>
            }
          </tr>
        ))}
      </tbody>
    </table>
  )
}
