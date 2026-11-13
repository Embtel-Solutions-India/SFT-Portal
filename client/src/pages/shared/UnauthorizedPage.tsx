import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, RefreshCw, GraduationCap } from 'lucide-react';
import { UserRole } from '../../types';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const requiredRoles: UserRole[] = location.state?.requiredRoles || [];

  const roleLabels: Record<UserRole, string> = {
    platform_admin: 'Platform Administrator',
    recruiter: 'Placement Operations',
    partner_admin: 'Partner Organization Admin',
    partner_staff: 'Partner Staff / Placement Officer'
  };

  const handleSwitchToAllowed = (role: UserRole) => {
    logout();
    const routes: Record<UserRole, string> = {
      platform_admin: '/admin/login',
      recruiter: '/recruiter/login',
      partner_admin: '/partner-admin/login',
      partner_staff: '/partner-staff/login'
    };
    navigate(routes[role]);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#18221b] flex flex-col justify-between p-6">
      <header className="max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008236] text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-[#18221b]">
            School for <span className="text-[#008236]">Training</span>
          </span>
        </Link>
      </header>

      <main className="max-w-lg w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#e5ece6] text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-800">
          HTTP 403 // ACCESS RESTRICTED
        </span>

        <h1 className="text-2xl font-bold text-[#18221b] mt-4">
          Role-Based Access Guard
        </h1>

        <p className="text-xs text-[#5e6d61] mt-3 leading-relaxed">
          Your current session is authenticated as <strong>{user?.name || user?.role}</strong> ({user?.role ? roleLabels[user.role] : 'Unknown'}). The requested workspace requires one of the following permissions:
        </p>

        {requiredRoles.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] flex flex-wrap gap-2 justify-center">
            {requiredRoles.map(r => (
              <span key={r} className="px-2.5 py-1 rounded-lg bg-[#3d4a3e]/10 text-[#3d4a3e] text-xs font-mono font-bold">
                {roleLabels[r]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#e5ece6] space-y-3">
          <p className="text-[11px] font-mono text-[#5e6d61] uppercase">
            Sign in with a different account:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {requiredRoles.length > 0 ? (
              requiredRoles.map(r => (
                <button
                  key={r}
                  onClick={() => handleSwitchToAllowed(r)}
                  className="px-3 py-2 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-colors cursor-pointer"
                >
                  Sign in as {roleLabels[r].split(' ')[0]}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => handleSwitchToAllowed('platform_admin')}
                  className="px-3 py-2 rounded-xl bg-[#3d4a3e] text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  Admin Console
                </button>
                <button
                  onClick={() => handleSwitchToAllowed('partner_admin')}
                  className="px-3 py-2 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-colors"
                >
                  Partner Workspace
                </button>
              </>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e6d61] hover:text-[#18221b] pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Home</span>
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-[#8a998c] font-mono">
        School for Training • Tenant Boundary Enforcement
      </footer>
    </div>
  );
};

