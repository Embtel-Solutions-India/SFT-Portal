import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Award, 
  CheckCircle2, 
  Building2, 
  Search, 
  Download, 
  DollarSign, 
  Calendar 
} from 'lucide-react';

export const PartnerAdminOffersPage: React.FC = () => {
  const { user } = useAuth();
  const { offers, organizations } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgOffers = offers.filter(o => o.partnerId === myOrg?.id);

  const totalOffers = orgOffers.length;
  const confirmedPlacements = orgOffers.filter(o => o.status === 'confirmed').length;
  const signedAttributions = orgOffers.filter(o => o.partnerApprovalStatus === 'approved').length;

  const filteredOffers = orgOffers.filter(o => 
    o.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.employer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Candidate,Role,Employer,Compensation,Start Date,Attribution Status\n"
      + orgOffers.map(o => `"${o.candidateName}","${o.jobTitle}","${o.employer}","${o.compensation}","${o.startDate}","${o.partnerApprovalStatus}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFS_${(myOrg?.displayName || 'Partner').replace(/\s+/g, '_')}_Placements.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Attributed Offers & Confirmed Placements"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Attributed Offers"
            value={totalOffers}
            subtext="Lifetime offers"
            variant="default"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={confirmedPlacements}
            subtext="Signed employment agreements"
            variant="success"
          />
          <KPIStatCard
            label="Institutional Signoffs"
            value={signedAttributions}
            subtext="Approved by partner"
            variant="default"
          />
          <KPIStatCard
            label="Attribution Rate"
            value="100%"
            subtext="Audited compliance"
            variant="default"
          />
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, role, or employer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Placement Registry</span>
          </button>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role & Employer</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Attribution Signoff</th>
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

export default PartnerAdminOffersPage;
