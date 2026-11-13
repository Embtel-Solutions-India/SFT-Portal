import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { Job } from '../../../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  X
} from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const { jobs, createJob, updateJobStatus } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Job State
  const [title, setTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'on_site'>('remote');
  const [employmentType, setEmploymentType] = useState<'full_time' | 'contract' | 'internship'>('full_time');
  const [salaryRange, setSalaryRange] = useState('$140,000 - $170,000 USD');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Three.js');
  const [experienceRange, setExperienceRange] = useState('4-7 Years');
  const [description, setDescription] = useState('');

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  const closedJobs = jobs.filter(j => j.status === 'closed').length;

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !employer) return;

    createJob({
      title,
      employer,
      department,
      location,
      workMode,
      employmentType,
      salaryRange,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: ['Tailwind CSS', 'WebGL'],
      experienceRange,
      description: description || 'High impact client requisition.',
      status: 'active'
    });

    setModalOpen(false);
    setTitle('');
    setEmployer('');
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Platform Job Requisitions"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Mandates"
            value={totalJobs}
            subtext="All corporate roles"
            variant="default"
          />
          <KPIStatCard
            label="Active Requisitions"
            value={activeJobs}
            subtext="Open for matching"
            variant="success"
          />
          <KPIStatCard
            label="Draft Requisitions"
            value={draftJobs}
            subtext="In review/preparation"
            variant="warning"
          />
          <KPIStatCard
            label="Filled / Closed"
            value={closedJobs}
            subtext="Successfully staffed"
            variant="default"
          />
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, employer, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="draft">Drafts Only</option>
                <option value="closed">Closed Only</option>
              </select>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Requisition</span>
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <div 
              key={job.id} 
              className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between hover:border-[#008236]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    job.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : job.status === 'draft'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#0082c0]">
                    {job.workMode} • {job.experienceRange}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#18221b]">{job.title}</h4>
                <p className="text-xs text-[#5e6d61] mb-3 font-semibold">{job.employer} ({job.department})</p>

                <div className="space-y-1.5 text-xs text-[#3d4a3e] mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8a998c]" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#008236]" />
                    <span>{job.salaryRange}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#f4f7f5] text-[10px] font-mono text-[#3d4a3e]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5ece6] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#8a998c]">Posted {job.createdAt}</span>
                <div className="flex items-center gap-2">
                  {job.status === 'active' ? (
                    <button
                      onClick={() => updateJobStatus(job.id, 'closed')}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-[#5e6d61] hover:bg-gray-50 text-[11px] font-semibold cursor-pointer"
                    >
                      Close Mandate
                    </button>
                  ) : (
                    <button
                      onClick={() => updateJobStatus(job.id, 'active')}
                      className="px-2.5 py-1 rounded-lg bg-[#008236] text-white hover:bg-[#006b2c] text-[11px] font-bold cursor-pointer"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Job */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
                <h3 className="text-base font-bold text-[#18221b]">Create Corporate Requisition</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Distributed Systems Engineer"
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Hiring Client *</label>
                    <input
                      type="text"
                      required
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                      placeholder="e.g. Apex Innovations Ltd"
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Workplace Modality *</label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as any)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    >
                      <option value="remote">Fully Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="on_site">On-Site</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Compensation Range *</label>
                    <input
                      type="text"
                      required
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Experience Range *</label>
                    <input
                      type="text"
                      required
                      value={experienceRange}
                      onChange={(e) => setExperienceRange(e.target.value)}
                      placeholder="e.g. 4-7 Years"
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Required Skills (Comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs"
                  >
                    Publish Requisition
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

export default AdminJobsPage;
