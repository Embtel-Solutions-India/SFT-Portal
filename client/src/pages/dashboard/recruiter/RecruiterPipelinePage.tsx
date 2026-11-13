import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Application, ApplicationStage } from '../../../types';
import {
  Layers,
  Search,
  Filter,
  Calendar,
  Award,
  Check,
  ArrowRight,
  ChevronRight,
  Clock,
  GripVertical,
  Sparkles,
  MoveHorizontal
} from 'lucide-react';

export const RecruiterPipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, advanceApplicationStage } = usePlatformData();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');

  // Drag and Drop State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [lastMovedCandidate, setLastMovedCandidate] = useState<{ name: string; stage: string } | null>(null);

  const filteredApplications = applications.filter(a => {
    const matchesSearch =
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.employer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const orderedStages: ApplicationStage[] = [
    'shortlisted',
    'opportunity_communicated',
    'candidate_responded',
    'interviewing',
    'offer_pending',
    'partner_approval_pending',
    'offer_communicated',
    'candidate_accepted',
    'placement_confirmed'
  ];

  const handleStepStage = (app: Application) => {
    const currentIdx = orderedStages.indexOf(app.stage);
    if (currentIdx !== -1 && currentIdx < orderedStages.length - 1) {
      const nextStage = orderedStages[currentIdx + 1];
      advanceApplicationStage(app.id, nextStage);
      setLastMovedCandidate({
        name: app.candidateName,
        stage: nextStage.replace(/_/g, ' ')
      });
      setTimeout(() => setLastMovedCandidate(null), 3000);
    }
  };

  const handleDrop = (targetStage: ApplicationStage) => {
    if (!draggedAppId) return;
    const app = applications.find(a => a.id === draggedAppId);
    if (app && app.stage !== targetStage) {
      advanceApplicationStage(draggedAppId, targetStage);
      setLastMovedCandidate({
        name: app.candidateName,
        stage: targetStage.replace(/_/g, ' ')
      });
      setTimeout(() => setLastMovedCandidate(null), 3500);
    }
    setDraggedAppId(null);
    setDragOverStage(null);
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Recruitment Pipeline"
    >
      {/* FILTER & VIEW TOGGLE */}
      <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a998c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, opportunity, or employer..."
              className="pl-9 pr-4 py-2 rounded-xl border border-[#e5ece6] text-xs bg-[#f9fbf9] w-full focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white"
          >
            <option value="all">All Stages ({applications.length})</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="opportunity_communicated">Opportunity Communicated</option>
            <option value="candidate_responded">Candidate Responded</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer_pending">Offer Pending</option>
            <option value="partner_approval_pending">Partner Approval Pending</option>
            <option value="placement_confirmed">Placement Confirmed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${viewMode === 'table' ? 'bg-[#3d4a3e] text-white' : 'bg-white border border-[#e5ece6] text-[#3d4a3e]'
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${viewMode === 'kanban' ? 'bg-[#3d4a3e] text-white' : 'bg-white border border-[#e5ece6] text-[#3d4a3e]'
              }`}
          >
            Kanban View
          </button>
        </div>
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Sourcing Partner</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Advance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-[#f9fbf9]/80">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#18221b] text-sm">{app.candidateName}</div>
                      <div className="text-[11px] text-[#5e6d61]">{app.candidateEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#18221b]">{app.jobTitle}</div>
                      <div className="text-[11px] text-[#5e6d61]">{app.employer}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#008236] font-medium">
                      {app.partnerName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#3d4a3e] text-white">
                        {app.stage.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#8a998c]">
                      {new Date(app.lastUpdated).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {app.stage === 'shortlisted' && (
                        <button
                          onClick={() => navigate('/recruiter/interviews')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0082c0] hover:bg-[#006e9f] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Book Interview
                        </button>
                      )}

                      {app.stage === 'interviewing' && (
                        <button
                          onClick={() => navigate('/recruiter/offers')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#008236] hover:bg-[#006b2c] text-white text-[11px] font-bold cursor-pointer"
                        >
                          Draft Offer
                        </button>
                      )}

                      <button
                        onClick={() => handleStepStage(app)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#e5ece6] hover:bg-gray-100 text-[#3d4a3e] text-[11px] font-semibold cursor-pointer"
                        title="Step to next pipeline stage"
                      >
                        Step →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drag & Drop Notice and Status Toast */}
      {lastMovedCandidate && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#008236] text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#008236]" />
            <span>Successfully moved <strong>{lastMovedCandidate.name}</strong> to stage <strong>"{lastMovedCandidate.stage}"</strong>.</span>
          </div>
          <span className="font-mono text-[10px] text-[#008236]/80 uppercase">Pipeline Synced</span>
        </div>
      )}

      {/* VIEW: KANBAN COLUMNS WITH DRAG AND DROP */}
      {viewMode === 'kanban' && (
        <div className="space-y-3">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
            {[
              { id: 'shortlisted', label: 'Shortlisted', color: 'border-blue-200 bg-blue-50/40 text-blue-800' },
              { id: 'opportunity_communicated', label: 'Outreach Sent', color: 'border-cyan-200 bg-cyan-50/40 text-cyan-800' },
              { id: 'interviewing', label: 'Interviewing', color: 'border-purple-200 bg-purple-50/40 text-purple-800' },
              { id: 'offer_pending', label: 'Offer Drafting', color: 'border-amber-200 bg-amber-50/40 text-amber-800' },
              { id: 'partner_approval_pending', label: 'Partner Approval', color: 'border-orange-200 bg-orange-50/40 text-orange-800' },
              { id: 'placement_confirmed', label: 'Placement Confirmed', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800' }
            ].map(col => {
              const stageApps = applications.filter(a => a.stage === col.id);
              const isOver = dragOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverStage !== col.id) {
                      setDragOverStage(col.id);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(col.id as ApplicationStage);
                  }}
                  className={`w-72 shrink-0 rounded-2xl p-3 border transition-all flex flex-col ${isOver
                    ? 'border-2 border-dashed border-[#008236] bg-[#008236]/10 shadow-md scale-[1.01]'
                    : 'bg-[#f4f7f5] border-[#e5ece6]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold uppercase ${col.color}`}>
                        {col.label}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-mono font-bold text-[#5e6d61] border border-[#e5ece6]">
                      {stageApps.length}
                    </span>
                  </div>

                  {isOver && (
                    <div className="mb-2 p-2 rounded-xl bg-[#008236]/15 border border-[#008236]/30 text-center text-[11px] font-bold text-[#008236] animate-pulse">
                      Drop here to move to {col.label}
                    </div>
                  )}

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[65vh] pr-0.5">
                    {stageApps.map(app => {
                      const isDraggingThis = draggedAppId === app.id;
                      return (
                        <div
                          key={app.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', app.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedAppId(app.id);
                          }}
                          onDragEnd={() => {
                            setDraggedAppId(null);
                            setDragOverStage(null);
                          }}
                          className={`p-3.5 rounded-xl bg-white border border-[#e5ece6] shadow-2xs transition-all cursor-grab active:cursor-grabbing hover:border-[#0082c0] group ${isDraggingThis ? 'opacity-40 ring-2 ring-[#008236]' : 'hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="font-bold text-sm text-[#18221b] group-hover:text-[#0082c0] transition-colors">
                                {app.candidateName}
                              </h4>
                              <p className="text-xs text-[#5e6d61] mt-0.5">{app.jobTitle}</p>
                            </div>
                            <div className="text-[#8a998c] hover:text-[#3d4a3e] p-0.5" title="Drag card to move stage">
                              <GripVertical className="w-4 h-4" />
                            </div>
                          </div>

                          <p className="text-[11px] text-[#008236] font-medium mt-1 truncate">
                            {app.partnerName}
                          </p>

                          <div className="mt-3 pt-2.5 border-t border-[#e5ece6] flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f7f5] text-[#3d4a3e] font-semibold">
                              {app.matchScore}% Match
                            </span>

                            <div className="flex items-center gap-1.5">
                              {col.id === 'shortlisted' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/recruiter/interviews');
                                  }}
                                  className="text-[10px] font-bold text-[#0082c0] hover:underline cursor-pointer"
                                >
                                  Interview
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStepStage(app);
                                }}
                                className="text-[11px] font-bold text-[#008236] hover:underline cursor-pointer flex items-center gap-0.5"
                                title="Advance to next sequential stage"
                              >
                                <span>Advance</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {stageApps.length === 0 && !isOver && (
                      <div className="py-6 px-3 text-center text-xs text-[#8a998c] border border-dashed border-[#e5ece6] rounded-xl bg-white/40">
                        Drop candidate here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
};

