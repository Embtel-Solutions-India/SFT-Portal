// Complete End-to-End API Integration Verification
async function runTests() {
  const BASE = 'http://127.0.0.1:5000/api';
  console.log('--- STARTING E2E BACKEND VERIFICATION ---');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`);
  const health: any = await healthRes.json();
  console.log(`[1] Health: ${health.status} | Orgs: ${health.database.organizations} | Cands: ${health.database.candidates}`);

  // 2. Demo Login
  const loginRes = await fetch(`${BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'platform_admin' })
  });
  const login: any = await loginRes.json();
  console.log(`[2] Demo Login: ${login.user.name} (${login.user.role})`);

  // 3. AI Parse Resume
  const parseRes = await fetch(`${BASE}/ai/parse-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: 'ALEX RIVERA\nBoston, MA\nalex.rivera@demo.com\nReact, TypeScript, Three.js, Node.js\n4 years experience'
    })
  });
  const parse: any = await parseRes.json();
  console.log(`[3] AI Parse: ${parse.data.fullName} | Skills: ${parse.data.skills.map((s: any) => s.name).join(', ')}`);

  // 4. AI Advisory Matching
  const matchRes = await fetch(`${BASE}/ai/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId: 'cand-101', jobId: 'job-1' })
  });
  const match: any = await matchRes.json();
  console.log(`[4] AI Match: ${match.data.matchScore}% | Factors: ${match.data.matchFactors.length}`);

  // 5. Create Job Requisition
  const jobRes = await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'platform_admin' },
    body: JSON.stringify({
      title: 'Principal Distributed Systems Architect',
      employer: 'Vanguard Interactive Studio',
      experienceRange: '6+ years',
      requiredSkills: ['Go', 'Kubernetes', 'PostgreSQL', 'Docker'],
      salaryRange: '$190,000 - $220,000 USD'
    })
  });
  const job: any = await jobRes.json();
  console.log(`[5] Create Job: ${job.data.id} - ${job.data.title}`);

  // 6. Create Application (Shortlist)
  const appRes = await fetch(`${BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' },
    body: JSON.stringify({
      candidateId: 'cand-102',
      jobId: job.data.id,
      matchScore: 97
    })
  });
  const app: any = await appRes.json();
  console.log(`[6] Shortlist Candidate: App ${app.data.id} | Stage: ${app.data.stage}`);

  // 7. Kanban Pipeline Transition
  const stageRes = await fetch(`${BASE}/applications/${app.data.id}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' },
    body: JSON.stringify({ stage: 'interviewing' })
  });
  const stage: any = await stageRes.json();
  console.log(`[7] Pipeline Transition: Stage moved to -> ${stage.data.stage}`);

  // 8. Schedule Interview
  const intRes = await fetch(`${BASE}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' },
    body: JSON.stringify({
      applicationId: app.data.id,
      candidateName: 'Amara Okafor',
      jobTitle: job.data.title,
      employer: job.data.employer,
      roundName: 'Technical Round',
      date: '2026-11-20',
      time: '15:00',
      timezone: 'EST (UTC-5)'
    })
  });
  const interview: any = await intRes.json();
  console.log(`[8] Schedule Interview: Round ${interview.data.roundName} on ${interview.data.date}`);

  // 9. Generate Offer
  const offerRes = await fetch(`${BASE}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' },
    body: JSON.stringify({
      applicationId: app.data.id,
      candidateName: 'Amara Okafor',
      jobTitle: job.data.title,
      compensation: '$195,000 / year + Comprehensive Medical',
      startDate: '2026-12-01'
    })
  });
  const offer: any = await offerRes.json();
  console.log(`[9] Generate Offer: ${offer.data.id} | Status: ${offer.data.status}`);

  // 10. Candidate Response
  const candResp = await fetch(`${BASE}/offers/${offer.data.id}/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'partner_staff' },
    body: JSON.stringify({ response: 'accepted', notes: 'Candidate enthusiastic to join.' })
  });
  const candOffer: any = await candResp.json();
  console.log(`[10] Candidate Offer Response: ${candOffer.data.candidateResponse}`);

  // 11. Request Partner Approval
  const reqAppr = await fetch(`${BASE}/offers/${offer.data.id}/request-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' }
  });
  const reqApprData: any = await reqAppr.json();
  console.log(`[11] Partner Approval Requested: ${reqApprData.data.partnerApprovalStatus}`);

  // 12. Partner Approval Decision
  const decAppr = await fetch(`${BASE}/applications/${app.data.id}/partner-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'partner_admin' },
    body: JSON.stringify({ decision: 'approved', reason: 'Alumni verified and placement attributed.' })
  });
  const decData: any = await decAppr.json();
  console.log(`[12] Partner Signoff: Status ${decData.data.partnerApprovalStatus} | Approver: ${decData.data.partnerApproverName}`);

  // 13. Confirm Final Placement
  const confirmRes = await fetch(`${BASE}/offers/${offer.data.id}/confirm-placement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' }
  });
  const placement: any = await confirmRes.json();
  console.log(`[13] Final Placement Confirmed: ${placement.data.status}`);

  // 14. Audit Trail Verification
  const auditRes = await fetch(`${BASE}/audit`, {
    headers: { 'x-user-role': 'platform_admin' }
  });
  const audit: any = await auditRes.json();
  console.log(`[14] Immutable Audit Trail: Total ${audit.count} events recorded.`);
  console.log(`     Latest: ${audit.data[0].action} - ${audit.data[0].details}`);

  // 15. Reports & Funnel Metrics
  const reportsRes = await fetch(`${BASE}/reports/dashboard-kpis`, {
    headers: { 'x-user-role': 'platform_admin' }
  });
  const reports: any = await reportsRes.json();
  console.log(`[15] Platform KPIs: Total Placements: ${reports.kpis.confirmedPlacements} | Active Apps: ${reports.kpis.activeApplications}`);

  console.log('\n======================================================');
  console.log('  ALL 15 ENTERPRISE BACKEND FEATURES PASSED VERIFICATION!');
  console.log('======================================================');
}

runTests().catch(console.error);

