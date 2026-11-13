import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { Offer } from '../../../types';
import { 
  CheckCircle2, 
  Clock, 
  X,
  ShieldCheck 
} from 'lucide-react';

export const PartnerAdminApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    offers, 
    organizations, 
    decidePartnerApproval 
  } = usePlatformData();

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgOffers = offers.filter(o => o.partnerId === myOrg?.id);

  const pendingApprovals = orgOffers.filter(o => o.partnerApprovalStatus === 'pending');
  const approvedOffers = orgOffers.filter(o => o.partnerApprovalStatus === 'approved');
  const waivedOffers = orgOffers.filter(o => o.partnerApprovalStatus === 'waived');

  const [rejectModalOffer, setRejectModalOffer] = useState<Offer | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalOffer || !rejectReason.trim()) return;

    decidePartnerApproval(rejectModalOffer.applicationId, 'rejected', rejectReason);
    setRejectModalOffer(null);
    setRejectReason('');
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Placement Attribution & Approvals Inbox"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Pending Approvals"
            value={pendingApprovals.length}
            subtext="Action required"
            variant={pendingApprovals.length > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Approved Attribution"
            value={approvedOffers.length}
            subtext="Signed by institution"
            variant="success"
          />
          <KPIStatCard
            label="Administrative Waivers"
            value={waivedOffers.length}
            subtext="Bypassed by platform lead"
            variant="default"
          />
          <KPIStatCard
            label="Total Attributed Offers"
            value={orgOffers.length}
            subtext="Lifetime opportunities"
            variant="default"
          />
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {orgOffers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#e5ece6]">
              <Clock className="w-8 h-8 text-[#8a998c] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#18221b]">No Placement Offers Pending Approval</h4>
              <p className="text-xs text-[#5e6d61] mt-1">Offers will appear here once candidate interviews are cleared and compensation packages are prepared.</p>
            </div>
          ) : (
            orgOffers.map(offer => (
              <div 
                key={offer.id} 
                className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#008236]/40 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[#008236]/10 text-[#008236]">
                      Offer {offer.version}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      offer.partnerApprovalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : offer.partnerApprovalStatus === 'waived'
                        ? 'bg-purple-100 text-purple-800'
                        : offer.partnerApprovalStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {offer.partnerApprovalStatus}
                    </span>
                    <span className="text-[11px] font-mono text-[#8a998c]">
                      Date: {offer.createdAt}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#18221b]">{offer.candidateName}</h4>
                  <p className="text-xs text-[#5e6d61]">
                    Target Opportunity: <strong>{offer.jobTitle}</strong> at <strong>{offer.employer}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 max-w-lg">
                    <div className="p-2.5 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                      <span className="text-[#8a998c] block font-mono">Agreed Compensation</span>
                      <strong className="text-[#18221b]">{offer.compensation}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                      <span className="text-[#8a998c] block font-mono">Earliest Start Date</span>
                      <strong className="text-[#18221b]">{offer.startDate}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-[#5e6d61] pt-1">
                    Candidate Consent & Response: <strong className="font-mono uppercase text-[#008236]">{offer.candidateResponse}</strong>
                  </div>

                  {offer.waiverReason && (
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-mono">
                      <strong>Audited Platform Override:</strong> {offer.waiverReason}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-end">
                  {offer.partnerApprovalStatus === 'pending' ? (
                    <>
                      <button
                        onClick={() => decidePartnerApproval(offer.applicationId, 'approved')}
                        className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Approve Attribution
                      </button>
                      <button
                        onClick={() => setRejectModalOffer(offer)}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Dispute Attribution
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#008236] text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Attribution Finalized</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Dispute Attribution */}
        {rejectModalOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5ece6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
                <h3 className="text-base font-bold text-rose-700">Dispute Placement Attribution</h3>
                <button onClick={() => setRejectModalOffer(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4 pt-4">
                <p className="text-xs text-[#5e6d61]">
                  Disputing attribution flags this record to the platform administrator and pauses placement confirmation for <strong>{rejectModalOffer.candidateName}</strong>.
                </p>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Formal Dispute Reason *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Candidate withdrew from program prior to graduation, attribution should belong to secondary partner..."
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setRejectModalOffer(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                  >
                    Submit Dispute
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

export default PartnerAdminApprovalsPage;
