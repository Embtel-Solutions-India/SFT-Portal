import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Organization } from '../../../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  X, 
  Eye, 
  FileText, 
  Mail, 
  Phone 
} from 'lucide-react';

export const AdminOrganizationsPage: React.FC = () => {
  const { 
    organizations, 
    approveOrganization, 
    rejectOrganization, 
    suspendOrganization, 
    reactivateOrganization, 
    toggleCandidateIntake,
    candidates 
  } = usePlatformData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals & Drawers
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [rejectModalOrg, setRejectModalOrg] = useState<Organization | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspendModalOrg, setSuspendModalOrg] = useState<Organization | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const totalOrgs = organizations.length;
  const pendingOrgs = organizations.filter(o => o.status === 'pending' || o.status === 'submitted').length;
  const activeOrgs = organizations.filter(o => o.status === 'approved').length;
  const suspendedOrgs = organizations.filter(o => o.status === 'suspended').length;

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = 
      org.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.authorizedRepresentative.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesType = typeFilter === 'all' || org.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalOrg || !rejectionReason.trim()) return;
    rejectOrganization(rejectModalOrg.id, rejectionReason);
    setRejectModalOrg(null);
    setRejectionReason('');
  };

  const handleSuspendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalOrg || !suspensionReason.trim()) return;
    suspendOrganization(suspendModalOrg.id, suspensionReason);
    setSuspendModalOrg(null);
    setSuspensionReason('');
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Partner Organizations & Verification Queue"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Partners"
            value={totalOrgs}
            subtext="Registered institutions"
            variant="default"
          />
          <KPIStatCard
            label="Pending Verification"
            value={pendingOrgs}
            subtext="Awaiting review"
            variant={pendingOrgs > 0 ? "warning" : "default"}
          />
          <KPIStatCard
            label="Approved Partners"
            value={activeOrgs}
            subtext="Permitted intake"
            variant="success"
          />
          <KPIStatCard
            label="Suspended / Inactive"
            value={suspendedOrgs}
            subtext="Intake disabled"
            variant="default"
          />
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search institution, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted (New)</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="coaching_center">Coaching Center</option>
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Authorized Representative</th>
                  <th className="py-3 px-4">Talent Pool</th>
                  <th className="py-3 px-4">Intake Status</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredOrgs.map(org => {
                  const candCount = candidates.filter(c => c.partnerId === org.id).length;
                  return (
                    <tr key={org.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#18221b]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#3d4a3e] shrink-0" />
                          <span>{org.displayName}</span>
                        </div>
                        <div className="text-[11px] text-[#8a998c] pl-6 font-normal">
                          {org.location} • Legal: {org.legalName}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-gray-100 text-[#3d4a3e]">
                          {org.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#18221b]">{org.authorizedRepresentative}</div>
                        <div className="text-[11px] text-[#5e6d61]">{org.contactEmail}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#18221b]">
                        {candCount} candidates
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleCandidateIntake(org.id)}
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            org.candidateIntakeEnabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {org.candidateIntakeEnabled ? 'Intake Active' : 'Intake Paused'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          org.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : org.status === 'pending' || org.status === 'submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : org.status === 'suspended'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrg(org)}
                            className="p-1.5 rounded-lg border border-[#e5ece6] hover:bg-gray-100 text-[#5e6d61] cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {(org.status === 'pending' || org.status === 'submitted') && (
                            <>
                              <button
                                onClick={() => approveOrganization(org.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#008236] hover:bg-[#006b2c] text-white text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalOrg(org)}
                                className="px-2 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {org.status === 'approved' && (
                            <button
                              onClick={() => setSuspendModalOrg(org)}
                              className="px-2 py-1 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Suspend
                            </button>
                          )}

                          {org.status === 'suspended' && (
                            <button
                              onClick={() => reactivateOrganization(org.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#008236] hover:bg-[#006b2c] text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drawer: Organization Inspection */}
        {selectedOrg && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#008236]" />
                    <h3 className="text-base font-bold text-[#18221b]">{selectedOrg.displayName}</h3>
                  </div>
                  <button onClick={() => setSelectedOrg(null)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-[#5e6d61]" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#8a998c] font-mono block">Status & Accreditation</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                        {selectedOrg.status}
                      </span>
                      <span className="font-mono text-[#5e6d61]">Type: {selectedOrg.type.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] space-y-2">
                    <span className="font-bold text-[#18221b] block">Authorized Representative</span>
                    <div className="text-[#3d4a3e]">
                      <span>{selectedOrg.authorizedRepresentative} ({selectedOrg.representativeTitle})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3d4a3e]">
                      <Mail className="w-3.5 h-3.5 text-[#0082c0]" />
                      <span>{selectedOrg.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#3d4a3e]">
                      <Phone className="w-3.5 h-3.5 text-[#0082c0]" />
                      <span>{selectedOrg.contactPhone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-[#18221b] block mb-2">Compliance Documentation</span>
                    <div className="p-3 rounded-xl border border-[#e5ece6] flex items-center justify-between bg-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#008236]" />
                        <div>
                          <div className="font-semibold text-[#18221b]">Institutional_Accreditation_Charter.pdf</div>
                          <div className="text-[10px] text-[#8a998c] font-mono">1.8 MB • Cryptographic Checksum Verified</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-[#008236]">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5ece6]">
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#18221b]"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Organization */}
        {rejectModalOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5ece6]">
              <h3 className="text-base font-bold text-rose-700 mb-1">Reject Partner Verification</h3>
              <p className="text-xs text-[#5e6d61] mb-4">
                Enter formal compliance reason for rejecting <strong>{rejectModalOrg.displayName}</strong>.
              </p>
              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid accreditation credentials, missing legal registration certificate..."
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-rose-600"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOrg(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Suspend Organization */}
        {suspendModalOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5ece6]">
              <h3 className="text-base font-bold text-purple-700 mb-1">Suspend Partner Organization</h3>
              <p className="text-xs text-[#5e6d61] mb-4">
                Temporarily suspend <strong>{suspendModalOrg.displayName}</strong> and revoke candidate intake privileges.
              </p>
              <form onSubmit={handleSuspendSubmit} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Pending compliance inquiry, duplicate submission audit..."
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-purple-600"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSuspendModalOrg(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs"
                  >
                    Confirm Suspension
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

export default AdminOrganizationsPage;
