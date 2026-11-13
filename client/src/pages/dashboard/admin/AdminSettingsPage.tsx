import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { 
  FileText, 
  Bell, 
  Lock, 
  Save, 
  CheckCircle2 
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = usePlatformData();

  const [resumeMaxFileSizeMB, setResumeMaxFileSizeMB] = useState(settings.resumeMaxFileSizeMB || 15);
  const [duplicateDetectionSensitivity, setDuplicateDetectionSensitivity] = useState<'strict' | 'balanced' | 'relaxed'>(settings.duplicateDetectionSensitivity || 'balanced');
  const [approvalReminderIntervalHours, setApprovalReminderIntervalHours] = useState(settings.approvalReminderIntervalHours || 48);
  const [allowDocxUploads, setAllowDocxUploads] = useState(true);
  const [enforceMfaForStaff, setEnforceMfaForStaff] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      resumeMaxFileSizeMB,
      duplicateDetectionSensitivity,
      approvalReminderIntervalHours
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Platform Governance & System Settings"
    >
      <div className="max-w-4xl space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#008236] flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings updated successfully across all tenant workspaces.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Resume Intake Policies */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <FileText className="w-5 h-5 text-[#008236]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Resume Intake & Parser Policies</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={resumeMaxFileSizeMB}
                  onChange={(e) => setResumeMaxFileSizeMB(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                />
                <span className="text-[11px] text-[#8a998c]">PRD default: 15 MB per PDF/DOCX binary</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                  Duplicate Candidate Detection Sensitivity
                </label>
                <select
                  value={duplicateDetectionSensitivity}
                  onChange={(e) => setDuplicateDetectionSensitivity(e.target.value as any)}
                  className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                >
                  <option value="strict">Strict (Exact matches on email/phone & name)</option>
                  <option value="balanced">Balanced (Fuzzy match on name + phone/email)</option>
                  <option value="relaxed">Relaxed (Manual review on exact email only)</option>
                </select>
                <span className="text-[11px] text-[#8a998c]">Fuzzy matching threshold on name, email, and phone</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDocxUploads}
                  onChange={(e) => setAllowDocxUploads(e.target.checked)}
                  className="w-4 h-4 rounded text-[#008236] accent-[#008236]"
                />
                <div>
                  <span className="text-xs font-bold text-[#18221b] block">Permit Microsoft Word (.docx) Resumes</span>
                  <span className="text-[11px] text-[#5e6d61]">Converts Word formatting to structured OCR text extracts alongside PDF.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Institutional Signoff & Reminder Rules */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <Bell className="w-5 h-5 text-[#0082c0]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Partner Institutional Signoff Automation</h3>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                Automated Partner Reminder Cadence (Hours)
              </label>
              <input
                type="number"
                min="12"
                max="168"
                value={approvalReminderIntervalHours}
                onChange={(e) => setApprovalReminderIntervalHours(Number(e.target.value))}
                className="w-full max-w-xs p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#0082c0]"
              />
              <span className="text-[11px] text-[#8a998c] block mt-1">
                Sends automated email reminder to Partner Admin if offer signoff is pending beyond this interval.
              </span>
            </div>
          </div>

          {/* Security & Access Guardrails */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#e5ece6]">
              <Lock className="w-5 h-5 text-[#3d4a3e]" />
              <div>
                <h3 className="text-sm font-bold text-[#18221b]">Security Guardrails & Session Controls</h3>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={enforceMfaForStaff}
                  onChange={(e) => setEnforceMfaForStaff(e.target.checked)}
                  className="w-4 h-4 rounded text-[#008236] accent-[#008236]"
                />
                <div>
                  <span className="text-xs font-bold text-[#18221b] block">Enforce Multi-Factor Authentication</span>
                  <span className="text-[11px] text-[#5e6d61]">Requires TOTP on all Platform Admin & Recruiter logins.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Apply Platform Policies</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default AdminSettingsPage;
