import type { Prisma, TrainingStatus } from '@prisma/client'

const STATUS_LABELS: Record<TrainingStatus, 'In Progress' | 'Completed' | 'Not Started'> = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  NOT_STARTED: 'Not Started',
}

export type TrainingStatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]

const STATUS_LOOKUP: Record<string, TrainingStatus> = {
  'in progress': 'IN_PROGRESS',
  'in-progress': 'IN_PROGRESS',
  inprogress: 'IN_PROGRESS',
  'not started': 'NOT_STARTED',
  'not-started': 'NOT_STARTED',
  notstarted: 'NOT_STARTED',
  completed: 'COMPLETED',
}

type TrainingWithEngineer = Prisma.EngineerTrainingGetPayload<{
  include: { engineer: true }
}>

export function mapTraining(record: TrainingWithEngineer) {
  return {
    id: record.id,
    employee: record.engineer?.name ?? '',
    vendor: record.vendor,
    module: record.module,
    domain: record.domain ?? 'General',
    progressPercent: record.progressPercent,
    timeline: record.timeline ?? 'TBD',
    status: STATUS_LABELS[record.status],
  }
}

export function toTrainingStatusEnum(label: string | null | undefined): TrainingStatus {
  if (!label) return 'IN_PROGRESS'
  const normalized = label.toLowerCase()
  return STATUS_LOOKUP[normalized] ?? 'IN_PROGRESS'
}
