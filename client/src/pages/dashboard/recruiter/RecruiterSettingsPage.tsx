import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { useAuth } from '../../../context/AuthContext';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  Mail,
  Smartphone
} from 'lucide-react';

export const RecruiterSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Marcus Vance');
  const [email, setEmail] = useState(user?.email || 'recruiter@sft.com');
  const [deskPhone, setDeskPhone] = useState('+1 (555) 438-9201');
  
  // AI Matching Configuration
  const [thresholdScore, setThresholdScore] = useState(70);
  const [prioritizeHardSkills, setPrioritizeHardSkills] = useState(true);
  const [allowLocationFlexibility, setAllowLocationFlexibility] = useState(true);

  // Notification Toggles
  const [notifyNewBatch, setNotifyNewBatch] = useState(true);
  const [notifyOfferSigned, setNotifyOfferSigned] = useState(true);
  const [notifyPartnerApproval, setNotifyPartnerApproval] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Placement Operations Settings"
    >
      <div className="max-w-4xl space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#008236] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Operational preferences and matching configurations saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Recruiter Profile Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <User className="w-5 h-5 text-[#008236]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Recruiter Profile & Direct Contact</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Direct Outreach Phone</label>
                <input
                  type="text"
                  value={deskPhone}
                  onChange={(e) => setDeskPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Operational Role</label>
                <input
                  type="text"
                  readOnly
                  value="Senior Placement Operations Lead"
                  className="w-full p-2.5 bg-gray-100 border border-[#e5ece6] rounded-xl text-xs text-[#5e6d61] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI Matching Rules Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <Sliders className="w-5 h-5 text-[#0082c0]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Advisory Matching Parameters</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-[#3d4a3e]">
                    Minimum Advisory Match Score Highlight
                  </label>
                  <span className="text-xs font-mono font-bold text-[#008236]">{thresholdScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={thresholdScore}
                  onChange={(e) => setThresholdScore(Number(e.target.value))}
                  className="w-full accent-[#008236]"
                />
                <span className="text-[11px] text-[#8a998c]">Candidates scoring above {thresholdScore}% are prominently highlighted on the matching board.</span>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prioritizeHardSkills}
                    onChange={(e) => setPrioritizeHardSkills(e.target.checked)}
                    className="w-4 h-4 rounded text-[#008236] accent-[#008236]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#18221b] block">Prioritize Direct Technical Stack Fit (50% Weight)</span>
                    <span className="text-[11px] text-[#5e6d61]">Requires matching programming languages and frameworks over general domain experience.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowLocationFlexibility}
                    onChange={(e) => setAllowLocationFlexibility(e.target.checked)}
                    className="w-4 h-4 rounded text-[#008236] accent-[#008236]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#18221b] block">Permit Remote Candidate Matching</span>
                    <span className="text-[11px] text-[#5e6d61]">Score remote-willing candidates equally for hybrid/remote requisitions.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <Bell className="w-5 h-5 text-[#3d4a3e]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Operational Event Notifications</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] cursor-pointer">
                <div>
                  <span className="font-bold text-[#18221b] block">New Resume Intake Batch Complete</span>
                  <span className="text-[11px] text-[#5e6d61]">Alert when OCR parser finishes processing uploaded institutional resumes</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewBatch}
                  onChange={(e) => setNotifyNewBatch(e.target.checked)}
                  className="w-4 h-4 accent-[#008236]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] cursor-pointer">
                <div>
                  <span className="font-bold text-[#18221b] block">Partner Placement Approval Received</span>
                  <span className="text-[11px] text-[#5e6d61]">Alert when institution administrator formally approves or flags an offer</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPartnerApproval}
                  onChange={(e) => setNotifyPartnerApproval(e.target.checked)}
                  className="w-4 h-4 accent-[#008236]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] cursor-pointer">
                <div>
                  <span className="font-bold text-[#18221b] block">Candidate Offer Accepted</span>
                  <span className="text-[11px] text-[#5e6d61]">Alert when candidate consent and formal offer acceptance is confirmed</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOfferSigned}
                  onChange={(e) => setNotifyOfferSigned(e.target.checked)}
                  className="w-4 h-4 accent-[#008236]"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configurations</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default RecruiterSettingsPage;

