import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { 
  Building2, 
  Search, 
  Download 
} from 'lucide-react';

export const AdminPlacementsPage: React.FC = () => {
  const { offers, organizations } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');

  const totalOffers = offers.length;
  const confirmedPlacements = offers.filter(o => o.status === 'confirmed').length;
  const approvedAttribution = offers.filter(o => o.partnerApprovalStatus === 'approved').length;
  const waivedAttribution = offers.filter(o => o.partnerApprovalStatus === 'waived').length;

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPartner = partnerFilter === 'all' || offer.partnerId === partnerFilter;
    return matchesSearch && matchesPartner;
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Candidate,Role,Employer,Partner Institution,Attribution Status,Compensation,Start Date\n"
      + offers.map(o => `"${o.candidateName}","${o.jobTitle}","${o.employer}","${o.partnerName}","${o.partnerApprovalStatus}","${o.compensation}","${o.startDate}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFS_Admin_Placements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Placements & Partner Attribution Governance"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Offers Issued"
            value={totalOffers}
            subtext="Formal packages"
            variant="default"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={confirmedPlacements}
            subtext="Fully finalized hires"
            variant="success"
          />
          <KPIStatCard
            label="Partner Approved"
            value={approvedAttribution}
            subtext="Consented by institution"
            variant="default"
          />
          <KPIStatCard
            label="Audited Waivers"
            value={waivedAttribution}
            subtext="Administrative exceptions"
            variant={waivedAttribution > 0 ? "warning" : "default"}
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
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Partner:</span>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Institutions</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.displayName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Placement Report</span>
            </button>
          </div>
        </div>

        {/* Placements Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Hired Requisition & Employer</th>
                  <th className="py-3 px-4">Attributed Partner</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Institutional Signoff</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#18221b]">
                      {offer.candidateName}
                    </td>

                    <td className="py-3 px-4 text-[#5e6d61]">
                      <div className="font-semibold text-[#18221b]">{offer.jobTitle}</div>
                      <div className="text-[11px] text-[#8a998c]">{offer.employer}</div>
                    </td>

                    <td className="py-3 px-4 text-[#0082c0] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{offer.partnerName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#18221b]">
                      {offer.compensation}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5e6d61]">
                      {offer.startDate}
                    </td>

                    <td className="py-3 px-4">
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
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        offer.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {offer.status}
                      </span>
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

export default AdminPlacementsPage;
