import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { Offer } from '../../../types';
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  X, 
  AlertTriangle 
} from 'lucide-react';

export const RecruiterOffersPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    offers, 
    applications, 
    createOffer, 
    updateOfferResponse, 
    requestPartnerApproval, 
    waivePartnerApproval,
    confirmPlacement 
  } = usePlatformData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'accepted' | 'confirmed'>('all');
  const [createOfferModalOpen, setCreateOfferModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [compensation, setCompensation] = useState('$165,000 / year + equity');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [notes, setNotes] = useState('Satisfactory background verification and degree conferral.');

  // Waiver Modal State
  const [waiverOfferId, setWaiverOfferId] = useState<string | null>(null);
  const [waiverReason, setWaiverReason] = useState('');

  const totalOffers = offers.length;
  const confirmedPlacements = offers.filter(o => o.status === 'confirmed').length;
  const pendingApprovals = offers.filter(o => o.partnerApprovalStatus === 'pending').length;
  const candidateAccepted = offers.filter(o => o.candidateResponse === 'accepted').length;

  const filteredOffers = offers.filter(item => {
    const matchesSearch = 
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find(a => a.id === selectedAppId);
    if (!app) return;

    createOffer({
      applicationId: app.id,
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      employer: app.employer,
      partnerId: app.partnerId,
      partnerName: app.partnerName,
      version: '1.0',
      compensation,
      startDate,
      notes,
      candidateResponse: 'pending',
      partnerApprovalStatus: 'pending'
    });

    setCreateOfferModalOpen(false);
    setSelectedAppId('');
  };

  const handleWaiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverOfferId || !waiverReason.trim()) return;

    waivePartnerApproval(waiverOfferId, waiverReason, user?.name || 'Recruiter Lead');
    setWaiverOfferId(null);
    setWaiverReason('');
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Offers & Placement Governance"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Offers"
            value={totalOffers}
            subtext="Formal packages drafted"
            variant="default"
          />
          <KPIStatCard
            label="Candidate Accepted"
            value={candidateAccepted}
            subtext="Signed by candidate"
            variant="default"
          />
          <KPIStatCard
            label="Partner Signoff Pending"
            value={pendingApprovals}
            subtext="Awaiting partner consent"
            variant="warning"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={confirmedPlacements}
            subtext="Attributed & finalized"
            variant="success"
          />
        </div>

        {/* Action & Filter Bar */}
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(['all', 'issued', 'accepted', 'confirmed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    statusFilter === tab
                      ? 'bg-[#008236] text-white'
                      : 'bg-[#f4f7f5] text-[#5e6d61] hover:bg-[#e5ece6]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (applications.length > 0) setSelectedAppId(applications[0].id);
                setCreateOfferModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Prepare Offer</span>
            </button>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map(offer => (
            <div 
              key={offer.id} 
              className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#008236]/40 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[#0082c0]/10 text-[#0082c0]">
                    Offer {offer.version}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    offer.status === 'confirmed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : offer.status === 'accepted' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {offer.status}
                  </span>
                  <span className="text-[11px] font-mono text-[#8a998c]">
                    Issued: {offer.createdAt}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#18221b]">{offer.candidateName}</h4>
                <p className="text-xs text-[#5e6d61]">
                  <strong>{offer.jobTitle}</strong> at {offer.employer} • Sourced by <strong>{offer.partnerName}</strong>
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 max-w-lg">
                  <div className="p-2.5 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                    <span className="text-[#8a998c] block font-mono">Compensation</span>
                    <strong className="text-[#18221b]">{offer.compensation}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                    <span className="text-[#8a998c] block font-mono">Start Date</span>
                    <strong className="text-[#18221b]">{offer.startDate}</strong>
                  </div>
                </div>

                {/* Governance Status */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <span className="text-[#5e6d61]">Candidate Response:</span>
                  <span className={`font-bold font-mono uppercase ${offer.candidateResponse === 'accepted' ? 'text-[#008236]' : 'text-amber-700'}`}>
                    {offer.candidateResponse}
                  </span>

                  <span className="text-[#8a998c]">•</span>

                  <span className="text-[#5e6d61]">Partner Institutional Signoff:</span>
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    offer.partnerApprovalStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : offer.partnerApprovalStatus === 'waived'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {offer.partnerApprovalStatus.toUpperCase()}
                  </span>
                </div>

                {offer.waiverReason && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-mono">
                    <strong>Audited Exception:</strong> {offer.waiverReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-end">
                {offer.candidateResponse === 'pending' && (
                  <button
                    onClick={() => updateOfferResponse(offer.id, 'accepted')}
                    className="px-3.5 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Mark Candidate Accepted
                  </button>
                )}

                {offer.partnerApprovalStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => requestPartnerApproval(offer.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#0082c0] hover:bg-[#006e9f] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Remind Partner Admin
                    </button>
                    <button
                      onClick={() => setWaiverOfferId(offer.id)}
                      className="px-3.5 py-2 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Record Audited Waiver
                    </button>
                  </>
                )}

                {offer.status !== 'confirmed' && (offer.partnerApprovalStatus === 'approved' || offer.partnerApprovalStatus === 'waived') && (
                  <button
                    onClick={() => confirmPlacement(offer.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Final Placement</span>
                  </button>
                )}

                {offer.status === 'confirmed' && (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#008236] text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Placement Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Offer */}
        {createOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div>
                  <h3 className="text-base font-bold text-[#18221b]">Prepare Official Employment Offer</h3>
                </div>
                <button onClick={() => setCreateOfferModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleCreateOfferSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Candidate Application *
                  </label>
                  <select
                    required
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  >
                    <option value="">Select Candidate Application...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.candidateName} — {app.jobTitle} ({app.employer}) [Partner: {app.partnerName}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                      Compensation Package *
                    </label>
                    <input
                      type="text"
                      required
                      value={compensation}
                      onChange={(e) => setCompensation(e.target.value)}
                      placeholder="e.g. $145,000 / yr + benefits"
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                      Target Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Offer Contingencies & Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setCreateOfferModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Issue Official Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Record Audited Waiver */}
        {waiverOfferId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-[#18221b]">Audited Partner Signoff Waiver</h3>
                </div>
                <button onClick={() => setWaiverOfferId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleWaiverSubmit} className="space-y-4 pt-4">
                <p className="text-xs text-[#5e6d61]">
                  PRD Section 4.3 Governance: Bypassing partner signoff creates an immutable log entry attributing recruiter justification.
                </p>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Justification for Waiver *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    placeholder="Enter formal reason (e.g. Partner Placement Officer provided phone authorization, expedited client start date requirement)..."
                    className="w-full p-3 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setWaiverOfferId(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Confirm & Record Audit Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default RecruiterOffersPage;
