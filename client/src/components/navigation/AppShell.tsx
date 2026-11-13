import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlatformData } from '../../context/PlatformDataContext';
import { UserRole } from '../../types';
import { Breadcrumbs } from './Breadcrumbs';
import { 
  GraduationCap, 
  Shield, 
  Briefcase, 
  Users, 
  LogOut, 
  Bell, 
  Layers, 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  Sliders, 
  Menu, 
  X,
  ExternalLink,
  Building2,
  FileCheck,
  Cpu,
  Settings,
  PhoneCall,
  Award,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeRole: UserRole;
  title: string;
  subtitle?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  activeRole, 
  title, 
  subtitle 
}) => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, isBackendConnected } = usePlatformData();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleMeta: Record<UserRole, { label: string; badgeBg: string; textColor: string; icon: any; baseRoute: string }> = {
    platform_admin: {
      label: 'Platform Administrator',
      badgeBg: 'bg-[#3d4a3e] text-white',
      textColor: 'text-[#3d4a3e]',
      icon: Shield,
      baseRoute: '/admin/dashboard'
    },
    recruiter: {
      label: 'Placement Operations',
      badgeBg: 'bg-[#0082c0] text-white',
      textColor: 'text-[#0082c0]',
      icon: Briefcase,
      baseRoute: '/recruiter/dashboard'
    },
    partner_admin: {
      label: 'Partner Admin (Institution)',
      badgeBg: 'bg-[#008236] text-white',
      textColor: 'text-[#008236]',
      icon: GraduationCap,
      baseRoute: '/partner-admin/dashboard'
    },
    partner_staff: {
      label: 'Partner Placement Officer',
      badgeBg: 'bg-[#00b8f9] text-[#18221b]',
      textColor: 'text-[#0082c0]',
      icon: Users,
      baseRoute: '/partner-staff/dashboard'
    }
  };

  const currentMeta = roleMeta[activeRole];
  const RoleIcon = currentMeta.icon;

  // Build navigation items based on active role
  const getNavLinks = () => {
    switch (activeRole) {
      case 'platform_admin':
        return [
          { name: 'Overview', href: '/admin/dashboard', icon: Layers },
          { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
          { name: 'Users & Roles', href: '/admin/users', icon: Users },
          { name: 'Candidate Directory', href: '/admin/candidates', icon: Users },
          { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
          { name: 'Applications', href: '/admin/applications', icon: FileCheck },
          { name: 'Placements', href: '/admin/placements', icon: Award },
          { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
          { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
          { name: 'Integrations', href: '/admin/integrations', icon: Cpu },
          { name: 'Settings', href: '/admin/settings', icon: Settings }
        ];
      case 'recruiter':
        return [
          { name: 'Overview', href: '/recruiter/dashboard', icon: Layers },
          { name: 'Candidate Directory', href: '/recruiter/candidates', icon: Users },
          { name: 'Resume Intake', href: '/recruiter/intake', icon: UploadCloud },
          { name: 'AI Parse Review', href: '/recruiter/parser', icon: Sparkles },
          { name: 'Job Requisitions', href: '/recruiter/jobs', icon: Briefcase },
          { name: 'AI Matching', href: '/recruiter/matching', icon: Sliders },
          { name: 'Pipeline Kanban', href: '/recruiter/pipeline', icon: Layers },
          { name: 'Candidate Outreach', href: '/recruiter/outreach', icon: PhoneCall },
          { name: 'Interview Management', href: '/recruiter/interviews', icon: CalendarCheck },
          { name: 'Offers & Placements', href: '/recruiter/offers', icon: Award },
          { name: 'Placement Reports', href: '/recruiter/reports', icon: BarChart3 },
          { name: 'Settings', href: '/recruiter/settings', icon: Settings }
        ];
      case 'partner_admin':
        return [
          { name: 'Overview', href: '/partner-admin/dashboard', icon: Layers },
          { name: 'Placement Approvals', href: '/partner-admin/approvals', icon: CheckCircle2 },
          { name: 'Candidate Submissions', href: '/partner-admin/candidates', icon: Users },
          { name: 'Bulk Resume Intake', href: '/partner-admin/intake', icon: UploadCloud },
          { name: 'AI Parse Review', href: '/partner-admin/parser', icon: Sparkles },
          { name: 'Progress Tracking', href: '/partner-admin/tracking', icon: FileCheck },
          { name: 'Offers & Placements', href: '/partner-admin/offers', icon: Award },
          { name: 'Staff Management', href: '/partner-admin/staff', icon: Users },
          { name: 'Organization Profile', href: '/partner-admin/profile', icon: Building2 },
          { name: 'Placement Reports', href: '/partner-admin/reports', icon: BarChart3 }
        ];
      case 'partner_staff':
        return [
          { name: 'Intake Dashboard', href: '/partner-staff/dashboard', icon: Layers },
          { name: 'Bulk Resume Upload', href: '/partner-staff/intake', icon: UploadCloud },
          { name: 'Parse Review Queue', href: '/partner-staff/parser', icon: Sparkles },
          { name: 'Candidate Directory', href: '/partner-staff/candidates', icon: Users },
          { name: 'Application Tracking', href: '/partner-staff/tracking', icon: FileCheck }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="h-screen max-h-screen bg-[#f4f7f5] text-[#18221b] flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar for Desktop - Fixed stationary layout, does not scroll with page */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e5ece6] p-4 justify-between flex-shrink-0 h-full overflow-y-auto">
          <div>
            {/* Brand in Sidebar */}
            <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#e5ece6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#008236] text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-tight text-[#18221b]">
                  SFT<span className="text-[#008236]"> Talent Cloud</span>
                </span>
                <span className="text-[10px] font-mono text-[#5e6d61]">Enterprise Operations</span>
              </div>
            </Link>

            {/* Navigation items */}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = 
                  location.pathname === link.href || 
                  (location.pathname.startsWith(link.href) && link.href !== currentMeta.baseRoute);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#008236] text-white shadow-sm shadow-[#008236]/20' 
                        : 'text-[#3d4a3e] hover:bg-[#f4f7f5] hover:text-[#18221b]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Sign Out Section */}
          <div className="pt-4 border-t border-[#e5ece6]">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area - Scrollable viewport, sidebar remains stationary */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto min-h-0">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ece6] px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-2xs">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-[#3d4a3e] hover:bg-[#f4f7f5] rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <Breadcrumbs />
                <h1 className="text-xl font-bold text-[#18221b] tracking-tight">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Button */}
              <button
                onClick={() => setNotifDrawerOpen(true)}
                className="relative p-2.5 rounded-xl text-[#3d4a3e] hover:bg-[#f4f7f5] transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#e5ece6]">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                  alt={user?.name || 'User avatar'}
                  className="h-9 w-9 rounded-full object-cover border border-[#008236]/30"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#18221b] leading-tight">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-[#5e6d61] leading-tight">{currentMeta.label}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Child Page Content */}
          <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl p-4 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6] mb-3">
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#008236] text-white">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-sm text-[#18221b]">
                    SFT<span className="text-[#008236]"> Talent Cloud</span>
                  </span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[#5e6d61]" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 overflow-y-auto max-h-[60vh]">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== currentMeta.baseRoute);
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-[#008236] text-white' : 'text-[#3d4a3e] hover:bg-[#f4f7f5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-[#e5ece6]">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Drawer Modal */}
      {notifDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setNotifDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#008236]" />
                    <h2 className="text-lg font-bold text-[#18221b]">Platform Notifications</h2>
                  </div>
                  <button 
                    onClick={() => setNotifDrawerOpen(false)}
                    className="p-1 rounded-lg hover:bg-[#f4f7f5] text-[#5e6d61]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-[75vh]">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        n.read 
                          ? 'bg-white border-[#e5ece6] opacity-75' 
                          : 'bg-[#008236]/5 border-[#008236]/30 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          n.type === 'alert' ? 'bg-rose-100 text-rose-700' :
                          n.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                          n.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-[10px] text-[#8a998c]">{n.timestamp}</span>
                      </div>
                      <h3 className="text-xs font-bold text-[#18221b]">{n.title}</h3>
                      <p className="text-xs text-[#5e6d61] mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5ece6]">
                <button
                  onClick={() => setNotifDrawerOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#3d4a3e] text-white font-semibold text-xs text-center"
                >
                  Close Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
