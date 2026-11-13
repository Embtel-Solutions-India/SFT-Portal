import React from 'react';
import { Candidate, Job } from '../../types';
import { CheckCircle2, AlertTriangle, FileText, UserCheck, SlidersHorizontal, MapPin, Building2 } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  job?: Job;
  matchScore: number;
  matchFactors?: { factor: string; score: number; note: string }[];
  missingSkills?: string[];
  isShortlisted?: boolean;
  onShortlist?: () => void;
  onCompare?: () => void;
  onViewProfile?: () => void;
  onViewResume?: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  matchScore,
  missingSkills = [],
  isShortlisted = false,
  onShortlist,
  onCompare,
  onViewProfile,
  onViewResume
}) => {
  const isHighMatch = matchScore >= 80;
  const isMedMatch = matchScore >= 60 && matchScore < 80;

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#e5ece6] hover:border-[#008236]/30 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#008236]/10 text-[#008236] flex items-center justify-center font-bold text-lg font-display shrink-0">
            {candidate.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#18221b] text-base">{candidate.fullName}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {candidate.targetRole || 'Fullstack'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5e6d61] mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {candidate.partnerName || 'Partner Academy'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.location || 'Remote, US'}
              </span>
              <span>{candidate.experienceYears || 2}+ yrs exp</span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-[#5e6d61]">AI MATCH</div>
            <div
              className={`text-2xl font-black font-display ${
                isHighMatch ? 'text-emerald-600' : isMedMatch ? 'text-amber-600' : 'text-slate-600'
              }`}
            >
              {matchScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="mt-4 pt-3 border-t border-[#e5ece6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(candidate.skills || []).slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f4f7f5] text-[#3d4a3e] font-mono"
            >
              {skill}
            </span>
          ))}
          {missingSkills.length > 0 && (
            <span className="text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Missing: {missingSkills.slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onViewResume && (
            <button
              onClick={onViewResume}
              className="px-3 py-1.5 rounded-xl border border-[#e5ece6] hover:bg-slate-50 text-xs font-bold text-[#3d4a3e] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}
          {onCompare && (
            <button
              onClick={onCompare}
              className="px-3 py-1.5 rounded-xl border border-[#e5ece6] hover:bg-slate-50 text-xs font-bold text-[#3d4a3e] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          )}
          {onShortlist && (
            <button
              onClick={onShortlist}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isShortlisted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#008236] text-white hover:bg-[#006e2e]'
              }`}
            >
              {isShortlisted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
