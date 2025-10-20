import { type FcoTseRow } from '@/lib/fco-tse'

type Props = {
  rows: FcoTseRow[]
  emptyMessage: string
}

export function FcoTseTable({ rows, emptyMessage }: Props) {
  const hasRows = rows.length > 0

  return (
    <div className="rounded-2xl border border-[#d6dbe7] bg-white shadow-sm">
      <div className="border-b border-[#d6dbe7] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#123c73]">Field Change Order Detail</h3>
        <p className="mt-1 text-xs text-[#4a5d7a]">
          All FCOs &amp; TSEs raised within the reporting period.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-sm text-[#1f2a44]">
          <thead className="bg-[#f5f8ff] text-xs uppercase tracking-wide text-[#4a5d7a]">
            <tr>
              <th className="px-4 py-3 text-left">SR Created</th>
              <th className="px-4 py-3 text-left">FCO</th>
              <th className="px-4 py-3 text-left">FCO Description</th>
              <th className="px-4 py-3 text-left">SR #</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Serial Number</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Problem Summary</th>
            </tr>
          </thead>
          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-[#5b6b7c]">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-[#e2e7f2]">
                <td className="px-4 py-3 text-[#4a5d7a]">{formatDate(row.srCreated)}</td>
                <td className="px-4 py-3 text-[#0d5cad]">{row.fcoId || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.description || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.srNumber || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.severity || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.serialNumber || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.status || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.productName || '-'}</td>
                <td className="px-4 py-3 text-[#4a5d7a]">{row.problemSummary || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
