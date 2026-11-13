import React, { useState } from 'react';
import { AppShell } from '../../../components/navigation/AppShell';
import { KPIStatCard } from '../../../components/common/KPIStatCard';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { AuditEvent } from '../../../types';
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  X 
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const { auditEvents } = usePlatformData();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const totalEvents = auditEvents.length;
  const orgEvents = auditEvents.filter(e => e.entity.toLowerCase().includes('org') || e.action.includes('ORG')).length;
  const placementEvents = auditEvents.filter(e => e.entity.toLowerCase().includes('offer') || e.action.includes('OFFER') || e.action.includes('WAIVER')).length;
  const userEvents = auditEvents.filter(e => e.entity.toLowerCase().includes('user') || e.action.includes('USER')).length;

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = 
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.correlationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || event.entity.toLowerCase() === entityFilter.toLowerCase();
    return matchesSearch && matchesEntity;
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Action,Actor Email,Actor Role,Entity,Entity ID,Details\n"
      + auditEvents.map(e => `"${e.timestamp}","${e.action}","${e.actorEmail}","${e.actorRole}","${e.entity}","${e.entityId}","${e.details.replace(/"/g, '""')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SFS_System_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      activeRole="platform_admin"
      title="Compliance Audit Log & Event Explorer"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPIStatCard
            label="Total Ledger Events"
            value={totalEvents}
            subtext="Append-only records"
            variant="default"
          />
          <KPIStatCard
            label="Institutional Actions"
            value={orgEvents}
            subtext="Verifications & state changes"
            variant="default"
          />
          <KPIStatCard
            label="Placement & Waivers"
            value={placementEvents}
            subtext="Signoffs & exception overrides"
            variant="warning"
          />
          <KPIStatCard
            label="Security & Access"
            value={userEvents}
            subtext="Role & identity changes"
            variant="info"
          />
        </div>

        {/* Filter & Action Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5ece6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8a998c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, details, actor email, or correlation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs focus:outline-none focus:border-[#008236]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#5e6d61]">Filter Entity:</span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#f9fbf9] border border-[#e5ece6] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Entities</option>
                <option value="organization">Organization</option>
                <option value="candidate">Candidate</option>
                <option value="job">Job</option>
                <option value="application">Application</option>
                <option value="offer">Offer & Placement</option>
                <option value="user">User</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#008236] hover:bg-[#006b2c] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger (CSV)</span>
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-[#e5ece6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f9fbf9] border-b border-[#e5ece6] font-mono text-[11px] text-[#5e6d61]">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Authorized Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Operational Summary</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ece6]">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-[#f9fbf9]/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5e6d61] whitespace-nowrap">
                      {event.timestamp}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        event.action.includes('REJECT') || event.action.includes('SUSPEND')
                          ? 'bg-rose-100 text-rose-800'
                          : event.action.includes('WAIVER')
                          ? 'bg-purple-100 text-purple-800'
                          : event.action.includes('APPROVE') || event.action.includes('CONFIRM')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-[#3d4a3e]'
                      }`}>
                        {event.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#18221b]">{event.actorEmail}</div>
                      <div className="text-[10px] font-mono text-[#8a998c]">Role: {event.actorRole}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] uppercase text-[#0082c0]">
                      {event.entity} ({event.entityId})
                    </td>

                    <td className="py-3 px-4 max-w-md truncate text-[#3d4a3e]">
                      {event.details}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="p-1.5 rounded-lg border border-[#e5ece6] hover:bg-gray-100 text-[#5e6d61] cursor-pointer"
                        title="Inspect Audit Event"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Event Payload Inspection */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5ece6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#008236]" />
                  <h3 className="text-base font-bold text-[#18221b]">Audit Ledger Event Detail</h3>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <div className="space-y-4 pt-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] space-y-1">
                  <div><strong>Event ID:</strong> {selectedEvent.id}</div>
                  <div><strong>Correlation ID:</strong> {selectedEvent.correlationId}</div>
                  <div><strong>Action:</strong> {selectedEvent.action}</div>
                  <div><strong>Timestamp:</strong> {selectedEvent.timestamp}</div>
                  <div><strong>Actor:</strong> {selectedEvent.actorEmail} ({selectedEvent.actorRole})</div>
                  <div><strong>Target:</strong> {selectedEvent.entity} ({selectedEvent.entityId})</div>
                </div>

                <div>
                  <span className="font-bold text-[#18221b] block mb-1">Operational Description</span>
                  <div className="p-3 rounded-xl border border-[#e5ece6] bg-white text-[#3d4a3e] font-sans">
                    {selectedEvent.details}
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#18221b]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminAuditPage;
