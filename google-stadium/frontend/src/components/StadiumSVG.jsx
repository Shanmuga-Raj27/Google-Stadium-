import React from 'react';

/**
 * Hardcoded coordinate dictionary mapping each SVG section ID
 * to its visual center point within the 800x800 viewBox.
 * Used by both AdminMapEditor (click targeting) and FanDashboard (tracking overlay).
 */
export const MAP_COORDS = {
  'block-A': { x: 400, y: 150 },
  'block-B': { x: 650, y: 400 },
  'block-C': { x: 400, y: 650 },
  'block-D': { x: 150, y: 400 },
  'gate-1':  { x: 400, y: 30 },
  'gate-2':  { x: 770, y: 400 },
  'gate-3':  { x: 400, y: 770 },
  'gate-4':  { x: 30, y: 400 },
  'stall-1': { x: 180, y: 140 },
  'stall-2': { x: 620, y: 660 },
  'restroom-1': { x: 620, y: 140 },
  'restroom-2': { x: 180, y: 660 },
};

/**
 * Default section metadata. Admin overrides merge on top of these.
 */
const DEFAULT_SECTIONS = {
  'block-A': { label: 'Block A', color: '#4285F4' },
  'block-B': { label: 'Block B', color: '#4285F4' },
  'block-C': { label: 'Block C', color: '#4285F4' },
  'block-D': { label: 'Block D', color: '#4285F4' },
  'gate-1':  { label: 'Gate 1', color: '#34A853' },
  'gate-2':  { label: 'Gate 2', color: '#34A853' },
  'gate-3':  { label: 'Gate 3', color: '#34A853' },
  'gate-4':  { label: 'Gate 4', color: '#34A853' },
  'stall-1': { label: 'Food Court 1', color: '#F97316' },
  'stall-2': { label: 'Food Court 2', color: '#F97316' },
  'restroom-1': { label: 'Restroom A', color: '#FBBC05' },
  'restroom-2': { label: 'Restroom B', color: '#FBBC05' },
};

/**
 * Merges admin overrides on top of default section data.
 * Returns a resolved dictionary: { sectionId: { label, color } }
 */
export function getResolvedSections(overrides = {}) {
  const resolved = {};
  for (const [id, defaults] of Object.entries(DEFAULT_SECTIONS)) {
    const ov = overrides[id] || {};
    resolved[id] = {
      label: ov.label || defaults.label,
      color: ov.color || defaults.color,
    };
  }
  return resolved;
}

/**
 * StadiumSVG — Modular round stadium SVG template.
 *
 * Props:
 *  - overrides: admin config overrides dict from the API
 *  - onSectionClick: callback(sectionId) when a section is clicked (admin mode)
 *  - selectedId: currently selected section ID (highlights it)
 *  - interactive: if true, sections have hover/click affordances
 */
