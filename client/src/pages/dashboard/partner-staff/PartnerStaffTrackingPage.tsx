import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle2 
} from 'lucide-react';

export const PartnerStaffTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { applications, organizations } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgApplications = applications.filter(a => a.partnerId === myOrg?.id);

  const totalInPipeline = orgApplications.length;
  const interviewingCount = orgApplications.filter(a => a.stage === 'interviewing').length;
  const offerCount = orgApplications.filter(a => ['offer_pending', 'partner_approval_pending', 'offer_communicated', 'candidate_accepted'].includes(a.stage)).length;
  const placedCount = orgApplications.filter(a => a.stage === 'placement_confirmed').length;

  const filteredApps = orgApplications.filter(a => {
    const matchesSearch = 
      a.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <AppShell
      activeRole="partner_staff"
      title="Application & Progress Tracking"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="In Active Pipeline"
            value={totalInPipeline}
            subtext="Candidates in progress"
            variant="default"
          />
          <KPIStatCard
            label="Active Interviews"
            value={interviewingCount}
            subtext="With hiring employers"
            variant="info"
          />
          <KPIStatCard
            label="In Offer Stages"
            value={offerCount}
            subtext="Compensation negotiation"
            variant="warning"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={placedCount}
            subtext="Successfully hired"
            variant="success"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, role, or client employer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5e6d61]" />
            <span className="text-xs font-mono text-[#5e6d61]">Filter:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="placement_confirmed">Placement Confirmed</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role & Employer</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Candidate Response</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#18221b]">
                      {app.candidateName}
                    </td>

                    <td className="py-3 px-4 text-[#5e6d61]">
                      <div className="font-semibold text-[#18221b]">{app.jobTitle}</div>
                      <div className="text-[11px] text-[#8a998c]">{app.employer}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        app.stage === 'placement_confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.stage.includes('offer')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-[#3d4a3e]'
                      }`}>
                        {app.stage.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        app.candidateResponse === 'accepted'
                          ? 'bg-emerald-50 text-[#008236]'
                          : app.candidateResponse === 'declined'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.candidateResponse || 'pending'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {app.stage === 'placement_confirmed' ? (
                        <span className="font-mono text-xs font-bold text-[#008236] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hired</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-[#5e6d61]">Active in Funnel</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PartnerStaffTrackingPage;
