import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

const BAR_PALETTE = [
  '#f27a24', // Warm Vibrant Orange (from reference image)
  '#0e4d34', // Deep Forest Green (from reference image)
  '#0082c0', // Professional Blue
  '#00b8f9', // Bright Cyan
  '#f59e0b', // Amber Ochre
  '#10b981', // Emerald Mint
  '#7c3aed'  // Purple Indigo
];
import { 
  Sparkles, 
  Briefcase, 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  Plus, 
  Sliders,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';

export const RecruiterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, candidates, applications, interviews, offers } = usePlatformData();

  const activeJobs = jobs.filter(j => j.status === 'active');
  const scheduledInterviews = interviews.filter(i => i.attendance === 'scheduled');
  const pendingApprovals = offers.filter(o => o.partnerApprovalStatus === 'pending');
  const confirmedPlacements = offers.filter(o => o.status === 'confirmed');

  const pipelineFunnelData = [
    { stage: 'Shortlisted', count: applications.filter(a => ['shortlisted', 'opportunity_communicated', 'candidate_responded'].includes(a.stage)).length },
    { stage: 'Interviewing', count: applications.filter(a => a.stage === 'interviewing').length },
    { stage: 'Offer Pending', count: applications.filter(a => ['offer_pending', 'offer_communicated'].includes(a.stage)).length },
    { stage: 'Partner Approval', count: pendingApprovals.length },
    { stage: 'Confirmed', count: confirmedPlacements.length }
  ];

  return (
    <AppShell
      activeRole="recruiter"
      title="Placement Operations Dashboard"
    >
      {/* TOP KPI STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <KPIStatCard
          label="OPEN JOBS"
          value={activeJobs.length}
          subtext="Active client reqs"
          onClick={() => navigate('/recruiter/jobs')}
        />
        <KPIStatCard
          label="TALENT POOL"
          value={candidates.length}
          subtext="Consent verified"
          onClick={() => navigate('/recruiter/candidates')}
        />
        <KPIStatCard
          label="IN PIPELINE"
          value={applications.length}
          subtext="Active candidates"
          onClick={() => navigate('/recruiter/pipeline')}
        />
        <KPIStatCard
          label="INTERVIEWS"
          value={scheduledInterviews.length}
          subtext="Scheduled rounds"
          onClick={() => navigate('/recruiter/interviews')}
        />
        <KPIStatCard
          label="PARTNER APPROVAL"
          value={pendingApprovals.length}
          subtext="Pending signoff"
          variant={pendingApprovals.length > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/recruiter/offers')}
        />
        <KPIStatCard
          label="CONFIRMED"
          value={confirmedPlacements.length}
          subtext="Finalized hires"
          variant="success"
          onClick={() => navigate('/recruiter/offers')}
        />
      </div>

      {/* CHARTS & RECRUITER ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recruitment Conversion Funnel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#18221b]">Candidate Pipeline Conversion Funnel</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#0082c0] bg-blue-50 px-2.5 py-1 rounded-lg">
              Active Lifecycle
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineFunnelData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#8a998c" fontSize={11} />
                <YAxis dataKey="stage" type="category" stroke="#8a998c" fontSize={11} width={115} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Candidates in Milestone">
                  {pipelineFunnelData.map((entry, index) => (
                    <Cell key={`funnel-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#18221b] mb-4">Recruiter Priority Tasks</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/recruiter/matching')}
                className="w-full p-3 rounded-xl bg-[#0082c0]/10 hover:bg-[#0082c0]/20 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-[#0082c0]" />
                  <div>
                    <p className="text-xs font-bold text-[#18221b]">Run AI Matching</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#0082c0]" />
              </button>

              <button
                onClick={() => navigate('/recruiter/offers')}
                className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-left transition-colors flex items-center justify-between cursor-pointer border border-amber-200/60"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">Follow Up Partner Approvals</p>
                    <p className="text-[10px] text-amber-700">{pendingApprovals.length} offers awaiting institution signoff</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </button>

              <button
                onClick={() => navigate('/recruiter/jobs')}
                className="w-full p-3 rounded-xl bg-[#008236]/10 hover:bg-[#008236]/20 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-[#008236]" />
                  <div>
                    <p className="text-xs font-bold text-[#18221b]">Post Job Requisition</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#008236]" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5ece6] mt-4">
            <div className="p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-[#18221b]">Advisory Matching Active</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">PRD COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE REQUISITIONS TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#18221b]">Active Client Opportunities</h3>
          </div>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="text-xs font-bold text-[#0082c0] hover:underline"
          >
            Manage All Requisitions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
              <tr>
                <th className="py-2.5 px-4">Title & Employer</th>
                <th className="py-2.5 px-4">Work Mode</th>
                <th className="py-2.5 px-4">Experience & Salary</th>
                <th className="py-2.5 px-4">Required Stack</th>
                <th className="py-2.5 px-4">In Pipeline</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ece6]">
              {activeJobs.map(j => (
                <tr key={j.id} className="hover:bg-[#f9fbf9]/80">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#18221b]">{j.title}</div>
                    <div className="text-[11px] text-[#5e6d61]">{j.employer}</div>
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[10px] text-[#0082c0]">
                    {j.workMode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#18221b]">{j.salaryRange}</div>
                    <div className="text-[10px] text-[#5e6d61]">{j.experienceRange}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {j.requiredSkills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-[#3d4a3e]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#18221b]">
                    {j.applicantsCount} candidates
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate('/recruiter/matching')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0082c0] hover:bg-[#006e9f] text-white text-[11px] font-bold cursor-pointer"
                    >
                      Match Pool
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

