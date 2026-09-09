import React from 'react';

/**
 * HealthcareBackground – v4 "Government Healthcare Portal"
 *
 * 4 large illustrated scenes anchored at screen edges + subtle curves.
 * Zero red. Blue / teal / white palette only.
 *
 *  LEFT  upper  → ECG / heartbeat monitor scene
 *  LEFT  lower  → Hospital building silhouette
 *  RIGHT upper  → Digital health tablet / record screen
 *  RIGHT lower  → Doctor with clipboard silhouette
 *
 * Layer structure:
 *  1. Light-blue atmospheric base + gradients
 *  2. Large soft blob ellipses + corner arc rings
 *  3. Flowing horizontal wave curves
 *  4. Four illustrated scenes (faint, blue-tinted, flat vector)
 *  5. A few thin connector lines between scenes
 *
 * position:absolute  z-index:0  pointer-events:none
 */
const HealthcareBackground = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      {/* ── Atmospheric glows ── */}
      <radialGradient id="g-tl" cx="0%" cy="0%" r="70%">
        <stop offset="0%"   stopColor="#bbd8ee" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#EAF5FC"  stopOpacity="0"   />
      </radialGradient>
      <radialGradient id="g-br" cx="100%" cy="100%" r="65%">
        <stop offset="0%"   stopColor="#aacfe8" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#EAF5FC"  stopOpacity="0"   />
      </radialGradient>
      <radialGradient id="g-ct" cx="50%" cy="0%" r="55%">
        <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.65" />
        <stop offset="100%" stopColor="#EAF5FC"  stopOpacity="0"    />
      </radialGradient>
      {/* Left & right soft blob fills */}
      <radialGradient id="g-left-blob" cx="0%" cy="50%" r="55%">
        <stop offset="0%"   stopColor="#a2ccdf" stopOpacity="0.32" />
        <stop offset="100%" stopColor="#a2ccdf" stopOpacity="0"    />
      </radialGradient>
      <radialGradient id="g-right-blob" cx="100%" cy="50%" r="55%">
        <stop offset="0%"   stopColor="#96c5dc" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#96c5dc" stopOpacity="0"    />
      </radialGradient>

      <clipPath id="bg-clip">
        <rect width="1440" height="900" />
      </clipPath>
    </defs>

    <g clipPath="url(#bg-clip)">

      {/* ══════════════════════════════
          LAYER 1 – Base & atmosphere
          ══════════════════════════════ */}
      <rect width="1440" height="900" fill="#EAF5FC" />
      <rect width="1440" height="900" fill="url(#g-tl)"        />
      <rect width="1440" height="900" fill="url(#g-br)"        />
      <rect width="1440" height="900" fill="url(#g-ct)"        />
      <rect width="1440" height="900" fill="url(#g-left-blob)" />
      <rect width="1440" height="900" fill="url(#g-right-blob)"/>





      {/* ══════════════════════════════════════════════════════════
          LAYER 4 – Healthcare Illustrations
          ══════════════════════════════════════════════════════════

          Illustration 1  (LEFT UPPER):  ECG / Patient Monitor
          Illustration 2  (LEFT LOWER):  Hospital building
          Illustration 3  (RIGHT UPPER): Digital health screen / tablet
          Illustration 4  (RIGHT LOWER): Doctor with clipboard
          ══════════════════════════════════════════════════════════ */}


      {/* ─────────────────────────────────────────────
          ILLUSTRATION 1 (LEFT UPPER)
          ECG / Vitals Monitor — large, faint, blue-teal
          Centred approx (90, 140) – scale ~210×155
          opacity group: 0.38
          ───────────────────────────────────────────── */}
      <g opacity="0.38" transform="translate(90, 110)">
        {/* Monitor outer casing */}
        <rect x="0" y="0" width="210" height="150" rx="14"
          fill="#d0e9f6" stroke="#4d9cc0" strokeWidth="1.6" />
        {/* Screen bezel */}
        <rect x="10" y="10" width="190" height="115" rx="8"
          fill="#e8f5fc" stroke="#5aaecb" strokeWidth="1" />
        {/* Screen header strip */}
        <rect x="10" y="10" width="190" height="22" rx="8"
          fill="#c2ddf0" />
        <rect x="10" y="24" width="190" height="8" rx="0"
          fill="#c2ddf0" />
        {/* Header label dots */}
        <circle cx="28"  cy="21" r="4" fill="#5aaecb" fillOpacity="0.7" />
        <circle cx="44"  cy="21" r="4" fill="#7bbdd6" fillOpacity="0.6" />
        <circle cx="60"  cy="21" r="4" fill="#9acde2" fillOpacity="0.5" />
        {/* Patient info line */}
        <rect x="20" y="40" width="80" height="5" rx="3" fill="#9ac8e0" fillOpacity="0.7" />
        <rect x="20" y="50" width="55" height="4" rx="2" fill="#9ac8e0" fillOpacity="0.5" />
        {/* ECG grid lines */}
        <line x1="18" y1="72" x2="192" y2="72" stroke="#b0d8ed" strokeWidth="0.7" />
        <line x1="18" y1="84" x2="192" y2="84" stroke="#b0d8ed" strokeWidth="0.7" />
        <line x1="18" y1="96" x2="192" y2="96" stroke="#b0d8ed" strokeWidth="0.7" />
        <line x1="68"  y1="62" x2="68"  y2="108" stroke="#b0d8ed" strokeWidth="0.7" />
        <line x1="118" y1="62" x2="118" y2="108" stroke="#b0d8ed" strokeWidth="0.7" />
        <line x1="168" y1="62" x2="168" y2="108" stroke="#b0d8ed" strokeWidth="0.7" />
        {/* ECG waveform – blue-teal, no red */}
        <polyline
          points="18,84 34,84 40,68 46,100 53,58 60,98 66,84 90,84 96,72 103,96 110,84 140,84 146,70 153,98 160,84 192,84"
          fill="none" stroke="#1e7aab" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Vital signs mini-readout bottom */}
        <rect x="18"  y="108" width="42" height="16" rx="3" fill="#b8ddf0" fillOpacity="0.6" />
        <rect x="68"  y="108" width="42" height="16" rx="3" fill="#b8ddf0" fillOpacity="0.6" />
        <rect x="118" y="108" width="42" height="16" rx="3" fill="#b8ddf0" fillOpacity="0.6" />
        <rect x="168" y="108" width="24" height="16" rx="3" fill="#b8ddf0" fillOpacity="0.6" />
        {/* Monitor stand */}
        <rect x="88"  y="150" width="34" height="12" rx="4" fill="#b2d6ea" />
        <rect x="70"  y="162" width="70" height="8"  rx="4" fill="#a8cfde" />
      </g>


      {/* ─────────────────────────────────────────────
          ILLUSTRATION 2 (LEFT LOWER)
          Hospital / Clinic Building — large, very faint
          Centred approx (60, 620) – scale ~220×190
          opacity group: 0.28
          ───────────────────────────────────────────── */}
      <g opacity="0.28" transform="translate(42, 610)">
        {/* Main structure */}
        <rect x="20" y="70" width="200" height="120" rx="4"
          fill="#cce3f2" stroke="#4695b8" strokeWidth="1.6" />
        {/* Roof */}
        <polygon points="10,70 110,20 220,70"
          fill="#b8d8ed" stroke="#4695b8" strokeWidth="1.6" />
        {/* Ground line */}
        <line x1="0" y1="190" x2="240" y2="190"
          stroke="#4695b8" strokeWidth="1.2" opacity="0.6" />
        {/* Front door */}
        <rect x="91" y="138" width="38" height="52" rx="3"
          fill="#96c8e0" stroke="#4695b8" strokeWidth="1.2" />
        <circle cx="122" cy="165" r="3" fill="#4695b8" fillOpacity="0.6" />
        {/* Left window */}
        <rect x="34"  y="90" width="36" height="28" rx="3"
          fill="#d8eef8" stroke="#4695b8" strokeWidth="1" />
        <line x1="52"  y1="90"  x2="52"  y2="118" stroke="#4695b8" strokeWidth="0.8" opacity="0.6" />
        <line x1="34"  y1="104" x2="70"  y2="104" stroke="#4695b8" strokeWidth="0.8" opacity="0.6" />
        {/* Right window */}
        <rect x="150" y="90" width="36" height="28" rx="3"
          fill="#d8eef8" stroke="#4695b8" strokeWidth="1" />
        <line x1="168" y1="90"  x2="168" y2="118" stroke="#4695b8" strokeWidth="0.8" opacity="0.6" />
        <line x1="150" y1="104" x2="186" y2="104" stroke="#4695b8" strokeWidth="0.8" opacity="0.6" />
        {/* Upper floor windows */}
        <rect x="50"  y="130" width="28" height="22" rx="2" fill="#d8eef8" stroke="#4695b8" strokeWidth="0.9" />
        <rect x="142" y="130" width="28" height="22" rx="2" fill="#d8eef8" stroke="#4695b8" strokeWidth="0.9" />
        {/* Medical cross on building face */}
        <rect x="101" y="35"  width="18" height="30" rx="3" fill="none" stroke="#3585aa" strokeWidth="2" />
        <rect x="96"  y="40"  width="28" height="18" rx="3" fill="none" stroke="#3585aa" strokeWidth="2" />
        {/* Flag pole */}
        <line x1="110" y1="20" x2="110" y2="0"   stroke="#4695b8" strokeWidth="1.2" />
        <rect x="110" y="0"   width="18" height="12" rx="2" fill="#96c8e0" stroke="#4695b8" strokeWidth="0.8" />
        {/* Pathway */}
        <rect x="96"  y="190" width="48" height="12" rx="2" fill="#b2d4e8" fillOpacity="0.7" />
      </g>


      {/* ─────────────────────────────────────────────
          ILLUSTRATION 3 (RIGHT UPPER)
          Digital Health Tablet / Medical Record Screen
          Centred approx (1190, 80) – scale ~240×210
          opacity group: 0.40
          ───────────────────────────────────────────── */}
      <g opacity="0.40" transform="translate(1162, 68)">
        {/* Tablet outer frame */}
        <rect x="0" y="0" width="238" height="195" rx="18"
          fill="#c8e4f4" stroke="#3d8fb5" strokeWidth="1.8" />
        {/* Screen */}
        <rect x="12" y="12" width="214" height="158" rx="10"
          fill="#e8f4fb" stroke="#60a8c8" strokeWidth="1" />
        {/* Screen top bar */}
        <rect x="12" y="12" width="214" height="28" rx="10"
          fill="#aed4ea" />
        <rect x="12" y="32" width="214" height="8"
          fill="#aed4ea" />
        {/* App title area */}
        <rect x="24" y="18" width="60" height="10" rx="3" fill="#6aaecb" fillOpacity="0.8" />
        {/* Profile avatar circle */}
        <circle cx="200" cy="26" r="11" fill="#7fbcd8" stroke="#60a8c8" strokeWidth="1" />
        <circle cx="200" cy="22" r="5"  fill="#60a8c8" fillOpacity="0.7" />
        <path d="M190,36 Q200,30 210,36" fill="#60a8c8" fillOpacity="0.6" />
        {/* Patient name block */}
        <rect x="22" y="50" width="100" height="8" rx="3" fill="#8dc4de" fillOpacity="0.75" />
        <rect x="22" y="64" width="70"  height="6" rx="3" fill="#8dc4de" fillOpacity="0.55" />
        {/* Vital signs row */}
        <rect x="22"  y="80" width="48" height="30" rx="6" fill="#c0dff0" stroke="#5aa0c0" strokeWidth="0.8" />
        <rect x="80"  y="80" width="48" height="30" rx="6" fill="#c0dff0" stroke="#5aa0c0" strokeWidth="0.8" />
        <rect x="138" y="80" width="48" height="30" rx="6" fill="#c0dff0" stroke="#5aa0c0" strokeWidth="0.8" />
        <rect x="196" y="80" width="26" height="30" rx="6" fill="#c0dff0" stroke="#5aa0c0" strokeWidth="0.8" />
        {/* Labels in vital boxes */}
        <rect x="28" y="87" width="36" height="4" rx="2" fill="#4895b8" fillOpacity="0.6" />
        <rect x="86" y="87" width="36" height="4" rx="2" fill="#4895b8" fillOpacity="0.6" />
        <rect x="144" y="87" width="36" height="4" rx="2" fill="#4895b8" fillOpacity="0.6" />
        <rect x="200" y="87" width="18" height="4" rx="2" fill="#4895b8" fillOpacity="0.6" />
        {/* Mini chart in bottom area */}
        <rect x="22" y="120" width="202" height="42" rx="6" fill="#d8eef8" stroke="#82c0da" strokeWidth="0.8" />
        {/* Chart bars */}
        <rect x="32"  y="140" width="14" height="14" rx="2" fill="#5aa8c8" fillOpacity="0.65" />
        <rect x="52"  y="133" width="14" height="21" rx="2" fill="#5aa8c8" fillOpacity="0.65" />
        <rect x="72"  y="138" width="14" height="16" rx="2" fill="#5aa8c8" fillOpacity="0.65" />
        <rect x="92"  y="128" width="14" height="26" rx="2" fill="#3890b8" fillOpacity="0.7"  />
        <rect x="112" y="135" width="14" height="19" rx="2" fill="#5aa8c8" fillOpacity="0.65" />
        <rect x="132" y="142" width="14" height="12" rx="2" fill="#5aa8c8" fillOpacity="0.6"  />
        <rect x="152" y="130" width="14" height="24" rx="2" fill="#5aa8c8" fillOpacity="0.65" />
        <rect x="172" y="136" width="14" height="18" rx="2" fill="#5aa8c8" fillOpacity="0.6"  />
        <rect x="192" y="138" width="14" height="16" rx="2" fill="#5aa8c8" fillOpacity="0.55" />
        {/* Tablet home button */}
        <circle cx="119" cy="181" r="7" fill="none" stroke="#3d8fb5" strokeWidth="1.5" />
        {/* Camera */}
        <circle cx="119" cy="7" r="3" fill="#4d95b8" fillOpacity="0.5" />
      </g>


      {/* ─────────────────────────────────────────────
          ILLUSTRATION 4 (RIGHT LOWER)
          Doctor / Healthcare Professional
          Centred approx (1250, 510) – scale ~170×260
          opacity group: 0.36
          ───────────────────────────────────────────── */}
      <g opacity="0.36" transform="translate(1248, 500)">
        {/* ── Body ── */}
        {/* Legs */}
        <rect x="42" y="190" width="28" height="70" rx="8"
          fill="#9ac8e2" stroke="#3d8fb5" strokeWidth="1.2" />
        <rect x="82" y="190" width="28" height="70" rx="8"
          fill="#9ac8e2" stroke="#3d8fb5" strokeWidth="1.2" />
        {/* Shoes */}
        <ellipse cx="56"  cy="258" rx="20" ry="9" fill="#7ab2cc" />
        <ellipse cx="96"  cy="258" rx="20" ry="9" fill="#7ab2cc" />
        {/* Coat / torso */}
        <rect x="30" y="100" width="92" height="96" rx="12"
          fill="#c8e4f4" stroke="#3d8fb5" strokeWidth="1.4" />
        {/* White coat center line */}
        <line x1="76" y1="100" x2="76" y2="196"
          stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        {/* Coat lapels */}
        <path d="M76,100 Q60,112 46,130 L46,196 Q60,180 76,168"
          fill="#b4d8ee" stroke="#3d8fb5" strokeWidth="0.8" />
        <path d="M76,100 Q92,112 106,130 L106,196 Q92,180 76,168"
          fill="#b4d8ee" stroke="#3d8fb5" strokeWidth="0.8" />
        {/* Stethoscope */}
        <path d="M56,116 Q44,135 42,152 Q40,168 52,172 Q64,176 68,162"
          fill="none" stroke="#2d7fa8" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="68" cy="162" r="8" fill="none" stroke="#2d7fa8" strokeWidth="2.2" />
        {/* Arms */}
        <rect x="10" y="110" width="24" height="74" rx="10"
          fill="#b8d8ec" stroke="#3d8fb5" strokeWidth="1.2" />
        <rect x="118" y="110" width="24" height="74" rx="10"
          fill="#b8d8ec" stroke="#3d8fb5" strokeWidth="1.2" />
        {/* Left hand / clipboard */}
        <rect x="2" y="176" width="40" height="54" rx="6"
          fill="#d8eef8" stroke="#4d95b8" strokeWidth="1.2" />
        {/* Clipboard top */}
        <rect x="14" y="170" width="16" height="10" rx="4"
          fill="#a0ccde" stroke="#4d95b8" strokeWidth="1" />
        {/* Clipboard lines */}
        <rect x="8"  y="188" width="28" height="4" rx="2" fill="#82b8d2" fillOpacity="0.7" />
        <rect x="8"  y="198" width="22" height="3" rx="2" fill="#82b8d2" fillOpacity="0.55" />
        <rect x="8"  y="207" width="26" height="3" rx="2" fill="#82b8d2" fillOpacity="0.5"  />
        <rect x="8"  y="216" width="18" height="3" rx="2" fill="#82b8d2" fillOpacity="0.45" />
        {/* ── Head ── */}
        <circle cx="76" cy="68" r="42"
          fill="#dbeef8" stroke="#3d8fb5" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="64" y="100" width="24" height="18" rx="6"
          fill="#cce5f4" />
        {/* Hair */}
        <path d="M36,58 Q38,26 76,24 Q114,26 116,58 Q112,40 76,38 Q40,40 36,58Z"
          fill="#7ab8d4" fillOpacity="0.8" />
        {/* Eyes */}
        <ellipse cx="62" cy="68" rx="5" ry="6" fill="#3d8fb5" fillOpacity="0.7" />
        <ellipse cx="90" cy="68" rx="5" ry="6" fill="#3d8fb5" fillOpacity="0.7" />
        <circle  cx="63" cy="68" r="2"  fill="white" fillOpacity="0.6" />
        <circle  cx="91" cy="68" r="2"  fill="white" fillOpacity="0.6" />
        {/* Calm smile */}
        <path d="M64,84 Q76,92 88,84"
          fill="none" stroke="#3d8fb5" strokeWidth="1.8" strokeLinecap="round" />
        {/* Ear details */}
        <ellipse cx="34" cy="70" rx="5" ry="8" fill="#cce5f4" stroke="#3d8fb5" strokeWidth="1" />
        <ellipse cx="118" cy="70" rx="5" ry="8" fill="#cce5f4" stroke="#3d8fb5" strokeWidth="1" />
        {/* Name badge */}
        <rect x="54" y="138" width="44" height="24" rx="4"
          fill="#aed4ea" stroke="#3d8fb5" strokeWidth="0.9" />
        <rect x="59" y="144" width="34" height="4" rx="2" fill="#3d8fb5" fillOpacity="0.55" />
        <rect x="61" y="152" width="22" height="3" rx="2" fill="#3d8fb5" fillOpacity="0.4"  />
      </g>

      {/* Optional 5th element: very subtle single medical cross outline – top-left corner */}
      <g opacity="0.16" transform="translate(230, 56)">
        <rect x="14" y="0"  width="12" height="40" rx="4"
          fill="none" stroke="#1e7aab" strokeWidth="1.8" />
        <rect x="0"  y="14" width="40" height="12" rx="4"
          fill="none" stroke="#1e7aab" strokeWidth="1.8" />
      </g>

    </g>
  </svg>
);

export default HealthcareBackground;
