import React from 'react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'warning' | 'info' | 'success' | 'danger';
  onClick?: () => void;
  className?: string;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'default',
  onClick,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-white border-[#e5ece6] hover:border-[#008236]/30',
    warning: 'bg-amber-50/50 border-amber-200 hover:border-amber-400',
    info: 'bg-blue-50/50 border-blue-200 hover:border-blue-400',
    success: 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400',
    danger: 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
  };

  const valueColors = {
    default: 'text-[#18221b]',
    warning: 'text-amber-700',
    info: 'text-blue-700',
    success: 'text-emerald-700',
    danger: 'text-rose-700'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#5e6d61] font-semibold truncate">
          {label}
        </span>
        {icon && <div className="text-[#8a998c] shrink-0">{icon}</div>}
      </div>
      <div className={`text-2xl font-black font-display tracking-tight ${valueColors[variant]}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-[11px] text-[#5e6d61] mt-1 font-mono truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};

