import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { CandidateCard } from '../../../components/common/CandidateCard';
import { Candidate, Job } from '../../../types';
import { calculateAdvisoryMatch, AdvisoryMatchResult } from '../../../services/aiService';
import { 
  ShieldCheck, 
  Sparkles, 
  Briefcase, 
  Users, 
  Clock, 
  Award, 
  Calendar,
  AlertTriangle,
  X,
  CheckCircle2,
  FileText,
  Sliders,
  RefreshCw,
  Cpu,
  BarChart2
} from 'lucide-react';

export const RecruiterMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, candidates, applications, interviews, offers, advanceApplicationStage, createApplication } = usePlatformData();

  // Selected Requisition
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || 'job-1');
  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Modals & Drawers
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [compareModalCandidates, setCompareModalCandidates] = useState<{ c1: Candidate; c2: Candidate } | null>(null);

  // AI Match Engine State
  const [aiResults, setAiResults] = useState<Record<string, AdvisoryMatchResult>>({});
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);

  // Filter / Sort state
  const [minMatchScore, setMinMatchScore] = useState<number>(70);
  const [sortBy, setSortBy] = useState<'match' | 'experience'>('match');

  // Compute AI Advisory Matches
  const runAiMatching = async () => {
    setIsAnalyzingAi(true);
    const results: Record<string, AdvisoryMatchResult> = {};
    try {
      for (const cand of candidates) {
        results[cand.id] = await calculateAdvisoryMatch(cand, selectedJob);
      }
    } catch (e: any) {
      alert(e?.message || 'AI matching failed. Please retry.');
    }
    setAiResults(results);
    setIsAnalyzingAi(false);
  };

  // AI results belong to one job; clear them when the job changes (run is manual to save AI quota).
  useEffect(() => {
    setAiResults({});
  }, [selectedJobId]);

  // Counts for Top KPIs
  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const talentPoolCount = candidates.length;
  const inPipelineCount = applications.length;
  const scheduledInterviewsCount = interviews.filter(i => i.attendance === 'scheduled').length;
  const pendingApprovalsCount = offers.filter(o => o.partnerApprovalStatus === 'pending').length;
  const confirmedPlacementsCount = offers.filter(o => o.status === 'confirmed').length;

  // Calculate AI / skill-overlap match scores for current requisition
  const candidateMatches = candidates.map(cand => {
    const aiMatch = aiResults[cand.id];
    const matchingSkills = cand.skills.filter(s => 
      selectedJob.requiredSkills.some(req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase()))
    );
    const missingSkills = aiMatch?.skillGaps || selectedJob.requiredSkills.filter(req => 
      !cand.skills.some(s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
    );

    // Before AI runs, show plain required-skill overlap — never a made-up score.
    const overlap = selectedJob.requiredSkills.length
      ? Math.round(((selectedJob.requiredSkills.length - missingSkills.length) / selectedJob.requiredSkills.length) * 100)
      : 0;
    const baseScore = aiMatch?.overallScore ?? overlap;
    const isShortlisted = applications.some(a => a.candidateId === cand.id && a.jobId === selectedJob.id && a.stage !== 'new');

    return {
      candidate: cand,
      matchScore: baseScore,
      aiData: aiMatch,
      missingSkills,
      matchingSkills,
      isShortlisted
    };
  }).filter(item => item.matchScore >= minMatchScore);

  const sortedMatches = [...candidateMatches].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    return b.candidate.experienceYears - a.candidate.experienceYears;
  });

  const handleShortlist = (cand: Candidate) => {
    const existingApp = applications.find(a => a.candidateId === cand.id && a.jobId === selectedJob.id);
    if (existingApp) {
      advanceApplicationStage(existingApp.id, 'shortlisted');
    } else {
      createApplication({
        candidateId: cand.id,
        jobId: selectedJob.id,
        matchScore: candidateMatches.find(m => m.candidate.id === cand.id)?.matchScore ?? undefined
      });
    }
    alert(`Candidate ${cand.fullName} shortlisted for "${selectedJob.title}". Application status updated in Recruitment Pipeline.`);
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Advisory AI Candidate Matching"
    >
      {/* 1. TOP KPI STAT CARDS (EXACT MATCH TO REFERENCE IMAGE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <KPIStatCard
          label="OPEN JOBS"
          value={activeJobsCount}
          subtext="Active client reqs"
          variant="default"
          onClick={() => navigate('/recruiter/jobs')}
        />
        <KPIStatCard
          label="TALENT POOL"
          value={talentPoolCount}
          subtext="Consent verified"
          variant="default"
          onClick={() => navigate('/recruiter/candidates')}
        />
        <KPIStatCard
          label="IN PIPELINE"
          value={inPipelineCount}
          subtext="Active candidates"
          variant="default"
          onClick={() => navigate('/recruiter/pipeline')}
        />
        <KPIStatCard
          label="INTERVIEWS"
          value={scheduledInterviewsCount}
          subtext="Scheduled rounds"
          variant="default"
          onClick={() => navigate('/recruiter/interviews')}
        />
        <KPIStatCard
          label="PARTNER APPROVAL"
          value={pendingApprovalsCount}
          subtext="Pending signoff"
          variant={pendingApprovalsCount > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/recruiter/offers')}
        />
        <KPIStatCard
          label="CONFIRMED"
          value={confirmedPlacementsCount}
          subtext="Finalized hires"
          variant="success"
          onClick={() => navigate('/recruiter/offers')}
        />
      </div>

      {/* 2. TARGET REQUISITION SELECTOR BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-[#18221b]">Requisition Match Pool</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-[#18221b] whitespace-nowrap">
            Target Requisition:
          </label>
          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white font-semibold shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0082c0]/20 max-w-md truncate"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.employer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. ADVISORY DECISION SUPPORT NOTICE (MANDATORY PRD COMPLIANCE BANNER) */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 mb-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0082c0] shrink-0" />
        <p className="text-xs text-blue-950 leading-relaxed">
          <strong>Advisory Decision Support Only (PRD Section 4):</strong> AI match percentages provide recommendation ranking. Automated candidate rejections or stage dismissals without human recruiter review are strictly prohibited by system governance.
        </p>
      </div>

      {/* 3B. AI MATCHING ENGINE CONTROLLER */}
      <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0082c0]/10 flex items-center justify-center text-[#0082c0]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#18221b]">Google Gemini Advisory Matching</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                Object.keys(aiResults).length ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {Object.keys(aiResults).length ? 'AI scores shown' : 'Skill overlap only'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isAnalyzingAi}
            onClick={runAiMatching}
            className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingAi ? 'Analyzing...' : 'Run AI Matching'}</span>
          </button>
        </div>
      </div>

      {/* 4. ACTIVE REQUISITION SUMMARY CARD (AS IN REFERENCE IMAGE) */}
      {selectedJob && (
        <div className="p-5 rounded-2xl bg-white border border-[#e5ece6] shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0082c0] text-[10px] font-mono font-bold uppercase tracking-wider">
                {selectedJob.workMode} • {selectedJob.experienceRange}
              </span>
              <span className="text-xs text-[#8a998c] font-mono">
                Req ID: {selectedJob.id}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#18221b]">
              {selectedJob.title} at {selectedJob.employer}
            </h3>

            <p className="text-xs text-[#5e6d61]">
              {selectedJob.location} • Compensation: <strong className="text-[#18221b]">{selectedJob.salaryRange}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs text-[#5e6d61] font-mono">Required:</span>
            <div className="flex flex-wrap gap-1">
              {selectedJob.requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-[#f4f7f5] text-[11px] font-semibold text-[#18221b] border border-[#e5ece6]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MATCH FILTER & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#18221b]">
            Showing {sortedMatches.length} Candidate Matches
          </span>
          <span className="text-[#8a998c]">•</span>
          <label className="flex items-center gap-1.5 text-[#5e6d61]">
            <span>Min Match:</span>
            <select
              value={minMatchScore}
              onChange={e => setMinMatchScore(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-[#e5ece6] bg-white text-xs"
            >
              <option value={60}>60%+</option>
              <option value={70}>70%+</option>
              <option value={80}>80%+</option>
              <option value={90}>90%+</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5e6d61]">Sort by:</span>
          <button
            onClick={() => setSortBy('match')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              sortBy === 'match'
                ? 'bg-[#3d4a3e] text-white'
                : 'bg-white border border-[#e5ece6] text-[#3d4a3e]'
            }`}
          >
            Match Score
          </button>
          <button
            onClick={() => setSortBy('experience')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              sortBy === 'experience'
                ? 'bg-[#3d4a3e] text-white'
                : 'bg-white border border-[#e5ece6] text-[#3d4a3e]'
            }`}
          >
            Experience
          </button>
        </div>
      </div>

      {/* 6. CANDIDATE MATCH CARDS (EXACT MATCH TO REFERENCE IMAGE) */}
      <div className="space-y-4">
        {sortedMatches.map(({ candidate, matchScore, missingSkills, isShortlisted }) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            job={selectedJob}
            matchScore={matchScore}
            missingSkills={missingSkills}
            isShortlisted={isShortlisted}
            onShortlist={() => handleShortlist(candidate)}
            onCompare={() => {
              const other = candidates.find(c => c.id !== candidate.id) || candidate;
              setCompareModalCandidates({ c1: candidate, c2: other });
            }}
            onViewProfile={() => setSelectedCandidate(candidate)}
            onViewResume={() => setSelectedCandidate(candidate)}
          />
        ))}
      </div>

      {/* 7. CANDIDATE DETAIL DRAWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedCandidate(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#0082c0]/10 text-[#0082c0]">
                      {selectedCandidate.targetRole}
                    </span>
                    <h3 className="text-lg font-bold text-[#18221b] mt-1">{selectedCandidate.fullName}</h3>
                  </div>
                  <button onClick={() => setSelectedCandidate(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-[#5e6d61]" />
                  </button>
                </div>

                <div className="space-y-4 mt-5 text-xs">
                  {/* AI Analysis Card */}
                  {selectedCandidate && aiResults[selectedCandidate.id] && (
                    <div className="p-4 rounded-2xl bg-[#0082c0]/5 border border-[#0082c0]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-[#0082c0]">
                          <Sparkles className="w-4 h-4" />
                          <span>Gemini Advisory Scoring</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#0082c0] text-white">
                          {aiResults[selectedCandidate.id].overallScore ?? '—'}% Advisory Match
                        </span>
                      </div>

                      {/* Factor bars */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div>
                          <div className="flex justify-between text-[#5e6d61]">
                            <span>Skills Alignment:</span>
                            <span className="font-bold text-[#18221b]">{aiResults[selectedCandidate.id].factors.skillsAlignment ?? '—'}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-[#0e4d34] h-full" style={{ width: `${aiResults[selectedCandidate.id].factors.skillsAlignment ?? 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#5e6d61]">
                            <span>Experience Relevance:</span>
                            <span className="font-bold text-[#18221b]">{aiResults[selectedCandidate.id].factors.experienceRelevance ?? '—'}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-[#f27a24] h-full" style={{ width: `${aiResults[selectedCandidate.id].factors.experienceRelevance ?? 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#5e6d61]">
                            <span>Domain Fit:</span>
                            <span className="font-bold text-[#18221b]">{aiResults[selectedCandidate.id].factors.domainFit ?? '—'}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-[#0082c0] h-full" style={{ width: `${aiResults[selectedCandidate.id].factors.domainFit ?? 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[#5e6d61]">
                            <span>Growth Potential:</span>
                            <span className="font-bold text-[#18221b]">{aiResults[selectedCandidate.id].factors.growthPotential ?? '—'}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-[#00b8f9] h-full" style={{ width: `${aiResults[selectedCandidate.id].factors.growthPotential ?? 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* AI Advisory Reasoning */}
                      <div className="p-3 rounded-xl bg-white border border-[#e5ece6] text-[11px] text-[#3d4a3e] leading-relaxed">
                        <strong className="text-[#0082c0] block mb-0.5">AI Recruiter Recommendation:</strong>
                        {aiResults[selectedCandidate.id].advisoryReasoning}
                      </div>

                      {/* Strengths and Gaps */}
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="font-bold text-emerald-800">Matching Strengths:</span>
                          <ul className="list-disc list-inside text-[#3d4a3e] mt-0.5">
                            {aiResults[selectedCandidate.id].matchingStrengths.map((str, i) => (
                              <li key={i}>{str}</li>
                            ))}
                          </ul>
                        </div>
                        {aiResults[selectedCandidate.id].skillGaps.length > 0 && (
                          <div>
                            <span className="font-bold text-amber-800">Gap Analysis:</span>
                            <ul className="list-disc list-inside text-[#5e6d61] mt-0.5">
                              {aiResults[selectedCandidate.id].skillGaps.map((gap, i) => (
                                <li key={i}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-emerald-950">Candidate Consent Attested</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Policy version {selectedCandidate.consentPolicyVersion} executed by {selectedCandidate.partnerName}.
                    </p>
                  </div>

                  <div>
                    <span className="text-[#8a998c] block font-mono">Contact Coordinates</span>
                    <p className="text-[#18221b]">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                    <p className="text-[#5e6d61]">{selectedCandidate.location} • {selectedCandidate.education}</p>
                  </div>

                  <div>
                    <span className="text-[#8a998c] block font-mono mb-1.5">Parsed Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map(s => (
                        <span key={s} className="px-2 py-1 rounded-md bg-[#f4f7f5] text-xs font-semibold text-[#18221b] border border-[#e5ece6]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedCandidate.resumeText && (
                    <div>
                      <span className="text-[#8a998c] block font-mono">Raw Resume Content Extract</span>
                      <pre className="text-[11px] font-mono text-[#3d4a3e] p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] mt-1 overflow-x-auto max-h-48 whitespace-pre-wrap">
                        {selectedCandidate.resumeText}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5ece6] flex items-center justify-end">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#3d4a3e]"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. CANDIDATE COMPARISON MODAL */}
      {compareModalCandidates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e5ece6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6] mb-4">
              <h3 className="text-base font-bold text-[#18221b]">Side-by-Side Candidate Comparison</h3>
              <button onClick={() => setCompareModalCandidates(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#5e6d61]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                <h4 className="font-bold text-sm text-[#18221b] mb-1">{compareModalCandidates.c1.fullName}</h4>
                <p className="text-[#008236] font-semibold mb-3">{compareModalCandidates.c1.partnerName}</p>
                <div className="space-y-2">
                  <p><strong>Experience:</strong> {compareModalCandidates.c1.experienceYears} Years</p>
                  <p><strong>Education:</strong> {compareModalCandidates.c1.education}</p>
                  <div>
                    <span className="text-[#8a998c] block mb-1">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {compareModalCandidates.c1.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white border border-[#e5ece6] text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                <h4 className="font-bold text-sm text-[#18221b] mb-1">{compareModalCandidates.c2.fullName}</h4>
                <p className="text-[#008236] font-semibold mb-3">{compareModalCandidates.c2.partnerName}</p>
                <div className="space-y-2">
                  <p><strong>Experience:</strong> {compareModalCandidates.c2.experienceYears} Years</p>
                  <p><strong>Education:</strong> {compareModalCandidates.c2.education}</p>
                  <div>
                    <span className="text-[#8a998c] block mb-1">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {compareModalCandidates.c2.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white border border-[#e5ece6] text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e5ece6] mt-4 flex justify-end">
              <button
                onClick={() => setCompareModalCandidates(null)}
                className="px-4 py-2 rounded-xl bg-[#3d4a3e] text-white text-xs font-bold cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
};

