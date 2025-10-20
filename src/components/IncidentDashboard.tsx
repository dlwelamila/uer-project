'use client'

import { useEffect, useMemo, useState } from 'react'
import TrendAreaChart from './charts/TrendAreaChart'
import Donut from './charts/Donut'
import StackedBar from './charts/StackedBar'
import { MONTH_LABELS, type DashboardTrendPoint } from '@/lib/dashboard'

type TopRow = { product: string; count: number; percent: number }
type SpareRow = { product: string; sparePart: string; qty: number | string; mode: string }
type SeveritySlice = { label: 'S1' | 'S2' | 'S3' | 'S5'; value: number }
type ChannelSlice = { label: string; value: number }

type Props = {
  top5: TopRow[]
  trend: DashboardTrendPoint[]
  severities: SeveritySlice[]
  channels: ChannelSlice[]
  notes: string[]
  spareParts: SpareRow[]
  periodLabel?: string
  reportTypeLabel?: string
}

export default function IncidentDashboard({
  top5,
  trend,
  severities,
  channels,
  notes,
  spareParts,
  periodLabel,
  reportTypeLabel,
}: Props) {
  const severityPalette = ['#E53935', '#FFC107', '#4CAF50', '#1976D2']
  const channelPalette = ['#4C9AFF', '#FFC107', '#9E9E9E', '#7CB342', '#FF8A65', '#8E24AA']

  const trendPoints = useMemo(() => {
    const byMonth = new Map<number, DashboardTrendPoint>()
    trend.forEach((point) => {
      const monthNumber = Math.min(12, Math.max(1, Number(point?.month ?? 1)))
      byMonth.set(monthNumber, {
        month: monthNumber,
        value: Number(point?.value ?? 0),
        comparison:
          point?.comparison === undefined || point?.comparison === null
            ? null
            : Number(point.comparison),
        note: point?.note ?? '',
      })
    })

    return MONTH_LABELS.map((label, index) => {
      const month = index + 1
      const match = byMonth.get(month)
      return {
        label,
        month,
        value: Number(match?.value ?? 0),
        comparison:
          match?.comparison === undefined || match?.comparison === null
            ? null
            : Number(match.comparison),
        note: match?.note?.trim?.() ?? '',
      }
    })
  }, [trend])

  const hasComparison = useMemo(
    () => trendPoints.some((point) => point.comparison !== null && point.comparison !== undefined),
    [trendPoints],
  )

  const [showComparison, setShowComparison] = useState(false)
  useEffect(() => {
    if (!hasComparison && showComparison) {
      setShowComparison(false)
    }
  }, [hasComparison, showComparison])

  return (
    <div className="incident-grid">
      <div className="area-left grid gap-4 lg:gap-6">
        <Card>
          <CardTitle icon="🎧">SRs for Top 5 Products</CardTitle>
          <div className="mt-1 border-b-2 border-[#0076CE]" />
          <div className="mt-2 overflow-x-auto sm:overflow-visible">
            <table className="w-full text-[12px] sm:min-w-[300px]">
              <thead className="text-[#5B6B7C]">
                <tr>
                  <th className="py-1 text-left">Product</th>
                  <th className="py-1 text-right">#</th>
                  <th className="py-1 text-right">% </th>
                </tr>
              </thead>
              <tbody>
                {top5.length ? (
                  top5.map((row, index) => (
                    <tr key={index} className="border-t border-[#DADDE1]">
                      <td className="py-1.5 pr-2">{row.product}</td>
                      <td className="py-1.5 text-right">{row.count}</td>
                      <td className="py-1.5 text-right">{Number(row.percent ?? 0).toFixed(1)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-xs text-[#5B6B7C]">
                      No product breakdown captured for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle icon="⚠️">Service Request Severity</CardTitle>
          <div className="mt-4 flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-10">
            <Donut className="w-full max-w-[220px]" data={severities.map((slice) => slice.value)} colors={severityPalette} strokeWidth={18} />
            <div className="flex flex-col items-center gap-3 text-[12px] lg:items-start">
              {severities.map((slice, index) => {
                const palette = severityPalette[index % severityPalette.length]
                const value = Number(slice.value ?? 0)
                const percent = `${Math.round(value)}%`
                const fontScale = Math.max(0.85, Math.min(1.2, value / 30 || 0.85))
                return (
                  <div key={`${slice.label}-${index}`} className="flex items-center gap-3">
                    <Legend label={slice.label} color={palette} />
                    <span
                      className="font-semibold"
                      style={{
                        color: palette,
                        fontSize: `${fontScale}rem`,
                      }}
                    >
                      {percent}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle icon="🧬">Service Request Channels</CardTitle>
          <div className="mt-3">
            <StackedBar data={channels.map((channel) => channel.value)} colors={channelPalette} height={22} />
            <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 text-[12px]">
              {channels.map((channel, index) => (
                <Legend key={`${channel.label}-${index}`} label={channel.label} color={channelPalette[index % channelPalette.length]} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="area-trend relative z-0">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle icon={<TrendMiniIcon />}>Service Request Volume Trend</CardTitle>
          {reportTypeLabel && <span className="text-xs font-medium text-[#5B6B7C]">{reportTypeLabel}</span>}
          {hasComparison && (
            <button
              type="button"
              className={`ml-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${showComparison ? 'border-[#0076CE] text-[#0076CE]' : 'border-slate-200 text-slate-500'}`}
              onClick={() => setShowComparison((prev) => !prev)}
            >
              {showComparison ? 'Hide' : 'Show'} prior period
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {periodLabel && <span>{periodLabel}</span>}
          {hasComparison && showComparison && (
            <span className="inline-flex items-center gap-2 text-[#0076CE]">
              <span
                aria-hidden
                className="inline-block h-2 w-6 rounded-sm border border-[#0076CE]"
                style={{ backgroundColor: 'rgba(0,118,206,0.15)' }}
              />
              Prior period overlay
            </span>
          )}
        </div>
        <div className="mt-3">
          <TrendAreaChart
            points={trendPoints}
            showQuarterGuides
            labelColor="#D32F2F"
            areaColor="rgba(154,166,185,.40)"
            axisColor="#BFC8D6"
            guideColor="#A8C5E8"
            showComparison={hasComparison && showComparison}
            comparisonColor="rgba(0,118,206,0.65)"
          />
        </div>
      </Card>

      <div
        className="area-notes rounded-lg border border-[#DADDE1] p-5 text-[14px] text-[#0b2a49] shadow print:shadow-none"
        style={{ background: 'linear-gradient(180deg,#cfe6fb 0%,#6aa5dd 100%)' }}
      >
        <div className="text-center text-[13px] font-medium text-[#005A9E]">
          Key Notes <span className="text-[#E53935]">***</span>
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-6">
          {notes.length ? notes.map((note, index) => <li key={index}>{note}</li>) : <li className="list-none">No key notes captured.</li>}
        </ul>
      </div>

      <Card className="area-spare">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-[#0076CE]">🧠</span>
            <CardTitle>Spare Parts Replacement</CardTitle>
          </div>
          {periodLabel && <span className="text-[11px] text-[#5B6B7C]">{periodLabel}</span>}
        </div>
        <div className="mt-2 border-b border-[#DADDE1]" />
        <div className="mt-2 overflow-x-auto sm:overflow-visible">
          <table className="w-full text-[12px] sm:min-w-[280px]">
            <thead className="text-[#5B6B7C]">
              <tr>
                <th className="py-1 text-left">Product</th>
                <th className="py-1 text-left">Spare Part</th>
                <th className="py-1 text-center">QTY</th>
                <th className="py-1 text-left">Mode</th>
              </tr>
            </thead>
            <tbody>
              {spareParts.length ? (
                spareParts.map((row, index) => (
                  <tr key={index} className="border-t border-[#DADDE1]">
                    <td className="py-1.5">{row.product}</td>
                    <td className="py-1.5">{row.sparePart}</td>
                    <td className="py-1.5 text-center">{row.qty}</td>
                    <td className="py-1.5">{row.mode || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-xs text-[#5B6B7C]">
                    No spare part activity captured for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[#DADDE1] bg-white p-4 shadow print:shadow-none ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#005A9E]">
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </h3>
  )
}

function Legend({ label, color, value }: { label: string; color: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="text-[#5B6B7C]">{label}</span>
      {value && <span className="ml-auto text-[#111]">{value}</span>}
    </div>
  )
}

function TrendMiniIcon() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#0076CE] bg-[#E3F0FF]">
      <svg
        width="16"
        height="12"
        viewBox="0 0 16 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#0076CE]"
      >
        <rect x="1" y="7" width="2" height="4" rx="0.5" fill="currentColor" />
        <rect x="5" y="4" width="2" height="7" rx="0.5" fill="currentColor" />
        <rect x="9" y="1" width="2" height="10" rx="0.5" fill="currentColor" />
        <rect x="13" y="5" width="2" height="6" rx="0.5" fill="currentColor" />
      </svg>
    </span>
  )
}




