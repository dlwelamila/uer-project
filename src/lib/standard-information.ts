export type EscalationContact = {
  tier: string
  name: string
  role: string
  email: string
  phone: string
  notes: string
}

export type StandardInformationSection = {
  title: string
  summary: string
  contacts: EscalationContact[]
  additionalNotes: string[]
}

export const DEFAULT_STANDARD_INFORMATION: StandardInformationSection = {
  title: 'Dell EMC Support – Escalation Matrix',
  summary: 'Use the following contact path for critical incidents and escalation management.',
  contacts: [
    {
      tier: 'Initial Call',
      name: 'CRDB Senior Systems Engineers',
      role: 'Primary escalation (24/7)',
      email: 'support@crdbbank.co.tz',
      phone: '+255 756 957 001',
      notes: '',
    },
    {
      tier: 'Dell Service Account Manager',
      name: 'Everlyn Mutunga',
      role: 'Service Account Manager',
      email: 'Everlyn.Mutunga@dell.com',
      phone: '+254 720 423 571',
      notes: '',
    },
  ],
  additionalNotes: [
    'If no response after three attempts within one hour, escalate to Senior Manager Data Center.',
    'Keep partner contacts informed for after-hours support.',
  ],
}

export function cloneStandardInformation(
  section: StandardInformationSection | null | undefined,
): StandardInformationSection {
  if (!section || typeof section !== 'object') {
    return {
      ...DEFAULT_STANDARD_INFORMATION,
      contacts: DEFAULT_STANDARD_INFORMATION.contacts.map((contact) => ({ ...contact })),
      additionalNotes: [...DEFAULT_STANDARD_INFORMATION.additionalNotes],
    }
  }

  return {
    title: String(section.title ?? '').trim(),
    summary: String(section.summary ?? '').trim(),
    contacts: Array.isArray(section.contacts)
      ? section.contacts.map((contact) => ({
          tier: String(contact?.tier ?? '').trim(),
          name: String(contact?.name ?? '').trim(),
          role: String(contact?.role ?? '').trim(),
          email: String(contact?.email ?? '').trim(),
          phone: String(contact?.phone ?? '').trim(),
          notes: String(contact?.notes ?? '').trim(),
        }))
      : [],
    additionalNotes: Array.isArray(section.additionalNotes)
      ? section.additionalNotes.map((note) => String(note ?? '').trim())
      : [],
  }
}
