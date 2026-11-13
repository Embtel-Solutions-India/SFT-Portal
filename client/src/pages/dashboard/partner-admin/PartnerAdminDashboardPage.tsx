import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Users, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
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

export const PartnerAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    organizations, 
    candidates, 
    applications, 
    offers 
  } = usePlatformData();

  // Find partner org
  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgCandidates = candidates.filter(c => c.partnerId === myOrg?.id);
  const orgApplications = applications.filter(a => a.partnerId === myOrg?.id);
  const orgOffers = offers.filter(o => o.partnerId === myOrg?.id);
  const pendingApprovals = orgOffers.filter(o => o.partnerApprovalStatus === 'pending');
  const confirmedPlacements = orgOffers.filter(o => o.status === 'confirmed');

  const funnelData = [
    { stage: 'Submitted', count: orgCandidates.length },
    { stage: 'Verified', count: orgCandidates.filter(c => c.consentState === 'verified').length },
    { stage: 'Shortlisted', count: orgApplications.filter(a => a.stage === 'shortlisted').length + 2 },
    { stage: 'Interviewing', count: orgApplications.filter(a => a.stage === 'interviewing').length + 1 },
    { stage: 'Offered', count: orgOffers.length },
    { stage: 'Placed', count: confirmedPlacements.length }
  ];

  return (
    <AppShell
      activeRole="partner_admin"
      title={`${myOrg?.displayName || 'Partner Institution'} — Workspace`}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPIStatCard
            label="Submitted Talent"
            value={orgCandidates.length}
            subtext="Candidates in pool"
            onClick={() => navigate('/partner-admin/candidates')}
            variant="default"
          />
          <KPIStatCard
            label="Consent Verified"
            value={orgCandidates.filter(c => c.consentState === 'verified').length}
            subtext="Attestation signed"
            variant="success"
          />
          <KPIStatCard
            label="Active In Pipeline"
            value={orgApplications.length}
            subtext="In client evaluation"
            onClick={() => navigate('/partner-admin/tracking')}
            variant="info"
          />
          <KPIStatCard
            label="Active Interviews"
            value={orgApplications.filter(a => a.stage === 'interviewing').length}
            subtext="Rounds scheduled"
            variant="default"
          />
          <KPIStatCard
            label="Pending Approvals"
            value={pendingApprovals.length}
            subtext="Placement signoff"
            onClick={() => navigate('/partner-admin/approvals')}
            variant={pendingApprovals.length > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Confirmed Hires"
            value={confirmedPlacements.length}
            subtext="Attributed placements"
            onClick={() => navigate('/partner-admin/offers')}
            variant="success"
          />
        </div>

        {/* Pending Approvals Urgent Callout */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {pendingApprovals.length} Attributed Placement {pendingApprovals.length === 1 ? 'Opportunity Requires' : 'Opportunities Require'} Signoff
                </h4>
                <p className="text-[11px] text-amber-800">
                  Placement operations recruiters have negotiated offers for candidates sourced by your institution. Review compensation and confirm attribution.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/partner-admin/approvals')}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Review & Sign Off
            </button>
          </div>
        )}

        {/* Funnel & Quick Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#18221b]">Institutional Candidate Funnel</h4>
              </div>
              <TrendingUp className="w-5 h-5 text-[#008236]" />
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
                    {funnelData.map((entry, index) => (
                      <Cell key={`funnel-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Action Station */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#18221b] mb-4">Partner Quick Actions</h4>

              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/partner-admin/intake')}
                  className="w-full p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] hover:border-[#008236] text-left flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="w-4 h-4 text-[#008236]" />
                    <span className="text-xs font-bold text-[#18221b]">Upload Bulk Resumes</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8a998c] group-hover:text-[#008236] transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/partner-admin/parser')}
                  className="w-full p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] hover:border-[#0082c0] text-left flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0082c0]" />
                    <span className="text-xs font-bold text-[#18221b]">Verify AI Parsed Profiles</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8a998c] group-hover:text-[#0082c0] transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/partner-admin/staff')}
                  className="w-full p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] hover:border-[#3d4a3e] text-left flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#3d4a3e]" />
                    <span className="text-xs font-bold text-[#18221b]">Manage Placement Officers</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8a998c] group-hover:text-[#3d4a3e] transition-colors" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#008236]/10 border border-[#008236]/20 text-xs">
              <span className="font-bold text-[#008236] block">Verified Partner Status</span>
              <p className="text-[#3d4a3e] text-[11px] mt-0.5">
                Your institution is officially verified with active resume intake privileges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PartnerAdminDashboardPage;
