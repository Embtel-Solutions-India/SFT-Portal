import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicHeader } from '../../components/navigation/PublicHeader';
import { usePlatformData } from '../../context/PlatformDataContext';
import { api } from '../../services/api';
import { OrganizationType } from '../../types';
import { 
  Building2, 
  GraduationCap, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Calendar,
  Users,
  Award,
  BookOpen,
  PhoneCall,
  Briefcase,
  ChevronRight,
  Globe,
  Mail,
  CheckCircle2
} from 'lucide-react';
import {
  EnterpriseNetworkGrid,
  SftVerificationShield,
  MatchWaveformGauge,
  StepConnectorLine,
  HandshakeSealSvg,
  UsInterviewBadgeSvg
} from '../../components/common/SvgIllustrators';

export const RegisterOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerOrganization } = usePlatformData();

  // Navigation tab state: 'proposal' (interactive flyer view) or 'register' (3-step onboarding form)
  const [activeTab, setActiveTab] = useState<'proposal' | 'register'>('proposal');
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);
  const [callRequested, setCallRequested] = useState<boolean>(false);
  const [callEmail, setCallEmail] = useState<string>('');
  const [callAcademyName, setCallAcademyName] = useState<string>('');

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionComplete, setSubmissionComplete] = useState<boolean>(false);
  const [createdOrgId, setCreatedOrgId] = useState<string>('');

  // Form Fields State
  const [formData, setFormData] = useState({
    legalName: '',
    displayName: '',
    type: 'university' as OrganizationType,
    location: '',
    website: '',
    authorizedRepresentative: '',
    representativeTitle: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    confirmPassword: '',
    consentAttestationAccepted: false,
    termsAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.legalName.trim()) errs.legalName = 'Legal entity name is required.';
    if (!formData.displayName.trim()) errs.displayName = 'Display name is required.';
    if (!formData.location.trim()) errs.location = 'Location (City, Country) is required.';
    if (!formData.website.trim() || !formData.website.includes('.')) {
      errs.website = 'Valid official website URL is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.authorizedRepresentative.trim()) {
      errs.authorizedRepresentative = 'Authorized representative full name is required.';
    }
    if (!formData.representativeTitle.trim()) {
      errs.representativeTitle = 'Official institutional title is required.';
    }
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      errs.contactEmail = 'Official institutional email is required.';
    }
    if (!formData.contactPhone.trim()) {
      errs.contactPhone = 'Official contact phone is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.password || formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters with numbers and letters.';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.consentAttestationAccepted) {
      errs.consentAttestationAccepted = 'You must attest that your organization collects verified candidate consent.';
    }
    if (!formData.termsAccepted) {
      errs.termsAccepted = 'You must accept the Partner Terms of Service.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      const apiRes = await api.auth.register({
        legalName: formData.legalName,
        displayName: formData.displayName,
        type: formData.type,
        location: formData.location,
        website: formData.website,
        authorizedRepresentative: formData.authorizedRepresentative,
        representativeTitle: formData.representativeTitle,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        password: formData.password
      });

      if (apiRes.isDuplicateFlagged) {
        setDuplicateModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (apiRes.success && apiRes.organization) {
        setCreatedOrgId(apiRes.organization.id);
        setSubmissionComplete(true);
        setIsSubmitting(false);
        return;
      }
    } catch (e) {
      console.warn('Backend API register fallback to context:', e);
    }

    const result = registerOrganization({
      legalName: formData.legalName,
      displayName: formData.displayName,
      type: formData.type,
      location: formData.location,
      website: formData.website,
      authorizedRepresentative: formData.authorizedRepresentative,
      representativeTitle: formData.representativeTitle,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone
    });

    setIsSubmitting(false);

    if (result.isDuplicate) {
      setDuplicateModalOpen(true);
      return;
    }

    if (result.success && result.org) {
      setCreatedOrgId(result.org.id);
      setSubmissionComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#18221b] flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation Switcher Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#e5ece6] shadow-sm">
            <button
              onClick={() => setActiveTab('proposal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'proposal'
                  ? 'bg-[#064e3b] text-white shadow-md'
                  : 'text-[#5e6d61] hover:text-[#18221b] hover:bg-[#f4f7f5]'
              }`}
            >
              <Award className="w-4 h-4 text-[#ea580c]" />
              <span>SFT Partnership Proposal</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#064e3b] text-white shadow-md'
                  : 'text-[#5e6d61] hover:text-[#18221b] hover:bg-[#f4f7f5]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#008236]" />
              <span>Partner Institution Onboarding</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SFT PARTNERSHIP PROPOSAL (Company Names Hidden / Generalized)      */}
        {/* ========================================================================= */}
        {activeTab === 'proposal' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner Section with Photo & SVG Illustrators */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#093c2c] to-[#04281e] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-[#0d5943]">
              {/* Dynamic SVG Background Grid Vector */}
              <div className="absolute inset-0 opacity-40">
                <EnterpriseNetworkGrid className="w-full h-full object-cover" />
              </div>

              {/* Ambient Radial Lights */}
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#ea580c]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Heading, Value Prop & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#fbb040] text-xs font-mono font-bold tracking-wide uppercase backdrop-blur-xs border border-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>US-INDUSTRY TRAINING • SFT CERTIFIED • DIRECT INTERVIEWS</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12]">
                    Make your learners <span className="text-[#f97316]">US-job ready</span>, SFT-certified and interview-ready.
                  </h1>

                  <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-xl">
                    SFT trains academy learners for US-industry roles, certifies real-world technical execution, then connects them to direct interviews with leading US enterprise tech employers and Silicon Valley partner companies.
                  </p>

                  {/* Dual Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('register')}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#d44e08] text-white text-xs font-bold transition-all shadow-xl shadow-[#ea580c]/30 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Register Partner Academy</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setCallModalOpen(true)}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer backdrop-blur-md transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Calendar className="w-4 h-4 text-[#fbb040]" />
                      <span>Schedule 20-Min Pilot Call</span>
                    </button>
                  </div>

                  {/* Micro Trust Matrix */}
                  <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-black text-white font-mono">100%</div>
                      <div className="text-[11px] text-emerald-200/80 font-medium">US Industry Overlap</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#f97316] font-mono">4-6 Wks</div>
                      <div className="text-[11px] text-emerald-200/80 font-medium">Intake to Interview</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white font-mono">Direct</div>
                      <div className="text-[11px] text-emerald-200/80 font-medium">Enterprise Access</div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Handshake Image & Floating SVG Illustrators */}
                <div className="lg:col-span-5 relative">
                  {/* Outer Framed Image Container */}
                  <div className="relative mx-auto max-w-md lg:max-w-none">
                    {/* Glowing Backdrop Border */}
                    <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-[#f97316]/40 via-[#10b981]/30 to-[#fbb040]/30 blur-lg opacity-70" />

                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#09241b]">
                      <img
                        src="/hero-handshake.jpg"
                        alt="Professional Interview Handshake across desk with laptop and evaluation clipboard"
                        className="w-full h-[320px] sm:h-[400px] object-cover object-center filter contrast-[1.03] brightness-[0.98] transition-transform duration-700 hover:scale-105"
                      />
                      {/* Dark gradient overlay for badge readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* Floating SVG Illustrator Card 1: Top Right - SFT Verified Shield */}
                    <div className="absolute -top-5 -right-3 sm:-right-5 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/50 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700 z-20">
                      <SftVerificationShield size={40} className="shrink-0 drop-shadow-md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ea580c] bg-[#ea580c]/10 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                          <span className="text-xs font-bold text-[#18221b]">SFT Attested</span>
                        </div>
                        <p className="text-[11px] text-[#5e6d61] font-medium">US-Industry Certified</p>
                      </div>
                    </div>

                    {/* Floating SVG Illustrator Card 2: Bottom Left - Radial Match Gauge */}
                    <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-[#04281e]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/30 shadow-2xl flex items-center gap-3.5 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 z-20">
                      <MatchWaveformGauge percentage={96} size={48} className="shrink-0" />
                      <div>
                        <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                          <span>Interview Ready</span>
                          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                        </div>
                        <p className="text-[11px] text-emerald-200/90 font-mono">96% Enterprise Fit</p>
                      </div>
                    </div>

                    {/* Subtle Overlay Pill: Fremont CA Tech Hub */}
                    <div className="hidden sm:flex absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 items-center gap-2 text-white text-[11px] font-mono z-10 shadow-lg">
                      <UsInterviewBadgeSvg className="w-4 h-4" />
                      <span>Fremont, CA Hub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section with Flow Connectors & SVG Elements */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5ece6] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="font-mono text-xs font-bold text-[#ea580c] tracking-wider uppercase">
                    OPERATIONAL LIFECYCLE
                  </span>
                  <h2 className="text-2xl font-black text-[#064e3b] font-display mt-1">
                    How it works
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#5e6d61] bg-[#f4f7f5] px-3.5 py-1.5 rounded-xl border border-[#e5ece6]">
                  <ShieldCheck className="w-4 h-4 text-[#008236]" />
                  <span>Transparent 4-Step Intake Pipeline</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-[#f7faf8] border border-[#e5ece6] relative hover:border-[#008236]/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        1
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#064e3b] bg-[#064e3b]/10 px-2 py-0.5 rounded-full">
                        Phase 01
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#18221b] mb-1.5">Academy enrolls</h3>
                    <p className="text-xs text-[#5e6d61] leading-relaxed">
                      Shares learners for the next batch with structured resumes, verified academic records, and portfolio artifacts.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e5ece6] flex items-center gap-1.5 text-[11px] font-medium text-[#064e3b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Candidate Consent Attested</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-[#f7faf8] border border-[#e5ece6] relative hover:border-[#ea580c]/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        2
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full">
                        Phase 02
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#18221b] mb-1.5">SFT trains</h3>
                    <p className="text-xs text-[#5e6d61] leading-relaxed">
                      Rigorous US-industry skills, communication standards, system design patterns, and modern enterprise toolsets.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e5ece6] flex items-center gap-1.5 text-[11px] font-medium text-[#ea580c]">
                    <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>US Industry Overlap Focus</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-[#f7faf8] border border-[#e5ece6] relative hover:border-[#008236]/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        3
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#064e3b] bg-[#064e3b]/10 px-2 py-0.5 rounded-full">
                        Phase 03
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#18221b] mb-1.5">SFT certifies</h3>
                    <p className="text-xs text-[#5e6d61] leading-relaxed">
                      Comprehensive project evaluation, code review, and issue of official cryptographic SFT credential badge.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e5ece6] flex items-center gap-1.5 text-[11px] font-medium text-[#064e3b]">
                    <Award className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Cryptographic Attestation</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-6 rounded-2xl bg-[#f7faf8] border border-[#e5ece6] relative hover:border-[#ea580c]/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-[#ea580c] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        4
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full">
                        Phase 04
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#18221b] mb-1.5">Interviews</h3>
                    <p className="text-xs text-[#5e6d61] leading-relaxed">
                      Direct scheduled interviews with leading US enterprise tech employers, Silicon Valley firms, and vetted hiring partners.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e5ece6] flex items-center gap-1.5 text-[11px] font-medium text-[#ea580c]">
                    <Users className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>Direct Corporate Placement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Training Cohorts & Executive Classroom Spotlight */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#093c2c] to-[#04281e] text-white rounded-3xl p-6 sm:p-10 border border-[#0d5943] shadow-xl overflow-hidden relative">
              {/* Decorative Background Grid */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <EnterpriseNetworkGrid className="w-full h-full object-cover" />
              </div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Classroom Photo with Floating Badges */}
                <div className="lg:col-span-6 relative order-2 lg:order-1">
                  <div className="relative mx-auto max-w-md lg:max-w-none">
                    {/* Glowing Accent Border */}
                    <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#ea580c]/30 to-[#10b981]/30 blur-md opacity-60" />

                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#09241b]">
                      <img
                        src="/training-classroom.jpg"
                        alt="SFT Executive Classroom Training Cohort with live presentation and engaged learners"
                        className="w-full h-[280px] sm:h-[360px] object-cover object-center filter contrast-[1.02] brightness-[0.98] transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* Floating Badge Top Left: Live Cohort Sessions */}
                    <div className="absolute -top-3.5 -left-2 sm:-left-4 bg-[#064e3b]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-400/30 shadow-xl flex items-center gap-2 text-white z-20">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                      <span className="text-[11px] font-mono font-bold tracking-tight">Live Evening Overlap • 9:00 - 10:30 PM IST</span>
                    </div>

                    {/* Floating Badge Bottom Right: Real-Time SFT Instruction */}
                    <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 shadow-2xl flex items-center gap-3 text-[#18221b] z-20">
                      <GraduationCap className="w-5 h-5 text-[#ea580c]" />
                      <div>
                        <div className="text-xs font-black text-[#064e3b]">Interactive Faculty Instruction</div>
                        <p className="text-[10px] text-[#5e6d61] font-mono">Fremont, CA Curriculum Standards</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Training Narrative & Core Curriculum Pillars */}
                <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fbb040] text-xs font-mono font-bold uppercase tracking-wider border border-white/15 mb-3">
                      <BookOpen className="w-3.5 h-3.5 text-[#f97316]" />
                      <span>PHASE 02 DEEP DIVE • LIVE US-INDUSTRY TRAINING</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                      Inside SFT Interactive Training Cohorts
                    </h2>
                    <p className="text-sm sm:text-base text-emerald-100/90 mt-3 leading-relaxed">
                      Conducted during evening IST hours for direct US daylight overlap, SFT transforms classroom theory into production-grade delivery through active executive lectures, live code reviews, and cross-cultural communication practice.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="h-8 w-8 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs mt-0.5">
                        01
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">US Workplace Communication & Culture</h4>
                        <p className="text-xs text-emerald-200/80 leading-relaxed mt-0.5">
                          Cross-cultural standup protocols, asynchronous documentation, sprint demos, and executive presentation tactics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="h-8 w-8 rounded-xl bg-[#008236] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs mt-0.5">
                        02
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Modern Engineering & System Design</h4>
                        <p className="text-xs text-emerald-200/80 leading-relaxed mt-0.5">
                          Architectural deep dives, cloud deployment topologies, automated test harnesses, and clean-code refactoring.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="h-8 w-8 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs mt-0.5">
                        03
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">1:1 Mock Interviews & SFT Attestation</h4>
                        <p className="text-xs text-emerald-200/80 leading-relaxed mt-0.5">
                          Rigorous simulated interviews with Silicon Valley practitioners followed by individualized feedback and formal credentialing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setCallModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ea580c] hover:bg-[#d44e08] text-white text-xs font-bold transition-all shadow-lg shadow-[#ea580c]/30 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Request Cohort Syllabus & Briefing</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Who Does What Section (Two-Column Comparative Grid) */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5ece6] shadow-sm">
              <div className="mb-6">
                <span className="font-mono text-xs font-bold text-[#ea580c] tracking-wider uppercase">
                  ROLES & RESPONSIBILITIES
                </span>
                <h2 className="text-2xl font-black text-[#064e3b] font-display mt-1">
                  Who does what
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: THE ACADEMY */}
                <div className="rounded-2xl border border-[#064e3b]/30 overflow-hidden bg-white shadow-sm flex flex-col">
                  <div className="bg-[#064e3b] text-white px-6 py-4 flex items-center justify-between">
                    <span className="font-display font-bold text-sm tracking-wider uppercase">
                      THE ACADEMY
                    </span>
                    <Building2 className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div className="p-6 space-y-4 flex-1 bg-[#f7faf8]/40">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Nominate learners for each training batch, with verified resumes.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Confirm the evening IST schedule (US-overlap hours).
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Training fee per learner, paid in bulk by the academy or by each learner.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Nominate one dedicated coordinator for program updates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: SFT (SCHOOL FOR TRAINING) */}
                <div className="rounded-2xl border border-[#ea580c]/30 overflow-hidden bg-white shadow-sm flex flex-col">
                  <div className="bg-[#ea580c] text-white px-6 py-4 flex items-center justify-between">
                    <span className="font-display font-bold text-sm tracking-wider uppercase">
                      SFT (SCHOOL FOR TRAINING)
                    </span>
                    <GraduationCap className="w-5 h-5 text-orange-200" />
                  </div>
                  <div className="p-6 space-y-4 flex-1 bg-[#fffbf9]/60">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Delivers training in US work culture, communication, and modern tools.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Evaluates each learner's profile and projects, then issues the official SFT certificate.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Conducts one mock interview with an SFT industry expert.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-xs text-[#18221b] font-medium leading-relaxed">
                        Introduces certified learners directly to vetted US enterprise tech partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What Your Academy Gets Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5ece6] shadow-sm">
              <div className="mb-6">
                <span className="font-mono text-xs font-bold text-[#ea580c] tracking-wider uppercase">
                  PARTNER VALUE DELIVERABLES
                </span>
                <h2 className="text-2xl font-black text-[#064e3b] font-display mt-1">
                  What your academy gets
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Benefit 1 */}
                <div className="rounded-2xl border-t-4 border-t-[#ea580c] bg-[#064e3b] text-white p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">SFT certificate</h3>
                    <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                      Proof of US work-readiness and technical proficiency.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Award className="w-6 h-6 text-[#fbb040] opacity-80" />
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="rounded-2xl border-t-4 border-t-[#ea580c] bg-[#064e3b] text-white p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">Interview access</h3>
                    <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                      Certified learners meet US-aligned hiring companies directly.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Briefcase className="w-6 h-6 text-[#fbb040] opacity-80" />
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="rounded-2xl border-t-4 border-t-[#ea580c] bg-[#064e3b] text-white p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">Job-ready skills</h3>
                    <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                      Communication, modern tools, and cross-border work culture.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <BookOpen className="w-6 h-6 text-[#fbb040] opacity-80" />
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="rounded-2xl border-t-4 border-t-[#ea580c] bg-[#064e3b] text-white p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">Stronger admissions</h3>
                    <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                      "Trained here, interview-ready" institutional credentialing.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <GraduationCap className="w-6 h-6 text-[#fbb040] opacity-80" />
                  </div>
                </div>
              </div>

              {/* Training Covers Chips */}
              <div className="mt-8 pt-8 border-t border-[#e5ece6]">
                <span className="font-mono text-xs font-bold text-[#064e3b] tracking-wider uppercase block mb-3">
                  TRAINING COVERS
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-4 py-2 rounded-xl bg-[#f4f7f5] border border-[#e5ece6] text-xs font-semibold text-[#18221b]">
                    US work culture
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#f4f7f5] border border-[#e5ece6] text-xs font-semibold text-[#18221b]">
                    Business communication
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#f4f7f5] border border-[#e5ece6] text-xs font-semibold text-[#18221b]">
                    Google Workspace, Canva and AI tools
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#f4f7f5] border border-[#e5ece6] text-xs font-semibold text-[#18221b]">
                    Interview preparation
                  </span>
                </div>
              </div>
            </div>

            {/* Next Step Orange Action Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white p-6 sm:p-10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-100">
                  ENGAGEMENT ROADMAP
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-display">
                  Next step: a 20-minute call to start a pilot batch
                </h3>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-white/95">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-orange-200" />
                    <span>Evenings 9:00-10:30 PM IST (US Pacific overlap)</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-white/90 pt-1">
                  Himanshu • Business Associate, Sales & Marketing • School for Training (SFT)
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setCallModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#ea580c] text-xs font-bold hover:bg-orange-50 transition-all shadow-md cursor-pointer text-center"
                >
                  Schedule Pilot Call
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#043327] transition-all shadow-md cursor-pointer text-center"
                >
                  Register Academy Now
                </button>
              </div>
            </div>

            {/* Footer Institutional Attribution Bar */}
            <div className="text-center py-6 border-t border-[#e5ece6] text-xs text-[#5e6d61] space-y-1">
              <p className="font-semibold text-[#18221b]">
                School for Training (SFT) | Fremont, California |{' '}
                <a 
                  href="https://www.schoolfortraining.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#ea580c] hover:underline"
                >
                  www.schoolfortraining.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PARTNER INSTITUTION REGISTRATION (3-Step Onboarding Form)          */}
        {/* ========================================================================= */}
        {activeTab === 'register' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Context Banner with Company Names Hidden */}
            <div className="bg-[#064e3b]/5 border border-[#064e3b]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#064e3b] text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#ea580c]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#064e3b] block">
                    School for Training (SFT) Partner Intake Program
                  </span>
                  <span className="text-[11px] text-[#5e6d61]">
                    Accredited partner status connects your certified learners with leading US enterprise tech employers.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('proposal')}
                className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Review Full Proposal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Onboarding Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008236]/10 text-[#008236] text-xs font-mono mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>PARTNER INSTITUTION ONBOARDING</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18221b] tracking-tight">
                Register Your Partner Organization
              </h1>
            </div>

            {/* Successful Submission View */}
            {submissionComplete ? (
              <div className="glass-panel-light p-8 sm:p-10 rounded-3xl border border-[#008236]/30 shadow-xl text-center bg-white">
                <div className="h-16 w-16 rounded-2xl bg-[#008236]/10 text-[#008236] flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>

                <span className="font-mono text-xs font-bold uppercase text-[#008236] tracking-wider">
                  REGISTRATION SUBMITTED // PENDING VERIFICATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18221b] mt-2">
                  Welcome, {formData.displayName}
                </h2>
                <p className="text-sm text-[#5e6d61] mt-3 max-w-lg mx-auto leading-relaxed">
                  Your application has been received and entered into the <strong>Platform Administrator Verification Queue</strong> (Reference: <code>{createdOrgId}</code>).
                </p>

                {/* Review Checklist Notice */}
                <div className="mt-8 p-6 rounded-2xl bg-[#f4f7f5] border border-[#e5ece6] text-left max-w-xl mx-auto space-y-3">
                  <p className="text-xs font-mono font-bold uppercase text-[#3d4a3e]">
                    Verification Review Checklist:
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#5e6d61]">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Domain & authorized representative verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5e6d61]">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Accreditation registry cross-reference</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5e6d61]">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Candidate consent policy compliance check</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register/status"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-all"
                  >
                    Track Registration Status
                  </Link>
                  <Link
                    to="/partner-admin/login"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#e5ece6] text-[#3d4a3e] text-xs font-semibold hover:bg-white transition-all"
                  >
                    Go to Partner Login Portal
                  </Link>
                </div>
              </div>
            ) : (
              /* Multi-Step Registration Form */
              <div className="glass-panel-light p-6 sm:p-10 rounded-3xl border border-[#e5ece6] shadow-xl bg-white">
                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e5ece6]">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 1 ? 'bg-[#008236] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      1
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-[#18221b]">Organization</p>
                      <p className="text-[10px] text-[#5e6d61]">Entity identification</p>
                    </div>
                  </div>

                  <div className="h-0.5 w-12 bg-[#e5ece6]" />

                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 2 ? 'bg-[#008236] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-[#18221b]">Representative</p>
                      <p className="text-[10px] text-[#5e6d61]">Authorized contact</p>
                    </div>
                  </div>

                  <div className="h-0.5 w-12 bg-[#e5ece6]" />

                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep >= 3 ? 'bg-[#008236] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      3
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-[#18221b]">Attestation & Security</p>
                      <p className="text-[10px] text-[#5e6d61]">Consent & credentials</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* STEP 1: ORGANIZATION DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#18221b]">Step 1: Organization Identification</h3>

                      <div>
                        <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                          Legal Registered Entity Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.legalName}
                          onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                          placeholder="e.g. Apex Institute of Technology Inc."
                          className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                        />
                        {errors.legalName && <p className="text-xs text-rose-600 mt-1">{errors.legalName}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Display Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="e.g. Apex Institute of Technology"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.displayName && <p className="text-xs text-rose-600 mt-1">{errors.displayName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Organization Type <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as OrganizationType })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          >
                            <option value="university">University / Higher Education</option>
                            <option value="college">Four-Year College</option>
                            <option value="polytechnic">Polytechnic / Technical Institute</option>
                            <option value="coaching_center">Coding Bootcamp / Coaching Center</option>
                            <option value="vocational_institute">Vocational & Trade Academy</option>
                            <option value="other">Other Educational Organization</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Headquarters Location (City, State, Country) <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Fremont, CA, USA"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Official Website Domain <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                            placeholder="e.g. https://apex-tech.edu"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.website && <p className="text-xs text-rose-600 mt-1">{errors.website}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: AUTHORIZED REPRESENTATIVE */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#18221b]">Step 2: Authorized Representative</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Representative Full Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.authorizedRepresentative}
                            onChange={e => setFormData({ ...formData, authorizedRepresentative: e.target.value })}
                            placeholder="e.g. Dr. Elena Rostova"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.authorizedRepresentative && <p className="text-xs text-rose-600 mt-1">{errors.authorizedRepresentative}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Official Institutional Title <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.representativeTitle}
                            onChange={e => setFormData({ ...formData, representativeTitle: e.target.value })}
                            placeholder="e.g. Dean of Career Services"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.representativeTitle && <p className="text-xs text-rose-600 mt-1">{errors.representativeTitle}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Official Institutional Email <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                            placeholder="e.g. elena.rostova@apex-tech.edu"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.contactEmail && <p className="text-xs text-rose-600 mt-1">{errors.contactEmail}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Direct Phone Contact <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                            placeholder="e.g. +1 (617) 555-0192"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.contactPhone && <p className="text-xs text-rose-600 mt-1">{errors.contactPhone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ATTESTATION & SECURITY */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#18221b]">Step 3: Security & Consent Attestation</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Portal Admin Password <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Minimum 8 characters"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                            Confirm Password <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Re-enter password"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e5ece6] focus:border-[#008236] focus:outline-none text-sm bg-white"
                          />
                          {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>}
                        </div>
                      </div>

                      {/* Candidate Consent Attestation Box */}
                      <div className="p-4 rounded-2xl bg-[#008236]/5 border border-[#008236]/30">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consentAttestationAccepted}
                            onChange={e => setFormData({ ...formData, consentAttestationAccepted: e.target.checked })}
                            className="mt-1 h-4 w-4 rounded text-[#008236] focus:ring-[#008236]"
                          />
                          <div className="text-xs text-[#3d4a3e]">
                            <span className="font-bold text-[#18221b]">Candidate Consent & Authorization Attestation (Policy v2.1):</span>
                            <p className="mt-1 text-[#5e6d61] leading-relaxed">
                              I attest that our institution obtains explicit candidate consent to store, process via advisory AI, and share resume records with recruitment operations prior to any bulk submission.
                            </p>
                          </div>
                        </label>
                        {errors.consentAttestationAccepted && (
                          <p className="text-xs text-rose-600 mt-2 font-medium">{errors.consentAttestationAccepted}</p>
                        )}
                      </div>

                      {/* Terms acceptance */}
                      <div className="p-4 rounded-2xl bg-white border border-[#e5ece6]">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.termsAccepted}
                            onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                            className="mt-1 h-4 w-4 rounded text-[#008236] focus:ring-[#008236]"
                          />
                          <div className="text-xs text-[#3d4a3e]">
                            I accept the <a href="#terms" className="text-[#008236] underline font-bold">Partner Terms of Service</a> and acknowledge that pending organizations cannot access candidate intake until verified.
                          </div>
                        </label>
                        {errors.termsAccepted && (
                          <p className="text-xs text-rose-600 mt-2 font-medium">{errors.termsAccepted}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation & Submit Controls */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#e5ece6]">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e5ece6] text-xs font-bold text-[#3d4a3e] hover:bg-[#f4f7f5] cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous Step</span>
                      </button>
                    ) : <div />}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-all cursor-pointer shadow-md shadow-[#008236]/20"
                      >
                        <span>Continue to Step {currentStep + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#008236] text-white text-xs font-bold hover:bg-[#006b2c] transition-all cursor-pointer shadow-lg shadow-[#008236]/30 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Verifying & Submitting...</span>
                        ) : (
                          <>
                            <span>Submit Registration for Verification</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Schedule Pilot Call Modal */}
        {callModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#e5ece6] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5ece6]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#18221b]">Schedule Pilot Batch Call</h3>
                    <p className="text-[11px] text-[#5e6d61]">School for Training (SFT) • Fremont, CA</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCallModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              {callRequested ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-[#18221b]">Briefing Request Received</h4>
                  <p className="text-xs text-[#5e6d61] max-w-sm mx-auto leading-relaxed">
                    Himanshu (Business Associate, SFT) has received your request. A calendar invite for the next available evening slot (9:00 - 10:30 PM IST) will be sent to <strong>{callEmail}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setCallModalOpen(false);
                      setCallRequested(false);
                      setActiveTab('register');
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold"
                  >
                    Proceed to Academy Registration
                  </button>
                </div>
              ) : (
                <div className="pt-4 space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5] text-xs text-[#9a3412]">
                    <div className="font-bold">US-Overlap Schedule:</div>
                    <div>Evenings 9:00 - 10:30 PM IST (US Pacific daylight overlap).</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                      Academy / Institution Name
                    </label>
                    <input
                      type="text"
                      value={callAcademyName}
                      onChange={e => setCallAcademyName(e.target.value)}
                      placeholder="e.g. Apex Institute of Technology"
                      className="w-full px-4 py-2 rounded-xl border border-[#e5ece6] text-xs focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3d4a3e] mb-1">
                      Your Institutional Email
                    </label>
                    <input
                      type="email"
                      value={callEmail}
                      onChange={e => setCallEmail(e.target.value)}
                      placeholder="e.g. coordinator@academy.edu"
                      className="w-full px-4 py-2 rounded-xl border border-[#e5ece6] text-xs focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCallModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#e5ece6] text-xs font-semibold text-[#5e6d61]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!callEmail || !callAcademyName}
                      onClick={() => setCallRequested(true)}
                      className="px-5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#d44e08] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      Confirm Briefing Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Duplicate Organization Warning Modal */}
        {duplicateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-200">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#18221b]">
                Potential Duplicate Organization Detected
              </h3>
              <p className="text-xs text-[#5e6d61] mt-2 leading-relaxed">
                An institution matching <strong>{formData.displayName}</strong> or with contact email <strong>{formData.contactEmail}</strong> is already registered in the platform registry.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl mt-4 text-[11px] text-amber-800">
                To prevent fractured candidate records and unverified collisions, duplicate organizations cannot be automatically merged.
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  to="/partner-admin/login"
                  className="w-full py-2.5 rounded-xl bg-[#008236] text-white text-xs font-bold text-center"
                >
                  Sign In to Existing Account
                </Link>
                <button
                  onClick={() => setDuplicateModalOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#e5ece6] text-xs font-semibold text-[#5e6d61]"
                >
                  Adjust Registration Details
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
