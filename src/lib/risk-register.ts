export type RiskRegisterRow = {
  category: string
  description: string
  priority: string
  probability: string
  owner: string
  status: string
  dueDate: string
  mitigation: string
}

export type RiskRegisterSection = {
  title: string
  summary: string
  rows: RiskRegisterRow[]
}

export const DEFAULT_RISK_REGISTER: RiskRegisterSection = {
  title: 'Risk Register – FY25 Q1',
  summary:
    'Track the top operational risks observed during the engagement. Update ownership, priority, and mitigation plans following review meetings.',
  rows: [
    {
      category: 'Outdated firmware',
      description: 'Systems running on firmware that is target -2 or below (EoSL).',
      priority: 'P1',
      probability: 'Yes',
      owner: 'CRDB / TTCS',
      status: 'Registered',
      dueDate: 'Q1 FY25',
      mitigation: 'Upgrade firmware for eligible systems.',
    },
    {
      category: 'Support renewal for expired contracts',
      description: 'Some support contracts are expired or approaching expiry.',
      priority: 'P1',
      probability: 'No',
      owner: 'Dell / CRDB / TTCS',
      status: 'Registered',
      dueDate: 'Q1 FY25',
      mitigation: 'Renewals in progress; align procurement approvals.',
    },
  ],
}

export function cloneRiskRegister(section: RiskRegisterSection | null | undefined): RiskRegisterSection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_RISK_REGISTER,
      rows: DEFAULT_RISK_REGISTER.rows.map((row) => ({ ...row })),
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    rows: Array.isArray(section.rows)
      ? section.rows.map((row) => ({
          category: String(row?.category ?? '').trim(),
          description: String(row?.description ?? '').trim(),
          priority: String(row?.priority ?? '').trim(),
          probability: String(row?.probability ?? '').trim(),
          owner: String(row?.owner ?? '').trim(),
          status: String(row?.status ?? '').trim(),
          dueDate: String(row?.dueDate ?? '').trim(),
          mitigation: String(row?.mitigation ?? '').trim(),
        }))
      : [],
  }
}
