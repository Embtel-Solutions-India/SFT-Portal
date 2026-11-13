import React from 'react';

/**
 * Proland-style Line-Art & Flat Color Cliparts
 * Distinctive thick dark outlines (strokeWidth 2-3px), rounded caps,
 * vibrant pastel & primary fills matching the reference screenshots.
 */

export const SvgMonitorDevice: React.FC<{ size?: number; className?: string }> = ({
  size = 76,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Monitor Screen Frame */}
    <rect
      x="10"
      y="12"
      width="60"
      height="44"
      rx="6"
      fill="#ffffff"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Screen Glass Area */}
    <rect x="14" y="16" width="52" height="36" rx="3" fill="#f8fafc" />
    
    {/* Screen Content: Cyan Window Header */}
    <rect x="18" y="20" width="44" height="28" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
    
    {/* Yellow/Orange Code Document Inside */}
    <rect x="28" y="24" width="30" height="20" rx="2" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
    {/* Code Lines */}
    <line x1="33" y1="29" x2="52" y2="29" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    <line x1="33" y1="34" x2="48" y2="34" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    <line x1="33" y1="39" x2="44" y2="39" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

    {/* Monitor Stand */}
    <path
      d="M34 56 L32 66 H48 L46 56"
      fill="#e2e8f0"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M26 66 H54"
      stroke="#1f2937"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export const SvgSliderControl: React.FC<{ size?: number; className?: string }> = ({
  size = 76,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer Rounded Panel */}
    <rect
      x="12"
      y="12"
      width="56"
      height="56"
      rx="10"
      fill="#ffffff"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Track 1 (Red / Orange) */}
    <line x1="22" y1="26" x2="58" y2="26" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="28" cy="26" r="6" fill="#f87171" stroke="#1f2937" strokeWidth="3" />

    {/* Track 2 (Neutral / Grey) */}
    <line x1="22" y1="40" x2="58" y2="40" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="40" r="6" fill="#fcd34d" stroke="#1f2937" strokeWidth="3" />

    {/* Track 3 (Green) */}
    <line x1="22" y1="54" x2="58" y2="54" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="38" cy="54" r="6" fill="#34d399" stroke="#1f2937" strokeWidth="3" />
  </svg>
);

export const SvgTrophyDone: React.FC<{ size?: number; className?: string }> = ({
  size = 76,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Trophy Handle */}
    <path
      d="M24 20 H16 C12 20 12 34 22 36"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right Trophy Handle */}
    <path
      d="M56 20 H64 C68 20 68 34 58 36"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Main Cup Body */}
    <path
      d="M22 16 H58 V34 C58 44 48 50 40 50 C32 50 22 44 22 34 V16 Z"
      fill="#fde047"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Inner Cup Shading */}
    <path
      d="M26 18 H54 V32 C54 39 46 44 40 44 C34 44 26 39 26 32 V18 Z"
      fill="#facc15"
    />

    {/* Star inside Trophy */}
    <path
      d="M40 24 L42 28.5 L47 29 L43 32.5 L44.5 37 L40 34.5 L35.5 37 L37 32.5 L33 29 L38 28.5 Z"
      fill="#ffffff"
      stroke="#1f2937"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Cup Stem */}
    <path
      d="M36 50 H44 V58 H36 Z"
      fill="#e2e8f0"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Trophy Base Pedestal */}
    <path
      d="M28 58 H52 L54 66 H26 L28 58 Z"
      fill="#f97316"
      stroke="#1f2937"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const SvgFlowArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`hidden md:block text-slate-300 ${className}`}
  >
    <path
      d="M10 6 L20 16 L10 26"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SvgCertificateScroll: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="12" y="10" width="40" height="44" rx="4" fill="#f8fafc" stroke="#1f2937" strokeWidth="3" />
    <line x1="20" y1="20" x2="44" y2="20" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="27" x2="40" y2="27" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="34" x2="36" y2="34" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Red Ribbon & Gold Seal */}
    <circle cx="42" cy="42" r="7" fill="#fbbf24" stroke="#1f2937" strokeWidth="2.5" />
    <path d="M42 49 L39 56 L42 54 L45 56 L42 49 Z" fill="#ef4444" stroke="#1f2937" strokeWidth="2" />
  </svg>
);

export const SvgSiliconValleyBridge: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="12" width="48" height="40" rx="8" fill="#f0fdf4" stroke="#1f2937" strokeWidth="3" />
    <path d="M14 42 C 22 24, 42 24, 50 42" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="42" x2="22" y2="30" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="42" x2="32" y2="26" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="42" x2="42" y2="30" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="20" r="4" fill="#fbbf24" stroke="#1f2937" strokeWidth="2" />
  </svg>
);

export const SvgHumanInTheLoop: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="10" y="10" width="44" height="44" rx="8" fill="#fef3c7" stroke="#1f2937" strokeWidth="3" />
    <circle cx="32" cy="26" r="7" fill="#f97316" stroke="#1f2937" strokeWidth="2.5" />
    <path d="M22 46 C22 38 27 36 32 36 C37 36 42 38 42 46" fill="#60a5fa" stroke="#1f2937" strokeWidth="2.5" />
    <circle cx="44" cy="20" r="3" fill="#22c55e" stroke="#1f2937" strokeWidth="1.5" />
  </svg>
);

