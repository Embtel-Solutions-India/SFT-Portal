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
  BatchIntakeItem
} from '../types';

export const DEMO_USERS: Record<string, User> = {
  platform_admin: {
    id: 'user-sft-admin-1',
    email: 'admin@sft.com',
    name: 'SFT Platform Administrator',
    role: 'platform_admin',
    password: 'SftAdmin#2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    lastLogin: '2026-11-06T00:00:00Z',
    invitedAt: '2026-11-01T00:00:00Z'
  },
  recruiter: {
    id: 'user-sft-recruiter-1',
    email: 'recruiter@sft.com',
    name: 'Himanshu (Placement Operations)',
    role: 'recruiter',
    password: 'SftAdmin#2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    lastLogin: '2026-11-06T00:00:00Z',
    invitedAt: '2026-11-01T00:00:00Z'
  },
  partner_admin: {
    id: 'user-sft-partner-admin-1',
    email: 'partner@sft.com',
    name: 'Dr. Elena Rostova',
    role: 'partner_admin',
    organizationId: 'org-1',
    organizationName: 'Apex Institute of Technology',
    password: 'SftAdmin#2026',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    lastLogin: '2026-11-06T00:00:00Z',
    invitedAt: '2026-11-01T00:00:00Z'
  },
  partner_staff: {
    id: 'user-sft-partner-staff-1',
    email: 'staff@sft.com',
    name: 'David Kalu',
    role: 'partner_staff',
    organizationId: 'org-1',
    organizationName: 'Apex Institute of Technology',
    password: 'SftAdmin#2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    status: 'active',
    lastLogin: '2026-11-06T00:00:00Z',
    invitedAt: '2026-11-01T00:00:00Z'
  }
};

