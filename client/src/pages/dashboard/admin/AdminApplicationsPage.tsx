import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Application, ApplicationStage } from '../../../types';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const { applications, advanceApplicationStage } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const totalApps = applications.length;
  const interviewingCount = applications.filter(a => a.stage === 'interviewing').length;
  const offerCount = applications.filter(a => ['offer_pending', 'partner_approval_pending', 'offer_communicated', 'candidate_accepted'].includes(a.stage)).length;
  const placedCount = applications.filter(a => a.stage === 'placement_confirmed').length;

  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      a.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const nextStageMap: Record<ApplicationStage, ApplicationStage | null> = {
    new: 'match_review',
    match_review: 'shortlisted',
    shortlisted: 'opportunity_communicated',
    opportunity_communicated: 'candidate_responded',
    candidate_responded: 'interviewing',
    interviewing: 'offer_pending',
    offer_pending: 'partner_approval_pending',
    partner_approval_pending: 'offer_communicated',
    offer_communicated: 'candidate_accepted',
    candidate_accepted: 'placement_confirmed',
    placement_confirmed: null,
    candidate_declined: null,
    partner_rejected: null,
    employer_rejected: null,
    withdrawn: null,
    on_hold: null,
    job_closed: null,
    offer_declined: null
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Global Pipeline & Applications"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Active Inquiries"
            value={totalApps}
            subtext="Candidates in process"
            variant="default"
          />
          <KPIStatCard
            label="In Active Interviews"
            value={interviewingCount}
            subtext="Under evaluation"
            variant="info"
          />
          <KPIStatCard
            label="In Offer Process"
            value={offerCount}
            subtext="Terms drafted/accepted"
            variant="warning"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={placedCount}
            subtext="Attributed institutional hires"
            variant="success"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, role, partner, or employer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5e6d61]" />
            <span className="text-xs font-mono text-[#5e6d61]">Filter Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Pipeline Stages</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer_pending">Offer Pending</option>
              <option value="partner_approval_pending">Partner Approval Pending</option>
              <option value="candidate_accepted">Candidate Accepted</option>
              <option value="placement_confirmed">Placement Confirmed</option>
            </select>
          </div>
        </div>

        {/* Global Applications Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Requisition & Client</th>
                  <th className="py-3 px-4">Sourcing Partner</th>
                  <th className="py-3 px-4">Current Milestone</th>
                  <th className="py-3 px-4">Candidate Consent</th>
                  <th className="py-3 px-4 text-right">Administrative Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredApps.map(app => {
                  const nextStage = nextStageMap[app.stage];
                  return (
                    <tr key={app.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#18221b]">
                        {app.candidateName}
                      </td>

                      <td className="py-3 px-4 text-[#5e6d61]">
                        <div className="font-semibold text-[#18221b]">{app.jobTitle}</div>
                        <div className="text-[11px] text-[#8a998c]">{app.employer}</div>
                      </td>

                      <td className="py-3 px-4 text-[#0082c0] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{app.partnerName}</span>
                        </div>
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
                          {app.candidateResponse || 'pending response'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {nextStage ? (
                          <button
                            onClick={() => advanceApplicationStage(app.id, nextStage)}
                            className="px-2.5 py-1 rounded-lg bg-[#3d4a3e] hover:bg-[#2e372e] text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Advance to {nextStage.replace(/_/g, ' ')}
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-[#008236] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Placed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminApplicationsPage;
