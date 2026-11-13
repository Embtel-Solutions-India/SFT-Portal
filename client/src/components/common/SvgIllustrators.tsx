import React from 'react';

/**
 * EnterpriseNetworkGrid: High-precision SVG background vector with node intersections
 * and subtle gradient connecting circuits.
 */
export const EnterpriseNetworkGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 800 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <defs>
      <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
        <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.05" />
      </linearGradient>
      <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
      </radialGradient>
      <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Subtle Perspective Coordinate Lines */}
    <path
      d="M50 100 L750 100 M50 250 L750 250 M50 400 L750 400 M50 550 L750 550"
      stroke="url(#grid-grad)"
      strokeWidth="1"
      strokeDasharray="4 8"
    />
    <path
      d="M150 50 L150 550 M350 50 L350 550 M550 50 L550 550 M700 50 L700 550"
      stroke="url(#grid-grad)"
      strokeWidth="1"
      strokeDasharray="4 8"
    />

    {/* Dynamic Connection Arch Pathways */}
    <path
      d="M150 400 C 250 250, 450 450, 550 250"
      stroke="#10b981"
      strokeWidth="2"
      strokeDasharray="6 6"
      strokeOpacity="0.4"
    />
    <path
      d="M350 250 C 450 150, 600 200, 700 100"
      stroke="#f97316"
      strokeWidth="2"
      strokeDasharray="6 6"
      strokeOpacity="0.5"
    />

    {/* Glowing Hub Nodes */}
    <circle cx="150" cy="400" r="14" fill="url(#node-glow)" />
    <circle cx="150" cy="400" r="4" fill="#10b981" filter="url(#glow-filter)" />

    <circle cx="350" cy="250" r="16" fill="url(#node-glow)" />
    <circle cx="350" cy="250" r="5" fill="#f97316" filter="url(#glow-filter)" />

    <circle cx="550" cy="250" r="14" fill="url(#node-glow)" />
    <circle cx="550" cy="250" r="4" fill="#34d399" filter="url(#glow-filter)" />

    <circle cx="700" cy="100" r="12" fill="url(#node-glow)" />
    <circle cx="700" cy="100" r="3.5" fill="#fb923c" filter="url(#glow-filter)" />
  </svg>
);

/**
 * SftVerificationShield: Multi-layered official attestation shield with golden star accents.
 */
export const SftVerificationShield: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
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
    <defs>
      <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <filter id="shield-shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#064e3b" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Outer Shield Shell */}
    <path
      d="M32 4 L54 13 C54 33 44 49 32 58 C20 49 10 33 10 13 L32 4 Z"
      fill="url(#shield-grad)"
      stroke="#34d399"
      strokeWidth="2"
      filter="url(#shield-shadow)"
    />

    {/* Inner Shield Inlay */}
    <path
      d="M32 9 L49 17 C49 33 41 46 32 53 C23 46 15 33 15 17 L32 9 Z"
      fill="#064e3b"
      stroke="#10b981"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Center Golden Checkmark */}
    <path
      d="M24 32 L29 37 L41 24"
      stroke="url(#gold-grad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Verified Star Pips */}
    <circle cx="32" cy="18" r="1.8" fill="#fbbf24" />
    <circle cx="27" cy="19.5" r="1.3" fill="#fbbf24" />
    <circle cx="37" cy="19.5" r="1.3" fill="#fbbf24" />
  </svg>
);

/**
 * MatchWaveformGauge: Circular radial gauge with dynamic percentage stroke and glowing center.
 */
export const MatchWaveformGauge: React.FC<{ percentage?: number; size?: number; className?: string }> = ({
  percentage = 96,
  size = 56,
  className = ''
}) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Background Track */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="4.5"
      />

      {/* Progress Stroke */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke="url(#gauge-gradient)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 30 30)"
      />

      {/* Centered Metric Label */}
      <text
        x="30"
        y="34"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="800"
        fontFamily="sans-serif"
      >
        {percentage}%
      </text>
    </svg>
  );
};

/**
 * StepConnectorLine: Horizontal connecting path with glowing chevron arrow for multi-step processes.
 */
export const StepConnectorLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-16 h-6 hidden lg:block ${className}`}
  >
    <path
      d="M4 12 L110 12"
      stroke="#10b981"
      strokeWidth="2"
      strokeDasharray="4 4"
      strokeOpacity="0.7"
    />
    <path
      d="M104 6 L112 12 L104 18"
      stroke="#f97316"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * HandshakeSealSvg: Certified attestation circular seal with typography and stars.
 */
export const HandshakeSealSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 72,
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
    <defs>
      <linearGradient id="seal-border" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>

    {/* Concentric Decorative Rings */}
    <circle cx="40" cy="40" r="37" stroke="url(#seal-border)" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="40" cy="40" r="33" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
    <circle cx="40" cy="40" r="28" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />

    {/* Handshake Graphic */}
    <path
      d="M26 40 L34 32 C36 30 40 30 42 32 L46 36 L52 33 C54 32 56 34 55 36 L50 44 C48 47 43 47 40 45 L35 48 C33 49 30 48 29 46 L26 40 Z"
      fill="#f97316"
    />
    <path
      d="M32 37 L38 43 M36 34 L42 40 M40 31 L46 37"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * UsInterviewBadgeSvg: SVG illustrator showing US flag gradient + bridge silhouette + verified node.
 */
export const UsInterviewBadgeSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-11 h-11 shrink-0 ${className}`}
  >
    <rect width="44" height="44" rx="12" fill="#0f172a" />
    <circle cx="22" cy="22" r="16" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* Bridge Arch Vector */}
    <path
      d="M12 28 C16 18, 28 18, 32 28"
      stroke="#38bdf8"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 28 L16 22 M22 28 L22 19 M28 28 L28 22"
      stroke="#38bdf8"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
    {/* Glowing Beacon Star */}
    <circle cx="22" cy="14" r="3" fill="#fbbf24" />
    <circle cx="22" cy="14" r="6" fill="#fbbf24" fillOpacity="0.25" />
  </svg>
);

