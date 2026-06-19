export type Stage =
  | 'submitted'
  | 'named_contact'
  | 'owner_assigned'
  | 'in_review'
  | 'signal_sent'
  | 'decision_go'
  | 'decision_redirect'
  | 'matched_pain_owner'
  | 'path_to_production'

export type PainPointStatus = 'open' | 'matched' | 'in_pilot'

export interface Owner {
  id: string
  name: string
  initials: string
  role: string
  department: string
  implementations: number
  startupsOwned: number
  avgDaysToSignal: number
  connectionsThisQuarter: number
}

export interface Application {
  id: string
  founderId: string
  founderName: string
  founderInitials: string
  companyName: string
  technology: string
  stage: Stage
  submittedAt: string
  daysInProcess: number
  ownerId: string | null
  signalDeadline: string
  notes: string
  funding: string
  teamSize: number
  // Extended application detail (optional — seed/legacy records may omit these)
  region?: string
  wantsVisit?: boolean | null
  teamMembers?: string
  website?: string
  linkedin?: string
  formerProjects?: string
  targetDepartment?: string
  productStage?: string
  trl?: number
  milestones?: string
  monthsToMarket?: string
  deployment?: string[]
  connectsTo?: string
  complianceCert?: string
  partnerType?: string
  timeline?: string
}

export interface PainPoint {
  id: string
  title: string
  description: string
  submittedBy: string
  department: string
  status: PainPointStatus
  linkedApplicationId: string | null
  submittedAt: string
  /** Theme assigned by "Group by theme". Null/absent until clustered. */
  clusterId?: string | null
}

export type PoolMemberType = 'startup' | 'contact'

export interface PoolMember {
  id: string
  name: string
  company?: string
  type: PoolMemberType
  techArea?: string
  addedAt: string
  addedByName: string
  applicationId?: string
  notes?: string
}

export type CommunityEventType = 'workshop' | 'networking' | 'demo_day' | 'hackathon'

export interface CommunityEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  type: CommunityEventType
  invitedMemberIds: string[]
}

export interface SystemMetrics {
  activePilots: number
  implementations: number
  avgTimeToSignal: number
  targetTimeToSignal: number
  connectionsThisQuarter: number
  implementationsThisQuarter: number
}
