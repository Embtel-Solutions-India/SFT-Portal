import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Candidate } from '../../../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Building2, 
  Eye, 
  X 
} from 'lucide-react';

export const AdminCandidatesPage: React.FC = () => {
  const { candidates, organizations } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const totalCandidates = candidates.length;
  const verifiedConsent = candidates.filter(c => c.consentState === 'verified').length;
  const activeReview = candidates.filter(c => c.status === 'draft').length;

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = 
      cand.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPartner = partnerFilter === 'all' || cand.partnerId === partnerFilter;
    return matchesSearch && matchesPartner;
  });

  return (
    <AppShell
      activeRole="platform_admin"
      title="Global Candidate Pool & Talent Directory"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Platform Pool"
            value={totalCandidates}
            subtext="Candidate records"
            variant="default"
          />
          <KPIStatCard
            label="Consent Verified"
            value={verifiedConsent}
            subtext="Institutional attestation"
            variant="success"
          />
          <KPIStatCard
            label="Profiles In Draft"
            value={activeReview}
            subtext="Needs confirmation"
            variant={activeReview > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Active Partners Sourcing"
            value={organizations.filter(o => o.status === 'approved').length}
            subtext="Supplying talent"
            variant="default"
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, role, skills, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5e6d61]" />
            <span className="text-xs font-mono text-[#5e6d61]">Sourcing Partner:</span>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Partner Institutions</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate Pool Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate Profile</th>
                  <th className="py-3 px-4">Sourcing Partner</th>
                  <th className="py-3 px-4">Experience & Location</th>
                  <th className="py-3 px-4">Technical Stack Fit</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredCandidates.map(cand => (
                  <tr key={cand.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#18221b]">
                      <div className="text-sm">{cand.fullName}</div>
                      <div className="text-[11px] text-[#5e6d61] font-normal">{cand.targetRole}</div>
                    </td>

                    <td className="py-3 px-4 text-[#0082c0] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{cand.partnerName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#3d4a3e]">
                      <div>{cand.experienceYears} yrs experience</div>
                      <div className="text-[11px] text-[#8a998c]">{cand.location}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded bg-[#f4f7f5] text-[10px] font-mono text-[#3d4a3e]">
                            {skill}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="text-[10px] text-[#8a998c] font-mono">
                            +{cand.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cand.consentState === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cand.consentState === 'verified' ? 'Consent Verified' : 'Pending Attestation'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        className="p-1.5 rounded-lg border border-[#e5ece6] hover:bg-gray-100 text-[#5e6d61] cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Detail Drawer */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                  <div>
                    <h3 className="text-base font-bold text-[#18221b]">{selectedCandidate.fullName}</h3>
                    <p className="text-xs text-[#5e6d61]">{selectedCandidate.targetRole} • Sourced by {selectedCandidate.partnerName}</p>
                  </div>
                  <button onClick={() => setSelectedCandidate(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-[#5e6d61]" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] space-y-2">
                    <span className="font-bold text-[#18221b] block">Contact & Location</span>
                    <div>Email: <strong className="text-[#18221b]">{selectedCandidate.email}</strong></div>
                    <div>Phone: <strong className="text-[#18221b]">{selectedCandidate.phone}</strong></div>
                    <div>Location: <strong className="text-[#18221b]">{selectedCandidate.location}</strong></div>
                    <div>Experience: <strong className="text-[#18221b]">{selectedCandidate.experienceYears} years</strong></div>
                  </div>

                  <div>
                    <span className="font-bold text-[#18221b] block mb-2">Technical Capabilities</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-[#008236]/10 text-[#008236] font-mono text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedCandidate.education && (
                    <div className="p-3 rounded-xl border border-[#e5ece6] bg-[#f9fbf9]">
                      <span className="font-bold text-[#18221b] block mb-1">Academic Pedigree</span>
                      <p className="text-[#5e6d61]">{selectedCandidate.education}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5ece6]">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#18221b]"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminCandidatesPage;
