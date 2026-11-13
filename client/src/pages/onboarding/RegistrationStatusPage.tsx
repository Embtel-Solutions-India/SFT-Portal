import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/navigation/PublicHeader';
import { usePlatformData } from '../../context/PlatformDataContext';
import { 
  Building2, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const RegistrationStatusPage: React.FC = () => {
  const { organizations } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const currentOrg = selectedOrgId ? organizations.find(o => o.id === selectedOrgId) : null;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputVal = (form.elements.namedItem('statusQuery') as HTMLInputElement)?.value ?? searchTerm;
    const query = (inputVal || '').trim().toLowerCase();
    if (!query) {
      setSelectedOrgId(null);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const found = organizations.find(o => 
      o.id.toLowerCase() === query ||
      o.contactEmail.toLowerCase() === query ||
      o.displayName.toLowerCase().includes(query) ||
      o.legalName.toLowerCase().includes(query)
    );

    setSelectedOrgId(found ? found.id : null);
  };

  return (
    <div className="min-h-screen bg-[#f9fbf9] text-[#18221b] flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0082c0]/10 text-[#0082c0] text-xs font-mono mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL STATUS LOOKUP</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#18221b] tracking-tight">
            Check Verification Status
          </h1>
          <p className="text-sm text-[#5e6d61] mt-2 max-w-lg mx-auto">
            Look up your partner application status using your official reference ID or registered institutional email.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#8a998c]" />
              <input
                type="text"
                name="statusQuery"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Enter Reference ID (e.g., org-1) or registered contact email..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#ea580c] text-white text-xs font-bold hover:bg-[#d44e08] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </div>
        </form>

        {/* Initial Empty State (Before Search) */}
        {!hasSearched && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e5ece6] shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#18221b]">
              Secure Institutional Verification Tracker
            </h3>
            <p className="text-xs text-[#5e6d61] max-w-md mx-auto leading-relaxed">
              To protect partner confidentiality, organization records are confidential. Please enter your registration Reference ID or official email above to review review status.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                to="/register"
                className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1"
              >
                <span>Need to submit a new application? Register here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Search Performed but No Result Found */}
        {hasSearched && !currentOrg && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#18221b]">
              No Application Record Found
            </h3>
            <p className="text-xs text-[#5e6d61] max-w-md mx-auto leading-relaxed">
              We could not find an active registration record matching <code className="text-rose-700 font-bold font-mono px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">"{searchTerm}"</code>.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setHasSearched(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#e5ece6] text-xs font-bold text-[#5e6d61] hover:text-[#18221b]"
              >
                Clear Search
              </button>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#043d2e]"
              >
                Start New Registration
              </Link>
            </div>
          </div>
        )}

        {/* Selected Org Details Card (Only shown upon valid lookup) */}
        {currentOrg && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#e5ece6] shadow-xl space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5ece6]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5e6d61]">
                  Reference ID: <code>{currentOrg.id}</code>
                </span>
                <h2 className="text-2xl font-bold text-[#18221b] mt-1">{currentOrg.displayName}</h2>
                <p className="text-xs text-[#5e6d61]">{currentOrg.legalName} • {currentOrg.location}</p>
              </div>

              {/* Status Badge */}
              <div>
                {currentOrg.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>PENDING VERIFICATION</span>
                  </span>
                )}
                {currentOrg.status === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VERIFIED & APPROVED</span>
                  </span>
                )}
                {currentOrg.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>VERIFICATION DECLINED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Contextual Status Guidance */}
            {currentOrg.status === 'pending' && (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Application Under Administrative Review</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your registration was received on {new Date(currentOrg.submittedAt).toLocaleDateString()}. Pending organizations cannot submit candidate resumes until official accreditation and representative credentials have been approved.
                </p>
                <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
                  <span>Candidate Intake Status:</span>
                  <span className="font-mono font-bold text-rose-600">LOCKED (PENDING ADMIN ACTION)</span>
                </div>
              </div>
            )}

            {currentOrg.status === 'approved' && (
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Institution Verified by Platform Operations</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Verified on {new Date(currentOrg.verifiedAt || '').toLocaleDateString()} by SFT Institutional Accreditation Committee. Candidate intake, bulk resume parsing, and attributed placement approval privileges are fully active.
                </p>
                <div className="pt-4 flex items-center gap-3">
                  <Link
                    to="/partner-admin/login"
                    className="px-5 py-2.5 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-all flex items-center gap-1.5"
                  >
                    <span>Sign In as Partner Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/partner-staff/login"
                    className="px-5 py-2.5 rounded-xl bg-white border border-[#e5ece6] text-[#3d4a3e] text-xs font-semibold hover:bg-[#f4f7f5]"
                  >
                    <span>Sign In as Placement Officer</span>
                  </Link>
                </div>
              </div>
            )}

            {currentOrg.status === 'rejected' && (
              <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Verification Exception Reason</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {currentOrg.rejectionReason || 'Verification credentials could not be validated against state registers.'}
                </p>
                <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-xs text-rose-800">
                    Rejected applicants can correct and resubmit.
                  </span>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-colors"
                  >
                    Correct & Resubmit Application
                  </Link>
                </div>
              </div>
            )}

            {/* Entity Summary Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-[#e5ece6]">
              <div>
                <p className="text-[#8a998c] font-mono text-[10px] uppercase">Representative</p>
                <p className="font-bold text-[#18221b] mt-0.5">{currentOrg.authorizedRepresentative}</p>
                <p className="text-[#5e6d61] text-[11px]">{currentOrg.representativeTitle}</p>
              </div>
              <div>
                <p className="text-[#8a998c] font-mono text-[10px] uppercase">Official Email</p>
                <p className="font-bold text-[#18221b] mt-0.5">{currentOrg.contactEmail}</p>
              </div>
              <div>
                <p className="text-[#8a998c] font-mono text-[10px] uppercase">Organization Type</p>
                <p className="font-bold text-[#18221b] mt-0.5 capitalize">
                  {currentOrg.type ? currentOrg.type.replace('_', ' ') : 'Institution'}
                </p>
              </div>
              <div>
                <p className="text-[#8a998c] font-mono text-[10px] uppercase">Official Website</p>
                {currentOrg.website ? (
                  <a 
                    href={currentOrg.website.startsWith('http') ? currentOrg.website : `https://${currentOrg.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-bold text-[#0082c0] hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                  >
                    <span>{currentOrg.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <p className="text-[#5e6d61] text-[11px] mt-0.5">Not provided</p>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};
