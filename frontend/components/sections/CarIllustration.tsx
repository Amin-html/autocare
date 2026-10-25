/**
 * Векторная иллюстрация спорткара (запасной вариант, пока нет реальной фотографии).
 * Рисуется на чистом SVG, без внешних файлов, поэтому серого блока быть не может.
 */
export function CarIllustration({ className }: { className?: string }) {
  const body =
    "M98 292 C92 270 96 246 118 236 C150 224 190 218 232 212 C292 164 352 150 430 148 " +
    "C500 148 548 160 590 186 C640 200 720 208 776 224 C812 236 828 256 826 282 " +
    "C826 292 818 296 806 296 L98 292 Z";
  const wheels = [250, 668];

  return (
    <svg
      viewBox="0 0 900 420"
      className={className}
      role="img"
      aria-label="Спортивный автомобиль"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="cg-glow" cx="55%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#C7FF2F" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#C7FF2F" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#C7FF2F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A535B" />
          <stop offset="45%" stopColor="#343B42" />
          <stop offset="100%" stopColor="#1A2026" />
        </linearGradient>
        <linearGradient id="cg-rim-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C7FF2F" stopOpacity="0" />
          <stop offset="55%" stopColor="#D8FF69" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F3F6F7" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1217" />
          <stop offset="100%" stopColor="#25313B" />
        </linearGradient>
        <linearGradient id="cg-floor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C7FF2F" stopOpacity="0" />
          <stop offset="50%" stopColor="#C7FF2F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C7FF2F" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cg-rim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#59636B" />
          <stop offset="100%" stopColor="#2A3138" />
        </radialGradient>
        <filter id="cg-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="cg-bloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="900" height="420" fill="url(#cg-glow)" />

      {/* пол и тень */}
      <rect x="60" y="329" width="780" height="1.5" fill="url(#cg-floor)" />
      <ellipse cx="460" cy="326" rx="400" ry="12" fill="#000" opacity="0.7" filter="url(#cg-blur)" />

      {/* кузов */}
      <path d={body} fill="url(#cg-body)" />
      <path d={body} fill="none" stroke="url(#cg-rim-light)" strokeWidth="2" />
      {/* линия бока и порог */}
      <path d="M130 262 C300 252 560 250 800 252" fill="none" stroke="#F3F6F7" strokeOpacity="0.14" strokeWidth="1.5" />
      <path d="M150 286 L790 290 L790 296 L150 292 Z" fill="#0B1014" opacity="0.65" />
      {/* стёкла */}
      <path
        d="M270 207 C312 176 362 164 428 163 C486 163 524 174 556 192 C540 200 520 204 500 205 L270 207 Z"
        fill="url(#cg-glass)"
        stroke="#F3F6F7"
        strokeOpacity="0.18"
      />
      <path d="M428 164 L420 206" stroke="#0B1014" strokeWidth="3" />
      {/* дверь */}
      <path d="M420 208 C416 240 418 268 424 288" fill="none" stroke="#0B1014" strokeOpacity="0.8" strokeWidth="1.5" />
      <path d="M520 230 L470 230" stroke="#F3F6F7" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />

      {/* свет фары и задний фонарь */}
      <path d="M770 232 L820 252 L812 256 L764 240 Z" fill="#C7FF2F" filter="url(#cg-bloom)" opacity="0.8" />
      <path d="M770 232 L820 252 L812 256 L764 240 Z" fill="#F3F6F7" />
      <path d="M100 252 C104 244 110 240 118 238" stroke="#FF4D55" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* колёса */}
      {wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={282} r={56} fill="#05080B" />
          <circle cx={cx} cy={282} r={46} fill="#0B1014" stroke="#1D2730" strokeWidth="2" />
          <circle cx={cx} cy={282} r={34} fill="url(#cg-rim)" />
          {[0, 72, 144, 216, 288].map((a) => (
            <path
              key={a}
              d={`M${cx} ${282 - 6} L${cx} ${282 - 32}`}
              stroke="#0B1014"
              strokeWidth="9"
              strokeLinecap="round"
              transform={`rotate(${a} ${cx} 282)`}
              opacity="0.85"
            />
          ))}
          <path d={`M${cx - 22} ${282 + 24} A32 32 0 0 0 ${cx + 22} ${282 + 24}`} stroke="#C7FF2F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx={cx} cy={282} r={6} fill="#C7FF2F" />
        </g>
      ))}
    </svg>
  );
}
