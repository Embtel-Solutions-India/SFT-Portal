import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Check 
} from 'lucide-react';

export const PartnerStaffParserPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    organizations, 
    candidates, 
    updateCandidateProfile 
  } = usePlatformData();

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgCandidates = candidates.filter(c => c.partnerId === myOrg?.id);
  const pendingReview = orgCandidates.filter(c => c.status === 'draft');

  const [selectedCandidate, setSelectedCandidate] = useState(pendingReview[0] || orgCandidates[0] || null);
  const [editedName, setEditedName] = useState(selectedCandidate?.fullName || '');
  const [editedTitle, setEditedTitle] = useState(selectedCandidate?.targetRole || '');
  const [editedSkills, setEditedSkills] = useState(selectedCandidate?.skills.join(', ') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelect = (cand: any) => {
    setSelectedCandidate(cand);
    setEditedName(cand.fullName);
    setEditedTitle(cand.targetRole);
    setEditedSkills(cand.skills.join(', '));
  };

  const handleVerifyCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    updateCandidateProfile(selectedCandidate.id, {
      fullName: editedName,
      targetRole: editedTitle,
      skills: editedSkills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'confirmed',
      consentState: 'verified'
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <AppShell
      activeRole="partner_staff"
      title="OCR Parse Review Queue"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="In Review Queue"
            value={pendingReview.length}
            subtext="Needs verification"
            variant={pendingReview.length > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Verified Profiles"
            value={orgCandidates.filter(c => c.status === 'confirmed').length}
            subtext="Available for jobs"
            variant="success"
          />
          <KPIStatCard
            label="Total Submitted Pool"
            value={orgCandidates.length}
            subtext="Organization candidates"
            variant="default"
          />
          <KPIStatCard
            label="OCR Extraction Precision"
            value="94.2%"
            subtext="Field accuracy rate"
            variant="default"
          />
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#008236] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Candidate verified and approved for placement matching!</span>
          </div>
        )}

        {/* Side-by-Side Review Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Selection List */}
          <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-[#5e6d61] mb-2 px-2">Queue Records</h4>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {orgCandidates.map(cand => (
                <button
                  key={cand.id}
                  onClick={() => handleSelect(cand)}
                  className={`w-full p-3 rounded-xl text-left transition-colors cursor-pointer flex flex-col gap-1 border ${
                    selectedCandidate?.id === cand.id
                      ? 'border-[#008236] bg-[#008236]/10 text-[#008236]'
                      : 'border-[#e5ece6] hover:bg-[#f9fbf9] text-[#18221b]'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{cand.fullName}</span>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-[#3d4a3e]">
                      {cand.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5e6d61] truncate">{cand.targetRole}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Verification Panel */}
          {selectedCandidate ? (
            <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#008236]" />
                  <div>
                    <h3 className="text-base font-bold text-[#18221b]">Verify Candidate OCR Extraction</h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#008236] px-2.5 py-1 rounded-xl bg-[#008236]/10">
                  Confidence: 94%
                </span>
              </div>

              <form onSubmit={handleVerifyCandidate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Candidate Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Primary Job Title / Discipline *</label>
                    <input
                      type="text"
                      required
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Extracted Technical Skills (Comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={editedSkills}
                    onChange={(e) => setEditedSkills(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] text-xs space-y-1.5 font-mono">
                  <div className="text-[#8a998c]">Read-Only Contact Information:</div>
                  <div>Email: <strong className="text-[#18221b]">{selectedCandidate.email}</strong></div>
                  <div>Phone: <strong className="text-[#18221b]">{selectedCandidate.phone}</strong></div>
                  <div>Location: <strong className="text-[#18221b]">{selectedCandidate.location}</strong></div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ece6]">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify Candidate</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e5ece6] lg:col-span-2">
              <FileText className="w-8 h-8 text-[#8a998c] mx-auto mb-2" />
              <p className="text-xs text-[#5e6d61]">Select a candidate to review OCR extraction</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default PartnerStaffParserPage;
