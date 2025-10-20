export type ActionSummaryRow = {
  action: string
  owner: string
  status: string
  dueDate: string
  notes: string
}

export type ActionSummarySection = {
  title: string
  summary: string
  rows: ActionSummaryRow[]
}

export const DEFAULT_ACTION_SUMMARY: ActionSummarySection = {
  title: 'Action Summary – Renewal & Operations',
  summary: 'Document the agreed follow-ups, owners, and target dates aligned to the engagement cadence.',
  rows: [
    {
      action: 'VMware license renewal process update',
      owner: 'Elie / James',
      status: 'Registered',
      dueDate: '14 Feb 2025',
      notes: 'Provide CRDB with updated VMware renewal process.',
    },
    {
      action: 'Enable unconnected devices on SCG',
      owner: 'CRDB / TTCS',
      status: 'Registered',
      dueDate: 'Q1 FY25',
      notes: 'Check dial-home feature and re-enable connectivity.',
    },
  ],
}

export function cloneActionSummary(section: ActionSummarySection | null | undefined): ActionSummarySection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_ACTION_SUMMARY,
      rows: DEFAULT_ACTION_SUMMARY.rows.map((row) => ({ ...row })),
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    rows: Array.isArray(section.rows)
      ? section.rows.map((row) => ({
          action: String(row?.action ?? '').trim(),
          owner: String(row?.owner ?? '').trim(),
          status: String(row?.status ?? '').trim(),
          dueDate: String(row?.dueDate ?? '').trim(),
          notes: String(row?.notes ?? '').trim(),
        }))
      : [],
  }
}
