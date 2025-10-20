export type ContractsReviewSection = {
  title: string
  summary: string
  keyNotes: string[]
  statusHighlights: Array<{ label: string; value: string }>
  productHighlights: Array<{ label: string; value: string }>
  screenshotCaption: string
}

export const DEFAULT_CONTRACTS_REVIEW: ContractsReviewSection = {
  title: 'Support Contracts Status – January 2024 to date',
  summary:
    'Capture the renewal outlook for all monitored assets. Highlight focus areas that require procurement or exception handling.',
  keyNotes: [
    'The data captures contract details from January 2023 to present.',
    'Use MS360 profiles to review historic contract expirations prior to 2023.',
  ],
  statusHighlights: [
    { label: 'Ending within 30 days', value: '36.99%' },
    { label: 'Ending beyond 180 days', value: '56.16%' },
    { label: 'Ending within 31-90 days', value: '6.85%' },
  ],
  productHighlights: [
    { label: 'VxRail', value: '20 assets require review' },
    { label: 'Connectrix', value: '3 assets nearing renewal' },
  ],
  screenshotCaption: 'Support contract status dashboard sourced from MS360 contract analytics.',
}

export function cloneContractsReview(section: ContractsReviewSection | null | undefined): ContractsReviewSection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_CONTRACTS_REVIEW,
      keyNotes: [...DEFAULT_CONTRACTS_REVIEW.keyNotes],
      statusHighlights: DEFAULT_CONTRACTS_REVIEW.statusHighlights.map((item) => ({ ...item })),
      productHighlights: DEFAULT_CONTRACTS_REVIEW.productHighlights.map((item) => ({ ...item })),
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    keyNotes: Array.isArray(section.keyNotes)
      ? section.keyNotes.map((note) => String(note ?? '').trim())
      : [],
    statusHighlights: Array.isArray(section.statusHighlights)
      ? section.statusHighlights.map((item) => ({
          label: String(item?.label ?? '').trim(),
          value: String(item?.value ?? '').trim(),
        }))
      : [],
    productHighlights: Array.isArray(section.productHighlights)
      ? section.productHighlights.map((item) => ({
          label: String(item?.label ?? '').trim(),
          value: String(item?.value ?? '').trim(),
        }))
      : [],
    screenshotCaption: String(section.screenshotCaption ?? '').trim(),
  }
}