export default function StadiumSVG({ overrides = {}, onSectionClick, selectedId, interactive = false }) {
  const sections = getResolvedSections(overrides);

  const handleClick = (id) => {
    if (onSectionClick) onSectionClick(id);
  };

  const sectionStyle = (id) => ({
    cursor: interactive ? 'pointer' : 'default',
    transition: 'opacity 0.2s, filter 0.2s',
    filter: selectedId === id ? 'brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
    opacity: selectedId && selectedId !== id ? 0.6 : 1,
  });

  return (
    <svg viewBox="0 0 800 800" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="800" height="800" rx="40" fill="#111827" />

      {/* Outer ring track */}
      <circle cx="400" cy="400" r="370" fill="none" stroke="#1F2937" strokeWidth="3" />

      {/* Seating Blocks — 4 curved wedges around the pitch */}

      {/* Block A (top) */}
      <path
        id="block-A"
        d="M 250 120 A 300 300 0 0 1 550 120 L 500 220 A 180 180 0 0 0 300 220 Z"
        fill={sections['block-A'].color + '33'}
        stroke={sections['block-A'].color}
        strokeWidth="2"
        style={sectionStyle('block-A')}
        onClick={() => handleClick('block-A')}
      />
      {/* Row lines inside Block A */}
      <path d="M 280 155 A 250 250 0 0 1 520 155" fill="none" stroke={sections['block-A'].color + '44'} strokeWidth="1" />
      <path d="M 290 185 A 220 220 0 0 1 510 185" fill="none" stroke={sections['block-A'].color + '44'} strokeWidth="1" />
      <text x="400" y="165" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>
        {sections['block-A'].label}
      </text>

      {/* Block B (right) */}
      <path
        id="block-B"
        d="M 680 250 A 300 300 0 0 1 680 550 L 580 500 A 180 180 0 0 0 580 300 Z"
        fill={sections['block-B'].color + '33'}
        stroke={sections['block-B'].color}
        strokeWidth="2"
        style={sectionStyle('block-B')}
        onClick={() => handleClick('block-B')}
      />
      <path d="M 645 280 A 250 250 0 0 1 645 520" fill="none" stroke={sections['block-B'].color + '44'} strokeWidth="1" />
      <path d="M 615 290 A 220 220 0 0 1 615 510" fill="none" stroke={sections['block-B'].color + '44'} strokeWidth="1" />
      <text x="640" y="405" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>
        {sections['block-B'].label}
      </text>

      {/* Block C (bottom) */}
      <path
        id="block-C"
        d="M 550 680 A 300 300 0 0 1 250 680 L 300 580 A 180 180 0 0 0 500 580 Z"
        fill={sections['block-C'].color + '33'}
        stroke={sections['block-C'].color}
        strokeWidth="2"
        style={sectionStyle('block-C')}
        onClick={() => handleClick('block-C')}
      />
      <path d="M 520 645 A 250 250 0 0 1 280 645" fill="none" stroke={sections['block-C'].color + '44'} strokeWidth="1" />
      <path d="M 510 615 A 220 220 0 0 1 290 615" fill="none" stroke={sections['block-C'].color + '44'} strokeWidth="1" />
      <text x="400" y="650" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>
        {sections['block-C'].label}
      </text>

      {/* Block D (left) */}
      <path
        id="block-D"
        d="M 120 550 A 300 300 0 0 1 120 250 L 220 300 A 180 180 0 0 0 220 500 Z"
        fill={sections['block-D'].color + '33'}
        stroke={sections['block-D'].color}
        strokeWidth="2"
        style={sectionStyle('block-D')}
        onClick={() => handleClick('block-D')}
      />
      <path d="M 155 520 A 250 250 0 0 1 155 280" fill="none" stroke={sections['block-D'].color + '44'} strokeWidth="1" />
      <path d="M 185 510 A 220 220 0 0 1 185 290" fill="none" stroke={sections['block-D'].color + '44'} strokeWidth="1" />
      <text x="160" y="405" textAnchor="middle" fill="white" fontSize="14" fontWeight="600" style={{ pointerEvents: 'none' }}>
        {sections['block-D'].label}
      </text>

      {/* Center pitch — green oval */}
      <ellipse cx="400" cy="400" rx="140" ry="130" fill="#166534" stroke="#22C55E" strokeWidth="2" />
      <ellipse cx="400" cy="400" rx="50" ry="46" fill="none" stroke="#22C55E66" strokeWidth="1.5" />
      <line x1="260" y1="400" x2="540" y2="400" stroke="#22C55E44" strokeWidth="1" />
      <text x="400" y="405" textAnchor="middle" fill="#86EFAC" fontSize="12" fontWeight="500" style={{ pointerEvents: 'none' }}>
        PITCH
      </text>

      {/* Gates — circles on the outer ring */}
      {['gate-1', 'gate-2', 'gate-3', 'gate-4'].map(id => (
        <React.Fragment key={id}>
          <circle
            id={id}
            cx={MAP_COORDS[id].x}
            cy={MAP_COORDS[id].y}
            r="28"
            fill={sections[id].color + '44'}
            stroke={sections[id].color}
            strokeWidth="2"
            style={sectionStyle(id)}
            onClick={() => handleClick(id)}
          />
          <text
            x={MAP_COORDS[id].x}
            y={MAP_COORDS[id].y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="600"
            style={{ pointerEvents: 'none' }}
          >
            {sections[id].label}
          </text>
        </React.Fragment>
      ))}

      {/* Food Stalls — rounded rectangles */}
      {['stall-1', 'stall-2'].map(id => (
        <React.Fragment key={id}>
          <rect
            id={id}
            x={MAP_COORDS[id].x - 30}
            y={MAP_COORDS[id].y - 18}
            width="60"
            height="36"
            rx="10"
            fill={sections[id].color + '33'}
            stroke={sections[id].color}
            strokeWidth="2"
            style={sectionStyle(id)}
            onClick={() => handleClick(id)}
          />
          <text
            x={MAP_COORDS[id].x}
            y={MAP_COORDS[id].y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="600"
            style={{ pointerEvents: 'none' }}
          >
            {sections[id].label}
          </text>
        </React.Fragment>
      ))}

      {/* Restrooms — rounded rectangles */}
      {['restroom-1', 'restroom-2'].map(id => (
        <React.Fragment key={id}>
          <rect
            id={id}
            x={MAP_COORDS[id].x - 30}
            y={MAP_COORDS[id].y - 18}
            width="60"
            height="36"
            rx="10"
            fill={sections[id].color + '33'}
            stroke={sections[id].color}
            strokeWidth="2"
            style={sectionStyle(id)}
            onClick={() => handleClick(id)}
          />
          <text
            x={MAP_COORDS[id].x}
            y={MAP_COORDS[id].y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="600"
            style={{ pointerEvents: 'none' }}
          >
            {sections[id].label}
          </text>
        </React.Fragment>
      ))}
    </svg>
  );
}
