import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { api } from '../../../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

export const RecruiterIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { organizations, batchItems, addBatchItems } = usePlatformData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [partnerId, setPartnerId] = useState(organizations[0]?.id || 'org-1');
  const [consentAttested, setConsentAttested] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles(filesArr);
      setSelectedFileNames(filesArr.map(f => f.name));
    }
  };

  const handleExecuteBatch = async () => {
    if (!consentAttested) {
      alert('Mandatory Consent Attestation: You must verify that candidate consent has been received under policy v2.1.');
      return;
    }

    const partner = organizations.find(o => o.id === partnerId);
    setIsUploading(true);

    if (selectedFiles.length === 0) {
      setIsUploading(false);
      alert('Select one or more resume files first.');
      return;
    }
    try {
      const res = await api.batches.upload(selectedFiles, partnerId);
      addBatchItems(res.data);
      setSelectedFiles([]);
      setSelectedFileNames([]);
      alert(`${res.message} (${partner?.displayName || 'Partner'})`);
    } catch (err: any) {
      alert(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Resume Intake Pipeline"
    >
      <div className="space-y-6 max-w-4xl">
        <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-5">
          {/* Sourcing Partner Selection */}
          <div>
            <label className="block text-xs font-bold text-[#18221b] mb-1">
              Sourcing Partner Institution <span className="text-rose-600">*</span>
            </label>
            <select
              value={partnerId}
              onChange={e => setPartnerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white"
            >
              {organizations.filter(o => o.candidateIntakeEnabled).map(org => (
                <option key={org.id} value={org.id}>
                  {org.displayName} (Intake Unlocked)
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone Area */}
          <div className="border-2 border-dashed border-[#a0afa1] hover:border-[#008236] rounded-2xl p-8 text-center transition-colors bg-[#f9fbf9]">
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept=".pdf,.docx,.txt" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <UploadCloud className="w-10 h-10 text-[#008236] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#18221b]">Upload Institutional Resume Documents</h4>
            <p className="text-xs text-[#5e6d61] mt-1 mb-4">
              Supports PDF, DOCX, and TXT files (Up to 15 MB per file per PRD Policy)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#008236] text-white hover:bg-[#006b2c] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Files on Device</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFileNames(['Devin_Vance_StaffEngineer.pdf', 'Amina_Siddiqui_DataPlatform.docx', 'Duplicate_Kofi_Mensah_CV.pdf'])}
                className="px-4 py-2 rounded-xl bg-white border border-[#e5ece6] hover:bg-gray-50 text-xs font-bold text-[#3d4a3e] shadow-xs cursor-pointer"
              >
                Load Pre-Staged Cohort Files
              </button>
            </div>
            {selectedFileNames.length > 0 && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono inline-block">
                Selected for Intake: {selectedFileNames.join(', ')}
              </div>
            )}
          </div>

          {/* Mandatory Consent Attestation */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAttested}
                onChange={e => setConsentAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[#008236]"
              />
              <span className="text-xs text-amber-950 font-medium">
                <strong>Mandatory Consent Attestation (PRD Section 4):</strong> I attest that candidate consent has been received and verified under active institutional policy v2.1. Candidate records submitted without valid consent will be purged and audited.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#5e6d61]">Automated deduplication will verify emails against existing profiles.</span>
            <button
              onClick={handleExecuteBatch}
              disabled={!consentAttested}
              className="px-5 py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Execute Batch Intake</span>
            </button>
          </div>
        </div>

        {/* Batch Processing History */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#18221b]">Recent Batch Processing Status</h4>
            <button
              onClick={() => navigate('/recruiter/parser')}
              className="text-xs font-bold text-[#0082c0] hover:underline"
            >
              Go to AI Parse Review →
            </button>
          </div>

          <div className="space-y-2.5">
            {batchItems.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#0082c0]" />
                  <div>
                    <p className="font-bold text-[#18221b]">{item.fileName}</p>
                    <p className="text-[10px] text-[#5e6d61]">{item.fileSize} • Candidate: {item.candidateName || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.isDuplicate ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                      DUPLICATE DETECTED
                    </span>
                  ) : item.status === 'confirmed' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      PARSED ({item.confidenceScore}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                      NEEDS REVIEW ({item.confidenceScore}%)
                    </span>
                  )}

                  <button
                    onClick={() => navigate('/recruiter/parser')}
                    className="text-xs font-bold text-[#0082c0] hover:underline cursor-pointer"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

