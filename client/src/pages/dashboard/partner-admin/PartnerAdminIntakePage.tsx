import React, { useState } from 'react';
import { api } from '../../../services/api';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  UploadCloud, 
  FileText 
} from 'lucide-react';

export const PartnerAdminIntakePage: React.FC = () => {
  const { user } = useAuth();
  const { 
    batchItems, 
    organizations, 
    addBatchItems, 
    updateBatchItemStatus 
  } = usePlatformData();

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];

  const [dragActive, setDragActive] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!consentConfirmed) {
      alert('Please confirm candidate consent verification prior to uploading resumes.');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      triggerUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!consentConfirmed) {
      alert('Please confirm candidate consent verification prior to uploading resumes.');
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      triggerUpload(e.target.files);
    }
  };

  const triggerUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const res = await api.batches.upload(Array.from(files));
      addBatchItems(res.data);
      alert(res.message);
    } catch (err: any) {
      alert(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Bulk Resume Intake & Batch Ingestion"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Resumes Ingested"
            value={batchItems.length}
            subtext="Lifetime submissions"
            variant="default"
          />
          <KPIStatCard
            label="Processed Successfully"
            value={batchItems.filter(b => b.status === 'confirmed').length}
            subtext="Ready for verification"
            variant="success"
          />
          <KPIStatCard
            label="Needs Review"
            value={batchItems.filter(b => b.status === 'review_needed').length}
            subtext="OCR confidence gap"
            variant={batchItems.some(b => b.status === 'review_needed') ? "warning" : "default"}
          />
          <KPIStatCard
            label="Intake Privilege"
            value={myOrg?.candidateIntakeEnabled ? "Active" : "Paused"}
            subtext="Compliance status"
            variant={myOrg?.candidateIntakeEnabled ? "success" : "default"}
          />
        </div>

        {/* Upload Station */}
        <div className="p-8 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#18221b]">Upload Candidate Resumes</h3>
            <p className="text-xs text-[#5e6d61]">
              Supported formats: PDF, DOCX (Max 15MB per file). Resumes are processed by multilingual OCR.
            </p>
          </div>

          {/* Mandatory Consent Checkbox */}
          <div className="p-4 rounded-xl bg-[#008236]/10 border border-[#008236]/20">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#008236] accent-[#008236]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#008236] block">
                  Mandatory Institutional Consent Attestation (PRD Section 3.1)
                </span>
                <p className="text-[#3d4a3e] mt-0.5">
                  I certify that all candidates uploaded in this batch have provided explicit written consent for their records, contact information, and resume details to be represented by SFT Placement Network for placement opportunities.
                </p>
              </div>
            </label>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-10 border-2 border-dashed rounded-2xl text-center transition-all ${
              dragActive 
                ? 'border-[#008236] bg-[#008236]/5' 
                : 'border-[#e5ece6] bg-[#f9fbf9] hover:border-[#008236]/60'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-[#008236] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#18221b] mb-1">
              Drag & Drop Resumes Here, or Browse Files
            </h4>
            <p className="text-xs text-[#8a998c] mb-4">
              Select multiple PDF or DOCX files from your institution's placement drive
            </p>

            <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              consentConfirmed 
                ? 'bg-[#008236] hover:bg-[#006b2c] text-white shadow-xs' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}>
              <span>Choose Files to Upload</span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx"
                disabled={!consentConfirmed}
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Batch Status Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#e5ece6] flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase text-[#18221b]">Recent Intake Batch Processing</h4>
            <span className="text-[11px] font-mono text-[#5e6d61]">Auto-updated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">OCR Status</th>
                  <th className="py-3 px-4">Confidence Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {batchItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#18221b] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#008236]" />
                      <span>{item.fileName}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5e6d61]">
                      {item.fileSize}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : item.status === 'review_needed' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#18221b]">
                      {item.confidenceScore ? `${Math.round(item.confidenceScore * 100)}%` : '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.status === 'review_needed' && (
                        <button
                          onClick={() => updateBatchItemStatus(item.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-[#0082c0] hover:bg-[#006e9f] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Mark Verified
                        </button>
                      )}
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

export default PartnerAdminIntakePage;
