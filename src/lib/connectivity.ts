export type ConnectivityLegendNote = string

export const DEFAULT_CONNECTIVITY_NOTES: ConnectivityLegendNote[] = [
  'Featured - installed systems with active support contracts.',
  'Secure Connect Gateway aggregates remote monitoring feeds.',
  'Health scores incorporate CloudIQ telemetry (good, fair, poor) with proactive alerting for degraded assets.',
  'Track connectivity restoration for devices that have recently dropped offline; review Data Domain telemetry for more context.',
]

export function cloneConnectivityNotes(notes: ConnectivityLegendNote[]): ConnectivityLegendNote[] {
  return Array.isArray(notes) ? notes.map((note) => String(note ?? '')) : []
}
