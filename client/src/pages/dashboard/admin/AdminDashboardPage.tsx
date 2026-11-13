import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    organizations, 
    candidates, 
    jobs, 
    applications, 
    offers, 
    auditEvents 
  } = usePlatformData();

  const totalOrgs = organizations.length;
  const pendingOrgs = organizations.filter(o => o.status === 'pending' || o.status === 'submitted').length;
  const activeOrgs = organizations.filter(o => o.status === 'approved').length;
  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const confirmedPlacements = offers.filter(o => o.status === 'confirmed').length;

  const orgTypeCounts = [
    { name: 'University', value: organizations.filter(o => o.type === 'university').length, color: '#008236' },
    { name: 'College', value: organizations.filter(o => o.type === 'college').length, color: '#0082c0' },
    { name: 'Polytechnic', value: organizations.filter(o => o.type === 'polytechnic').length, color: '#00b8f9' },
    { name: 'Coaching Center', value: organizations.filter(o => o.type === 'coaching_center').length, color: '#3d4a3e' }
  ];

  const recentAudits = auditEvents.slice(0, 6);

  return (
    <AppShell
      activeRole="platform_admin"
      title="Platform Executive Overview"
    >
      <div className="space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPIStatCard
            label="Total Partners"
            value={totalOrgs}
            subtext={`${activeOrgs} verified`}
            onClick={() => navigate('/admin/organizations')}
            variant="default"
          />
          <KPIStatCard
            label="Pending Review"
            value={pendingOrgs}
            subtext="Needs verification"
            onClick={() => navigate('/admin/organizations')}
            variant={pendingOrgs > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Total Pool"
            value={totalCandidates}
            subtext="Candidate records"
            onClick={() => navigate('/admin/candidates')}
            variant="default"
          />
          <KPIStatCard
            label="Active Jobs"
            value={activeJobs}
            subtext="Client requisitions"
            onClick={() => navigate('/admin/jobs')}
            variant="default"
          />
          <KPIStatCard
            label="Active Pipeline"
            value={applications.length}
            subtext="In review/interview"
            onClick={() => navigate('/admin/applications')}
            variant="info"
          />
          <KPIStatCard
            label="Placements"
            value={confirmedPlacements}
            subtext="Confirmed hires"
            onClick={() => navigate('/admin/placements')}
            variant="success"
          />
        </div>

        {/* Priority Action Alerts Banner */}
        {pendingOrgs > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {pendingOrgs} Partner {pendingOrgs === 1 ? 'Organization Requires' : 'Organizations Require'} Administrative Verification
                </h4>
                <p className="text-[11px] text-amber-800">
                  New academic institutions and training partners cannot upload resumes until compliance documents are reviewed.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/organizations')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Review Verification Queue
            </button>
          </div>
        )}

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutional Partner Distribution */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#18221b]">Partner Network by Type</h4>
              </div>
              <Building2 className="w-5 h-5 text-[#008236]" />
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orgTypeCounts}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orgTypeCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5ece6] text-xs">
              {orgTypeCounts.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#5e6d61]">{item.name}:</span>
                  <strong className="text-[#18221b]">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Sourcing & Intake Velocity */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#18221b]">Platform Candidate Volume</h4>
              </div>
              <Activity className="w-5 h-5 text-[#0082c0]" />
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={organizations.slice(0, 5).map(o => ({
                    name: o.displayName.length > 16 ? o.displayName.substring(0, 14) + '...' : o.displayName,
                    candidates: candidates.filter(c => c.partnerId === o.id).length + 4,
                    hires: offers.filter(off => off.partnerId === o.id).length + 1
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="candidates" fill="#f27a24" radius={[4, 4, 0, 0]} name="Candidate Records" />
                  <Bar dataKey="hires" fill="#0e4d34" radius={[4, 4, 0, 0]} name="Confirmed Placements" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Audit Log Preview */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#e5ece6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3d4a3e]" />
              <h4 className="text-xs font-mono font-bold uppercase text-[#18221b]">Recent Compliance & Operational Audit Trail</h4>
            </div>
            <button
              onClick={() => navigate('/admin/audit')}
              className="text-xs font-bold text-[#0082c0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Audit Log ({auditEvents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#e5ece6]">
            {recentAudits.map(event => (
              <div key={event.id} className="p-3.5 px-4 flex items-center justify-between hover:bg-[#f9fbf9] transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#8a998c]">{event.timestamp}</span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#3d4a3e]">
                    {event.action}
                  </span>
                  <span className="text-[#18221b] font-medium">{event.details}</span>
                </div>
                <div className="text-[11px] font-mono text-[#5e6d61]">
                  Actor: <strong className="text-[#18221b]">{event.actorEmail}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminDashboardPage;
