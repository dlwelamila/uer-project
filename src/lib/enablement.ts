export type EnablementRoleEnum = 'SALES' | 'SYSTEMS_ENGINEER'

const ROLE_LABELS: Record<EnablementRoleEnum, 'Sales' | 'Systems Engineer'> = {
  SALES: 'Sales',
  SYSTEMS_ENGINEER: 'Systems Engineer',
}

const ROLE_LOOKUP: Record<string, EnablementRoleEnum> = {
  sales: 'SALES',
  'sales-specialist': 'SALES',
  'account executive': 'SALES',
  'account-executive': 'SALES',
  'systems engineer': 'SYSTEMS_ENGINEER',
  'systems-engineer': 'SYSTEMS_ENGINEER',
  'systemsengineer': 'SYSTEMS_ENGINEER',
  engineer: 'SYSTEMS_ENGINEER',
  'technical architect': 'SYSTEMS_ENGINEER',
  architect: 'SYSTEMS_ENGINEER',
}

export type EnablementProgramModel = {
  id: string
  vendor: string
  specialization: string
  role: EnablementRoleEnum
  keywords: string[]
  activeYear: number
  notes: string | null
}

export type EnablementProgramDto = {
  id: string
  vendor: string
  specialization: string
  role: 'Sales' | 'Systems Engineer'
  keywords: string[]
  activeYear: number
  notes: string | null
}

export function mapEnablementProgram(record: EnablementProgramModel): EnablementProgramDto {
  const keywords = Array.isArray(record.keywords)
    ? record.keywords
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    : []

  return {
    id: record.id,
    vendor: record.vendor,
    specialization: record.specialization,
    role: ROLE_LABELS[record.role] ?? 'Systems Engineer',
    keywords,
    activeYear: record.activeYear,
    notes: record.notes ?? null,
  }
}

export function toEnablementRoleEnum(label: unknown): EnablementRoleEnum {
  if (typeof label !== 'string') {
    return 'SYSTEMS_ENGINEER'
  }

  const normalized = label.trim().toLowerCase()
  return ROLE_LOOKUP[normalized] ?? 'SYSTEMS_ENGINEER'
}
