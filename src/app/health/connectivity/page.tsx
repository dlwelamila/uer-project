'use client'

import { useEffect, useState } from 'react'
import { useIncidentsFilters } from '@/components/IncidentsFilters'
import { ConnectivitySummaryCard } from '@/components/ConnectivitySummaryCard'
import { ConnectivityLegendCard } from '@/components/ConnectivityLegendCard'
import { ConnectivityTable, type ConnectivityRow } from '@/components/ConnectivityTable'
import { DEFAULT_CONNECTIVITY_NOTES, cloneConnectivityNotes } from '@/lib/connectivity'

const CONNECTED_ROWS: ConnectivityRow[] = [
  {
    assetId: 'DE600204877487',
    alternateAssetId: '9WB1033',
    productName: 'VxRail E560F',
    assetAlias: 'VxRail E560F',
    connectivityStatus: 'Connected',
    lastAlertAt: '2025-02-06T02:35:42Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 100,
    healthLabel: 'Good',
  },
  {
    assetId: 'DE600204877489',
    alternateAssetId: '3VW2PKF3',
    productName: 'Dell EMC Unity XT 480',
    assetAlias: 'Unity-480',
    connectivityStatus: 'Connected',
    lastAlertAt: '2025-02-06T02:30:42Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 86,
    healthLabel: 'Fair',
  },
  {
    assetId: 'DE600204877483',
    alternateAssetId: '7VS0D273',
    productName: 'VxRail P570F',
    assetAlias: 'VXR-P570F-01',
    connectivityStatus: 'Connected',
    lastAlertAt: '2025-02-05T23:12:18Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 95,
    healthLabel: 'Good',
  },
  {
    assetId: 'DE600204877495',
    alternateAssetId: '4V5D273',
    productName: 'VxRail P570F',
    assetAlias: 'VXR-P570F-02',
    connectivityStatus: 'Connected',
    lastAlertAt: '2025-02-05T23:10:03Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 90,
    healthLabel: 'Good',
  },
  {
    assetId: 'DE600204877501',
    alternateAssetId: 'CS17B04',
    productName: 'VxRail P670F',
    assetAlias: 'P670F-Core',
    connectivityStatus: 'Connected',
    lastAlertAt: '2025-02-05T22:48:01Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 78,
    healthLabel: 'Fair',
  },
]

const NOT_CONNECTED_ROWS: ConnectivityRow[] = [
  {
    assetId: 'DE600204877459',
    alternateAssetId: '5VD2T3',
    productName: 'VxRail P570F',
    assetAlias: 'P570F-Archive',
    connectivityStatus: 'Not Connected',
    lastAlertAt: '2025-02-04T05:21:00Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 45,
    healthLabel: 'Poor',
  },
  {
    assetId: 'DE600204877460',
    alternateAssetId: '7VMZVB3',
    productName: 'VxRail P570F',
    assetAlias: 'P570F-DR',
    connectivityStatus: 'Not Connected',
    lastAlertAt: '2025-02-04T05:18:00Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 55,
    healthLabel: 'Fair',
  },
  {
    assetId: 'DE600204877461',
    alternateAssetId: 'CQDKF98',
    productName: 'VxRail E560F',
    assetAlias: 'Edge-E560F',
    connectivityStatus: 'Not Connected',
    lastAlertAt: '2025-01-29T09:43:00Z',
    connectionType: 'Secure Connect Gateway',
    healthScore: 32,
    healthLabel: 'Poor',
  },
  {
    assetId: 'BRCC001916P0J4',
    alternateAssetId: 'CKM0018700399',
    productName: 'Connectrix DS-6505B',
    assetAlias: 'Core-DS6505',
    connectivityStatus: 'Not Connected',
    lastAlertAt: '2025-01-19T03:42:00Z',
    connectionType: 'Other',
    healthScore: 40,
    healthLabel: 'Poor',
  },
]

const FALLBACK_SUMMARY = {
  totalAssets: CONNECTED_ROWS.length + NOT_CONNECTED_ROWS.length,
  connectedCount: CONNECTED_ROWS.length,
}

const FALLBACK_ROWS: ConnectivityRow[] = [...CONNECTED_ROWS, ...NOT_CONNECTED_ROWS]
const FALLBACK_NOTES = cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES)

