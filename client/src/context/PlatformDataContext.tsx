import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  Candidate,
  Job,
  Application,
  AuditEvent,
  SystemNotification,
  ApplicationStage,
  User,
  InterviewRound,
  Offer,
  PlatformSettings,
  BatchIntakeItem,
  UserRole
} from '../types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_CANDIDATES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_SETTINGS,
  INITIAL_BATCH_ITEMS
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface PlatformDataContextType {
  isBackendConnected: boolean;
  organizations: Organization[];
  candidates: Candidate[];
  jobs: Job[];
  applications: Application[];
  auditEvents: AuditEvent[];
  notifications: SystemNotification[];
  users: User[];
  interviews: InterviewRound[];
  offers: Offer[];
  settings: PlatformSettings;
  batchItems: BatchIntakeItem[];

  // Organization Actions
  registerOrganization: (orgData: Omit<Organization, 'id' | 'status' | 'submittedAt' | 'candidateIntakeEnabled'>) => { success: boolean; org?: Organization; isDuplicate?: boolean };
  approveOrganization: (id: string, reason?: string) => void;
  rejectOrganization: (id: string, reason: string) => void;
  suspendOrganization: (id: string, reason: string) => void;
  reactivateOrganization: (id: string) => void;
  toggleCandidateIntake: (id: string) => void;
  updateOrganizationProfile: (id: string, updates: Partial<Organization>) => void;

  // Candidate Actions
  addCandidate: (cand: Candidate) => void;
  updateCandidateProfile: (id: string, updates: Partial<Candidate>) => void;

  // Job Actions
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'applicantsCount'>) => Job;
  updateJobStatus: (id: string, status: Job['status']) => void;

  // Application / Pipeline Actions
  createApplication: (data: { candidateId: string; jobId: string; matchScore?: number; matchFactors?: any[]; missingSkills?: string[] }) => Application;
  advanceApplicationStage: (appId: string, nextStage: ApplicationStage) => void;
  recordCandidateResponse: (appId: string, response: 'accepted' | 'declined', notes?: string) => void;
  decidePartnerApproval: (appId: string, decision: 'approved' | 'rejected', reason?: string) => void;

  // User & Role Actions
  addUser: (userData: Omit<User, 'id' | 'invitedAt' | 'lastLogin'>) => User;
  toggleUserStatus: (userId: string) => void;
  updateUserRole: (userId: string, role: UserRole, organizationId?: string, organizationName?: string) => void;

  // Interview Management
  scheduleInterview: (interviewData: Omit<InterviewRound, 'id' | 'history'>) => InterviewRound;
  updateInterviewOutcome: (interviewId: string, outcome: InterviewRound['outcome'], feedback?: string, attendance?: InterviewRound['attendance']) => void;

  // Offer & Placement Management
  createOffer: (offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>) => Offer;
  updateOfferResponse: (offerId: string, response: 'accepted' | 'declined', notes?: string) => void;
  requestPartnerApproval: (offerId: string) => void;
  waivePartnerApproval: (offerId: string, waiverReason: string, authorizedBy: string) => void;
  confirmPlacement: (offerId: string) => void;

  // Platform Settings
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;

  // Batch Intake Actions
  addBatchItems: (items: BatchIntakeItem[]) => void;
  updateBatchItemStatus: (id: string, status: BatchIntakeItem['status'], error?: string) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Audit Action
  logAudit: (action: string, entity: string, entityId: string, details: string, orgName?: string, beforeValue?: string, afterValue?: string) => void;
}

const PlatformDataContext = createContext<PlatformDataContextType | undefined>(undefined);

