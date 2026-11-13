import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Application } from '../../../types';
import { 
  PhoneCall, 
  Mail, 
  Users, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Search, 
  Filter, 
  X, 
  Send,
  AlertCircle
} from 'lucide-react';

export const RecruiterOutreachPage: React.FC = () => {
  const { applications, recordCandidateResponse } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [responseFilter, setResponseFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [outreachModalApp, setOutreachModalApp] = useState<Application | null>(null);
  const [outreachChannel, setOutreachChannel] = useState<'phone' | 'email' | 'in_person'>('phone');
  const [candidateDecision, setCandidateDecision] = useState<'accepted' | 'declined'>('accepted');
  const [outreachNotes, setOutreachNotes] = useState('');

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.employer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (responseFilter === 'all') return matchesSearch;
    if (responseFilter === 'pending') return matchesSearch && !app.candidateResponse;
    return matchesSearch && app.candidateResponse === responseFilter;
  });

  const totalOutreach = applications.length;
  const acceptedCount = applications.filter(a => a.candidateResponse === 'accepted').length;
  const declinedCount = applications.filter(a => a.candidateResponse === 'declined').length;
  const pendingCount = applications.filter(a => !a.candidateResponse).length;

  const handleSaveOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachModalApp) return;

    recordCandidateResponse(
      outreachModalApp.id,
      candidateDecision,
      `[Channel: ${outreachChannel.toUpperCase()}] ${outreachNotes}`
    );
    setOutreachModalApp(null);
    setOutreachNotes('');
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Candidate Outreach & Engagement"
    >
      <div className="space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Active Inquiries"
            value={totalOutreach}
            subtext="Candidates in outreach"
            variant="default"
          />
          <KPIStatCard
            label="Candidate Accepted"
            value={acceptedCount}
            subtext="Consented to pursue"
            variant="success"
          />
          <KPIStatCard
            label="Pending Outreach"
            value={pendingCount}
            subtext="Awaiting response"
            variant="warning"
          />
          <KPIStatCard
            label="Opportunity Declined"
            value={declinedCount}
            subtext="Alternative roles sought"
            variant="default"
          />
        </div>

        {/* PRD Governance Callout */}
        <div className="p-4 rounded-2xl bg-[#0082c0]/10 border border-[#0082c0]/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#0082c0] shrink-0 mt-0.5" />
          <div className="text-xs text-[#18221b] space-y-1">
            <span className="font-bold text-[#0082c0]">Managed Candidate Record Governance (PRD Section 3.1)</span>
            <p className="text-[#3d4a3e]">
              Candidates do not have direct self-service logins. Placement staff and partner institutions act as authorized stewards. All outreach calls, emails, and in-person interviews must be logged here with explicit notes.
            </p>
          </div>
        </div>

        {/* Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by candidate, requisition, or employer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5e6d61]" />
            <span className="text-xs font-mono text-[#5e6d61]">Status:</span>
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'accepted', 'declined'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setResponseFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    responseFilter === tab
                      ? 'bg-[#008236] text-white'
                      : 'bg-[#f4f7f5] text-[#5e6d61] hover:bg-[#e5ece6]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Outreach Records Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Opportunity</th>
                  <th className="py-3 px-4">Primary Channel</th>
                  <th className="py-3 px-4">Response Status</th>
                  <th className="py-3 px-4">Recruiter / Staff Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18221b]">{app.candidateName}</div>
                      <div className="text-[11px] text-[#5e6d61]">Stage: {app.stage.toUpperCase()}</div>
                    </td>
                    <td className="py-3 px-4 text-[#5e6d61]">
                      <div className="font-semibold text-[#18221b]">{app.jobTitle}</div>
                      <div className="text-[11px] text-[#8a998c]">{app.employer}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#0082c0]">
                      <span className="flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3" />
                        Phone / Official Email
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        app.candidateResponse === 'accepted' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : app.candidateResponse === 'declined' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.candidateResponse ? app.candidateResponse : 'Pending Response'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#3d4a3e]">
                      {app.candidateResponseNotes || <span className="italic text-[#8a998c]">No notes logged yet</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setOutreachModalApp(app);
                          setCandidateDecision(app.candidateResponse === 'declined' ? 'declined' : 'accepted');
                          setOutreachNotes(app.candidateResponseNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0082c0] hover:bg-[#006e9f] text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Log Interaction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Log Interaction */}
        {outreachModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div>
                  <h3 className="text-base font-bold text-[#18221b]">Log Outreach Interaction</h3>
                  <p className="text-xs text-[#5e6d61]">{outreachModalApp.candidateName} • {outreachModalApp.jobTitle}</p>
                </div>
                <button onClick={() => setOutreachModalApp(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleSaveOutreach} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Contact Channel Used *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'phone', label: 'Phone Call', icon: PhoneCall },
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'in_person', label: 'In-Person', icon: Users }
                    ].map(chan => {
                      const Icon = chan.icon;
                      return (
                        <button
                          key={chan.id}
                          type="button"
                          onClick={() => setOutreachChannel(chan.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            outreachChannel === chan.id
                              ? 'border-[#008236] bg-[#008236]/10 text-[#008236]'
                              : 'border-[#e5ece6] hover:bg-gray-50 text-[#5e6d61]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{chan.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Candidate Decision / Consent *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCandidateDecision('accepted')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                        candidateDecision === 'accepted'
                          ? 'border-[#008236] bg-[#008236] text-white shadow-xs'
                          : 'border-[#e5ece6] hover:bg-gray-50 text-[#5e6d61]'
                      }`}
                    >
                      Accepted & Consented
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateDecision('declined')}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                        candidateDecision === 'declined'
                          ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                          : 'border-[#e5ece6] hover:bg-gray-50 text-[#5e6d61]'
                      }`}
                    >
                      Declined Opportunity
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Conversation Details & Placement Notes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={outreachNotes}
                    onChange={(e) => setOutreachNotes(e.target.value)}
                    placeholder="Log key points: candidate interest level, salary expectations discussed, notice period, location preferences..."
                    className="w-full p-3 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setOutreachModalApp(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Save Outreach Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default RecruiterOutreachPage;