export const INITIAL_USERS: User[] = [
  DEMO_USERS.platform_admin,
  DEMO_USERS.recruiter,
  DEMO_USERS.partner_admin,
  DEMO_USERS.partner_staff,
  {
    id: 'user-admin-2',
    email: 'alex.rivera@sft.demo',
    name: 'Alex Rivera',
    role: 'platform_admin',
    status: 'active',
    lastLogin: '2026-11-02T14:00:00Z',
    invitedAt: '2026-08-01T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-recruiter-2',
    email: 'chloe.taylor@sft.demo',
    name: 'Chloe Taylor',
    role: 'recruiter',
    status: 'active',
    lastLogin: '2026-11-03T18:40:00Z',
    invitedAt: '2026-09-01T10:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-partner-admin-2',
    email: 'arthur.pendelton@metropoly.edu.demo',
    name: 'Prof. Arthur Pendelton',
    role: 'partner_admin',
    organizationId: 'org-2',
    organizationName: 'Metro Polytechnic',
    status: 'active',
    lastLogin: '2026-10-30T11:15:00Z',
    invitedAt: '2026-10-03T11:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'user-partner-staff-2',
    email: 'lisa.wong@metropoly.edu.demo',
    name: 'Lisa Wong',
    role: 'partner_staff',
    organizationId: 'org-2',
    organizationName: 'Metro Polytechnic',
    status: 'inactive',
    lastLogin: '2026-10-25T09:00:00Z',
    invitedAt: '2026-10-05T14:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    legalName: 'Apex Institute of Technology Inc.',
    displayName: 'Apex Institute of Technology',
    type: 'university',
    location: 'Boston, MA, USA',
    contactEmail: 'partneradmin@sft.demo',
    contactPhone: '+1 (617) 555-0192',
    website: 'https://apex-tech.edu.demo',
    authorizedRepresentative: 'Dr. Elena Rostova',
    representativeTitle: 'Dean of Career Services',
    status: 'approved',
    submittedAt: '2026-09-12T10:30:00Z',
    verifiedAt: '2026-09-14T14:20:00Z',
    verifiedBy: 'admin@sft.demo',
    candidateIntakeEnabled: true,
    candidateCount: 42,
    placementCount: 18,
    notes: 'Premier technical university partner. High-volume computer science intake.'
  },
  {
    id: 'org-2',
    legalName: 'Metro Polytechnic Institute of Engineering',
    displayName: 'Metro Polytechnic',
    type: 'polytechnic',
    location: 'Chicago, IL, USA',
    contactEmail: 'contact@metropoly.edu.demo',
    contactPhone: '+1 (312) 555-8821',
    website: 'https://metropoly.edu.demo',
    authorizedRepresentative: 'Prof. Arthur Pendelton',
    representativeTitle: 'Director of Industry Partnerships',
    status: 'approved',
    submittedAt: '2026-10-01T08:15:00Z',
    verifiedAt: '2026-10-03T11:45:00Z',
    verifiedBy: 'admin@sft.demo',
    candidateIntakeEnabled: true,
    candidateCount: 28,
    placementCount: 9,
    notes: 'Accredited vocational and engineering polytechnic.'
  },
  {
    id: 'org-3',
    legalName: 'Horizon Fullstack Coding Academy LLC',
    displayName: 'Horizon Coding Academy',
    type: 'coaching_center',
    location: 'Austin, TX, USA',
    contactEmail: 'admin@horizoncode.org.demo',
    contactPhone: '+1 (512) 555-4301',
    website: 'https://horizoncode.org.demo',
    authorizedRepresentative: 'Maya Lin',
    representativeTitle: 'Managing Partner',
    status: 'approved',
    submittedAt: '2026-10-15T16:00:00Z',
    verifiedAt: '2026-10-18T09:30:00Z',
    verifiedBy: 'admin@sft.demo',
    candidateIntakeEnabled: true,
    candidateCount: 19,
    placementCount: 6,
    notes: 'Intensive web & cloud bootcamp partner.'
  },
  {
    id: 'org-4',
    legalName: 'St. Jude Technical College Foundation',
    displayName: 'St. Jude Technical College',
    type: 'college',
    location: 'Seattle, WA, USA',
    contactEmail: 'careers@stjude-tech.org.demo',
    contactPhone: '+1 (206) 555-7790',
    website: 'https://stjude-tech.org.demo',
    authorizedRepresentative: 'Father Thomas Sterling',
    representativeTitle: 'President',
    status: 'pending',
    submittedAt: '2026-11-02T11:20:00Z',
    candidateIntakeEnabled: false,
    candidateCount: 0,
    placementCount: 0,
    notes: 'Submitted verification documents pending accreditation cross-reference.',
    isDuplicateFlagged: false
  },
  {
    id: 'org-5',
    legalName: 'Brightwood Career & Trade Academy',
    displayName: 'Brightwood Career Academy',
    type: 'vocational_institute',
    location: 'Denver, CO, USA',
    contactEmail: 'info@brightwood-trade.demo',
    contactPhone: '+1 (303) 555-1144',
    website: 'https://brightwood-trade.demo',
    authorizedRepresentative: 'Robert Miller',
    representativeTitle: 'Director',
    status: 'rejected',
    submittedAt: '2026-10-20T14:10:00Z',
    rejectionReason: 'Invalid legal entity documentation and unverified contact domain. Candidate consent mechanism lacked required disclosures.',
    candidateIntakeEnabled: false,
    candidateCount: 0,
    placementCount: 0,
    notes: 'Can resubmit once state certification and corrected consent workflow are provided.'
  },
  {
    id: 'org-6',
    legalName: 'Evergreen Polytechnic Institute of Technology',
    displayName: 'Evergreen Polytechnic',
    type: 'polytechnic',
    location: 'Portland, OR, USA',
    contactEmail: 'contact@evergreen-poly.demo',
    contactPhone: '+1 (503) 555-9012',
    website: 'https://evergreen-poly.demo',
    authorizedRepresentative: 'Dr. Marcus Vance Sr.',
    representativeTitle: 'Chancellor',
    status: 'suspended',
    submittedAt: '2026-08-10T12:00:00Z',
    verifiedAt: '2026-08-15T10:00:00Z',
    suspensionReason: 'Administrative audit identified unverified candidate consent attestations. Candidate intake suspended pending compliance audit review.',
    candidateIntakeEnabled: false,
    candidateCount: 14,
    placementCount: 3,
    notes: 'Suspended by platform administrator Sarah Chen.'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-101',
    fullName: 'Liam Thorne',
    email: 'liam.thorne@alumni.apex.demo',
    phone: '+1 (617) 555-9182',
    location: 'Boston, MA (Open to Remote)',
    targetRole: 'Senior Frontend Architect / React Specialist',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    status: 'in_pipeline',
    consentState: 'verified',
    consentTimestamp: '2026-10-05T09:00:00Z',
    consentPolicyVersion: 'v2.1-attestation',
    skills: ['React', 'TypeScript', 'Three.js', 'Next.js', 'Tailwind CSS', 'WebGL', 'Performance Optimization'],
    experienceYears: 5,
    education: 'B.S. in Computer Science, Apex Institute of Technology (2023)',
    resumeFileName: 'Liam_Thorne_CS_2026.pdf',
    submittedAt: '2026-10-05T09:30:00Z',
    activeApplicationCount: 1,
    internalNotes: 'Top graduate from 2023 CS cohort. Exceptional UI craft and WebGL experience. Highly responsive to initial outreach.',
    resumeText: `LIAM THORNE
Boston, MA • liam.thorne@alumni.apex.demo • +1 (617) 555-9182
Portfolio: https://liamthorne.dev

SUMMARY
Frontend Engineer with 5 years experience specializing in modern React architectures, TypeScript systems, WebGL graphics, and high-performance interactive interfaces.

EXPERIENCE
Frontend Creative Engineer • PixelCraft Interactive (2023 - Present)
- Engineered responsive WebGL/Three.js web applications delivering 60fps across mobile and desktop.
- Built reusable design system component library in React, TypeScript, and Tailwind CSS.
- Optimized bundle sizes by 42% through code splitting and tree shaking.

Junior Software Engineer • Apex Innovation Labs (2021 - 2023)
- Implemented state management using Redux Toolkit and Zustand.
- Collaborated with UI/UX designers to translate Figma specifications into pixel-perfect code.

EDUCATION
B.S. in Computer Science • Apex Institute of Technology (Graduated May 2023, GPA 3.9/4.0)

SKILLS
React, TypeScript, Three.js, Next.js, WebGL, Tailwind CSS, GSAP, Git, Jest, Cypress`,
    parsedProfile: {
      fullName: 'Liam Thorne',
      email: 'liam.thorne@alumni.apex.demo',
      phone: '+1 (617) 555-9182',
      location: 'Boston, MA',
      skills: [
        { name: 'React', confidence: 0.98 },
        { name: 'TypeScript', confidence: 0.95 },
        { name: 'Three.js', confidence: 0.91 },
        { name: 'WebGL', confidence: 0.88 },
        { name: 'Tailwind CSS', confidence: 0.96 }
      ],
      experienceYears: 5,
      education: 'B.S. in Computer Science',
      summary: 'Frontend engineer with high visual craft and experience in real-time WebGL graphics.',
      parseConfidence: 0.96
    },
    activityHistory: [
      { date: '2026-10-05', action: 'Uploaded in Batch #batch-2026-1005 with verified consent attestation', actor: 'David Kalu' },
      { date: '2026-10-06', action: 'Parsed by AI Parser v2.4 (Confidence 96%)', actor: 'System' },
      { date: '2026-10-08', action: 'Profile confirmed and released to pool', actor: 'Marcus Vance' },
      { date: '2026-10-12', action: 'Matched with Vanguard Studios (Score 94%)', actor: 'Marcus Vance' }
    ]
  },
  {
    id: 'cand-102',
    fullName: 'Amara Okafor',
    email: 'amara.okafor@alumni.apex.demo',
    phone: '+1 (617) 555-2244',
    location: 'New York, NY (Hybrid)',
    targetRole: 'Full Stack Distributed Systems Engineer',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    status: 'in_pipeline',
    consentState: 'verified',
    consentTimestamp: '2026-10-08T14:15:00Z',
    consentPolicyVersion: 'v2.1-attestation',
    skills: ['Go', 'Kubernetes', 'PostgreSQL', 'Docker', 'Distributed Systems', 'TypeScript', 'gRPC'],
    experienceYears: 4,
    education: 'M.S. in Software Systems, Apex Institute of Technology (2024)',
    resumeFileName: 'Amara_Okafor_Systems.pdf',
    submittedAt: '2026-10-08T14:40:00Z',
    activeApplicationCount: 1,
    internalNotes: 'Strong systems background. Mastered concurrent microservice pipelines in Go. Recommended by Prof. Chen.',
    parsedProfile: {
      fullName: 'Amara Okafor',
      email: 'amara.okafor@alumni.apex.demo',
      phone: '+1 (617) 555-2244',
      location: 'New York, NY',
      skills: [
        { name: 'Go', confidence: 0.97 },
        { name: 'Kubernetes', confidence: 0.94 },
        { name: 'PostgreSQL', confidence: 0.92 }
      ],
      experienceYears: 4,
      education: 'M.S. in Software Systems',
      summary: 'Backend and cloud infrastructure specialist with focus on high-throughput microservices.',
      parseConfidence: 0.94
    }
  },
  {
    id: 'cand-103',
    fullName: 'Devon Zhao',
    email: 'devon.zhao@metropoly.alumni.demo',
    phone: '+1 (312) 555-7811',
    location: 'Chicago, IL',
    targetRole: 'Machine Learning & Data Operations Specialist',
    partnerId: 'org-2',
    partnerName: 'Metro Polytechnic',
    status: 'in_pipeline',
    consentState: 'verified',
    consentTimestamp: '2026-10-12T11:00:00Z',
    consentPolicyVersion: 'v2.1-attestation',
    skills: ['Python', 'PyTorch', 'SQL', 'FastAPI', 'MLOps', 'Vector Databases', 'Pandas'],
    experienceYears: 3,
    education: 'B.Eng. in Computational Systems, Metro Polytechnic (2024)',
    resumeFileName: 'Devon_Zhao_ML_Resume.pdf',
    submittedAt: '2026-10-12T11:25:00Z',
    activeApplicationCount: 1,
    parsedProfile: {
      fullName: 'Devon Zhao',
      email: 'devon.zhao@metropoly.alumni.demo',
      phone: '+1 (312) 555-7811',
      location: 'Chicago, IL',
      skills: [
        { name: 'Python', confidence: 0.99 },
        { name: 'PyTorch', confidence: 0.93 },
        { name: 'MLOps', confidence: 0.89 }
      ],
      experienceYears: 3,
      education: 'B.Eng. in Computational Systems',
      summary: 'MLOps engineer experienced in serving LLMs and automated pipeline validation.',
      parseConfidence: 0.93
    }
  },
  {
    id: 'cand-104',
    fullName: 'Sophia Martinez',
    email: 'sophia.m@horizon.alumni.demo',
    phone: '+1 (512) 555-6677',
    location: 'Austin, TX (Remote)',
    targetRole: 'Full Stack Product Engineer',
    partnerId: 'org-3',
    partnerName: 'Horizon Coding Academy',
    status: 'active',
    consentState: 'verified',
    consentTimestamp: '2026-10-22T08:30:00Z',
    consentPolicyVersion: 'v2.1-attestation',
    skills: ['TypeScript', 'Node.js', 'React', 'Tailwind CSS', 'Prisma', 'Next.js', 'GraphQL'],
    experienceYears: 2,
    education: 'Fullstack Software Engineering Certification, Horizon Academy (2025)',
    resumeFileName: 'Sophia_Martinez_Portfolio_Resume.pdf',
    submittedAt: '2026-10-22T08:50:00Z',
    activeApplicationCount: 0
  },
  {
    id: 'cand-105',
    fullName: 'Kofi Mensah',
    email: 'kofi.mensah@alumni.apex.demo',
    phone: '+1 (617) 555-4920',
    location: 'San Francisco, CA (Hybrid)',
    targetRole: 'Lead Security & Cloud Operations',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    status: 'placed',
    consentState: 'verified',
    consentTimestamp: '2026-09-18T10:00:00Z',
    consentPolicyVersion: 'v2.1-attestation',
    skills: ['AWS', 'Terraform', 'SOC2 Compliance', 'Zero Trust', 'Docker', 'Linux', 'Python'],
    experienceYears: 6,
    education: 'B.S. in Cybersecurity & Networks, Apex Institute of Technology (2022)',
    resumeFileName: 'Kofi_Mensah_CloudSec.pdf',
    submittedAt: '2026-09-18T10:15:00Z',
    activeApplicationCount: 1
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Creative Technologist',
    employer: 'Vanguard Interactive Studio',
    department: 'Digital Experience Group',
    location: 'New York, NY / Remote',
    workMode: 'remote',
    employmentType: 'full_time',
    experienceRange: '4-7 years',
    salaryRange: '$145,000 - $175,000 USD',
    description: 'Lead visual design and 3D web experiences for flagship consumer platforms. Requires deep React, WebGL, and micro-interaction craft.',
    requiredSkills: ['React', 'TypeScript', 'Three.js', 'WebGL', 'Tailwind CSS'],
    preferredSkills: ['GSAP', 'GLSL Shaders', 'Framer Motion'],
    status: 'active',
    createdAt: '2026-10-01T10:00:00Z',
    applicantsCount: 6,
    matchesCount: 4
  },
  {
    id: 'job-2',
    title: 'Cloud Infrastructure & Kubernetes Engineer',
    employer: 'FinScale Distributed Technologies',
    department: 'Platform Reliability',
    location: 'Chicago, IL / Hybrid',
    workMode: 'hybrid',
    employmentType: 'full_time',
    experienceRange: '3-6 years',
    salaryRange: '$130,000 - $160,000 USD',
    description: 'Architect multi-tenant Kubernetes clusters and automated deployment pipelines for mission-critical payment gateways.',
    requiredSkills: ['Go', 'Kubernetes', 'Docker', 'PostgreSQL', 'Terraform'],
    preferredSkills: ['gRPC', 'Prometheus', 'AWS'],
    status: 'active',
    createdAt: '2026-10-04T12:30:00Z',
    applicantsCount: 4,
    matchesCount: 3
  },
  {
    id: 'job-3',
    title: 'Machine Learning Pipeline Engineer',
    employer: 'Axiom Neural Intelligence',
    department: 'Applied AI',
    location: 'Austin, TX / Remote',
    workMode: 'remote',
    employmentType: 'full_time',
    experienceRange: '2-5 years',
    salaryRange: '$120,000 - $150,000 USD',
    description: 'Deploy, evaluate, and monitor retrieval-augmented generation pipelines and structured inference models in production.',
    requiredSkills: ['Python', 'PyTorch', 'SQL', 'FastAPI'],
    preferredSkills: ['Vector Databases', 'MLOps', 'Docker'],
    status: 'active',
    createdAt: '2026-10-10T09:15:00Z',
    applicantsCount: 5,
    matchesCount: 2
  },
  {
    id: 'job-4',
    title: 'Distributed Systems Core Engineer',
    employer: 'DataScale Labs',
    department: 'Storage Engine',
    location: 'San Francisco, CA / On-site',
    workMode: 'on_site',
    employmentType: 'full_time',
    experienceRange: '5+ years',
    salaryRange: '$170,000 - $210,000 USD',
    description: 'Low-latency C++ / Rust memory management engine for real-time analytics lakehouse.',
    requiredSkills: ['Rust', 'C++', 'Distributed Consensus', 'Linux Kernel'],
    preferredSkills: ['Raft', 'eBPF'],
    status: 'draft',
    createdAt: '2026-11-01T14:00:00Z',
    applicantsCount: 0,
    matchesCount: 0
  }
];

