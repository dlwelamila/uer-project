import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

const TRACK_STATUS_LABELS: Record<Prisma.OemComplianceStatus, 'On Track' | 'Pending' | 'At Risk'> = {
  ON_TRACK: 'On Track',
  PENDING: 'Pending',
  AT_RISK: 'At Risk',
}

const TRACK_STATUS_LOOKUP: Record<string, Prisma.OemComplianceStatus> = {
  'On Track': 'ON_TRACK',
  'Pending': 'PENDING',
  'At Risk': 'AT_RISK',
}

const ASSIGNMENT_STATUS_LABELS: Record<Prisma.OemAssignmentStatus, 'Earned' | 'Ongoing' | 'Pending'> = {
  EARNED: 'Earned',
  ONGOING: 'Ongoing',
  PENDING: 'Pending',
}

const ASSIGNMENT_STATUS_LOOKUP: Record<string, Prisma.OemAssignmentStatus> = {
  Earned: 'EARNED',
  Ongoing: 'ONGOING',
  Pending: 'PENDING',
}

export type TrackWithAssignments = Prisma.OemComplianceTrackGetPayload<{
  include: {
    assignments: {
      include: {
        engineer: true
        certification: true
      }
    }
  }
}>

type AssignmentWithRelations = Prisma.OemComplianceAssignmentGetPayload<{
  include: {
    engineer: true
    certification: true
  }
}>

export type AssignmentDto = {
  id: string
  trackId: string
  engineerId: string
  engineer: string
  engineerRole: string
  certificationName: string
  status: 'Earned' | 'Ongoing' | 'Pending'
  startedAt: string | null
  completedAt: string | null
  dueAt: string | null
  certificationId: string | null
  attachmentUrl?: string
  attachmentName?: string | null
  attachmentType?: 'pdf' | 'image'
}

function resolveAttachmentType(mime: string | null | undefined) {
  if (!mime) return undefined
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  return undefined
}

export function mapAssignment(record: AssignmentWithRelations): AssignmentDto {
  const attachmentUrl = record.certification?.attachmentPath
    ? `/api/competency/certifications/${record.certification.id}/attachment`
    : undefined

  return {
    id: record.id,
    trackId: record.trackId,
    engineerId: record.engineerId,
    engineer: record.engineer?.name ?? '',
    engineerRole: record.engineer?.role ?? '',
    certificationName: record.certificationName,
    status: ASSIGNMENT_STATUS_LABELS[record.status],
    startedAt: record.startedAt ? record.startedAt.toISOString() : null,
    completedAt: record.completedAt ? record.completedAt.toISOString() : null,
    dueAt: record.dueAt ? record.dueAt.toISOString() : null,
    certificationId: record.certificationId ?? null,
    attachmentUrl,
    attachmentName: record.certification?.attachmentName ?? null,
    attachmentType: resolveAttachmentType(record.certification?.attachmentMime),
  }
}

export type TrackDto = ReturnType<typeof mapTrack>

export function mapTrack(record: TrackWithAssignments) {
  return {
    id: record.id,
    oem: record.oem,
    specialization: record.specialization,
    requiredCerts: record.requiredCerts,
    earnedCerts: record.earnedCerts,
    overallRequirement: record.overallRequirement,
    overallEarned: record.overallEarned,
    complianceStatus: TRACK_STATUS_LABELS[record.complianceStatus],
    targetDate: record.targetDate ? record.targetDate.toISOString() : null,
    roadmapNotes: record.roadmapNotes ?? null,
    assignments: record.assignments
      .map((assignment: AssignmentWithRelations) => mapAssignment(assignment))
      .sort((a: AssignmentDto, b: AssignmentDto) =>
        a.engineer.localeCompare(b.engineer) || a.certificationName.localeCompare(b.certificationName)
      ),
  }
}

export function toTrackStatusEnum(label: string | null | undefined): Prisma.OemComplianceStatus | null {
  if (!label) return null
  return TRACK_STATUS_LOOKUP[label] ?? null
}

export function toAssignmentStatusEnum(label: string | null | undefined): Prisma.OemAssignmentStatus | null {
  if (!label) return null
  return ASSIGNMENT_STATUS_LOOKUP[label] ?? null
}

export async function recalcTrackProgress(trackId: string) {
  const track = await prisma.oemComplianceTrack.findUnique({
    where: { id: trackId },
    select: {
      id: true,
      overallRequirement: true,
    },
  })

  if (!track) {
    return null
  }

  const aggregates = await prisma.oemComplianceAssignment.groupBy({
    by: ['trackId', 'status'],
    where: { trackId },
    _count: { _all: true },
  })

  const earnedCount = aggregates
    .filter((row: { status: string; _count: { _all: number } }) => row.status === 'EARNED')
    .reduce(
      (total: number, row: { status: string; _count: { _all: number } }) => total + row._count._all,
      0
    )

  const updated = await prisma.oemComplianceTrack.update({
    where: { id: trackId },
    data: {
      earnedCerts: earnedCount,
      overallEarned: Math.min(track.overallRequirement, earnedCount),
    },
    include: {
      assignments: {
        include: {
          engineer: true,
          certification: true,
        },
      },
    },
  })

  return mapTrack(updated)
}
