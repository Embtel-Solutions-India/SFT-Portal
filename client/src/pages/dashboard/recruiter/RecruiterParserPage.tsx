import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/navigation/AppShell';
import { usePlatformData } from '../../../context/PlatformDataContext';
import { parseResume, ParsedResumeResponse } from '../../../services/aiService';
import { BatchIntakeItem } from '../../../types';
import { 
  FileText, 
  Sparkles, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Languages,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';

const SAMPLE_RESUMES: Record<string, { label: string; language: string; fileName: string; text: string }> = {
  english_creative: {
    label: 'English — Maya Lin (Creative Technologist)',
    language: 'English',
    fileName: 'maya_lin_portfolio_resume.pdf',
    text: `MAYA LIN
Boston, MA • maya.lin@alumni.apex.demo • +1 (617) 555-8392
GitHub: github.com/mayalin-creative • Portfolio: mayalin.design

PROFESSIONAL SUMMARY
Senior Creative Technologist and WebGL Engineer with 4 years of experience building immersive interactive 3D web applications, GLSL shaders, and design systems for enterprise brands.

EDUCATION
Apex Institute of Technology
B.S. in Computer Science (Summa Cum Laude), 2022

CORE COMPETENCIES & SKILLS
- Languages: JavaScript (ESNext), TypeScript, GLSL, HTML5, CSS3/Tailwind
- 3D & Graphics: Three.js, React Three Fiber, WebGL 2.0, Blender, Post-processing
- Motion & UI: GSAP (ScrollTrigger, Flip), Framer Motion, Canvas API
- Frameworks: React, Next.js, Vite, Node.js

PROFESSIONAL EXPERIENCE
Senior Frontend Creative Engineer | Aura Interactive (2023 - Present)
- Architected procedural 3D landing experiences handling 1.2M monthly impressions.
- Optimized Three.js draw calls and buffer geometries, improving mobile frame rate from 24fps to 60fps.
- Authored custom fragment shaders for volumetric lighting and interactive particle simulations.`
  },
  hindi_bilingual: {
    label: 'Hindi & English — Priya Sharma (Full-Stack Engineer)',
    language: 'Hindi & English (Bilingual OCR)',
    fileName: 'priya_sharma_tech_cv.pdf',
    text: `PRIYA SHARMA | प्रिया शर्मा
New Delhi, India • priya.sharma@alumni.iitd.demo • +91 98765 43210
GitHub: github.com/priyasharma • LinkedIn: linkedin.com/in/priyasharma-dev

उद्देश्य एवं सारांश (SUMMARY):
वरिष्ठ सॉफ्टवेयर इंजीनियर (Senior Software Engineer) with 5 years in distributed systems, React, Python, and scalable backend microservices. Proven track record delivering fintech platforms.

शिक्षा (EDUCATION):
Indian Institute of Technology (IIT Delhi)
B.Tech in Computer Science and Engineering, 2021

तकनीकी कौशल (TECHNICAL SKILLS):
- Core: React, TypeScript, Python, Django, FastAPI, Node.js
- Cloud & Data: AWS (ECS, Lambda), PostgreSQL, Redis, Docker, Kubernetes
- Frontend: Tailwind CSS, Next.js, Redux Toolkit

कार्य अनुभव (EXPERIENCE):
Lead Fullstack Engineer | Delhi FinTech Solutions (2021 - Present)
- Managed core payment gateway processing over ₹50M daily transactions.
- Automated OCR data intake pipelines with 99.2% parsing accuracy.`
  },
  spanish_cloud: {
    label: 'Spanish — Carlos Rodriguez (DevOps & Cloud Architect)',
    language: 'Spanish (Castilian OCR)',
    fileName: 'carlos_rodriguez_cv_esp.pdf',
    text: `CARLOS RODRIGUEZ
Madrid, España • carlos.rodriguez@alumni.ucm.demo • +34 912 345 678
LinkedIn: linkedin.com/in/carlos-rodriguez-cloud

PERFIL PROFESIONAL
Arquitecto Cloud y Especialista DevOps con más de 6 años de experiencia en infraestructura como código, Kubernetes y optimización de microservicios en la nube.

FORMACIÓN ACADÉMICA
Universidad Complutense de Madrid
Grado en Ingeniería Informática, 2020

COMPETENCIAS Y HABILIDADES TÉCNICAS
- Nube: AWS, Google Cloud Platform, Azure
- Contenedores: Kubernetes, Docker, Helm, ArgoCD
- Automatización: Terraform, Ansible, GitHub Actions, CI/CD
- Desarrollo: Go, Python, Bash, Node.js

EXPERIENCIA LABORAL
Ingeniero Cloud Senior | Telefónica Tech (2021 - Actualidad)
- Migración de más de 40 microservicios críticos a clústeres Kubernetes multinube.
- Reducción del tiempo de despliegue en un 65% mediante pipelines automatizados.`
  }
};

export const RecruiterParserPage: React.FC = () => {
  const navigate = useNavigate();
  const { batchItems, addCandidate, organizations } = usePlatformData();

  const [activeSampleKey, setActiveSampleKey] = useState<string>('english_creative');
  const [resumeText, setResumeText] = useState<string>(SAMPLE_RESUMES.english_creative.text);
  const [activeFileName, setActiveFileName] = useState<string>(SAMPLE_RESUMES.english_creative.fileName);

  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English');
  const [modelUsed, setModelUsed] = useState<string>('Gemini');
  const [confidenceScore, setConfidenceScore] = useState<number>(95);

  const [parsedProfile, setParsedProfile] = useState({
    fullName: 'Maya Lin',
    email: 'maya.lin@alumni.apex.demo',
    phone: '+1 (617) 555-8392',
    location: 'Boston, MA',
    targetRole: 'Creative Technologist / WebGL Engineer',
    skills: ['Three.js', 'WebGL', 'GLSL', 'React', 'TypeScript', 'GSAP'],
    experienceYears: 4,
    education: 'B.S. in Computer Science, Apex Institute of Technology',
    summary: 'Senior Creative Technologist and WebGL Engineer with 4 years of experience building immersive interactive 3D web applications and GLSL shaders.'
  });

  const handleSelectSample = (key: string) => {
    setActiveSampleKey(key);
    const sample = SAMPLE_RESUMES[key];
    setResumeText(sample.text);
    setActiveFileName(sample.fileName);
    setDetectedLanguage(sample.language);
  };

  const handleParse = async () => {
    setIsParsing(true);
    try {
      const result: ParsedResumeResponse = await parseResume(resumeText);
      setParsedProfile({
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        location: result.location,
        targetRole: result.targetRole,
        skills: result.skills.map(s => s.name),
        experienceYears: result.experienceYears ?? 0,
        education: result.education,
        summary: result.summary
      });
      setDetectedLanguage(result.detectedLanguage || 'Unknown');
      setModelUsed(result.modelUsed);
      setConfidenceScore(result.parseConfidence ?? 0);
    } catch (e: any) {
      alert(e?.message || 'Resume parsing failed. Please retry.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmProfile = () => {
    const partner = organizations[0];

    addCandidate({
      id: `cand-${Date.now()}`,
      fullName: parsedProfile.fullName,
      email: parsedProfile.email,
      phone: parsedProfile.phone,
      location: parsedProfile.location,
      targetRole: parsedProfile.targetRole,
      partnerId: partner.id,
      partnerName: partner.displayName,
      status: 'active',
      consentState: 'verified',
      consentTimestamp: new Date().toISOString(),
      consentPolicyVersion: 'v2.1',
      skills: parsedProfile.skills,
      experienceYears: parsedProfile.experienceYears,
      education: parsedProfile.education,
      resumeFileName: activeFileName,
      submittedAt: new Date().toISOString(),
      parsedProfile: {
        fullName: parsedProfile.fullName,
        email: parsedProfile.email,
        phone: parsedProfile.phone,
        location: parsedProfile.location,
        skills: parsedProfile.skills.map(s => ({ name: s, confidence: 95 })),
        experienceYears: parsedProfile.experienceYears,
        education: parsedProfile.education,
        summary: parsedProfile.summary,
        parseConfidence: confidenceScore
      }
    });

    alert(`Candidate profile confirmed for ${parsedProfile.fullName}. Added to active talent pool!`);
    navigate('/recruiter/candidates');
  };

  return (
    <AppShell
      activeRole="recruiter"
      title="Multilingual OCR & Resume Parser"
    >
      <div className="space-y-6">
        {/* TOP AI SERVICE BAR */}
        <div className="p-4 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#008236]/10 flex items-center justify-center text-[#008236]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#18221b]">Google Gemini Resume Parser</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                  Server-side
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isParsing}
              onClick={handleParse}
              className="px-4 py-2 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
              <span>{isParsing ? 'Parsing...' : '⚡ Parse with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* MULTILINGUAL SAMPLE PICKER BAR */}
        <div className="p-4 rounded-2xl bg-[#f9fbf9] border border-[#e5ece6] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#3d4a3e] font-semibold">
            <Globe className="w-4 h-4 text-[#0082c0]" />
            <span>Select Multilingual Test Case:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SAMPLE_RESUMES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleSelectSample(key)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors ${
                  activeSampleKey === key 
                    ? 'bg-[#3d4a3e] text-white shadow-2xs' 
                    : 'bg-white border border-[#e5ece6] text-[#3d4a3e] hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* SPLIT SCREEN VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: ORIGINAL EXTRACT */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6] mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5e6d61]" />
                  <h4 className="text-xs font-bold text-[#18221b] font-mono">
                    ORIGINAL OCR EXTRACT ({activeFileName})
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-blue-50 text-[#0082c0] px-2 py-0.5 rounded font-bold">
                    {detectedLanguage}
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    OCR: {confidenceScore}%
                  </span>
                </div>
              </div>

              <label className="text-[11px] text-[#5e6d61] mb-1.5 block">
                Raw Resume Text Stream (Editable for live OCR test):
              </label>
              <textarea
                rows={16}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                className="w-full text-xs font-mono text-[#3d4a3e] leading-relaxed p-4 rounded-xl bg-[#f9fbf9] border border-[#e5ece6] focus:bg-white focus:outline-hidden focus:border-[#008236]"
              />
            </div>

            <div className="pt-3 border-t border-[#e5ece6] mt-4 flex items-center justify-between text-xs text-[#5e6d61]">
              <span className="font-mono text-[11px]">Engine: {modelUsed}</span>
              <button
                onClick={handleParse}
                disabled={isParsing}
                className="text-xs font-bold text-[#008236] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-run Parser</span>
              </button>
            </div>
          </div>

          {/* RIGHT: PARSED EDITABLE PROFILE */}
          <div className="p-6 rounded-2xl bg-white border border-[#e5ece6] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ece6]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0082c0]" />
                <h4 className="text-xs font-bold text-[#18221b] font-mono">
                  PARSED STRUCTURED PROFILE (STAFF EDITABLE)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                {confidenceScore}% Parse Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#18221b] mb-1">Full Name</label>
                <input
                  type="text"
                  value={parsedProfile.fullName}
                  onChange={e => setParsedProfile({ ...parsedProfile, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18221b] mb-1">Target Role</label>
                <input
                  type="text"
                  value={parsedProfile.targetRole}
                  onChange={e => setParsedProfile({ ...parsedProfile, targetRole: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#18221b] mb-1">Email</label>
                <input
                  type="email"
                  value={parsedProfile.email}
                  onChange={e => setParsedProfile({ ...parsedProfile, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18221b] mb-1">Phone</label>
                <input
                  type="text"
                  value={parsedProfile.phone}
                  onChange={e => setParsedProfile({ ...parsedProfile, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#18221b] mb-1">Location</label>
                <input
                  type="text"
                  value={parsedProfile.location}
                  onChange={e => setParsedProfile({ ...parsedProfile, location: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#18221b] mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={parsedProfile.experienceYears}
                  onChange={e => setParsedProfile({ ...parsedProfile, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6]"
                />
              </div>
            </div>

            {/* Skills with Confidence Badges */}
            <div>
              <label className="block text-xs font-bold text-[#18221b] mb-1">
                Extracted Skills & Confidence
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#f9fbf9] border border-[#e5ece6]">
                {parsedProfile.skills.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white text-[#18221b] border border-[#e5ece6]"
                  >
                    <span>{skill}</span>
                    <span className="text-[9px] text-emerald-700 font-bold">96%</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18221b] mb-1">Education Credentials</label>
              <input
                type="text"
                value={parsedProfile.education}
                onChange={e => setParsedProfile({ ...parsedProfile, education: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-[#e5ece6] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18221b] mb-1">Executive Summary</label>
              <textarea
                rows={3}
                value={parsedProfile.summary}
                onChange={e => setParsedProfile({ ...parsedProfile, summary: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#e5ece6] text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleConfirmProfile}
                className="w-full py-2.5 rounded-xl bg-[#008236] hover:bg-[#006b2c] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Profile & Add to Talent Pool</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </AppShell>
  );
};

export default RecruiterParserPage;
