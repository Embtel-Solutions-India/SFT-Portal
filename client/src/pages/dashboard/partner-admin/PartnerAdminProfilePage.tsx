import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Globe 
} from 'lucide-react';

export const PartnerAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { organizations, updateOrganizationProfile } = usePlatformData();
  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];

  const [contactName, setContactName] = useState(myOrg?.authorizedRepresentative || '');
  const [contactEmail, setContactEmail] = useState(myOrg?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(myOrg?.contactPhone || '');
  const [location, setLocation] = useState(myOrg?.location || 'Boston, MA');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (myOrg) {
      updateOrganizationProfile(myOrg.id, {
        authorizedRepresentative: contactName,
        contactEmail,
        contactPhone,
        location
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Institutional Profile & Accreditation"
    >
      <div className="max-w-4xl space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#008236] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Organization profile and contact information updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Institution Header Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#008236]/10 text-[#008236] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18221b]">{myOrg?.displayName}</h3>
                  <p className="text-xs text-[#5e6d61] capitalize">Type: {myOrg?.type?.replace('_', ' ')} • Legal: {myOrg?.legalName}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-[#3d4a3e] mb-1">Campus Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl focus:outline-none focus:border-[#008236]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-[#3d4a3e] mb-1">Registered Institution Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={myOrg?.website || 'https://institution.edu'}
                    className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-[#e5ece6] rounded-xl text-[#5e6d61] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Placement Officer Contact */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#18221b] pb-2 border-b border-[#e5ece6]">
              Authorized Representative
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-[#3d4a3e] mb-1">Representative Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl focus:outline-none focus:border-[#008236]"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[#3d4a3e] mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl focus:outline-none focus:border-[#008236]"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-[#3d4a3e] mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl focus:outline-none focus:border-[#008236]"
                />
              </div>
            </div>
          </div>

          {/* Legal Compliance & Accreditation File */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#18221b] pb-2 border-b border-[#e5ece6]">
              Accreditation Documents on Record
            </h4>

            <div className="p-4 rounded-xl border border-[#e5ece6] bg-[#f9fbf9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#008236]" />
                <div>
                  <div className="text-xs font-bold text-[#18221b]">Institutional_Accreditation_Certificate.pdf</div>
                  <div className="text-[11px] text-[#8a998c] font-mono">Approved & Countersigned by Platform Lead</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                AUDITED
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default PartnerAdminProfilePage;
