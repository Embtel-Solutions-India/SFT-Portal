import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { InterviewRound } from '../../../types';
import { 
  CalendarCheck, 
  Calendar, 
  Video, 
  Plus, 
  Search, 
  Filter, 
  X
} from 'lucide-react';

export const RecruiterInterviewsPage: React.FC = () => {
  const { 
    interviews, 
    applications, 
    scheduleInterview, 
    updateInterviewOutcome 
  } = usePlatformData();

  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'pending' | 'passed' | 'failed'>('all');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  
  // Schedule Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [roundName, setRoundName] = useState<'Initial Screen' | 'Technical Round' | 'Hiring Manager' | 'Final Panel'>('Technical Round');
  const [interviewer, setInterviewer] = useState('Senior Staff Technologist');
  const [date, setDate] = useState('2026-11-15');
  const [time, setTime] = useState('14:00');
  const [timezone, setTimezone] = useState('EST (UTC-5)');
  const [modality, setModality] = useState<'video' | 'phone' | 'in_person'>('video');
  const [instructions, setInstructions] = useState('Please review system architecture principles prior to call.');

  const totalInterviews = interviews.length;
  const passedInterviews = interviews.filter(i => i.outcome === 'passed').length;
  const failedInterviews = interviews.filter(i => i.outcome === 'failed').length;
  const pendingInterviews = interviews.filter(i => i.outcome === 'pending').length;

  const filteredInterviews = interviews.filter(item => {
    const matchesSearch = 
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (outcomeFilter === 'all') return matchesSearch;
    return matchesSearch && item.outcome === outcomeFilter;
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find(a => a.id === selectedAppId);
    if (!app) return;

    scheduleInterview({
      applicationId: app.id,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      employer: app.employer,
      roundName,
      interviewer,
      date,
      time,
      timezone,
      modality,
      instructions,
      candidateContacted: true,
      attendance: 'scheduled',
      outcome: 'pending'
    });

    setScheduleModalOpen(false);
    setSelectedAppId('');
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Interview Coordination & Management"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Rounds"
            value={totalInterviews}
            subtext="Tracked rounds"
            variant="default"
          />
          <KPIStatCard
            label="Pending Evaluation"
            value={pendingInterviews}
            subtext="Awaiting scorecard"
            variant="warning"
          />
          <KPIStatCard
            label="Passed / Cleared"
            value={passedInterviews}
            subtext="Advanced to offer stage"
            variant="success"
          />
          <KPIStatCard
            label="Failed / Rejected"
            value={failedInterviews}
            subtext="Archived evaluations"
            variant="default"
          />
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, role, or interviewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'passed', 'failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setOutcomeFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    outcomeFilter === tab
                      ? 'bg-[#008236] text-white'
                      : 'bg-[#f4f7f5] text-[#5e6d61] hover:bg-[#e5ece6]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (applications.length > 0) setSelectedAppId(applications[0].id);
                setScheduleModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Round</span>
            </button>
          </div>
        </div>

        {/* Interviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInterviews.map(item => (
            <div 
              key={item.id} 
              className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between hover:border-[#0082c0]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#0082c0]/10 text-[#0082c0]">
                    {item.roundName}
                  </span>
                  <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    item.outcome === 'passed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : item.outcome === 'failed' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.outcome}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#18221b]">{item.candidateName}</h4>
                <p className="text-xs text-[#5e6d61] mb-3">{item.jobTitle} • {item.employer}</p>

                <div className="p-3.5 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] text-xs space-y-1.5 mb-3 font-mono">
                  <div className="flex items-center gap-2 text-[#18221b]">
                    <Calendar className="w-3.5 h-3.5 text-[#0082c0]" />
                    <span>{item.date} at {item.time} ({item.timezone})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5e6d61]">
                    <Video className="w-3.5 h-3.5 text-[#3d4a3e]" />
                    <span>Modality: <strong className="text-[#18221b] uppercase">{item.modality}</strong> • Interviewer: {item.interviewer}</span>
                  </div>
                </div>

                {item.instructions && (
                  <p className="text-xs text-[#5e6d61] mb-3 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                    <strong className="text-[#3d4a3e]">Candidate Prep Brief:</strong> {item.instructions}
                  </p>
                )}

                {item.feedbackNotes && (
                  <p className="text-xs text-[#18221b] p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <strong className="text-[#008236]">Evaluator Scorecard:</strong> {item.feedbackNotes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#e5ece6] mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8a998c]">
                  Attendance: <strong className="text-[#18221b] uppercase">{item.attendance}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateInterviewOutcome(item.id, 'passed', 'Candidate demonstrated exceptional capability during evaluation.', 'attended')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#008236] hover:bg-[#006b2c] text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Record Pass
                  </button>
                  <button
                    onClick={() => updateInterviewOutcome(item.id, 'failed', 'Technical benchmark not met for senior level expectation.', 'attended')}
                    className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    Record Fail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Schedule Round */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div>
                  <h3 className="text-base font-bold text-[#18221b]">Schedule Interview Round</h3>
                </div>
                <button onClick={() => setScheduleModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                    Candidate Application *
                  </label>
                  <select
                    required
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  >
                    <option value="">Select Candidate Application...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.candidateName} — {app.jobTitle} ({app.employer})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                      Round Type *
                    </label>
                    <select
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value as any)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    >
                      <option value="Initial Screen">Initial Screen</option>
                      <option value="Technical Round">Technical Round</option>
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Final Panel">Final Panel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                      Interviewer / Panel *
                    </label>
                    <input
                      type="text"
                      required
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      placeholder="e.g. Lead Engineer, Hiring VP"
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Timezone *</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    >
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="CST (UTC-6)">CST (UTC-6)</option>
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                      <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Modality *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'video', label: 'Video Call' },
                      { id: 'phone', label: 'Phone Call' },
                      { id: 'in_person', label: 'In-Person' }
                    ].map(mod => (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => setModality(mod.id as any)}
                        className={`p-2 rounded-xl border text-xs font-semibold capitalize transition-colors ${
                          modality === mod.id
                            ? 'border-[#008236] bg-[#008236]/10 text-[#008236]'
                            : 'border-[#e5ece6] hover:bg-gray-50 text-[#5e6d61]'
                        }`}
                      >
                        {mod.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Candidate Preparation Notes</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Confirm Interview
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

export default RecruiterInterviewsPage;
