import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Shield, 
  Users, 
  Briefcase, 
  GraduationCap, 
  ChevronDown
} from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
        <div className="bg-white/95 backdrop-blur-md flex h-16 items-center justify-between px-5 sm:px-6 rounded-2xl border border-[#e5ece6] shadow-sm">
          
          {/* Clean Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#064e3b] to-[#008236] text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-extrabold tracking-tight text-[#18221b]">
                  SCHOOL FOR TRAINING
                </span>
                <span className="text-[10px] font-mono text-[#ea580c] font-bold px-1.5 py-0.5 rounded bg-[#ea580c]/10">
                  Fremont, CA
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#5e6d61] leading-none">
                US Industry Talent & Placement Cloud
              </span>
            </div>
          </Link>

          {/* Simple, Essential Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#4b5563]">
            <Link 
              to="/register"
              className={`hover:text-[#ea580c] transition-colors ${
                location.pathname === '/' || location.pathname === '/register' ? 'text-[#064e3b]' : ''
              }`}
            >
              Proposal
            </Link>
            <Link 
              to="/register/status"
              className={`hover:text-[#ea580c] transition-colors ${
                location.pathname === '/register/status' ? 'text-[#064e3b]' : ''
              }`}
            >
              Track Status
            </Link>
          </nav>

          {/* Action CTAs & Auth Dropdown */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Sign In Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3d4a3e] hover:text-[#18221b] rounded-xl hover:bg-[#f4f7f5] border border-[#e5ece6] transition-all cursor-pointer"
                aria-expanded={authDropdownOpen}
              >
                <span>Portal Sign In</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#8a998c] transition-transform duration-200" style={{ transform: authDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {authDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setAuthDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-[#e5ece6] z-50 animate-in fade-in slide-in-from-top-2">
                    <Link
                      to="/admin/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f4f7f5] transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-[#3d4a3e]/10 text-[#3d4a3e]">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#18221b]">Platform Admin</div>
                        <div className="text-[10px] text-[#5e6d61]">Governance & Audit Ledger</div>
                      </div>
                    </Link>

                    <Link
                      to="/recruiter/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f4f7f5] transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-[#0082c0]/10 text-[#0082c0]">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#18221b]">Placement Operations</div>
                        <div className="text-[10px] text-[#5e6d61]">Matching & Client Pipeline</div>
                      </div>
                    </Link>

                    <Link
                      to="/partner-admin/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f4f7f5] transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-[#008236]/10 text-[#008236]">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#18221b]">Partner Admin</div>
                        <div className="text-[10px] text-[#5e6d61]">Institution & Attribution Signoff</div>
                      </div>
                    </Link>

                    <Link
                      to="/partner-staff/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f4f7f5] transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-[#00b8f9]/10 text-[#0082c0]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#18221b]">Placement Officer</div>
                        <div className="text-[10px] text-[#5e6d61]">Resume Intake & Verification</div>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action Button */}
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#d44e08] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Onboard Academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3d4a3e] hover:bg-[#f4f7f5] rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 p-5 rounded-2xl bg-white border border-[#e5ece6] shadow-xl space-y-4 animate-in fade-in">
          <nav className="flex flex-col gap-2 text-sm font-semibold text-[#18221b]">
            <Link 
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 hover:text-[#008236]"
            >
              SFT Proposal
            </Link>
            <Link 
              to="/register/status"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 hover:text-[#008236]"
            >
              Track Application Status
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#e5ece6] grid grid-cols-2 gap-2">
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl border border-[#e5ece6] text-xs font-bold text-[#18221b] text-center"
            >
              Portal Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#ea580c] text-white text-xs font-bold text-center"
            >
              Onboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
