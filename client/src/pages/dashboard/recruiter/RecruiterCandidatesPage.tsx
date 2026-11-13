import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { Candidate } from '../../../types';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  FileText, 
  X, 
  Plus, 
  Eye, 
  Edit3, 
  UploadCloud,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const RecruiterCandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { candidates, updateCandidateProfile } = usePlatformData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partnerFilter, setPartnerFilter] = useState('all');

  // Selected candidate drawer
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [internalNotes, setInternalNotes] = useState('');

  // Active drawer tab: 'overview' | 'resume' | 'activity'
  const [drawerTab, setDrawerTab] = useState<'overview' | 'resume' | 'activity'>('overview');

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPartner = partnerFilter === 'all' || c.partnerId === partnerFilter;
    return matchesSearch && matchesStatus && matchesPartner;
  });

  const uniquePartners = Array.from(new Set(candidates.map(c => JSON.stringify({ id: c.partnerId, name: c.partnerName }))))
    .map(p => JSON.parse(p));

  const handleSaveNotes = () => {
    if (selectedCandidate) {
      updateCandidateProfile(selectedCandidate.id, { internalNotes });
      setSelectedCandidate({ ...selectedCandidate, internalNotes });
      alert('Internal staff notes saved and logged to audit trail.');
    }
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Candidate Directory"
    >
      {/* ACTION BAR & FILTERS */}
      <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a998c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, target role, or technical skills..."
              className="pl-9 pr-4 py-2 rounded-xl border border-[#e5ece6] text-xs bg-[#f9fbf9] w-full focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Pool</option>
            <option value="in_pipeline">In Pipeline</option>
            <option value="placed">Placed</option>
          </select>

          <select
            value={partnerFilter}
            onChange={e => setPartnerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white"
          >
            <option value="all">All Sourcing Partners</option>
            {uniquePartners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/recruiter/intake')}
            className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* CANDIDATE TABLE */}
      <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Target Role & Sourcing Partner</th>
                <th className="py-3 px-4">Consent Verification</th>
                <th className="py-3 px-4">Experience & Education</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ece6]">
              {filteredCandidates.map(c => (
                <tr key={c.id} className="hover:bg-[#f9fbf9]/80">
                  <td className="py-3.5 px-4 font-bold text-[#18221b]">
                    {c.fullName}
                    <div className="text-[11px] text-[#5e6d61] font-normal">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#18221b]">{c.targetRole}</div>
                    <div className="text-[11px] text-[#008236] font-medium">{c.partnerName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Policy {c.consentPolicyVersion}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#18221b]">{c.experienceYears} Years Exp</div>
                    <div className="text-[11px] text-[#5e6d61] max-w-xs truncate">{c.education}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-[#3d4a3e]">
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 3 && (
                        <span className="text-[10px] text-[#8a998c]">+{c.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f4f7f5] text-[#3d4a3e]">
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCandidate(c);
                        setInternalNotes(c.internalNotes || '');
                        setDrawerTab('overview');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f4f7f5] hover:bg-[#e5ece6] text-[#3d4a3e] font-bold text-[11px] cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANDIDATE DETAIL DRAWER (PROPER RECORD TABS: OVERVIEW, RESUME, ACTIVITY) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedCandidate(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Drawer Header */}
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

                {/* RECORD TABS (TABS PROPERLY USED WITHIN A SINGLE RECORD) */}
                <div className="flex items-center gap-2 border-b border-[#e5ece6] py-3 text-xs font-semibold">
                  {(['overview', 'resume', 'activity'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setDrawerTab(tab)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                        drawerTab === tab
                          ? 'bg-[#3d4a3e] text-white'
                          : 'text-[#5e6d61] hover:bg-gray-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TAB 1: OVERVIEW */}
                {drawerTab === 'overview' && (
                  <div className="space-y-4 mt-4 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span className="font-bold text-emerald-950">Verified Consent Record</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Executed under policy {selectedCandidate.consentPolicyVersion} by {selectedCandidate.partnerName} on {new Date(selectedCandidate.consentTimestamp).toLocaleDateString()}.
                      </p>
                    </div>

                    <div>
                      <span className="text-[#8a998c] block font-mono">Contact Coordinates</span>
                      <p className="text-[#18221b]">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                      <p className="text-[#5e6d61]">{selectedCandidate.location} • {selectedCandidate.education}</p>
                    </div>

                    <div>
                      <span className="text-[#8a998c] block font-mono mb-1.5">Parsed Technical Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.skills.map(s => (
                          <span key={s} className="px-2 py-1 rounded-md bg-[#f4f7f5] text-xs font-semibold text-[#18221b] border border-[#e5ece6]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#8a998c] font-mono mb-1">Private Recruiter Staff Notes</label>
                      <textarea
                        rows={3}
                        value={internalNotes}
                        onChange={e => setInternalNotes(e.target.value)}
                        placeholder="Add private staff observation..."
                        className="w-full p-2.5 rounded-xl border border-[#e5ece6] text-xs"
                      />
                      <button
                        onClick={handleSaveNotes}
                        className="mt-1.5 px-3 py-1.5 rounded-lg bg-[#3d4a3e] hover:bg-[#283229] text-white text-xs font-bold cursor-pointer"
                      >
                        Save Internal Note
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: RESUME EXTRACT */}
                {drawerTab === 'resume' && (
                  <div className="mt-4 text-xs">
                    <span className="text-[#8a998c] block font-mono mb-2">Raw Resume Content Extract</span>
                    <pre className="text-[11px] font-mono text-[#3d4a3e] p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] overflow-x-auto max-h-96 whitespace-pre-wrap">
                      {selectedCandidate.resumeText || 'No raw extract available.'}
                    </pre>
                  </div>
                )}

                {/* TAB 3: ACTIVITY HISTORY */}
                {drawerTab === 'activity' && (
                  <div className="mt-4 text-xs space-y-2.5">
                    <span className="text-[#8a998c] block font-mono mb-1">Recruitment Timeline</span>
                    <div className="p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                      <span className="font-mono text-[10px] text-[#8a998c] block">
                        {new Date(selectedCandidate.submittedAt).toLocaleDateString()}
                      </span>
                      <p className="font-semibold text-[#18221b]">Profile Sourced by {selectedCandidate.partnerName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#e5ece6] flex items-center justify-end">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#3d4a3e]"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

