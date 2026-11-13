import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const PartnerAdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { candidates, applications, offers, organizations } = usePlatformData();
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '12m'>('90d');

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgCandidates = candidates.filter(c => c.partnerId === myOrg?.id);
  const orgApplications = applications.filter(a => a.partnerId === myOrg?.id);
  const orgOffers = offers.filter(o => o.partnerId === myOrg?.id);
  const confirmedPlacements = orgOffers.filter(o => o.status === 'confirmed');

  const conversionRate = orgCandidates.length > 0
    ? Math.round((confirmedPlacements.length / orgCandidates.length) * 100)
    : 0;

  const cohortData = [
    { cohort: 'Q1 Cohort', submissions: 14, placed: 4 },
    { cohort: 'Q2 Cohort', submissions: 22, placed: 7 },
    { cohort: 'Q3 Cohort', submissions: 30, placed: 11 },
    { cohort: 'Q4 Cohort', submissions: 36, placed: 14 }
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Submissions,${orgCandidates.length}\n`
      + `Active In Funnel,${orgApplications.length}\n`
      + `Confirmed Placements,${confirmedPlacements.length}\n`
      + `Institutional Conversion Yield,${conversionRate}%\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFS_${(myOrg?.displayName || 'Partner').replace(/\s+/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Institutional Placement Reports & Yield"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Submitted Pool"
            value={orgCandidates.length}
            subtext="Candidates submitted"
            variant="default"
          />
          <KPIStatCard
            label="Active In Funnel"
            value={orgApplications.length}
            subtext="Under evaluation"
            variant="info"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={confirmedPlacements.length}
            subtext="Attributed hires"
            variant="success"
          />
          <KPIStatCard
            label="Placement Yield"
            value={`${conversionRate}%`}
            subtext="Intake-to-hire rate"
            variant="default"
          />
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#008236]" />
            <span className="text-xs font-mono font-bold text-[#18221b]">Cohort View:</span>
            <div className="flex items-center gap-1">
              {[
                { id: '30d', label: 'Last 30 Days' },
                { id: '90d', label: 'Last Quarter' },
                { id: '12m', label: 'Past 12 Months' }
              ].map(period => (
                <button
                  key={period.id}
                  onClick={() => setTimeRange(period.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    timeRange === period.id
                      ? 'bg-[#008236] text-white'
                      : 'bg-[#f4f7f5] text-[#5e6d61] hover:bg-[#e5ece6]'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Institutional Report</span>
          </button>
        </div>

        {/* Cohort Performance Chart */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#18221b]">Cohort Submissions vs Confirmed Placements</h4>
            </div>
            <TrendingUp className="w-5 h-5 text-[#008236]" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                <XAxis dataKey="cohort" tick={{ fontSize: 10, fill: '#5e6d61' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5e6d61' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="submissions" fill="#f27a24" radius={[4, 4, 0, 0]} name="Candidate Submissions" />
                <Bar dataKey="placed" fill="#0e4d34" radius={[4, 4, 0, 0]} name="Confirmed Placements" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PartnerAdminReportsPage;
