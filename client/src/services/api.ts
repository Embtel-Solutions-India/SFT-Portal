// School for Training Backend API Client
import { 
  Organization, 
  Candidate, 
  Job, 
  Application, 
  AuditEvent, 
  SystemNotification, 
  User, 
  InterviewRound, 
  Offer, 
  PlatformSettings, 
  BatchIntakeItem,
  UserRole,
  ApplicationStage,
  OrganizationStatus
} from '../types';

const API_BASE = '/api';

export const TOKEN_KEY = 'sft_auth_token';
export const USER_KEY = 'sft_auth_user';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // storage unavailable → anonymous request
  }
  return headers;
}

/** Expired/revoked session: drop credentials and send the user back to sign in. */
function handleUnauthorized(endpoint: string) {
  if (endpoint.startsWith('/auth/')) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
  if (window.location.pathname !== '/') window.location.assign('/');
}

async function parseError(response: Response): Promise<string> {
  try {
    const errJson = await response.json();
    return errJson.error || errJson.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) }
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized(endpoint);
    throw new Error(await parseError(response));
  }

  return response.json();
}

export const api = {
  // Auth API
  auth: {
    login: (email: string, password: string, requiredRole?: UserRole) =>
      request<{ success: boolean; user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, requiredRole })
      }),
    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    resetPassword: (token: string, password: string) =>
      request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      }),
    me: () => request<{ authenticated: boolean; user: User | null }>('/auth/me'),
    register: (orgData: any) =>
      request<{ success: boolean; organization: Organization; user: User; isDuplicateFlagged: boolean; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(orgData)
      })
  },

  system: {
    status: () => request<{
      database: string;
      integrations: { gemini: string; s3: string; smtp: string };
    }>('/system/status')
  },

  // Organizations API
  organizations: {
    getAll: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: Organization[] }>(`/organizations${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Organization }>(`/organizations/${id}`),
    create: (data: Partial<Organization>) =>
      request<{ success: boolean; data: Organization }>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStatus: (id: string, status: OrganizationStatus, reason?: string) =>
      request<{ success: boolean; data: Organization }>(`/organizations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      }),
    toggleIntake: (id: string) =>
      request<{ success: boolean; data: Organization }>(`/organizations/${id}/toggle-intake`, {
        method: 'PATCH'
      }),
    update: (id: string, data: Partial<Organization>) =>
      request<{ success: boolean; data: Organization }>(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Candidates API
  candidates: {
    getAll: (params?: { search?: string; status?: string; skill?: string; partnerId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: Candidate[] }>(`/candidates${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Candidate }>(`/candidates/${id}`),
    create: (data: Partial<Candidate>) =>
      request<{ success: boolean; data: Candidate }>('/candidates', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<Candidate>) =>
      request<{ success: boolean; data: Candidate }>(`/candidates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    updateConsent: (id: string, consentState: 'verified' | 'pending' | 'withdrawn', reason?: string) =>
      request<{ success: boolean; data: Candidate }>(`/candidates/${id}/consent`, {
        method: 'POST',
        body: JSON.stringify({ consentState, reason })
      })
  },

  // Jobs API
  jobs: {
    getAll: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: Job[] }>(`/jobs${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Job }>(`/jobs/${id}`),
    create: (data: Partial<Job>) =>
      request<{ success: boolean; data: Job }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStatus: (id: string, status: Job['status']) =>
      request<{ success: boolean; data: Job }>(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    update: (id: string, data: Partial<Job>) =>
      request<{ success: boolean; data: Job }>(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Applications & Pipeline Kanban API
  applications: {
    getAll: (params?: { stage?: string; jobId?: string; candidateId?: string; partnerId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: Application[] }>(`/applications${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Application }>(`/applications/${id}`),
    create: (data: { candidateId: string; jobId: string; matchScore?: number; matchFactors?: any[]; missingSkills?: string[] }) =>
      request<{ success: boolean; data: Application }>('/applications', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStage: (id: string, stage: ApplicationStage) =>
      request<{ success: boolean; data: Application }>(`/applications/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage })
      }),
    recordCandidateResponse: (id: string, response: 'accepted' | 'declined', notes?: string) =>
      request<{ success: boolean; data: Application }>(`/applications/${id}/candidate-response`, {
        method: 'POST',
        body: JSON.stringify({ response, notes })
      }),
    decidePartnerApproval: (id: string, decision: 'approved' | 'rejected', reason?: string) =>
      request<{ success: boolean; data: Application }>(`/applications/${id}/partner-approval`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason })
      })
  },

  // Interviews API
  interviews: {
    getAll: (params?: { applicationId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: InterviewRound[] }>(`/interviews${q ? `?${q}` : ''}`);
    },
    create: (data: Partial<InterviewRound>) =>
      request<{ success: boolean; data: InterviewRound }>('/interviews', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateOutcome: (id: string, outcome: InterviewRound['outcome'], feedbackNotes?: string, attendance?: InterviewRound['attendance']) =>
      request<{ success: boolean; data: InterviewRound }>(`/interviews/${id}/outcome`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome, feedbackNotes, attendance })
      })
  },

  // Offers & Placements API
  offers: {
    getAll: () => request<{ success: boolean; count: number; data: Offer[] }>('/offers'),
    create: (data: Partial<Offer>) =>
      request<{ success: boolean; data: Offer }>('/offers', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    requestApproval: (id: string) =>
      request<{ success: boolean; data: Offer }>(`/offers/${id}/request-approval`, {
        method: 'POST'
      }),
    waiveApproval: (id: string, waiverReason: string) =>
      request<{ success: boolean; data: Offer }>(`/offers/${id}/waive-approval`, {
        method: 'POST',
        body: JSON.stringify({ waiverReason })
      }),
    recordResponse: (id: string, response: 'accepted' | 'declined', notes?: string) =>
      request<{ success: boolean; data: Offer }>(`/offers/${id}/response`, {
        method: 'POST',
        body: JSON.stringify({ response, notes })
      }),
    confirmPlacement: (id: string) =>
      request<{ success: boolean; data: Offer }>(`/offers/${id}/confirm-placement`, {
        method: 'POST'
      })
  },

  // Batches & Resume Upload API
  batches: {
    getAll: () => request<{ success: boolean; count: number; data: BatchIntakeItem[] }>('/batches'),
    upload: async (files: File[], organizationId?: string) => {
      const formData = new FormData();
      if (organizationId) formData.append('organizationId', organizationId); // must precede files for multer
      files.forEach(f => formData.append('files', f));

      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set boundary

      const res = await fetch(`${API_BASE}/batches/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!res.ok) {
        if (res.status === 401) handleUnauthorized('/batches/upload');
        throw new Error(await parseError(res));
      }

      return res.json() as Promise<{ success: boolean; count: number; data: BatchIntakeItem[]; message: string }>;
    },
    retry: (id: string) =>
      request<{ success: boolean; data: BatchIntakeItem }>(`/batches/${id}/retry`, {
        method: 'POST'
      }),
    downloadUrl: (id: string) => request<{ success: boolean; url: string }>(`/batches/${id}/download`)
  },

  // AI OCR & Advisory Matching API
  ai: {
    parseResume: (resumeText: string) =>
      request<{ success: boolean; provider: string; data: any }>('/ai/parse-resume', {
        method: 'POST',
        body: JSON.stringify({ resumeText })
      }),
    match: (candidateId: string, jobId: string) =>
      request<{ success: boolean; provider: string; data: any }>('/ai/match', {
        method: 'POST',
        body: JSON.stringify({ candidateId, jobId })
      })
  },

  // Users & Roles API
  users: {
    getAll: () => request<{ success: boolean; count: number; data: User[] }>('/users'),
    invite: (data: Partial<User>) =>
      request<{ success: boolean; data: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateRole: (id: string, role: UserRole, organizationId?: string, organizationName?: string) =>
      request<{ success: boolean; data: User }>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role, organizationId, organizationName })
      }),
    toggleStatus: (id: string) =>
      request<{ success: boolean; data: User }>(`/users/${id}/status`, {
        method: 'PATCH'
      })
  },

  // Audit Logs API
  audit: {
    getAll: (params?: { entity?: string; action?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; count: number; data: AuditEvent[] }>(`/audit${q ? `?${q}` : ''}`);
    },
    log: (data: Partial<AuditEvent>) =>
      request<{ success: boolean; data: AuditEvent }>('/audit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Notifications API
  notifications: {
    getAll: () => request<{ success: boolean; count: number; data: SystemNotification[] }>('/notifications'),
    markRead: (id: string) =>
      request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PATCH'
      }),
    create: (data: Partial<SystemNotification>) =>
      request<{ success: boolean; data: SystemNotification }>('/notifications', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Reports & KPIs API
  reports: {
    getDashboardKPIs: () => request<{ success: boolean; kpis: any }>('/reports/dashboard-kpis'),
    getFunnel: () => request<{ success: boolean; data: any[] }>('/reports/funnel'),
    getPartnerYield: () => request<{ success: boolean; data: any[] }>('/reports/partner-yield')
  },

  // Platform Settings API
  settings: {
    get: () => request<{ success: boolean; data: PlatformSettings }>('/settings'),
    update: (data: Partial<PlatformSettings>) =>
      request<{ success: boolean; data: PlatformSettings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  }
};

