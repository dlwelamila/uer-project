import { CompetencyDashboardClient } from './CompetencyDashboardClient'

export const dynamic = 'force-dynamic'

export default function CompetencyPage() {
  return (
    <div className="space-y-10">
      <CompetencyDashboardClient />
    </div>
  )
}
