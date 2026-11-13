import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Calendar, 
  Building2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

const BAR_PALETTE = [
  '#f27a24', // Warm Vibrant Orange (from reference image)
  '#0e4d34', // Deep Forest Green (from reference image)
  '#0082c0', // Professional Blue
  '#00b8f9', // Bright Cyan
  '#f59e0b', // Amber Ochre
  '#10b981', // Emerald Mint
  '#7c3aed'  // Purple Indigo
];

export const AdminReportsPage: React.FC = () => {
  const { candidates, applications, offers, organizations } = usePlatformData();
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '12m'>('90d');

  const totalCandidates = candidates.length;
  const inPipeline = applications.length;
  const confirmedPlacements = offers.filter(o => o.status === 'confirmed').length;

  const monthlyGrowth = [
    { month: 'Jun', candidates: 12, placements: 2 },
    { month: 'Jul', candidates: 24, placements: 4 },
    { month: 'Aug', candidates: 38, placements: 7 },
    { month: 'Sep', candidates: 55, placements: 11 },
    { month: 'Oct', candidates: 74, placements: 16 },
    { month: 'Nov', candidates: 92, placements: 22 }
  ];

  const orgPerformance = organizations.map((org, i) => ({
    name: org.displayName.length > 18 ? org.displayName.substring(0, 15) + '...' : org.displayName,
    intake: 14 + i * 6,
    hired: 3 + i * 2,
    rate: Math.round(((3 + i * 2) / (14 + i * 6)) * 100)
  }));

  const handleExportSummary = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Platform Pool,${totalCandidates}\n`
      + `Active In Pipeline,${inPipeline}\n`
      + `Confirmed Placements,${confirmedPlacements}\n`
      + `Active Partner Institutions,${organizations.filter(o => o.status === 'approved').length}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFS_Executive_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Platform Reports & Executive Intelligence"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Platform Pool"
            value={totalCandidates}
            subtext="Available candidate records"
            variant="default"
          />
          <KPIStatCard
            label="In Active Pipeline"
            value={inPipeline}
            subtext="Ongoing recruitment"
            variant="info"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={confirmedPlacements}
            subtext="Attributed institutional hires"
            variant="success"
          />
          <KPIStatCard
            label="Avg Conversion Rate"
            value="24.8%"
            subtext="Intake to placement yield"
            variant="default"
          />
        </div>

        {/* Filter & Action Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#008236]" />
            <span className="text-xs font-mono font-bold text-[#18221b]">Cohort Window:</span>
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
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0082c0] hover:bg-[#006e9f] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive Summary (CSV)</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#18221b]">Platform Growth Velocity</h4>
              </div>
              <TrendingUp className="w-5 h-5 text-[#008236]" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="candidates" stroke="#008236" strokeWidth={2.5} name="Candidate Pool" />
                  <Line type="monotone" dataKey="placements" stroke="#0082c0" strokeWidth={2.5} name="Placements" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#18221b]">Institutional Conversion Rates</h4>
              </div>
              <Building2 className="w-5 h-5 text-[#0082c0]" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5e6d61' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5e6d61' }} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18221b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]} name="Placement Yield %">
                    {orgPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_PALETTE[index % BAR_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminReportsPage;
