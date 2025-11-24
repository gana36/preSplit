import React from 'react';

interface FinalLogoProps {
    size?: number;
    className?: string;
}

export const FinalLogo: React.FC<FinalLogoProps> = ({ size = 40, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="beamThroughHorizontal" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#007AFF" stopOpacity="0" />
                <stop offset="20%" stopColor="#007AFF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00C7BE" stopOpacity="1" />
                <stop offset="80%" stopColor="#007AFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* --- Top Half of Receipt --- */}
        <path
            d="M 25 15 L 75 15 L 75 42 L 70 45 L 65 42 L 60 45 L 55 42 L 50 45 L 45 42 L 40 45 L 35 42 L 30 45 L 25 42 Z"
            fill="#F8FAFC"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="translate(0, -3)"
        />
        {/* Top Content Lines */}
        <path d="M 32 22 H 68" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, -3)" />
        <path d="M 32 28 H 50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, -3)" />
        <path d="M 32 34 H 60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, -3)" />

        {/* --- Bottom Half of Receipt --- */}
        <path
            d="M 25 58 L 30 55 L 35 58 L 40 55 L 45 58 L 50 55 L 55 58 L 60 55 L 65 58 L 70 55 L 75 58 L 75 85 L 25 85 Z"
            fill="#F8FAFC"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="translate(0, 3)"
        />
        {/* Bottom Content Lines */}
        <path d="M 32 65 H 68" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, 3)" />
        <path d="M 32 71 H 45" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, 3)" />
        <path d="M 32 77 H 55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="translate(0, 3)" />

        {/* --- The Beam --- */}
        <rect x="0" y="48" width="100" height="4" fill="url(#beamThroughHorizontal)" filter="url(#glow)" />

        {/* Sparkles */}
        <circle cx="35" cy="46" r="1.5" fill="#00C7BE" opacity="0.8" />
        <circle cx="65" cy="54" r="1.5" fill="#007AFF" opacity="0.8" />
    </svg>
);
