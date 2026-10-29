/** Запасные иллюстрации для карточек услуг, пока нет реальных фотографий в public/images/services. */
export type ServiceArtKind = "diagnostics" | "oil" | "brakes" | "tires";

const SPOKES = [0, 72, 144, 216, 288];

export function ServiceArt({ kind, className }: { kind: ServiceArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 400 250" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`sa-glow-${kind}`} cx="50%" cy="52%" r="55%">
          <stop offset="0%" stopColor="#C7FF2F" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#C7FF2F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sa-metal-${kind}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5E6870" />
          <stop offset="100%" stopColor="#262D33" />
        </radialGradient>
        <linearGradient id={`sa-oil-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD58A" />
          <stop offset="100%" stopColor="#E0891C" />
        </linearGradient>
        <filter id={`sa-blur-${kind}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="400" height="250" fill="#0B1217" />
      <rect width="400" height="250" fill={`url(#sa-glow-${kind})`} />

      {kind === "diagnostics" && (
        <g>
          <g stroke="#29343D" strokeWidth="1">
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="250" />
            ))}
            {[50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} />
            ))}
          </g>
          <path d="M20 135 H112 L130 92 L152 186 L174 68 L194 146 L210 135 H380" fill="none" stroke="#C7FF2F" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" filter={`url(#sa-blur-${kind})`} />
          <path d="M20 135 H112 L130 92 L152 186 L174 68 L194 146 L210 135 H380" fill="none" stroke="#C7FF2F" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="380" cy="135" r="5" fill="#F3F6F7" />
        </g>
      )}

      {kind === "oil" && (
        <g>
          <path d="M200 38 C200 38 158 92 158 126 a42 42 0 0 0 84 0 C242 92 200 38 200 38 Z" fill={`url(#sa-oil-${kind})`} />
          <path d="M178 120 C178 108 186 94 194 84" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="5" strokeLinecap="round" />
          {[
            [62, 10, 0.7],
            [98, 17, 0.35],
            [134, 24, 0.16],
          ].map(([rx, ry, o]) => (
            <ellipse key={rx} cx="200" cy="196" rx={rx} ry={ry} fill="none" stroke="#C7FF2F" strokeOpacity={o} strokeWidth="2" />
          ))}
        </g>
      )}

      {kind === "brakes" && (
        <g>
          <circle cx="200" cy="125" r="96" fill={`url(#sa-metal-${kind})`} stroke="#3A444C" strokeWidth="2" />
          <circle cx="200" cy="125" r="64" fill="none" stroke="#0B1014" strokeWidth="2" opacity="0.8" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <circle key={i} cx={200 + 80 * Math.cos(a)} cy={125 + 80 * Math.sin(a)} r="5.5" fill="#0B1014" />;
          })}
          <circle cx="200" cy="125" r="30" fill="#1A2026" stroke="#3A444C" strokeWidth="2" />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i * 72 * Math.PI) / 180;
            return <circle key={i} cx={200 + 17 * Math.cos(a)} cy={125 + 17 * Math.sin(a)} r="3" fill="#59636B" />;
          })}
          <path d="M268 62 A112 112 0 0 1 268 188" fill="none" stroke="#C7FF2F" strokeWidth="22" strokeLinecap="round" opacity="0.35" filter={`url(#sa-blur-${kind})`} />
          <path d="M268 62 A112 112 0 0 1 268 188" fill="none" stroke="#C7FF2F" strokeWidth="20" strokeLinecap="round" />
          <path d="M268 62 A112 112 0 0 1 268 188" fill="none" stroke="#0B1014" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {kind === "tires" && (
        <g>
          <circle cx="200" cy="125" r="100" fill="#0B1014" stroke="#1D2730" strokeWidth="2" />
          <circle cx="200" cy="125" r="93" fill="none" stroke="#1D2730" strokeWidth="10" strokeDasharray="14 8" />
          <circle cx="200" cy="125" r="76" fill="none" stroke="#29343D" strokeWidth="2" />
          <circle cx="200" cy="125" r="70" fill="none" stroke="#C7FF2F" strokeOpacity="0.8" strokeWidth="2" />
          <circle cx="200" cy="125" r="62" fill={`url(#sa-metal-${kind})`} />
          {SPOKES.map((a) => (
            <path key={a} d="M200 119 L200 74" stroke="#0B1014" strokeWidth="13" strokeLinecap="round" transform={`rotate(${a} 200 125)`} opacity="0.88" />
          ))}
          <circle cx="200" cy="125" r="10" fill="#C7FF2F" />
        </g>
      )}
    </svg>
  );
}
