import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  UploadCloud, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

export const PartnerStaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    organizations, 
    candidates, 
    applications, 
    batchItems, 
    offers 
  } = usePlatformData();

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgCandidates = candidates.filter(c => c.partnerId === myOrg?.id);
  const orgApplications = applications.filter(a => a.partnerId === myOrg?.id);
  const orgOffers = offers.filter(o => o.partnerId === myOrg?.id && o.status === 'confirmed');

  const pendingReview = orgCandidates.filter(c => c.status === 'draft');

  return (
    <AppShell
      activeRole="partner_staff"
      title="Placement Officer Operations Desk"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Uploaded"
            value={batchItems.length}
            subtext="Candidate resumes"
            onClick={() => navigate('/partner-staff/intake')}
            variant="default"
          />
          <KPIStatCard
            label="Verified Profiles"
            value={orgCandidates.filter(c => c.status === 'active' || c.status === 'confirmed').length}
            subtext="Ready for matching"
            onClick={() => navigate('/partner-staff/candidates')}
            variant="success"
          />
          <KPIStatCard
            label="Active In Funnel"
            value={orgApplications.length}
            subtext="Client evaluation"
            onClick={() => navigate('/partner-staff/tracking')}
            variant="info"
          />
          <KPIStatCard
            label="Confirmed Placements"
            value={orgOffers.length}
            subtext="Hired candidates"
            variant="default"
          />
        </div>

        {/* Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Resumes */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#008236]/10 text-[#008236] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#18221b]">Upload Candidate Resumes</h3>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/partner-staff/intake')}
                className="w-full py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch Intake Station</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Parse Review Queue */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0082c0]/10 text-[#0082c0] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#18221b]">OCR Quality Review Queue</h3>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/partner-staff/parser')}
                className="w-full py-2.5 rounded-xl bg-[#0082c0] hover:bg-[#006e9f] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Review Parsed Profiles ({pendingReview.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default PartnerStaffDashboardPage;