export const INITIAL_INTERVIEWS: InterviewRound[] = [
  {
    id: 'int-1',
    applicationId: 'app-501',
    candidateName: 'Liam Thorne',
    jobTitle: 'Senior Frontend Creative Technologist',
    employer: 'Vanguard Interactive Studio',
    roundName: 'Technical Round',
    date: '2026-10-22',
    time: '14:00',
    timezone: 'America/New_York (EDT)',
    modality: 'video',
    interviewer: 'Danielle Brooks (Head of Creative Tech)',
    instructions: 'Live architecture review of 3D canvas rendering and shader optimization.',
    candidateContacted: true,
    attendance: 'attended',
    outcome: 'passed',
    feedbackNotes: 'Exemplary performance. Deep mastery of WebGL scene hierarchy and custom shader performance.',
    history: [
      { timestamp: '2026-10-16T10:00:00Z', note: 'Scheduled with candidate confirmation via staff outreach.' },
      { timestamp: '2026-10-22T15:15:00Z', note: 'Candidate attended. Result: Recommended for final offer.' }
    ]
  },
  {
    id: 'int-2',
    applicationId: 'app-502',
    candidateName: 'Amara Okafor',
    jobTitle: 'Cloud Infrastructure & Kubernetes Engineer',
    employer: 'FinScale Distributed Technologies',
    roundName: 'Initial Screen',
    date: '2026-11-06',
    time: '11:00',
    timezone: 'America/Chicago (CDT)',
    modality: 'video',
    interviewer: 'David Chen (VP of Platform Engineering)',
    instructions: 'Discuss distributed consensus algorithms and production Kubernetes troubleshooting.',
    candidateContacted: true,
    attendance: 'scheduled',
    outcome: 'pending',
    feedbackNotes: 'Candidate confirmed video link and timezone alignment.',
    history: [
      { timestamp: '2026-10-29T11:20:00Z', note: 'Screening round booked. Calendar invite sent to candidate and hiring manager.' }
    ]
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    applicationId: 'app-501',
    candidateId: 'cand-101',
    candidateName: 'Liam Thorne',
    candidateEmail: 'liam.thorne@alumni.apex.demo',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Creative Technologist',
    employer: 'Vanguard Interactive Studio',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    version: 'v1.0',
    compensation: '$158,000 USD Base + 0.1% Equity + Comprehensive Health',
    startDate: '2026-12-01',
    notes: 'Requires partner approval from Apex Institute prior to placement finalization.',
    candidateResponse: 'accepted',
    candidateResponseNotes: 'Candidate accepted terms verbally via staff outreach.',
    partnerApprovalStatus: 'pending',
    status: 'issued',
    createdAt: '2026-10-28T16:00:00Z'
  },
  {
    id: 'offer-2',
    applicationId: 'app-504',
    candidateId: 'cand-105',
    candidateName: 'Kofi Mensah',
    candidateEmail: 'kofi.mensah@alumni.apex.demo',
    jobId: 'job-2',
    jobTitle: 'Lead Security & Cloud Operations',
    employer: 'FinScale Distributed Technologies',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    version: 'v1.0-final',
    compensation: '$165,000 USD Base',
    startDate: '2026-11-15',
    notes: 'Attributed placement approved by Dr. Elena Rostova on 2026-10-10.',
    candidateResponse: 'accepted',
    partnerApprovalStatus: 'approved',
    partnerApprovalReason: 'Reviewed and confirmed under Apex career placement guidelines.',
    partnerApproverName: 'Dr. Elena Rostova',
    partnerApprovalTimestamp: '2026-10-10T14:00:00Z',
    status: 'confirmed',
    createdAt: '2026-10-02T16:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-501',
    candidateId: 'cand-101',
    candidateName: 'Liam Thorne',
    candidateEmail: 'liam.thorne@alumni.apex.demo',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Creative Technologist',
    employer: 'Vanguard Interactive Studio',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    stage: 'partner_approval_pending',
    matchScore: 94,
    matchFactors: [
      { factor: 'Core Tech Stack Alignment', score: 98, note: 'Direct match on React, TypeScript, Three.js, and WebGL' },
      { factor: 'Experience Level', score: 92, note: '5 years matches required 4-7 years range' },
      { factor: 'Creative Portfolio Proof', score: 94, note: 'Demonstrated WebGL and interactive shader portfolio' }
    ],
    missingSkills: ['GLSL Shaders (Self-taught / intermediate)'],
    candidateResponse: 'accepted',
    candidateResponseNotes: 'Candidate expressed strong excitement for Vanguard interactive projects via phone screen.',
    candidateResponseTimestamp: '2026-10-15T14:30:00Z',
    offerTerms: {
      compensation: '$158,000 USD Base + 0.1% Equity',
      startDate: '2026-12-01',
      termsVersion: 'v1.0',
      notes: 'Requires attributed partner approval from Apex Institute of Technology prior to formal release.'
    },
    partnerApprovalStatus: 'pending',
    lastUpdated: '2026-10-28T16:00:00Z'
  },
  {
    id: 'app-502',
    candidateId: 'cand-102',
    candidateName: 'Amara Okafor',
    candidateEmail: 'amara.okafor@alumni.apex.demo',
    jobId: 'job-2',
    jobTitle: 'Cloud Infrastructure & Kubernetes Engineer',
    employer: 'FinScale Distributed Technologies',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    stage: 'interviewing',
    matchScore: 91,
    matchFactors: [
      { factor: 'Systems Programming Language', score: 96, note: 'High proficiency in Go' },
      { factor: 'Orchestration & Containers', score: 95, note: 'Hands-on Kubernetes cluster architecture' },
      { factor: 'Relational Store Scale', score: 85, note: 'Strong PostgreSQL query optimization' }
    ],
    candidateResponse: 'accepted',
    candidateResponseTimestamp: '2026-10-18T10:00:00Z',
    lastUpdated: '2026-10-29T11:20:00Z'
  },
  {
    id: 'app-503',
    candidateId: 'cand-103',
    candidateName: 'Devon Zhao',
    candidateEmail: 'devon.zhao@metropoly.alumni.demo',
    jobId: 'job-3',
    jobTitle: 'Machine Learning Pipeline Engineer',
    employer: 'Axiom Neural Intelligence',
    partnerId: 'org-2',
    partnerName: 'Metro Polytechnic',
    stage: 'shortlisted',
    matchScore: 88,
    matchFactors: [
      { factor: 'Python & Frameworks', score: 95, note: 'Extensive PyTorch and FastAPI experience' },
      { factor: 'Data Pipeline Reliability', score: 84, note: 'Solid automated testing practices' }
    ],
    missingSkills: ['Vector Databases (Conceptual knowledge)'],
    lastUpdated: '2026-11-01T09:45:00Z'
  },
  {
    id: 'app-504',
    candidateId: 'cand-105',
    candidateName: 'Kofi Mensah',
    candidateEmail: 'kofi.mensah@alumni.apex.demo',
    jobId: 'job-2',
    jobTitle: 'Lead Security & Cloud Operations',
    employer: 'FinScale Distributed Technologies',
    partnerId: 'org-1',
    partnerName: 'Apex Institute of Technology',
    stage: 'placement_confirmed',
    matchScore: 96,
    matchFactors: [
      { factor: 'Compliance & Auditing', score: 99, note: 'Direct SOC2 and zero-trust engineering experience' },
      { factor: 'Infrastructure as Code', score: 96, note: 'Terraform and AWS certified' }
    ],
    candidateResponse: 'accepted',
    candidateResponseTimestamp: '2026-10-02T16:00:00Z',
    offerTerms: {
      compensation: '$165,000 USD base',
      startDate: '2026-11-15',
      termsVersion: 'v1.0-final',
      notes: 'Partner attribution verified and approved by Apex Institute.'
    },
    partnerApprovalStatus: 'approved',
    partnerApprovalReason: 'Candidate placement attributed to Apex career program; terms fully reviewed and approved.',
    partnerApprovalTimestamp: '2026-10-10T14:00:00Z',
    partnerApproverName: 'Dr. Elena Rostova',
    lastUpdated: '2026-10-12T10:00:00Z'
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-001',
    timestamp: '2026-11-04T05:30:12Z',
    actorEmail: 'admin@sft.demo',
    actorRole: 'platform_admin',
    action: 'ORGANIZATION_STATUS_UPDATE',
    entity: 'Organization',
    entityId: 'org-4',
    organizationName: 'St. Jude Technical College',
    details: 'Placed organization in pending status awaiting state board registration certificate.',
    correlationId: 'req-c7a91b-admin-01',
    beforeValue: 'Submitted',
    afterValue: 'Pending Verification'
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-28T16:00:00Z',
    actorEmail: 'recruiter@sft.demo',
    actorRole: 'recruiter',
    action: 'APPROVAL_REQUEST_DISPATCHED',
    entity: 'Application',
    entityId: 'app-501',
    organizationName: 'Apex Institute of Technology',
    details: 'Dispatched partner placement approval request for candidate Liam Thorne at Vanguard Interactive Studio.',
    correlationId: 'req-4482ef-rec-09'
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-10T14:00:00Z',
    actorEmail: 'partneradmin@sft.demo',
    actorRole: 'partner_admin',
    action: 'PARTNER_PLACEMENT_APPROVED',
    entity: 'Application',
    entityId: 'app-504',
    organizationName: 'Apex Institute of Technology',
    details: 'Dr. Elena Rostova approved attributed placement for Kofi Mensah (Terms v1.0). Attribution documented.',
    correlationId: 'req-9881ab-part-03'
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-05T09:30:00Z',
    actorEmail: 'placementofficer@sft.demo',
    actorRole: 'partner_staff',
    action: 'BULK_RESUME_INTAKE_CONFIRMED',
    entity: 'CandidateIntakeBatch',
    entityId: 'batch-2026-1005',
    organizationName: 'Apex Institute of Technology',
    details: 'Uploaded batch of 12 candidate resumes with signed consent attestations under policy v2.1.',
    correlationId: 'req-3120cb-staff-12'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'partner_admin',
    targetOrgId: 'org-1',
    title: 'Placement Approval Required',
    message: 'Liam Thorne has accepted an offer from Vanguard Interactive Studio. Please review terms and confirm attribution.',
    timestamp: '2 hours ago',
    read: false,
    type: 'alert',
    actionUrl: '/recruiter/offers'
  },
  {
    id: 'notif-2',
    targetRole: 'platform_admin',
    title: 'New Organization Registration',
    message: 'St. Jude Technical College submitted verification details. Verification queue updated.',
    timestamp: '1 day ago',
    read: false,
    type: 'info',
    actionUrl: '/admin/organizations?status=pending'
  },
  {
    id: 'notif-3',
    targetRole: 'recruiter',
    title: 'New AI Matches Generated',
    message: '3 candidate profiles scored above 85% match for Senior Frontend Creative Technologist.',
    timestamp: '3 hours ago',
    read: true,
    type: 'success',
    actionUrl: '/recruiter/matching'
  }
];

