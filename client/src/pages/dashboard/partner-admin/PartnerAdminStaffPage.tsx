import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  X 
} from 'lucide-react';

export const PartnerAdminStaffPage: React.FC = () => {
  const { user } = useAuth();
  const { users, organizations, addUser, toggleUserStatus } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  const myOrg = organizations.find(o => o.id === user?.organizationId) || organizations[0];
  const orgStaff = users.filter(u => u.organizationId === myOrg?.id);

  const totalStaff = orgStaff.length;
  const activeStaff = orgStaff.filter(u => u.status === 'active').length;

  const filteredStaff = orgStaff.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    addUser({
      name: staffName,
      email: staffEmail,
      role: 'partner_staff',
      organizationId: myOrg.id,
      organizationName: myOrg.displayName,
      status: 'active'
    });

    setInviteModalOpen(false);
    setStaffName('');
    setStaffEmail('');
  };

  return (
    <AppShell
      activeRole="partner_admin"
      title="Placement Staff & Delegated Officers"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Authorized Staff"
            value={totalStaff}
            subtext="Institutional users"
            variant="default"
          />
          <KPIStatCard
            label="Active Staff"
            value={activeStaff}
            subtext="Can upload resumes"
            variant="success"
          />
          <KPIStatCard
            label="Placement Officers"
            value={orgStaff.filter(u => u.role === 'partner_staff').length}
            subtext="Delegated operators"
            variant="info"
          />
          <KPIStatCard
            label="Institutional Admins"
            value={orgStaff.filter(u => u.role === 'partner_admin').length}
            subtext="Primary signoffs"
            variant="default"
          />
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Placement Officer</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role Delegation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#18221b]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#008236]/10 text-[#008236] flex items-center justify-center font-bold text-xs uppercase">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div>{staff.name}</div>
                          <div className="text-[11px] text-[#5e6d61] font-normal">{staff.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        staff.role === 'partner_admin'
                          ? 'bg-[#008236] text-white'
                          : 'bg-[#00b8f9] text-[#18221b]'
                      }`}>
                        {staff.role === 'partner_admin' ? 'Partner Admin' : 'Placement Officer'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        staff.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {staff.status || 'active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5e6d61]">
                      {staff.lastLogin || 'Recent'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {staff.role !== 'partner_admin' && (
                        <button
                          onClick={() => toggleUserStatus(staff.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            staff.status === 'active'
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'bg-[#008236] text-white hover:bg-[#006b2c]'
                          }`}
                        >
                          {staff.status === 'active' ? 'Revoke Access' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Invite Placement Officer */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5ece6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
                <h3 className="text-base font-bold text-[#18221b]">Invite Placement Officer</h3>
                <button onClick={() => setInviteModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4 pt-4">
                <p className="text-xs text-[#5e6d61]">
                  Placement officers can upload candidate resume batches and review parsed fields, but cannot approve placement opportunities or modify organization settings.
                </p>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#3d4a3e] mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
                  />
                </div>

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

export default PartnerAdminStaffPage;
