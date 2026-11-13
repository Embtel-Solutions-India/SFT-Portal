import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Job } from '../../../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Edit3, 
  Check, 
  X,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';

export const RecruiterJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, createJob, updateJobStatus } = usePlatformData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newJobForm, setNewJobForm] = useState({
    title: '',
    employer: '',
    department: 'Engineering',
    location: 'Remote, US',
    workMode: 'remote' as const,
    employmentType: 'full_time' as const,
    experienceRange: '3-5 years',
    salaryRange: '$120,000 - $140,000',
    description: '',
    requiredSkills: 'React, TypeScript, CSS',
    preferredSkills: 'Next.js, Tailwind, GraphQL'
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.employer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title || !newJobForm.employer) return;

    createJob({
      title: newJobForm.title,
      employer: newJobForm.employer,
      department: newJobForm.department,
      location: newJobForm.location,
      workMode: newJobForm.workMode,
      employmentType: newJobForm.employmentType,
      experienceRange: newJobForm.experienceRange,
      salaryRange: newJobForm.salaryRange,
      description: newJobForm.description,
      requiredSkills: newJobForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: newJobForm.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'active'
    });

    setCreateModalOpen(false);
    setNewJobForm({
      title: '',
      employer: '',
      department: 'Engineering',
      location: 'Remote, US',
      workMode: 'remote',
      employmentType: 'full_time',
      experienceRange: '3-5 years',
      salaryRange: '$120,000 - $140,000',
      description: '',
      requiredSkills: 'React, TypeScript, CSS',
      preferredSkills: 'Next.js, Tailwind, GraphQL'
    });
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Job Requisitions Management"
    >
      {/* ACTION BAR & FILTERS */}
      <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a998c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by job title, client employer, or skills..."
              className="pl-9 pr-4 py-2 rounded-xl border border-[#e5ece6] text-xs bg-[#f9fbf9] w-full focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e5ece6] text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Requisition</span>
        </button>
      </div>

      {/* JOBS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map(job => (
          <div key={job.id} className="p-5 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0082c0]/10 text-[#0082c0]">
                  {job.workMode}
                </span>
                <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {job.status}
                </span>
              </div>

              <h4 className="font-bold text-[#18221b] text-base">{job.title}</h4>
              <p className="text-xs text-[#5e6d61] mb-2">{job.employer} • {job.location}</p>

              <p className="text-xs text-[#3d4a3e] line-clamp-3 mb-3">{job.description}</p>

              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-mono text-[#8a998c] block uppercase">Required Stack</span>
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-[#f4f7f5] text-[10px] font-semibold text-[#18221b]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5ece6] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#5e6d61]">
                <span>Salary: <strong className="text-[#18221b]">{job.salaryRange}</strong></span>
                <span className="font-mono font-bold text-[#0082c0]">{job.applicantsCount} in pipeline</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const nextStatus = job.status === 'active' ? 'paused' : 'active';
                    updateJobStatus(job.id, nextStatus);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e5ece6] text-[#5e6d61] hover:bg-[#f4f7f5] text-xs font-semibold cursor-pointer"
                >
                  {job.status === 'active' ? 'Pause' : 'Activate'}
                </button>

                <button
                  onClick={() => navigate('/recruiter/matching')}
                  className="px-3 py-1.5 rounded-lg bg-[#0082c0] hover:bg-[#006e9f] text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Match</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE JOB MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6] mb-4">
              <h3 className="text-base font-bold text-[#18221b]">Post Client Job Requisition</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-[#5e6d61]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#18221b] mb-1">Job Title <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    value={newJobForm.title}
                    onChange={e => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    placeholder="e.g. Lead WebGL Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-[#e5ece6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#18221b] mb-1">Client Employer <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    value={newJobForm.employer}
                    onChange={e => setNewJobForm({ ...newJobForm, employer: e.target.value })}
                    placeholder="e.g. Vanguard Interactive"
                    className="w-full px-3 py-2 rounded-xl border border-[#e5ece6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#18221b] mb-1">Work Mode</label>
                  <select
                    value={newJobForm.workMode}
                    onChange={e => setNewJobForm({ ...newJobForm, workMode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5ece6] bg-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#18221b] mb-1">Experience</label>
                  <input
                    type="text"
                    value={newJobForm.experienceRange}
                    onChange={e => setNewJobForm({ ...newJobForm, experienceRange: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5ece6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#18221b] mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newJobForm.salaryRange}
                    onChange={e => setNewJobForm({ ...newJobForm, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e5ece6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#18221b] mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={newJobForm.requiredSkills}
                  onChange={e => setNewJobForm({ ...newJobForm, requiredSkills: e.target.value })}
                  placeholder="e.g. Three.js, WebGL, React, TypeScript"
                  className="w-full px-3 py-2 rounded-xl border border-[#e5ece6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18221b] mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={newJobForm.description}
                  onChange={e => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  placeholder="Key responsibilities and technical expectations..."
                  className="w-full p-2.5 rounded-xl border border-[#e5ece6]"
                />
              </div>

              <div className="pt-3 border-t border-[#e5ece6] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold cursor-pointer"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};

