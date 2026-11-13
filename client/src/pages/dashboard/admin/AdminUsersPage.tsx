import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { UserRole } from '../../../types';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Building2, 
  ShieldAlert 
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { 
    users, 
    organizations, 
    addUser, 
    toggleUserStatus 
  } = usePlatformData();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'partner_staff' as UserRole,
    organizationId: organizations[0]?.id || ''
  });
  const [inviteError, setInviteError] = useState<string | null>(null);

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'platform_admin').length;
  const recruiterUsers = users.filter(u => u.role === 'recruiter').length;
  const partnerUsers = users.filter(u => u.role === 'partner_admin' || u.role === 'partner_staff').length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!inviteForm.name || !inviteForm.email) {
      setInviteError('Please fill out all required fields.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === inviteForm.email.toLowerCase())) {
      setInviteError('A user with this email address already exists in the system.');
      return;
    }

    if (['partner_admin', 'partner_staff'].includes(inviteForm.role) && !inviteForm.organizationId) {
      setInviteError('Partner users must be explicitly bound to an authorized Partner Organization.');
      return;
    }

    const assignedOrg = organizations.find(o => o.id === inviteForm.organizationId);

    addUser({
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      organizationId: ['partner_admin', 'partner_staff'].includes(inviteForm.role) ? inviteForm.organizationId : undefined,
      organizationName: ['partner_admin', 'partner_staff'].includes(inviteForm.role) ? assignedOrg?.displayName : undefined,
      status: 'active'
    });

    setInviteModalOpen(false);
    setInviteForm({
      name: '',
      email: '',
      role: 'partner_staff',
      organizationId: organizations[0]?.id || ''
    });
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Users & Role-Based Access Control"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Platform Users"
            value={totalUsers}
            subtext="Active system identities"
            variant="default"
          />
          <KPIStatCard
            label="Platform Admins"
            value={adminUsers}
            subtext="Root system privilege"
            variant="default"
          />
          <KPIStatCard
            label="Placement Operations"
            value={recruiterUsers}
            subtext="Recruitment leads"
            variant="info"
          />
          <KPIStatCard
            label="Partner Institutional"
            value={partnerUsers}
            subtext="Staff & administrators"
            variant="success"
          />
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name or corporate email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="recruiter">Recruiter (Placement Ops)</option>
                <option value="partner_admin">Partner Admin</option>
                <option value="partner_staff">Partner Placement Officer</option>
              </select>
            </div>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">User Identity</th>
                  <th className="py-3 px-4">Designated Role</th>
                  <th className="py-3 px-4">Associated Institution</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredUsers.map(u => {
                  const org = organizations.find(o => o.id === u.organizationId);
                  return (
                    <tr key={u.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#18221b]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#3d4a3e]/10 text-[#3d4a3e] flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[11px] text-[#5e6d61] font-normal">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          u.role === 'platform_admin'
                            ? 'bg-[#3d4a3e] text-white'
                            : u.role === 'recruiter'
                            ? 'bg-[#0082c0] text-white'
                            : u.role === 'partner_admin'
                            ? 'bg-[#008236] text-white'
                            : 'bg-[#00b8f9] text-[#18221b]'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#5e6d61]">
                        {org ? (
                          <div className="flex items-center gap-1.5 font-semibold text-[#18221b]">
                            <Building2 className="w-3.5 h-3.5 text-[#0082c0]" />
                            <span>{org.displayName}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] text-[#8a998c]">Global Platform Scoped</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[#5e6d61]">
                        {u.lastLogin || 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {u.role !== 'platform_admin' && (
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                              u.status === 'active'
                                ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'bg-[#008236] text-white hover:bg-[#006b2c]'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend Access' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role & Permissions Governance Matrix */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5ece6]">
            <ShieldAlert className="w-5 h-5 text-[#008236]" />
            <div>
              <h3 className="text-sm font-bold text-[#18221b]">Role-Permission Governance Matrix (PRD Section 3)</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-2.5 px-3">Capability</th>
                  <th className="py-2.5 px-3 text-center">Platform Admin</th>
                  <th className="py-2.5 px-3 text-center">Recruiter</th>
                  <th className="py-2.5 px-3 text-center">Partner Admin</th>
                  <th className="py-2.5 px-3 text-center">Partner Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6] text-xs">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Institutional Verification & Approval</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Job Requisition Management</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Advisory AI Matching Workspace</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ View</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Attributed Placement Signoff</td>
                  <td className="py-2.5 px-3 text-center text-purple-700 font-bold">Waiver Only</td>
                  <td className="py-2.5 px-3 text-center text-[#0082c0] font-bold">Request Only</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Signoff</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Candidate Bulk Resume Upload</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Full</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Scoped</td>
                  <td className="py-2.5 px-3 text-center text-[#008236] font-bold">✓ Scoped</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Invite User */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5ece6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
                <h3 className="text-base font-bold text-[#18221b]">Invite Authorized Platform User</h3>
                <button onClick={() => setInviteModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              {inviteError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {inviteError}
                </div>
              )}

              <form onSubmit={handleInviteSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Assigned Role *</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  >
                    <option value="recruiter">Recruiter (Placement Operations)</option>
                    <option value="partner_admin">Partner Administrator (Institution)</option>
                    <option value="partner_staff">Partner Placement Officer</option>
                    <option value="platform_admin">Platform Administrator</option>
                  </select>
                </div>

                {['partner_admin', 'partner_staff'].includes(inviteForm.role) && (
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">
                      Target Partner Organization *
                    </label>
                    <select
                      value={inviteForm.organizationId}
                      onChange={(e) => setInviteForm({ ...inviteForm, organizationId: e.target.value })}
                      className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                    >
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.displayName} ({org.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5ece6]">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#5e6d61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs"
                  >
                    Send Invitation
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

export default AdminUsersPage;