export const PlatformDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [interviews, setInterviews] = useState<InterviewRound[]>(INITIAL_INTERVIEWS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [batchItems, setBatchItems] = useState<BatchIntakeItem[]>(INITIAL_BATCH_ITEMS);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Sync state with live backend API on initial load
  useEffect(() => {
    let isMounted = true;
    async function syncFromBackend() {
      try {
        const [orgsRes, candsRes, jobsRes, appsRes, usersRes, intsRes, offersRes, auditsRes, notifsRes, batchesRes] = await Promise.all([
          api.organizations.getAll().catch(() => null),
          api.candidates.getAll().catch(() => null),
          api.jobs.getAll().catch(() => null),
          api.applications.getAll().catch(() => null),
          api.users.getAll().catch(() => null),
          api.interviews.getAll().catch(() => null),
          api.offers.getAll().catch(() => null),
          api.audit.getAll().catch(() => null),
          api.notifications.getAll().catch(() => null),
          api.batches.getAll().catch(() => null)
        ]);

        if (isMounted) {
          if (orgsRes?.data) setOrganizations(orgsRes.data);
          if (candsRes?.data) setCandidates(candsRes.data);
          if (jobsRes?.data) setJobs(jobsRes.data);
          if (appsRes?.data) setApplications(appsRes.data);
          if (usersRes?.data) setUsers(usersRes.data);
          if (intsRes?.data) setInterviews(intsRes.data);
          if (offersRes?.data) setOffers(offersRes.data);
          if (auditsRes?.data) setAuditEvents(auditsRes.data);
          if (notifsRes?.data) setNotifications(notifsRes.data);
          if (batchesRes?.data) setBatchItems(batchesRes.data);
          setIsBackendConnected(true);
        }
      } catch (e) {
        if (isMounted) setIsBackendConnected(false);
      }
    }

    syncFromBackend();
    return () => { isMounted = false; };
  }, []);

  const logAudit = (
    action: string,
    entity: string,
    entityId: string,
    details: string,
    orgName?: string,
    beforeValue?: string,
    afterValue?: string
  ) => {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorEmail: user?.email || 'system@sft.demo',
      actorRole: user?.role || 'platform_admin',
      action,
      entity,
      entityId,
      organizationName: orgName || user?.organizationName || 'Platform Core',
      details,
      correlationId: `req-${Math.random().toString(36).substr(2, 8)}`,
      beforeValue,
      afterValue
    };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const registerOrganization = (orgData: Omit<Organization, 'id' | 'status' | 'submittedAt' | 'candidateIntakeEnabled'>) => {
    const normalizedName = orgData.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDup = organizations.some(o =>
      o.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName ||
      o.contactEmail.toLowerCase() === orgData.contactEmail.toLowerCase()
    );

    if (isDup) {
      return { success: false, isDuplicate: true };
    }

    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      candidateIntakeEnabled: false,
      candidateCount: 0,
      placementCount: 0
    };

    setOrganizations(prev => [newOrg, ...prev]);
    api.organizations.create(newOrg).catch(err => console.warn('[Backend Sync] org create:', err));

    logAudit(
      'ORGANIZATION_REGISTRATION_SUBMITTED',
      'Organization',
      newOrg.id,
      `New organization registration submitted: ${newOrg.displayName} (${newOrg.type}). Status: Pending verification.`,
      newOrg.displayName
    );

    addNotification({
      targetRole: 'platform_admin',
      title: 'New Partner Registration',
      message: `${newOrg.displayName} has registered and is pending verification.`,
      type: 'info',
      actionUrl: '/admin/dashboard?tab=organizations'
    });

    return { success: true, org: newOrg };
  };

  const approveOrganization = (id: string, reason?: string) => {
    api.organizations.updateStatus(id, 'approved', reason).catch(err => console.warn('[Backend Sync] approve:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        return {
          ...org,
          status: 'approved',
          verifiedAt: new Date().toISOString(),
          verifiedBy: user?.email || 'admin@sft.demo',
          candidateIntakeEnabled: true,
          notes: reason ? `${org.notes || ''} [Approved: ${reason}]` : org.notes
        };
      }
      return org;
    }));

    const targetOrg = organizations.find(o => o.id === id);
    if (targetOrg) {
      logAudit(
        'ORGANIZATION_VERIFIED_APPROVED',
        'Organization',
        id,
        `Organization ${targetOrg.displayName} verified and approved. Candidate intake unlocked. Reason: ${reason || 'Accreditation verified.'}`,
        targetOrg.displayName,
        'status: pending',
        'status: approved'
      );

      addNotification({
        targetRole: 'partner_admin',
        targetOrgId: id,
        title: 'Organization Verified',
        message: 'Your organization has been approved. You can now access full candidate intake workflows.',
        type: 'success',
        actionUrl: '/partner-admin/dashboard'
      });
    }
  };

  const rejectOrganization = (id: string, reason: string) => {
    api.organizations.updateStatus(id, 'rejected', reason).catch(err => console.warn('[Backend Sync] reject:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        return {
          ...org,
          status: 'rejected',
          rejectionReason: reason,
          candidateIntakeEnabled: false
        };
      }
      return org;
    }));

    const targetOrg = organizations.find(o => o.id === id);
    if (targetOrg) {
      logAudit(
        'ORGANIZATION_VERIFICATION_REJECTED',
        'Organization',
        id,
        `Organization ${targetOrg.displayName} rejected. Reason: ${reason}`,
        targetOrg.displayName,
        'status: pending',
        'status: rejected'
      );

      addNotification({
        targetRole: 'partner_admin',
        targetOrgId: id,
        title: 'Registration Verification Notice',
        message: `Action required on your organization registration: ${reason}`,
        type: 'alert',
        actionUrl: '/register/status'
      });
    }
  };

  const suspendOrganization = (id: string, reason: string) => {
    api.organizations.updateStatus(id, 'suspended', reason).catch(err => console.warn('[Backend Sync] suspend:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        return {
          ...org,
          status: 'suspended',
          suspensionReason: reason,
          candidateIntakeEnabled: false
        };
      }
      return org;
    }));

    const targetOrg = organizations.find(o => o.id === id);
    if (targetOrg) {
      logAudit(
        'ORGANIZATION_SUSPENDED',
        'Organization',
        id,
        `Organization ${targetOrg.displayName} suspended by admin. Reason: ${reason}`,
        targetOrg.displayName,
        'status: approved',
        'status: suspended'
      );

      addNotification({
        targetRole: 'partner_admin',
        targetOrgId: id,
        title: 'Account Suspended',
        message: `Your organization access has been suspended: ${reason}`,
        type: 'alert',
        actionUrl: '/partner-admin/dashboard'
      });
    }
  };

  const reactivateOrganization = (id: string) => {
    api.organizations.updateStatus(id, 'approved', 'Reactivated').catch(err => console.warn('[Backend Sync] reactivate:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        return {
          ...org,
          status: 'approved',
          suspensionReason: undefined,
          candidateIntakeEnabled: true
        };
      }
      return org;
    }));

    const targetOrg = organizations.find(o => o.id === id);
    if (targetOrg) {
      logAudit(
        'ORGANIZATION_REACTIVATED',
        'Organization',
        id,
        `Organization ${targetOrg.displayName} reactivated by admin. Candidate intake re-enabled.`,
        targetOrg.displayName,
        'status: suspended',
        'status: approved'
      );
    }
  };

  const toggleCandidateIntake = (id: string) => {
    api.organizations.toggleIntake(id).catch(err => console.warn('[Backend Sync] toggleIntake:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        const nextState = !org.candidateIntakeEnabled;
        logAudit(
          'ORGANIZATION_INTAKE_TOGGLED',
          'Organization',
          id,
          `Candidate intake ${nextState ? 'enabled' : 'disabled'} for ${org.displayName}.`,
          org.displayName,
          `intake: ${org.candidateIntakeEnabled}`,
          `intake: ${nextState}`
        );
        return {
          ...org,
          candidateIntakeEnabled: nextState
        };
      }
      return org;
    }));
  };

  const updateOrganizationProfile = (id: string, updates: Partial<Organization>) => {
    api.organizations.update(id, updates).catch(err => console.warn('[Backend Sync] update org:', err));
    setOrganizations(prev => prev.map(org => {
      if (org.id === id) {
        logAudit(
          'ORGANIZATION_PROFILE_UPDATED',
          'Organization',
          id,
          `Organization profile updated: ${Object.keys(updates).join(', ')}`,
          org.displayName
        );
        return { ...org, ...updates };
      }
      return org;
    }));
  };

  const addCandidate = (cand: Candidate) => {
    api.candidates.create(cand).catch(err => console.warn('[Backend Sync] cand create:', err));
    setCandidates(prev => [cand, ...prev]);
    logAudit(
      'CANDIDATE_PROFILE_CONFIRMED',
      'Candidate',
      cand.id,
      `Candidate profile created and confirmed for ${cand.fullName} with verified consent (${cand.consentPolicyVersion}).`,
      cand.partnerName
    );
  };

  const updateCandidateProfile = (id: string, updates: Partial<Candidate>) => {
    api.candidates.update(id, updates).catch(err => console.warn('[Backend Sync] cand update:', err));
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAudit(
      'CANDIDATE_PROFILE_UPDATED',
      'Candidate',
      id,
      `Candidate profile edited by staff (${user?.email || 'staff'}).`
    );
  };

  const createJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'applicantsCount'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      applicantsCount: 0,
      matchesCount: 0
    };
    setJobs(prev => [newJob, ...prev]);
    api.jobs.create(newJob).catch(err => console.warn('[Backend Sync] job create:', err));
    logAudit(
      'JOB_CREATED',
      'Job',
      newJob.id,
      `New job requisition posted: ${newJob.title} at ${newJob.employer} (${newJob.workMode}).`
    );
    return newJob;
  };

  const updateJobStatus = (id: string, status: Job['status']) => {
    api.jobs.updateStatus(id, status).catch(err => console.warn('[Backend Sync] job status:', err));
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        logAudit(
          'JOB_STATUS_UPDATED',
          'Job',
          id,
          `Requisition status changed to ${status.toUpperCase()} for "${j.title}".`,
          undefined,
          `status: ${j.status}`,
          `status: ${status}`
        );
        return { ...j, status };
      }
      return j;
    }));
  };

  const createApplication = (data: { candidateId: string; jobId: string; matchScore?: number; matchFactors?: any[]; missingSkills?: string[] }) => {
    const cand = candidates.find(c => c.id === data.candidateId);
    const job = jobs.find(j => j.id === data.jobId);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      candidateId: data.candidateId,
      candidateName: cand?.fullName || 'Candidate',
      candidateEmail: cand?.email || 'candidate@domain.com',
      jobId: data.jobId,
      jobTitle: job?.title || 'Job Requisition',
      employer: job?.employer || 'Client Partner',
      partnerId: cand?.partnerId || 'org-1',
      partnerName: cand?.partnerName || 'Partner Academy',
      stage: 'shortlisted',
      matchScore: data.matchScore || 94,
      matchFactors: data.matchFactors || [
        { factor: 'Skills Alignment', score: 95, note: 'Direct match on core skills' },
        { factor: 'Experience Relevance', score: 92, note: 'Exceeds experience requirements' },
        { factor: 'Domain Fit', score: 94, note: 'Aligned target role and background' }
      ],
      missingSkills: data.missingSkills || [],
      lastUpdated: new Date().toISOString()
    };

    setApplications(prev => [newApp, ...prev]);
    api.applications.create(data).catch(err => console.warn('[Backend Sync] app create:', err));

    logAudit(
      'CANDIDATE_SHORTLISTED',
      'Application',
      newApp.id,
      `Shortlisted ${newApp.candidateName} for "${newApp.jobTitle}" at ${newApp.employer}. Match score: ${newApp.matchScore}%.`,
      newApp.partnerName
    );

    return newApp;
  };

  const advanceApplicationStage = (appId: string, nextStage: ApplicationStage) => {
    api.applications.updateStage(appId, nextStage).catch(err => console.warn('[Backend Sync] update stage:', err));
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        logAudit(
          'APPLICATION_STAGE_TRANSITION',
          'Application',
          appId,
          `Candidate ${app.candidateName} moved to stage: ${nextStage.toUpperCase()} for "${app.jobTitle}".`,
          app.partnerName,
          `stage: ${app.stage}`,
          `stage: ${nextStage}`
        );
        return {
          ...app,
          stage: nextStage,
          lastUpdated: new Date().toISOString()
        };
      }
      return app;
    }));
  };

  const recordCandidateResponse = (appId: string, response: 'accepted' | 'declined', notes?: string) => {
    api.applications.recordCandidateResponse(appId, response, notes).catch(err => console.warn('[Backend Sync] record cand response:', err));
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const nextStage: ApplicationStage = response === 'accepted' ? 'candidate_responded' : 'candidate_declined';
        return {
          ...app,
          candidateResponse: response,
          candidateResponseNotes: notes,
          candidateResponseTimestamp: new Date().toISOString(),
          stage: nextStage,
          lastUpdated: new Date().toISOString()
        };
      }
      return app;
    }));

    logAudit(
      'STAFF_RECORDED_CANDIDATE_RESPONSE',
      'Application',
      appId,
      `Staff recorded candidate response: ${response.toUpperCase()}. Notes: ${notes || 'No extra notes provided'}`
    );
  };

  const decidePartnerApproval = (appId: string, decision: 'approved' | 'rejected', reason?: string) => {
    api.applications.decidePartnerApproval(appId, decision, reason).catch(err => console.warn('[Backend Sync] partner approval:', err));
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const nextStage: ApplicationStage = decision === 'approved' ? 'placement_confirmed' : 'partner_rejected';
        return {
          ...app,
          partnerApprovalStatus: decision,
          partnerApprovalReason: reason || (decision === 'approved' ? 'Approved by institution administration.' : 'Declined by institution.'),
          partnerApprovalTimestamp: new Date().toISOString(),
          partnerApproverName: user?.name || 'Institution Approver',
          stage: nextStage,
          lastUpdated: new Date().toISOString()
        };
      }
      return app;
    }));

    // Synchronize offer state
    setOffers(prev => prev.map(off => {
      if (off.applicationId === appId) {
        return {
          ...off,
          partnerApprovalStatus: decision,
          partnerApprovalReason: reason || (decision === 'approved' ? 'Approved by institution administration.' : 'Declined by institution.'),
          partnerApproverName: user?.name || 'Institution Approver',
          partnerApprovalTimestamp: new Date().toISOString(),
          status: decision === 'approved' ? 'confirmed' : 'declined'
        };
      }
      return off;
    }));

    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      logAudit(
        decision === 'approved' ? 'PARTNER_PLACEMENT_APPROVED' : 'PARTNER_PLACEMENT_REJECTED',
        'Application',
        appId,
        `Partner placement ${decision} for candidate ${targetApp.candidateName} at ${targetApp.employer}. Reason: ${reason || 'Terms accepted.'}`,
        targetApp.partnerName
      );

      addNotification({
        targetRole: 'recruiter',
        title: `Partner Placement ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `${targetApp.partnerName} has ${decision} placement for ${targetApp.candidateName}.`,
        type: decision === 'approved' ? 'success' : 'alert',
        actionUrl: `/recruiter/dashboard?appId=${appId}`
      });
    }
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id' | 'invitedAt' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      invitedAt: new Date().toISOString(),
      status: 'active'
    };
    setUsers(prev => [newUser, ...prev]);
    api.users.invite(newUser).catch(err => console.warn('[Backend Sync] user invite:', err));
    logAudit(
      'USER_INVITED',
      'User',
      newUser.id,
      `New user invited: ${newUser.name} (${newUser.email}) with role ${newUser.role}. Organization: ${newUser.organizationName || 'Platform Core'}.`,
      newUser.organizationName
    );
    return newUser;
  };

  const toggleUserStatus = (userId: string) => {
    api.users.toggleStatus(userId).catch(err => console.warn('[Backend Sync] toggle status:', err));
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        logAudit(
          'USER_STATUS_TOGGLED',
          'User',
          userId,
          `User ${u.name} (${u.email}) status changed to ${nextStatus}.`,
          u.organizationName,
          `status: ${u.status}`,
          `status: ${nextStatus}`
        );
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const updateUserRole = (userId: string, role: UserRole, organizationId?: string, organizationName?: string) => {
    api.users.updateRole(userId, role, organizationId, organizationName).catch(err => console.warn('[Backend Sync] update role:', err));
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        logAudit(
          'USER_ROLE_UPDATED',
          'User',
          userId,
          `User ${u.name} role changed to ${role} (Org: ${organizationName || 'None'}).`,
          organizationName,
          `role: ${u.role}`,
          `role: ${role}`
        );
        return { ...u, role, organizationId, organizationName };
      }
      return u;
    }));
  };

  // Interview Management
  const scheduleInterview = (interviewData: Omit<InterviewRound, 'id' | 'history'>) => {
    const newInterview: InterviewRound = {
      ...interviewData,
      id: `int-${Date.now()}`,
      history: [
        {
          timestamp: new Date().toISOString(),
          note: `Interview scheduled by ${user?.name || 'Recruiter'} for ${interviewData.date} at ${interviewData.time} ${interviewData.timezone}.`
        }
      ]
    };
    setInterviews(prev => [newInterview, ...prev]);
    api.interviews.create(newInterview).catch(err => console.warn('[Backend Sync] interview create:', err));

    // Also advance application stage to interviewing if not already there
    advanceApplicationStage(interviewData.applicationId, 'interviewing');

    logAudit(
      'INTERVIEW_SCHEDULED',
      'InterviewRound',
      newInterview.id,
      `Scheduled "${newInterview.roundName}" with ${newInterview.candidateName} for ${newInterview.employer} (${newInterview.time} ${newInterview.timezone}).`
    );
    return newInterview;
  };

  const updateInterviewOutcome = (
    interviewId: string,
    outcome: InterviewRound['outcome'],
    feedback?: string,
    attendance?: InterviewRound['attendance']
  ) => {
    api.interviews.updateOutcome(interviewId, outcome, feedback, attendance).catch(err => console.warn('[Backend Sync] interview outcome:', err));
    setInterviews(prev => prev.map(item => {
      if (item.id === interviewId) {
        const historyEntry = {
          timestamp: new Date().toISOString(),
          note: `Outcome recorded: ${outcome.toUpperCase()}. Attendance: ${attendance || item.attendance}. Feedback: ${feedback || 'None'}`
        };
        logAudit(
          'INTERVIEW_OUTCOME_RECORDED',
          'InterviewRound',
          interviewId,
          `Recorded outcome "${outcome}" for ${item.candidateName} (${item.roundName}).`,
          undefined,
          `outcome: ${item.outcome}`,
          `outcome: ${outcome}`
        );
        return {
          ...item,
          outcome,
          feedbackNotes: feedback || item.feedbackNotes,
          attendance: attendance || item.attendance,
          history: [...(item.history || []), historyEntry]
        };
      }
      return item;
    }));
  };

  // Offer & Placement Management
  const createOffer = (offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'issued'
    };
    setOffers(prev => [newOffer, ...prev]);
    api.offers.create(newOffer).catch(err => console.warn('[Backend Sync] offer create:', err));
    advanceApplicationStage(offerData.applicationId, 'offer_pending');

    logAudit(
      'OFFER_CREATED_AND_ISSUED',
      'Offer',
      newOffer.id,
      `Offer (${newOffer.version}) issued to ${newOffer.candidateName} for ${newOffer.jobTitle} at ${newOffer.employer}. Compensation: ${newOffer.compensation}.`,
      newOffer.partnerName
    );
    return newOffer;
  };

  const updateOfferResponse = (offerId: string, response: 'accepted' | 'declined', notes?: string) => {
    api.offers.recordResponse(offerId, response, notes).catch(err => console.warn('[Backend Sync] offer response:', err));
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        const nextStatus = response === 'accepted' ? 'accepted' : 'declined';
        const nextAppStage: ApplicationStage = response === 'accepted' ? 'candidate_accepted' : 'offer_declined';
        advanceApplicationStage(off.applicationId, nextAppStage);

        logAudit(
          'OFFER_CANDIDATE_RESPONSE_RECORDED',
          'Offer',
          offerId,
          `Candidate ${off.candidateName} marked offer ${response.toUpperCase()}. Notes: ${notes || 'None'}`,
          off.partnerName,
          `candidateResponse: ${off.candidateResponse}`,
          `candidateResponse: ${response}`
        );

        return {
          ...off,
          candidateResponse: response,
          candidateResponseNotes: notes,
          status: nextStatus
        };
      }
      return off;
    }));
  };

  const requestPartnerApproval = (offerId: string) => {
    api.offers.requestApproval(offerId).catch(err => console.warn('[Backend Sync] request approval:', err));
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        advanceApplicationStage(off.applicationId, 'partner_approval_pending');

        logAudit(
          'PARTNER_APPROVAL_REQUEST_SENT',
          'Offer',
          offerId,
          `Formal partner approval request dispatched to ${off.partnerName} for candidate ${off.candidateName}.`,
          off.partnerName
        );

        addNotification({
          targetRole: 'partner_admin',
          targetOrgId: off.partnerId,
          title: 'Placement Approval Required',
          message: `${off.candidateName} has accepted an offer from ${off.employer}. Please verify and sign off on placement attribution.`,
          type: 'alert',
          actionUrl: '/partner-admin/dashboard?tab=approvals'
        });

        return {
          ...off,
          partnerApprovalStatus: 'pending'
        };
      }
      return off;
    }));
  };

  const waivePartnerApproval = (offerId: string, waiverReason: string, authorizedBy: string) => {
    api.offers.waiveApproval(offerId, waiverReason).catch(err => console.warn('[Backend Sync] waive approval:', err));
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        logAudit(
          'PARTNER_APPROVAL_EXPLICITLY_WAIVED',
          'Offer',
          offerId,
          `Partner approval requirement waived by ${authorizedBy}. Reason: ${waiverReason}`,
          off.partnerName,
          'partnerApprovalStatus: pending',
          'partnerApprovalStatus: waived'
        );

        return {
          ...off,
          partnerApprovalStatus: 'waived',
          waiverReason,
          waiverAuthorizedBy: authorizedBy
        };
      }
      return off;
    }));
  };

  const confirmPlacement = (offerId: string) => {
    const targetOffer = offers.find(o => o.id === offerId);
    if (!targetOffer) return;

    // Check duplicate placement guard
    const alreadyPlaced = candidates.find(c => c.id === targetOffer.candidateId && c.status === 'placed');
    if (alreadyPlaced) {
      alert(`Conflict: Candidate ${targetOffer.candidateName} is already recorded as placed. PRD rules prevent duplicate placement finalization.`);
      return;
    }

    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'confirmed' } : o));
    api.offers.confirmPlacement(offerId).catch(err => console.warn('[Backend Sync] confirm placement:', err));
    advanceApplicationStage(targetOffer.applicationId, 'placement_confirmed');

    // Update candidate status
    setCandidates(prev => prev.map(c => c.id === targetOffer.candidateId ? { ...c, status: 'placed' } : c));

    // Increment partner placement count
    setOrganizations(prev => prev.map(org => {
      if (org.id === targetOffer.partnerId) {
        return {
          ...org,
          placementCount: (org.placementCount || 0) + 1
        };
      }
      return org;
    }));

    logAudit(
      'PLACEMENT_FINALIZED_AND_CONFIRMED',
      'Offer',
      offerId,
      `PLACEMENT CONFIRMED: ${targetOffer.candidateName} placed at ${targetOffer.employer} (${targetOffer.jobTitle}). Institutional attribution credited to ${targetOffer.partnerName}.`,
      targetOffer.partnerName
    );

    addNotification({
      targetRole: 'all',
      title: 'Placement Confirmed!',
      message: `${targetOffer.candidateName} successfully placed at ${targetOffer.employer}. Attribution: ${targetOffer.partnerName}.`,
      type: 'success'
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    api.settings.update(newSettings).catch(err => console.warn('[Backend Sync] update settings:', err));
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      logAudit(
        'PLATFORM_SETTINGS_UPDATED',
        'PlatformSettings',
        'global',
        `Platform configurations updated: ${JSON.stringify(newSettings)}`
      );
      return updated;
    });
  };

  // Batch Intake
  const addBatchItems = (items: BatchIntakeItem[]) => {
    setBatchItems(prev => [...items, ...prev]);
    logAudit(
      'BULK_INTAKE_BATCH_PROCESSED',
      'BatchIntake',
      `batch-${Date.now()}`,
      `Processed ${items.length} files in bulk intake upload.`
    );
  };

  const updateBatchItemStatus = (id: string, status: BatchIntakeItem['status'], error?: string) => {
    setBatchItems(prev => prev.map(b => b.id === id ? { ...b, status, error: error || b.error } : b));
  };

  const markNotificationRead = (id: string) => {
    api.notifications.markRead(id).catch(err => console.warn('[Backend Sync] mark read:', err));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <PlatformDataContext.Provider
      value={{
        isBackendConnected,
        organizations,
        candidates,
        jobs,
        applications,
        auditEvents,
        notifications,
        users,
        interviews,
        offers,
        settings,
        batchItems,
        registerOrganization,
        approveOrganization,
        rejectOrganization,
        suspendOrganization,
        reactivateOrganization,
        toggleCandidateIntake,
        updateOrganizationProfile,
        addCandidate,
        updateCandidateProfile,
        createJob,
        updateJobStatus,
        createApplication,
        advanceApplicationStage,
        recordCandidateResponse,
        decidePartnerApproval,
        addUser,
        toggleUserStatus,
        updateUserRole,
        scheduleInterview,
        updateInterviewOutcome,
        createOffer,
        updateOfferResponse,
        requestPartnerApproval,
        waivePartnerApproval,
        confirmPlacement,
        updateSettings,
        addBatchItems,
        updateBatchItemStatus,
        markNotificationRead,
        addNotification,
        logAudit
      }}
    >
      {children}
    </PlatformDataContext.Provider>
  );
};

export const usePlatformData = () => {
  const context = useContext(PlatformDataContext);
  if (!context) {
    throw new Error('usePlatformData must be used within a PlatformDataProvider');
  }
  return context;
};
