import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Shield, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X,
  KeyRound
} from 'lucide-react';

interface RoleLoginPageProps {
  role: UserRole;
}

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({ role }) => {
  const navigate = useNavigate();
  const { login, authError, clearError, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Role metadata configurations
  const roleConfig: Record<UserRole, {
    title: string;
    badge: string;
    badgeColor: string;
    accentColor: string;
    icon: any;
    placeholderEmail: string;
    description: string;
    redirectUrl: string;
  }> = {
    platform_admin: {
      title: 'Platform Administrator Console',
      badge: 'GOVERNANCE & OPS',
      badgeColor: 'bg-[#064e3b] text-white',
      accentColor: '#064e3b',
      icon: Shield,
      placeholderEmail: 'admin@sft or admin@sft.com',
      description: 'Institutional verification, security governance, and system-wide audit controls.',
      redirectUrl: '/admin/dashboard'
    },
    recruiter: {
      title: 'Placement Operations Portal',
      badge: 'RECRUITMENT & PIPELINE',
      badgeColor: 'bg-[#ea580c] text-white',
      accentColor: '#ea580c',
      icon: Briefcase,
      placeholderEmail: 'recruiter@sft.com',
      description: 'Candidate pipelines, advisory AI job matching, and employer interview coordination.',
      redirectUrl: '/recruiter/dashboard'
    },
    partner_admin: {
      title: 'Partner Organization Admin',
      badge: 'INSTITUTION OVERSIGHT',
      badgeColor: 'bg-[#008236] text-white',
      accentColor: '#008236',
      icon: GraduationCap,
      placeholderEmail: 'partner@sft.com',
      description: 'Manage institutional cohorts, authorize placement signoffs, and track hiring yield.',
      redirectUrl: '/partner-admin/dashboard'
    },
    partner_staff: {
      title: 'Partner Placement Officer',
      badge: 'CANDIDATE INTAKE',
      badgeColor: 'bg-[#00b8f9] text-[#18221b]',
      accentColor: '#00b8f9',
      icon: Users,
      placeholderEmail: 'staff@sft.com',
      description: 'Submit learner cohorts with verified consent policies and review AI resume parsing.',
      redirectUrl: '/partner-staff/dashboard'
    }
  };

  const currentConfig = roleConfig[role];
  const Icon = currentConfig.icon;

  useEffect(() => {
    setEmail('');
    setPassword('');
    clearError();
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password, role);
    setLoading(false);
    if (res.success) {
      navigate(currentConfig.redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#18221b] flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#064e3b] to-[#008236] text-white shadow-sm shadow-[#008236]/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-extrabold tracking-tight text-[#18221b]">
                SFT
              </span>
              <span className="text-[10px] font-mono text-[#ea580c] font-bold px-1.5 py-0.2 rounded bg-[#ea580c]/10">
                School for Training
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5e6d61] leading-none">
              In association with US Enterprise Hiring Partners
            </span>
          </div>
        </Link>

        <Link to="/register" className="text-xs font-semibold text-[#5e6d61] hover:text-[#008236] flex items-center gap-1">
          <span>Register New Academy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#e5ece6]">
          
          {/* Role Header & Badge */}
          <div className="text-center mb-8">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              role === 'platform_admin' ? 'bg-[#064e3b]/10 text-[#064e3b]' :
              role === 'recruiter' ? 'bg-[#ea580c]/10 text-[#ea580c]' :
              role === 'partner_admin' ? 'bg-[#008236]/10 text-[#008236]' :
              'bg-[#00b8f9]/15 text-[#0082c0]'
            }`}>
              <Icon className="w-7 h-7" />
            </div>

            <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${currentConfig.badgeColor}`}>
              {currentConfig.badge}
            </span>

            <h1 className="text-2xl font-bold text-[#18221b] tracking-tight">
              {currentConfig.title}
            </h1>
            <p className="text-xs text-[#5e6d61] mt-2 leading-relaxed">
              {currentConfig.description}
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#8a998c]" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={currentConfig.placeholderEmail}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#3d4a3e]">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#0082c0] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#8a998c]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#8a998c] hover:text-[#3d4a3e]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold transition-all shadow-md shadow-[#064e3b]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to {currentConfig.badge}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role Portal Switcher */}
          <div className="mt-8 pt-6 border-t border-[#e5ece6] text-center">
            <p className="text-[11px] text-[#5e6d61] mb-2 font-mono uppercase tracking-wider">
              Switch Access Portal
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {role !== 'platform_admin' && (
                <Link to="/admin/login" className="p-2 rounded-xl bg-[#f4f7f5] hover:bg-[#e5ece6] text-[#064e3b] font-medium truncate">
                  Admin Console
                </Link>
              )}
              {role !== 'recruiter' && (
                <Link to="/recruiter/login" className="p-2 rounded-xl bg-[#f4f7f5] hover:bg-[#e5ece6] text-[#ea580c] font-medium truncate">
                  Recruiter Portal
                </Link>
              )}
              {role !== 'partner_admin' && (
                <Link to="/partner-admin/login" className="p-2 rounded-xl bg-[#f4f7f5] hover:bg-[#e5ece6] text-[#008236] font-medium truncate">
                  Partner Admin
                </Link>
              )}
              {role !== 'partner_staff' && (
                <Link to="/partner-staff/login" className="p-2 rounded-xl bg-[#f4f7f5] hover:bg-[#e5ece6] text-[#0082c0] font-medium truncate">
                  Placement Staff
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#e5ece6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6] mb-4">
              <h3 className="text-base font-bold text-[#18221b]">Password Recovery</h3>
              <button 
                onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                className="text-[#8a998c] hover:text-[#18221b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-[#008236] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-[#18221b]">Password Reset Link Dispatched</h4>
                <p className="text-xs text-[#5e6d61] mt-2 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, a reset link has been emailed. It expires in 1 hour.
                </p>
                <button
                  onClick={() => { setForgotModalOpen(false); setForgotSent(false); }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#5e6d61] mb-4">
                  Enter your registered institutional email to receive a password reset link.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] text-sm mb-4"
                />
                <button
                  onClick={async () => { if (email) { await requestPasswordReset(email); setForgotSent(true); } }}
                  className="w-full py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#043d2e]"
                >
                  Send Recovery Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#8a998c] font-mono">
        School for Training (SFT) • US Enterprise Talent Cloud • 256-Bit TLS Security
      </footer>
    </div>
  );
};
