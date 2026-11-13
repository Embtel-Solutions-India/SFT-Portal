// Core System Types for School for Training

export type UserRole = 
  | 'platform_admin' 
  | 'recruiter' 
  | 'partner_admin' 
  | 'partner_staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  invitedAt?: string;
  password?: string;
}

export type OrganizationType = 
  | 'university' 
  | 'college' 
  | 'coaching_center' 
  | 'polytechnic' 
  | 'vocational_institute' 
  | 'other';

export type OrganizationStatus = 
  | 'submitted' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'suspended';

export interface Organization {
  id: string;
  legalName: string;
  displayName: string;
  type: OrganizationType;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  authorizedRepresentative: string;
  representativeTitle: string;
  status: OrganizationStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  candidateIntakeEnabled: boolean;
  notes?: string;
  candidateCount?: number;
  placementCount?: number;
  isDuplicateFlagged?: boolean;
}

export type CandidateStatus = 
  | 'draft' 
  | 'confirmed' 
  | 'active' 
  | 'in_pipeline' 
  | 'placed' 
  | 'withdrawn';

export interface CandidateParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  skills: { name: string; confidence: number }[];
  experienceYears: number;
  education: string;
  certifications?: string[];
  summary: string;
  parseConfidence: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  partnerId: string;
  partnerName: string;
  status: CandidateStatus;
  consentState: 'verified' | 'pending' | 'withdrawn';
  consentTimestamp: string;
  consentPolicyVersion: string;
  skills: string[];
  experienceYears: number;
  education: string;
  resumeFileName: string;
  submittedAt: string;
  parsedProfile?: CandidateParsedProfile;
  activeApplicationCount?: number;
  resumeText?: string;
  internalNotes?: string;
  activityHistory?: { date: string; action: string; actor: string }[];
}

export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';

export interface Job {
  id: string;
  title: string;
  employer: string;
  department: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'on_site';
  employmentType: 'full_time' | 'contract' | 'internship';
  experienceRange: string;
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  status: JobStatus;
  createdAt: string;
  applicantsCount: number;
  matchesCount?: number;
}

export type ApplicationStage = 
  | 'new' 
  | 'match_review' 
  | 'shortlisted' 
  | 'opportunity_communicated' 
  | 'candidate_responded' 
  | 'interviewing' 
  | 'offer_pending' 
  | 'partner_approval_pending' 
  | 'offer_communicated' 
  | 'candidate_accepted' 
  | 'placement_confirmed' 
  | 'candidate_declined' 
  | 'partner_rejected' 
  | 'employer_rejected' 
  | 'withdrawn' 
  | 'on_hold' 
  | 'job_closed' 
  | 'offer_declined';

export interface InterviewRound {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  employer: string;
  roundName: 'Initial Screen' | 'Technical Round' | 'Hiring Manager' | 'Final Panel';
  date: string;
  time: string;
  timezone: string;
  modality: 'video' | 'phone' | 'in_person';
  interviewer: string;
  instructions?: string;
  candidateContacted: boolean;
  attendance: 'scheduled' | 'attended' | 'no_show' | 'rescheduled';
  outcome: 'pending' | 'passed' | 'failed' | 'on_hold';
  feedbackNotes?: string;
  history?: { timestamp: string; note: string }[];
}

export interface Offer {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  partnerId: string;
  partnerName: string;
  version: string;
  compensation: string;
  startDate: string;
  notes: string;
  candidateResponse: 'pending' | 'accepted' | 'declined';
  candidateResponseNotes?: string;
  partnerApprovalStatus: 'pending' | 'approved' | 'rejected' | 'waived';
  partnerApprovalReason?: string;
  partnerApproverName?: string;
  partnerApprovalTimestamp?: string;
  waiverReason?: string;
  waiverAuthorizedBy?: string;
  status: 'draft' | 'issued' | 'accepted' | 'declined' | 'confirmed';
  createdAt: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  partnerId: string;
  partnerName: string;
  stage: ApplicationStage;
  matchScore: number;
  matchFactors: { factor: string; score: number; note: string }[];
  missingSkills?: string[];
  candidateResponse?: 'accepted' | 'declined' | 'pending';
  candidateResponseNotes?: string;
  candidateResponseTimestamp?: string;
  interviews?: InterviewRound[];
  offerTerms?: {
    compensation: string;
    startDate: string;
    termsVersion: string;
    notes: string;
  };
  partnerApprovalStatus?: 'pending' | 'approved' | 'rejected' | 'waived';
  partnerApprovalReason?: string;
  partnerApprovalTimestamp?: string;
  partnerApproverName?: string;
  lastUpdated: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  organizationName?: string;
  details: string;
  correlationId: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface SystemNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetOrgId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  actionUrl?: string;
}

export interface BatchIntakeItem {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'validating' | 'duplicate_check' | 'parsing' | 'review_needed' | 'confirmed' | 'failed';
  candidateName?: string;
  confidenceScore?: number;
  error?: string;
  isDuplicate?: boolean;
}

export interface PlatformSettings {
  resumeMaxFileSizeMB: number;
  supportedResumeFormats: string[];
  duplicateDetectionSensitivity: 'strict' | 'balanced' | 'relaxed';
  approvalReminderIntervalHours: number;
  aiProviderStatus: 'healthy' | 'degraded';
  storageProviderStatus: 'healthy' | 'degraded';
  emailProviderStatus: 'healthy' | 'degraded';
}