export const INITIAL_SETTINGS: PlatformSettings = {
  resumeMaxFileSizeMB: 25,
  supportedResumeFormats: ['PDF', 'DOCX', 'ZIP'],
  duplicateDetectionSensitivity: 'balanced',
  approvalReminderIntervalHours: 48,
  aiProviderStatus: 'healthy',
  storageProviderStatus: 'healthy',
  emailProviderStatus: 'healthy'
};

export const ROLE_PERMISSIONS_MATRIX = [
  { module: 'Platform Administration & Tenants', admin: 'Full Control', recruiter: 'No Access', partnerAdmin: 'No Access', partnerStaff: 'No Access' },
  { module: 'User & Role Invitation', admin: 'Platform-wide', recruiter: 'No Access', partnerAdmin: 'Own Org Only', partnerStaff: 'Limited / Delegated' },
  { module: 'Organization Verification', admin: 'Approve / Reject / Suspend', recruiter: 'Read-only', partnerAdmin: 'View Status', partnerStaff: 'No Access' },
  { module: 'Bulk Resume Intake', admin: 'Full Oversight', recruiter: 'Operational Intake', partnerAdmin: 'Own Org Upload', partnerStaff: 'Own Org Upload' },
  { module: 'Candidate Profile Visibility', admin: 'All (Audited)', recruiter: 'Assigned Pool', partnerAdmin: 'Own Org Only', partnerStaff: 'Own Org Only' },
  { module: 'Edit Parsed Profile Fields', admin: 'Override (Audited)', recruiter: 'Recruitment Fields', partnerAdmin: 'Own Org Fields', partnerStaff: 'Submitted Fields' },
  { module: 'Job Requisition Management', admin: 'Full Control', recruiter: 'Create & Manage', partnerAdmin: 'No Access', partnerStaff: 'No Access' },
  { module: 'Advisory AI Matching', admin: 'Model Review', recruiter: 'Shortlist Decisions', partnerAdmin: 'Limited Summary', partnerStaff: 'No Access' },
  { module: 'Pipeline Stage Advancement', admin: 'Override (Audited)', recruiter: 'Manage Workflow', partnerAdmin: 'Scoped View', partnerStaff: 'Scoped View' },
  { module: 'Partner Placement Approval', admin: 'Waiver with Audit', recruiter: 'Request & Track', partnerAdmin: 'Approve / Reject', partnerStaff: 'No Access' },
  { module: 'Interview Coordination', admin: 'Oversight', recruiter: 'Schedule & Log Outcome', partnerAdmin: 'Status Updates', partnerStaff: 'Status Updates' },
  { module: 'Placement Finalization', admin: 'Verify & Close', recruiter: 'Execute & Confirm', partnerAdmin: 'Prerequisite Gate', partnerStaff: 'No Access' },
  { module: 'Audit Log Explorer', admin: 'Platform-wide Append-only', recruiter: 'Relevant Cases', partnerAdmin: 'Own Org Actions', partnerStaff: 'Own Actions' }
];

