import React from 'react';

interface UpArrowLogoProps {
  className?: string;
  size?: string;
  showText?: boolean;
  isDarkBg?: boolean;
}

export default function UpArrowLogo({ className = '', size = '48px', showText = true, isDarkBg = false }: UpArrowLogoProps) {
  const textPrimaryColor = isDarkBg ? "#FFFFFF" : "#04153F";
  const textSecondaryColor = isDarkBg ? "#00D8F6" : "#0052FF";
  const textMutedColor = isDarkBg ? "#94A3B8" : "#4A5568";

  if (!showText) {
    // Icon-only version
    return (
      <svg 
        viewBox="0 0 110 110" 
        className={className} 
        style={{ height: size, width: size }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cyan Left Rect */}
        <rect x="5" y="45" width="30" height="28" fill="#00D8F6" />
        {/* Cyan Bottom Rect */}
        <rect x="35" y="73" width="30" height="28" fill="#00D8F6" />
        {/* Overlap Deep Navy Rect */}
        <rect x="35" y="45" width="30" height="28" fill="#04153F" />
        {/* Bright Blue Top Right Rect */}
        <rect x="35" y="15" width="60" height="58" fill="#0B66FF" />
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 320 120" 
      className={className} 
      style={{ height: size, width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cyan Left Rect */}
      <rect x="5" y="45" width="30" height="28" fill="#00D8F6" />
      {/* Cyan Bottom Rect */}
      <rect x="35" y="73" width="30" height="28" fill="#00D8F6" />
      {/* Overlap Deep Navy Rect */}
      <rect x="35" y="45" width="30" height="28" fill="#04153F" />
      {/* Bright Blue Top Right Rect */}
      <rect x="35" y="15" width="60" height="58" fill="#0B66FF" />

      {/* Text group */}
      <text 
        x="180" 
        y="50" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="900" 
        fontSize="54" 
        fill={textPrimaryColor} 
        letterSpacing="-1.5"
      >
        UP
      </text>
      <text 
        x="100" 
        y="88" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontStyle="italic" 
        fontWeight="800" 
        fontSize="44" 
        fill={textSecondaryColor} 
        letterSpacing="-1"
      >
        arrow
      </text>
      <text 
        x="100" 
        y="110" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontStyle="italic" 
        fontWeight="600" 
        fontSize="12" 
        fill={textMutedColor}
      >
        Powered by NeuNet
      </text>
    </svg>
  );
}
