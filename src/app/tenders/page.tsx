"use client"

import { useEffect, useMemo, useState } from "react"
import Donut from "@/components/charts/Donut"
import ColumnChart from "@/components/charts/ColumnChart"
import LineTrendChart from "@/components/charts/LineTrendChart"

type TabKey = "dashboard" | "overview" | "processing" | "history"

const TAB_LABELS: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "overview", label: "Overview" },
  { key: "processing", label: "Processing" },
  { key: "history", label: "History" },
]

const STATUS_OPTIONS = ["WON", "LOST", "ONGOING", "PENDING", "SUBMITTED", "IN_REVIEW"] as const
type TenderStatus = (typeof STATUS_OPTIONS)[number]
type Tender = {
  id: string
  name: string
  entity: string
  status: TenderStatus
  submissionDate: string | null
  advertisedDate: string | null
  submissionDateTime: string | null
  tenderNumber: string | null
  value: number | null
  owner: string | null
  comment: string | null
  createdAt: string
}

type WorkflowEntry = {
  id: string
  tenderId: string
  stage: string
  keyTask: string | null
  timeline: string | null
  owner: string | null
  status: TenderStatus
  note: string | null
  createdAt: string
  tender?: Pick<Tender, "name">
}

type HistoryEntry = {
  id: string
  year: number
  total: number
  won: number
  lost: number
  ongoing: number
  valueWon: number
  source?: "manual" | "derived"
  createdAt: string
}

type TenderFormState = {
  name: string
  entity: string
  status: TenderStatus
  submissionDate: string
  advertisedDate: string
  submissionDateTime: string
  tenderNumber: string
  value: string
  owner: string
  comment: string
}

type WorkflowFormState = {
  tenderId: string
  stage: string
  keyTask: string
  timeline: string
  owner: string
  status: TenderStatus
  note: string
}

const WORKFLOW_STAGE_OPTIONS = [
  "Tender Identification",
  "Document Preparation",
  "Submission",
  "Evaluation",
  "Award",
] as const

type HistoryFormState = {
  year: string
  total: string
  won: string
  lost: string
  ongoing: string
  valueWon: string
}

type ModalState =
  | { kind: "tender"; mode: "create" | "edit"; record?: Tender }
  | { kind: "workflow"; mode: "create" | "edit"; record?: WorkflowEntry }
  | { kind: "history"; mode: "create" | "edit"; record?: HistoryEntry }

const STATUS_STYLES: Record<TenderStatus, string> = {
  WON: "bg-emerald-100 text-emerald-700 ring-emerald-400/40",
  LOST: "bg-rose-100 text-rose-700 ring-rose-400/40",
  ONGOING: "bg-sky-100 text-sky-700 ring-sky-400/40",
  PENDING: "bg-amber-100 text-amber-700 ring-amber-400/40",
  SUBMITTED: "bg-indigo-100 text-indigo-700 ring-indigo-400/40",
  IN_REVIEW: "bg-violet-100 text-violet-700 ring-violet-400/40",
}

const DEFAULT_STATUS_STYLE = "bg-slate-200 text-slate-700 ring-slate-400/30"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function initialTenderForm(): TenderFormState {
  return {
    name: "",
    entity: "",
    status: "ONGOING",
    submissionDate: "",
    advertisedDate: "",
    submissionDateTime: "",
    tenderNumber: "",
    value: "",
    owner: "",
    comment: "",
  }
}

function initialWorkflowForm(defaultTenderId: string): WorkflowFormState {
  return {
    tenderId: defaultTenderId,
    stage: WORKFLOW_STAGE_OPTIONS[0],
    keyTask: "",
    timeline: "",
    owner: "",
    status: "PENDING",
    note: "",
  }
}

function initialHistoryForm(): HistoryFormState {
  return {
    year: "",
    total: "",
    won: "",
    lost: "",
    ongoing: "",
    valueWon: "",
  }
}

