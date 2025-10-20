export type CapacitySystemRow = {
  systemName: string
  healthScore: string
  status: string
  remarks: string
}

export type CapacityReviewSection = {
  title: string
  summary: string
  highlightBullets: string[]
  systems: CapacitySystemRow[]
  screenshotCaption: string
}

export const DEFAULT_CAPACITY_REVIEW: CapacityReviewSection = {
  title: 'System Health Overview – Storage Capacity',
  summary:
    'Summarize the current capacity position and highlight systems that require proactive remediation.',
  highlightBullets: [
    'New name Dell APEX AIOps Infrastructure Observability',
    'Simplicity, agility, and control of IT systems',
    'Infrastructure observability across core, edge, and cloud',
    'Plan ahead, reduce risk, improve productivity',
  ],
  systems: [
    {
      systemName: 'Dell EMC Unity XT 480 #HQ NAS',
      healthScore: '90',
      status: 'Fair',
      remarks: "The file system 'PWC' is predicted to run out of space within a month.",
    },
    {
      systemName: 'Dell EMC Unity XT 480 #DR NAS',
      healthScore: '94',
      status: 'Fair',
      remarks: "Monitor growth trend; allocate additional capacity during next maintenance window.",
    },
  ],
  screenshotCaption: 'Capacity insights and AIOps dashboards sourced from CloudIQ.',
}

export function cloneCapacityReview(section: CapacityReviewSection | null | undefined): CapacityReviewSection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_CAPACITY_REVIEW,
      highlightBullets: [...DEFAULT_CAPACITY_REVIEW.highlightBullets],
      systems: DEFAULT_CAPACITY_REVIEW.systems.map((row) => ({ ...row })),
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    highlightBullets: Array.isArray(section.highlightBullets)
      ? section.highlightBullets.map((item) => String(item ?? '').trim())
      : [],
    systems: Array.isArray(section.systems)
      ? section.systems.map((row) => ({
          systemName: String(row?.systemName ?? '').trim(),
          healthScore: String(row?.healthScore ?? '').trim(),
          status: String(row?.status ?? '').trim(),
          remarks: String(row?.remarks ?? '').trim(),
        }))
      : [],
    screenshotCaption: String(section.screenshotCaption ?? '').trim(),
  }
}
