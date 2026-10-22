import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-extrabold',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Custom Findora SVG Logo: Magnifying glass combined with Location Pin and checkmark */}
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-sm ${
          light ? 'bg-white text-findora-navy-900' : 'bg-findora-navy-900 text-white'
        }`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Magnifying Glass Ring */}
          <circle
            cx="17"
            cy="17"
            r="10"
            stroke={light ? '#0f766e' : '#14b8a6'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Location Pin stem / Glass Handle */}
          <path
            d="M24.5 24.5L33 33"
            stroke={light ? '#0f766e' : '#14b8a6'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Verification Checkmark Inside Lens */}
          <path
            d="M13 17L16 20L21 14"
            stroke={light ? '#0b1d30' : '#f8fafc'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`tracking-tight font-sans ${textSizes[size]} ${
            light ? 'text-white' : 'text-findora-navy-900'
          }`}
        >
          Find<span className="text-findora-teal-600">ora</span>
        </span>
        {showTagline && (
          <span className={`text-[10px] -mt-1 font-medium tracking-wide ${light ? 'text-slate-300' : 'text-slate-500'}`}>
            Lost something? Let's bring it back.
          </span>
        )}
      </div>
    </Link>
  );
};