function formatStatusLabel(status: TenderStatus) {
  return status
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ")
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "—"
  return `TZS ${currencyFormatter.format(value)}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return dateFormatter.format(parsed)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return dateTimeFormatter.format(parsed)
}

function toLocalDateInput(value: string | null) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function toLocalDateTimeInput(value: string | null) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function fromDateInput(value: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function fromDateTimeInput(value: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function StatusBadge({ status }: { status: TenderStatus }) {
  const styles = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

export default function TendersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard")
  const [tenders, setTenders] = useState<Tender[]>([])
  const [workflows, setWorkflows] = useState<WorkflowEntry[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [tenderForm, setTenderForm] = useState<TenderFormState>(() => initialTenderForm())
  const [workflowForm, setWorkflowForm] = useState<WorkflowFormState>(() => initialWorkflowForm(""))
  const [historyForm, setHistoryForm] = useState<HistoryFormState>(() => initialHistoryForm())
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [tenderResponse, workflowResponse, historyResponse] = await Promise.all([
          fetch("/api/tenders", { cache: "no-store" }),
          fetch("/api/tenders/workflows", { cache: "no-store" }),
          fetch("/api/tenders/history", { cache: "no-store" }),
        ])

        if (!tenderResponse.ok || !workflowResponse.ok || !historyResponse.ok) {
          throw new Error("Failed to load tender data")
        }

        const [tenderData, workflowData, historyData] = await Promise.all([
          tenderResponse.json() as Promise<Tender[]>,
          workflowResponse.json() as Promise<WorkflowEntry[]>,
          historyResponse.json() as Promise<HistoryEntry[]>,
        ])

        if (!isMounted) return
        setTenders(tenderData)
        setWorkflows(workflowData)
        setHistory(historyData)
      } catch (loadError) {
        if (!isMounted) return
        console.error(loadError)
        setError(loadError instanceof Error ? loadError.message : "Unexpected error")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const dashboardStats = useMemo(() => {
    if (!tenders.length) {
      return {
        total: 0,
        won: 0,
        ongoing: 0,
        pending: 0,
        winRate: 0,
        valueWon: 0,
      }
    }

    const wonTenders = tenders.filter((tender) => tender.status === "WON")
    const ongoingTenders = tenders.filter((tender) => tender.status === "ONGOING")
    const pendingTenders = tenders.filter((tender) => tender.status === "PENDING" || tender.status === "SUBMITTED" || tender.status === "IN_REVIEW")
    const totalValueWon = wonTenders.reduce((total, tender) => total + (tender.value ?? 0), 0)
    const winRate = Math.round((wonTenders.length / tenders.length) * 100)

    return {
      total: tenders.length,
      won: wonTenders.length,
      ongoing: ongoingTenders.length,
      pending: pendingTenders.length,
      winRate,
      valueWon: totalValueWon,
    }
  }, [tenders])

  const historySummary = useMemo(() => {
    if (!history.length) return null
    const sorted = [...history].sort((a, b) => b.year - a.year)
    const latest = sorted[0]
    const aggregate = sorted.reduce(
      (accumulator, record) => {
        accumulator.total += record.total
        accumulator.won += record.won
        accumulator.valueWon += record.valueWon
        return accumulator
      },
      { total: 0, won: 0, valueWon: 0 }
    )
    const aggregateWinRate = aggregate.total === 0 ? 0 : Math.round((aggregate.won / aggregate.total) * 100)
    const latestWinRate = latest.total === 0 ? 0 : Math.round((latest.won / latest.total) * 100)

    return {
      latest,
      aggregate,
      aggregateWinRate,
      latestWinRate,
    }
  }, [history])

  const latestTenders = useMemo(() => {
    const sorted = [...tenders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted.slice(0, 6)
  }, [tenders])

  const statusBreakdown = useMemo(() => {
    const counts = STATUS_OPTIONS.reduce<Record<TenderStatus, number>>((map, status) => {
      map[status] = 0
      return map
    }, {} as Record<TenderStatus, number>)

    tenders.forEach((tender) => {
      counts[tender.status] += 1
    })

    return counts
  }, [tenders])

  const statusDonut = useMemo(() => {
    const slices = [
      { label: "Won", value: statusBreakdown.WON ?? 0, color: "#22c55e" },
      { label: "Lost", value: statusBreakdown.LOST ?? 0, color: "#ef4444" },
      {
        label: "Ongoing",
        value:
          (statusBreakdown.ONGOING ?? 0) +
          (statusBreakdown.PENDING ?? 0) +
          (statusBreakdown.SUBMITTED ?? 0) +
          (statusBreakdown.IN_REVIEW ?? 0),
        color: "#0ea5e9",
      },
    ]
    const total = slices.reduce((sum, slice) => sum + slice.value, 0)
    return { slices, total }
  }, [statusBreakdown])

  const performanceMetrics = useMemo(() => {
    const total = dashboardStats.total || 0
    const winRate = total ? dashboardStats.winRate : 0
    const submittedCount =
      (statusBreakdown.SUBMITTED ?? 0) +
      (statusBreakdown.IN_REVIEW ?? 0) +
      (statusBreakdown.WON ?? 0) +
      (statusBreakdown.LOST ?? 0)
    const submissionRate = total ? Math.round((submittedCount / total) * 100) : 0

    const now = Date.now()
    const onTrack = total
      ? tenders.filter((tender) => {
          const raw = tender.submissionDateTime ?? tender.submissionDate
          if (!raw) return true
          const submission = new Date(raw)
          if (Number.isNaN(submission.getTime())) return true
          if (submission.getTime() >= now) return true
          return tender.status === "WON"
        }).length
      : 0
    const onTimeRate = total ? Math.round((onTrack / total) * 100) : 0

    return [
      { label: "Win Rate", value: Math.min(100, Math.max(0, winRate)), color: "#22c55e" },
      { label: "Submission Rate", value: Math.min(100, Math.max(0, submissionRate)), color: "#0f766e" },
      { label: "On-Time Delivery", value: Math.min(100, Math.max(0, onTimeRate)), color: "#a855f7" },
    ]
  }, [dashboardStats, statusBreakdown, tenders])

  const upcomingDeadlines = useMemo(() => {
    const now = Date.now()
    const horizon = 30

    const colorForDays = (days: number) => {
      if (days <= 2) return "#ef4444"
      if (days <= 5) return "#f97316"
      if (days <= 10) return "#f59e0b"
      return "#facc15"
    }

    return tenders
      .map((tender) => {
        const raw = tender.submissionDateTime ?? tender.submissionDate
        if (!raw) return null
        const submission = new Date(raw)
        if (Number.isNaN(submission.getTime())) return null
        const diffMs = submission.getTime() - now
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays < 0) return null
        const progress = Math.max(0, Math.min(1, (horizon - diffDays) / horizon))
        return {
          id: tender.id,
          name: tender.name,
          daysRemaining: diffDays,
          color: colorForDays(diffDays),
          progress,
        }
      })
      .filter((entry): entry is {
        id: string
        name: string
        daysRemaining: number
        color: string
        progress: number
      } => entry !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5)
  }, [tenders])

  const formatDeadlineLabel = (days: number) => {
    if (days <= 0) return "Due today"
    if (days === 1) return "1 day"
    return `${days} days`
  }

  const historyCharts = useMemo(() => {
    if (!history.length) {
      return { awards: [] as Array<{ label: string; value: number }>, winRates: [] as Array<{ label: string; value: number }> }
    }

    const byYear = history.reduce<Record<number, HistoryEntry>>((map, entry) => {
      const existing = map[entry.year]
      if (!existing || existing.source === "derived") {
        map[entry.year] = entry
      }
      return map
    }, {})

    const sortedYears = Object.keys(byYear)
      .map((year) => Number(year))
      .filter((year) => Number.isFinite(year))
      .sort((a, b) => a - b)

    const awards = sortedYears.map((year) => ({
      label: String(year),
      value: Math.max(0, byYear[year]?.won ?? 0),
    }))

    const winRates = sortedYears.map((year) => {
      const record = byYear[year]
      const rate = record && record.total > 0 ? Math.round((record.won / record.total) * 100) : 0
      return {
        label: String(year),
        value: Math.max(0, Math.min(100, rate)),
      }
    })

    return { awards, winRates }
  }, [history])
  const workflowStageOptions = useMemo(() => {
    const options = new Set<string>(WORKFLOW_STAGE_OPTIONS)
    if (workflowForm.stage && !options.has(workflowForm.stage)) {
      options.add(workflowForm.stage)
    }
    return Array.from(options)
  }, [workflowForm.stage])

  const closeModal = () => {
    setModal(null)
    setFormError(null)
    setTenderForm(initialTenderForm())
    setWorkflowForm(initialWorkflowForm(tenders[0]?.id || ""))
    setHistoryForm(initialHistoryForm())
  }

  const handleTenderFieldChange = <Key extends keyof TenderFormState>(field: Key, value: TenderFormState[Key]) => {
    setTenderForm((current) => ({ ...current, [field]: value }))
  }

  const handleWorkflowFieldChange = <Key extends keyof WorkflowFormState>(field: Key, value: WorkflowFormState[Key]) => {
    setWorkflowForm((current) => ({ ...current, [field]: value }))
  }

  const handleHistoryFieldChange = <Key extends keyof HistoryFormState>(field: Key, value: HistoryFormState[Key]) => {
    setHistoryForm((current) => ({ ...current, [field]: value }))
  }

  const refreshTenders = async () => {
    const response = await fetch("/api/tenders", { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to refresh tenders")
    const data = (await response.json()) as Tender[]
    setTenders(data)
  }

  const refreshWorkflows = async () => {
    const response = await fetch("/api/tenders/workflows", { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to refresh workflow entries")
    const data = (await response.json()) as WorkflowEntry[]
    setWorkflows(data)
  }

  const refreshHistory = async () => {
    const response = await fetch("/api/tenders/history", { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to refresh history")
    const data = (await response.json()) as HistoryEntry[]
    setHistory(data)
  }

  const openTenderModal = (mode: ModalState["mode"], record?: Tender) => {
    if (mode === "edit" && record) {
      setTenderForm({
        name: record.name,
        entity: record.entity,
        status: record.status,
        submissionDate: toLocalDateInput(record.submissionDate),
        advertisedDate: toLocalDateInput(record.advertisedDate),
        submissionDateTime: toLocalDateTimeInput(record.submissionDateTime),
        tenderNumber: record.tenderNumber ?? "",
        value: record.value !== null && record.value !== undefined ? String(record.value) : "",
        owner: record.owner ?? "",
        comment: record.comment ?? "",
      })
    } else {
      setTenderForm(initialTenderForm())
    }
    setFormError(null)
    setModal({ kind: "tender", mode, record })
  }

  const openWorkflowModal = (mode: ModalState["mode"], record?: WorkflowEntry) => {
    const defaultTenderId = record?.tenderId || tenders[0]?.id || ""
    if (mode === "edit" && record) {
      setWorkflowForm({
        tenderId: defaultTenderId,
        stage: record.stage,
        keyTask: record.keyTask ?? "",
        timeline: record.timeline ?? "",
        owner: record.owner ?? "",
        status: record.status,
        note: record.note ?? "",
      })
    } else {
      setWorkflowForm(initialWorkflowForm(defaultTenderId))
    }
    setFormError(null)
    setModal({ kind: "workflow", mode, record })
  }

  const openHistoryModal = (mode: ModalState["mode"], record?: HistoryEntry) => {
    if (mode === "edit" && record?.source === "derived") {
      setError("Automated history rows reflect tender activity and are read-only.")
      return
    }
    if (mode === "edit" && record) {
      setHistoryForm({
        year: String(record.year),
        total: String(record.total),
        won: String(record.won),
        lost: String(record.lost),
        ongoing: String(record.ongoing),
        valueWon: String(record.valueWon),
      })
    } else {
      setHistoryForm(initialHistoryForm())
    }
    setFormError(null)
    setModal({ kind: "history", mode, record })
  }

  const submitTenderForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!modal || modal.kind !== "tender") return

    try {
      setFormError(null)
      const payload = {
        name: tenderForm.name.trim(),
        entity: tenderForm.entity.trim(),
        status: tenderForm.status,
        submissionDate: fromDateInput(tenderForm.submissionDate),
        advertisedDate: fromDateInput(tenderForm.advertisedDate),
        submissionDateTime: fromDateTimeInput(tenderForm.submissionDateTime),
        tenderNumber: tenderForm.tenderNumber.trim() || null,
        value: tenderForm.value ? Number(tenderForm.value) : null,
        owner: tenderForm.owner.trim() || null,
        comment: tenderForm.comment.trim() || null,
      }

      const url = modal.mode === "create" ? "/api/tenders" : `/api/tenders/${modal.record?.id}`
      const method = modal.mode === "create" ? "POST" : "PATCH"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to save tender")
      }

      await refreshTenders()
      closeModal()
    } catch (submitError) {
      console.error(submitError)
      setFormError(submitError instanceof Error ? submitError.message : "Failed to save tender")
    }
  }

  const submitWorkflowForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!modal || modal.kind !== "workflow") return

    try {
      setFormError(null)
      if (!workflowForm.tenderId) {
        throw new Error("Select a tender to associate with the task")
      }

      const payload = {
        tenderId: workflowForm.tenderId,
        stage: workflowForm.stage.trim(),
        keyTask: workflowForm.keyTask.trim() || null,
        timeline: workflowForm.timeline.trim() || null,
        owner: workflowForm.owner.trim() || null,
        status: workflowForm.status,
        note: workflowForm.note.trim() || null,
      }

      if (!payload.stage) {
        throw new Error("Stage is required")
      }

      const url = modal.mode === "create" ? "/api/tenders/workflows" : `/api/tenders/workflows/${modal.record?.id}`
      const method = modal.mode === "create" ? "POST" : "PATCH"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to save workflow entry")
      }

      await refreshWorkflows()
      closeModal()
    } catch (submitError) {
      console.error(submitError)
      setFormError(submitError instanceof Error ? submitError.message : "Failed to save workflow entry")
    }
  }

  const submitHistoryForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!modal || modal.kind !== "history") return

    try {
      setFormError(null)
      const payload = {
        year: Number(historyForm.year),
        total: Number(historyForm.total),
        won: Number(historyForm.won),
        lost: Number(historyForm.lost),
        ongoing: Number(historyForm.ongoing),
        valueWon: Number(historyForm.valueWon),
      }

      if (Object.values(payload).some((value) => Number.isNaN(value))) {
        throw new Error("All fields must be numeric")
      }

      const url = modal.mode === "create" ? "/api/tenders/history" : `/api/tenders/history/${modal.record?.id}`
      const method = modal.mode === "create" ? "POST" : "PATCH"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to save history entry")
      }

      await refreshHistory()
      closeModal()
    } catch (submitError) {
      console.error(submitError)
      setFormError(submitError instanceof Error ? submitError.message : "Failed to save history entry")
    }
  }

  const deleteTender = async (tender: Tender) => {
    if (!window.confirm(`Delete tender “${tender.name}”?`)) return
    const response = await fetch(`/api/tenders/${tender.id}`, { method: "DELETE" })
    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => null)
      setError(body?.error ?? "Failed to delete tender")
      return
    }
    await refreshTenders()
  }

  const deleteWorkflow = async (entry: WorkflowEntry) => {
    if (!window.confirm(`Delete workflow stage “${entry.stage}”?`)) return
    const response = await fetch(`/api/tenders/workflows/${entry.id}`, { method: "DELETE" })
    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => null)
      setError(body?.error ?? "Failed to delete workflow entry")
      return
    }
    await refreshWorkflows()
  }

  const deleteHistory = async (entry: HistoryEntry) => {
    if (entry.source === "derived") {
      setError("Automated history rows cannot be deleted.")
      return
    }
    if (!window.confirm(`Delete history record for ${entry.year}?`)) return
    const response = await fetch(`/api/tenders/history/${entry.id}`, { method: "DELETE" })
    if (!response.ok && response.status !== 204) {
      const body = await response.json().catch(() => null)
      setError(body?.error ?? "Failed to delete history entry")
      return
    }
    await refreshHistory()
  }

  const renderModal = () => {
    if (!modal) return null

    if (modal.kind === "tender") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{modal.mode === "create" ? "Add tender" : "Edit tender"}</h2>
                <p className="text-sm text-slate-500">Maintain the pipeline with the latest bid activity.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900">
                Close
              </button>
            </header>
            <form className="mt-6 space-y-4" onSubmit={submitTenderForm}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Tender name
                  <input
                    value={tenderForm.name}
                    onChange={(event) => handleTenderFieldChange("name", event.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Procuring entity
                  <input
                    value={tenderForm.entity}
                    onChange={(event) => handleTenderFieldChange("entity", event.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Submission date
                  <input
                    type="date"
                    value={tenderForm.submissionDate}
                    onChange={(event) => handleTenderFieldChange("submissionDate", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Advertised date
                  <input
                    type="date"
                    value={tenderForm.advertisedDate}
                    onChange={(event) => handleTenderFieldChange("advertisedDate", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Submission date &amp; time
                  <input
                    type="datetime-local"
                    value={tenderForm.submissionDateTime}
                    onChange={(event) => handleTenderFieldChange("submissionDateTime", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Tender reference number
                  <input
                    value={tenderForm.tenderNumber}
                    onChange={(event) => handleTenderFieldChange("tenderNumber", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Value (TZS)
                  <input
                    type="number"
                    min={0}
                    value={tenderForm.value}
                    onChange={(event) => handleTenderFieldChange("value", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Owner
                  <input
                    value={tenderForm.owner}
                    onChange={(event) => handleTenderFieldChange("owner", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Status
                  <select
                    value={tenderForm.status}
                    onChange={(event) => handleTenderFieldChange("status", event.target.value as TenderFormState["status"])}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Comment
                <textarea
                  rows={3}
                  value={tenderForm.comment}
                  onChange={(event) => handleTenderFieldChange("comment", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-900/30 transition hover:brightness-110">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    if (modal.kind === "workflow") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{modal.mode === "create" ? "Add workflow task" : "Edit workflow task"}</h2>
                <p className="text-sm text-slate-500">Connect bid office activities to each tender.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900">
                Close
              </button>
            </header>
            <form className="mt-6 space-y-4" onSubmit={submitWorkflowForm}>
              <label className="block text-sm font-medium text-slate-700">
                Tender
                <select
                  value={workflowForm.tenderId}
                  onChange={(event) => handleWorkflowFieldChange("tenderId", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select tender</option>
                  {tenders.map((tender) => (
                    <option key={tender.id} value={tender.id}>
                      {tender.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Stage
                <select
                  value={workflowForm.stage}
                  onChange={(event) => handleWorkflowFieldChange("stage", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {workflowStageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Key task
                <input
                  value={workflowForm.keyTask}
                  onChange={(event) => handleWorkflowFieldChange("keyTask", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Timeline
                <input
                  value={workflowForm.timeline}
                  onChange={(event) => handleWorkflowFieldChange("timeline", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Owner
                <input
                  value={workflowForm.owner}
                  onChange={(event) => handleWorkflowFieldChange("owner", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Status
                <select
                  value={workflowForm.status}
                  onChange={(event) => handleWorkflowFieldChange("status", event.target.value as WorkflowFormState["status"])}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Note
                <textarea
                  rows={3}
                  value={workflowForm.note}
                  onChange={(event) => handleWorkflowFieldChange("note", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
              {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-900/30 transition hover:brightness-110">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10">
        <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{modal.mode === "create" ? "Add history" : "Edit history"}</h2>
              <p className="text-sm text-slate-500">Build the multi-year award baseline.</p>
            </div>
            <button type="button" onClick={closeModal} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900">
              Close
            </button>
          </header>
          <form className="mt-6 space-y-4" onSubmit={submitHistoryForm}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Year
                <input
                  type="number"
                  value={historyForm.year}
                  onChange={(event) => handleHistoryFieldChange("year", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Total tenders
                <input
                  type="number"
                  value={historyForm.total}
                  onChange={(event) => handleHistoryFieldChange("total", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Won tenders
                <input
                  type="number"
                  value={historyForm.won}
                  onChange={(event) => handleHistoryFieldChange("won", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Lost tenders
                <input
                  type="number"
                  value={historyForm.lost}
                  onChange={(event) => handleHistoryFieldChange("lost", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Ongoing tenders
                <input
                  type="number"
                  value={historyForm.ongoing}
                  onChange={(event) => handleHistoryFieldChange("ongoing", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Value won (TZS)
                <input
                  type="number"
                  value={historyForm.valueWon}
                  onChange={(event) => handleHistoryFieldChange("valueWon", event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>
            {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/30 transition hover:brightness-110">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="space-y-10 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Bids</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tender intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Realtime view of procurement pursuits tied to workflow progress and historical performance.</p>
        </div>
        <button
          type="button"
          onClick={() => openTenderModal("create")}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-900/30 transition hover:brightness-110"
        >
          <span aria-hidden>＋</span>
          Add tender
        </button>
      </header>

      <nav className="flex flex-wrap items-center gap-2">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>}

      {loading ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Loading tender workspace…
        </section>
      ) : (
        <div className="space-y-10">
          {activeTab === "dashboard" && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active tenders</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{dashboardStats.total}</p>
                  <p className="mt-1 text-sm text-slate-500">Total bids tracked across all teams.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Won this cycle</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-600">{dashboardStats.won}</p>
                  <p className="mt-1 text-sm text-slate-500">Confirmed awards with signed contracts.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Win rate</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{Number.isFinite(dashboardStats.winRate) ? `${dashboardStats.winRate}%` : "—"}</p>
                  <p className="mt-1 text-sm text-slate-500">Won vs total tenders logged.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Value won (TZS)</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(dashboardStats.valueWon)}</p>
                  <p className="mt-1 text-sm text-slate-500">Awarded value across the portfolio.</p>
                </article>
              </div>

              {historySummary && (
                <>
                  <article className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Latest performance ({historySummary.latest.year})</h2>
                      <p className="mt-1 text-sm text-slate-500">Won {historySummary.latest.won} of {historySummary.latest.total} tenders ({historySummary.latestWinRate}%).</p>
                      <p className="mt-4 text-sm font-semibold text-slate-600">Value won {formatCurrency(historySummary.latest.valueWon)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">Multi-year</p>
                      <p className="mt-3 text-3xl font-semibold">{historySummary.aggregateWinRate}%</p>
                      <p className="mt-2 text-sm text-white/80">Win rate across {historySummary.aggregate.total} tenders.</p>
                      <p className="mt-6 text-sm text-white/70">Awards value {formatCurrency(historySummary.aggregate.valueWon)}</p>
                    </div>
                  </article>
                  {!!historyCharts.awards.length && (
                    <article className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <header className="flex items-center gap-3 text-slate-900">
                        <span aria-hidden className="text-2xl">📈</span>
                        <div>
                          <h2 className="text-lg font-semibold">Tender history & trend</h2>
                          <p className="text-sm text-slate-500">Multi-year performance outlook based on recorded outcomes.</p>
                        </div>
                      </header>
                      <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-2xl border border-slate-100 p-4">
                          <header className="mb-4">
                            <h3 className="text-base font-semibold text-slate-800">Awarded contracts by year</h3>
                            <p className="text-xs text-slate-500">Total number of successful awards captured for each year.</p>
                          </header>
                          <ColumnChart data={historyCharts.awards} color="#22c55e" />
                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" aria-hidden />
                            <span>Awarded contracts</span>
                          </div>
                        </section>
                        <section className="rounded-2xl border border-slate-100 p-4">
                          <header className="mb-4">
                            <h3 className="text-base font-semibold text-slate-800">Win rate trend</h3>
                            <p className="text-xs text-slate-500">Year-over-year win percentage calculated from tender history.</p>
                          </header>
                          <LineTrendChart data={historyCharts.winRates} />
                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" aria-hidden />
                            <span>Win rate %</span>
                          </div>
                        </section>
                      </div>
                    </article>
                  )}
                </>
              )}

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-6 shadow-[0_15px_35px_-18px_rgba(30,64,175,0.4)]">
                    <header className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-indigo-700">Tender performance</h2>
                        <p className="text-sm text-slate-500">Conversion and execution indicators from live data.</p>
                      </div>
                      <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-2xl">🏆</span>
                    </header>
                    <div className="space-y-5">
                      {performanceMetrics.map((metric) => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                            <span>{metric.label}</span>
                            <span>{metric.value}%</span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-200">
                            <div className="h-3 rounded-full" style={{ width: `${metric.value}%`, backgroundColor: metric.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-6 shadow-[0_15px_35px_-18px_rgba(30,64,175,0.4)]">
                    <header className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-indigo-700">Upcoming deadlines</h2>
                        <p className="text-sm text-slate-500">Submission clocks for the next critical tenders.</p>
                      </div>
                      <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-2xl">🕒</span>
                    </header>
                    <div className="space-y-4">
                      {upcomingDeadlines.length ? (
                        upcomingDeadlines.map((deadline) => (
                          <div key={deadline.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                              <span className="truncate pr-4" title={deadline.name}>{deadline.name}</span>
                              <span className="text-slate-500">{formatDeadlineLabel(deadline.daysRemaining)}</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-200">
                              <div
                                className="h-3 rounded-full transition-[width]"
                                style={{
                                  width: `${Math.max(6, Math.min(100, Math.round(deadline.progress * 100)))}%`,
                                  backgroundColor: deadline.color,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No upcoming deadlines within the next month.</p>
                      )}
                    </div>
                  </section>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Current tenders status</h2>
                    <p className="text-sm text-slate-500">Live split of won, lost, and in-progress pursuits.</p>
                  </div>
                </header>
                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
                  <div className="flex items-center justify-center">
                    <Donut data={statusDonut.slices.map((slice) => slice.value)} colors={statusDonut.slices.map((slice) => slice.color)} className="h-64 w-64" />
                  </div>
                  <div className="space-y-4">
                    {statusDonut.slices.map((slice) => (
                      <div key={slice.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
                          <span className="text-sm font-semibold text-slate-700">{slice.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{slice.value}</span>
                      </div>
                    ))}
                    {statusDonut.total === 0 && <p className="text-sm text-slate-500">No tenders captured yet.</p>}
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Most recent tenders</h2>
                    <p className="text-sm text-slate-500">Snapshot across the latest bids captured.</p>
                  </div>
                </header>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Tender</th>
                        <th className="px-4 py-3">Entity</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Submission</th>
                        <th className="px-4 py-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {latestTenders.map((tender) => (
                        <tr key={tender.id} className="align-top">
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{tender.name}</td>
                          <td className="px-4 py-3 text-slate-600">{tender.entity}</td>
                          <td className="px-4 py-3"><StatusBadge status={tender.status} /></td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(tender.submissionDate)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(tender.value)}</td>
                        </tr>
                      ))}
                      {!latestTenders.length && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                            No tenders captured yet. Add your first record to build the pipeline.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Status distribution</h2>
                <p className="mt-1 text-sm text-slate-500">Live view of the tender funnel.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatStatusLabel(status)}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{statusBreakdown[status]}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {activeTab === "overview" && (
            <section className="space-y-6">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Tender register</h2>
                  <p className="text-sm text-slate-500">Full detail across all captured tenders with inline actions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openTenderModal("create")}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  >
                    Add tender
                  </button>
                </div>
              </header>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tender</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submission</th>
                      <th className="px-4 py-3">Advertised</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Comment</th>
                      <th className="px-4 py-3 text-right">Value</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenders.map((tender) => (
                      <tr key={tender.id} className="align-top">
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{tender.name}</td>
                        <td className="px-4 py-3 text-slate-600">{tender.entity}</td>
                        <td className="px-4 py-3"><StatusBadge status={tender.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(tender.submissionDateTime ?? tender.submissionDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(tender.advertisedDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{tender.tenderNumber ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{tender.owner ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{tender.comment ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(tender.value)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openTenderModal("edit", tender)}
                              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTender(tender)}
                              className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!tenders.length && (
                      <tr>
                        <td colSpan={10} className="px-4 py-6 text-center text-sm text-slate-500">
                          No tenders recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "processing" && (
            <section className="space-y-6">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Workflow tracker</h2>
                  <p className="text-sm text-slate-500">Stage-by-stage view of bid execution tasks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openWorkflowModal("create")}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                >
                  Add workflow task
                </button>
              </header>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tender</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Key task</th>
                      <th className="px-4 py-3">Timeline</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workflows.map((entry) => (
                      <tr key={entry.id} className="align-top">
                        <td className="px-4 py-3 font-semibold text-slate-900">{entry.tender?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.stage}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.keyTask ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.timeline ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.owner ?? "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                        <td className="px-4 py-3 text-slate-600">{entry.note ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openWorkflowModal("edit", entry)}
                              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteWorkflow(entry)}
                              className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!workflows.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                          No workflow tasks logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "history" && (
            <section className="space-y-6">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Performance history</h2>
                  <p className="text-sm text-slate-500">Year-by-year outcomes aggregated from the bid register.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openHistoryModal("create")}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                >
                  Add history record
                </button>
              </header>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Total tenders</th>
                      <th className="px-4 py-3">Won</th>
                      <th className="px-4 py-3">Lost</th>
                      <th className="px-4 py-3">Ongoing</th>
                      <th className="px-4 py-3">Win rate</th>
                      <th className="px-4 py-3">Value won</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history
                      .slice()
                      .sort((a, b) => b.year - a.year)
                      .map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {record.year}
                            <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              {record.source === "derived" ? "Automated" : "Manual"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{record.total}</td>
                          <td className="px-4 py-3 text-slate-600">{record.won}</td>
                          <td className="px-4 py-3 text-slate-600">{record.lost}</td>
                          <td className="px-4 py-3 text-slate-600">{record.ongoing}</td>
                          <td className="px-4 py-3 text-slate-600">{record.total === 0 ? "—" : `${Math.round((record.won / record.total) * 100)}%`}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(record.valueWon)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {record.source === "manual" ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openHistoryModal("edit", record)}
                                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteHistory(record)}
                                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 hover:text-rose-700"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Read only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {!history.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                          No history captured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {renderModal()}
    </main>
  )
}