export const INITIAL_BATCH_ITEMS: BatchIntakeItem[] = [
  {
    id: 'batch-f1',
    fileName: 'Maya_Lin_Resume_2026.pdf',
    fileSize: '1.4 MB',
    status: 'review_needed',
    candidateName: 'Maya Lin',
    confidenceScore: 94,
    isDuplicate: false
  },
  {
    id: 'batch-f2',
    fileName: 'Kofi_Mensah_Security.docx',
    fileSize: '2.1 MB',
    status: 'confirmed',
    candidateName: 'Kofi Mensah',
    confidenceScore: 98,
    isDuplicate: false
  },
  {
    id: 'batch-f3',
    fileName: 'Jordan_Blake_CV_Apex.pdf',
    fileSize: '890 KB',
    status: 'confirmed',
    candidateName: 'Jordan Blake',
    confidenceScore: 91,
    isDuplicate: false
  },
  {
    id: 'batch-f4',
    fileName: 'Duplicate_Liam_Thorne_v2.pdf',
    fileSize: '1.1 MB',
    status: 'failed',
    candidateName: 'Liam Thorne',
    confidenceScore: 88,
    isDuplicate: true,
    error: 'Duplicate detected against existing profile cand-101 (Apex Institute).'
  },
  {
    id: 'batch-f5',
    fileName: 'Tariq_Zaman_Portfolio.pdf',
    fileSize: '3.2 MB',
    status: 'review_needed',
    candidateName: 'Tariq Zaman',
    confidenceScore: 84,
    isDuplicate: false
  }
];
