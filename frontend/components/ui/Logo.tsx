/** Знак AutoCare (A с «росчерком») + надпись. tagline — подпись под логотипом на экранах входа. */
export function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width="38" height="24" viewBox="0 0 470 301" aria-hidden className="shrink-0">
        <path d="M0 301 L190 0 H290 L470 301 H370 L240 92 L132 301 Z" fill="#C7FF2F" />
        <path d="M112 262 C186 196 276 160 372 138 L306 176 C246 196 200 226 168 262 Z" fill="#080D11" />
        <path d="M118 258 C190 192 280 156 366 138 L304 170 C244 190 196 222 164 258 Z" fill="#C7FF2F" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-[0.04em] text-fg">
          AUTO<span className="text-lime">CARE</span>
        </span>
        {tagline && (
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-fg-muted">
            Premium car service
          </span>
        )}
      </span>
    </span>
  );
}