function normalizeRow(row: any): ConnectivityRow {
  return {
    assetId: String(row?.assetId ?? '').trim(),
    alternateAssetId: row?.alternateAssetId ? String(row.alternateAssetId).trim() : undefined,
    productName: String(row?.productName ?? '').trim(),
    assetAlias: row?.assetAlias ? String(row.assetAlias).trim() : undefined,
    connectivityStatus: row?.connectivityStatus === 'Not Connected' ? 'Not Connected' : 'Connected',
    lastAlertAt: row?.lastAlertAt ? String(row.lastAlertAt) : undefined,
    connectionType: row?.connectionType ? String(row.connectionType).trim() : undefined,
    healthScore:
      row?.healthScore === null || row?.healthScore === undefined || Number.isNaN(Number(row.healthScore))
        ? null
        : Number(row.healthScore),
    healthLabel:
      row?.healthLabel === 'Good' || row?.healthLabel === 'Fair' || row?.healthLabel === 'Poor'
        ? row.healthLabel
        : undefined,
  }
}

export default function ConnectivityPage() {
  const { periodLabel, reportTypeLabel, currentEngagement, selectedEngagementId } = useIncidentsFilters()

  const [summary, setSummary] = useState(FALLBACK_SUMMARY)
  const [rows, setRows] = useState<ConnectivityRow[]>(FALLBACK_ROWS)
  const [notes, setNotes] = useState<string[]>(FALLBACK_NOTES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedEngagementId) {
      setSummary(FALLBACK_SUMMARY)
      setRows(FALLBACK_ROWS)
      setNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
      setLoading(false)
      return
    }

    let cancelled = false
    async function loadConnectivity() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/connectivity?engagementId=${encodeURIComponent(selectedEngagementId)}`)
        if (!res.ok) throw new Error(`Failed to load connectivity (${res.status})`)
        const payload = await res.json()
        if (!cancelled) {
          const parsedSummary = {
            totalAssets: Number.isFinite(Number(payload?.summary?.totalAssets))
              ? Number(payload.summary.totalAssets)
              : FALLBACK_SUMMARY.totalAssets,
            connectedCount: Number.isFinite(Number(payload?.summary?.connectedCount))
              ? Number(payload.summary.connectedCount)
              : FALLBACK_SUMMARY.connectedCount,
          }
          const parsedRows =
            Array.isArray(payload?.rows) && payload.rows.length
              ? payload.rows.map(normalizeRow)
              : FALLBACK_ROWS
          const parsedNotes = Array.isArray(payload?.notes)
            ? payload.notes
                .map((note: any) => String(note ?? '').trim())
                .filter((note: string) => note.length > 0)
            : cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES)
          setSummary(parsedSummary)
          setRows(parsedRows)
          setNotes(parsedNotes.length ? parsedNotes : [])
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load connectivity data for this engagement.')
          setSummary(FALLBACK_SUMMARY)
          setRows(FALLBACK_ROWS)
          setNotes(cloneConnectivityNotes(DEFAULT_CONNECTIVITY_NOTES))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadConnectivity()
    return () => {
      cancelled = true
    }
  }, [selectedEngagementId])

  const connectedRows = rows.filter((row) => row.connectivityStatus === 'Connected')
  const notConnectedRows = rows.filter((row) => row.connectivityStatus === 'Not Connected')

  const rawTotal = summary.totalAssets || rows.length
  const connectedCount = summary.connectedCount || connectedRows.length
  const safeTotal = Math.max(rawTotal, connectedRows.length + notConnectedRows.length)
  const disconnectedCount = Math.max(0, safeTotal - connectedCount)

  return (
    <div className="space-y-5">
      {currentEngagement && (
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>{periodLabel}</span>
          <span>
            Interval: {reportTypeLabel} - Status: {currentEngagement.status}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Loading connectivity telemetry...
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <ConnectivitySummaryCard
            totalAssets={safeTotal}
            connected={connectedCount}
            disconnected={disconnectedCount}
          />
          <ConnectivityLegendCard notes={notes} />
        </div>

        <div className="space-y-5">
          <ConnectivityTable
            title="Connected Hardware Assets Breakdown"
            rows={connectedRows}
            emptyMessage="No connected assets were captured for this engagement."
            highlight="Connected"
          />
          <ConnectivityTable
            title="Not Connected Breakdown"
            rows={notConnectedRows}
            emptyMessage="Great news - no disconnected assets were identified for this engagement."
            highlight="Not Connected"
          />
        </div>
      </div>
    </div>
  )
}
