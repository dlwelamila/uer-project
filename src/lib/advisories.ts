export type AdvisorySection = {
  title: string
  subtitle: string
  summary: string
  notes: string[]
}

export type AdvisoriesPayload = {
  sections: AdvisorySection[]
}

export const DEFAULT_ADVISORIES: AdvisorySection[] = [
  {
    title: 'Dell Security Advisories – FY25 Latest Trending',
    subtitle: 'Security Update for Dell PowerProtect DD Multiple Vulnerabilities',
    summary:
      'Summarize the security bulletin, key vulnerabilities addressed, and remediation outcomes for the customer.',
    notes: [],
  },
  {
    title: 'Dell Technical Advisories – FY24 Latest Trending',
    subtitle: 'Redistribution: Dell Unity Support for Integrated SRS ends on December 30, 2024',
    summary:
      'Highlight lifecycle advisories, sunset notices, and any mandatory configuration changes impacting the environment.',
    notes: [],
  },
  {
    title: 'Dell APEX AIOps Poor / Fair Health Scores – Follow Up & Mitigation',
    subtitle: 'Capacity risks and health-score alerting for monitored systems',
    summary:
      'Capture the headline health metrics (capacity, configuration, performance) that require continued attention.',
    notes: [],
  },
]

export function cloneAdvisories(sections: AdvisorySection[]): AdvisorySection[] {
  return Array.isArray(sections)
    ? sections.map((section) => ({
        title: String(section?.title ?? '').trim(),
        subtitle: String(section?.subtitle ?? '').trim(),
        summary: String(section?.summary ?? '').trim(),
        notes: Array.isArray(section?.notes)
          ? section.notes.map((note) => String(note ?? '').trim())
          : [],
      }))
    : []
}
