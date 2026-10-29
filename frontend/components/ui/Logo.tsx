export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden>
        <path d="M3 25 14 3l11 22h-6.2L14 15.2 9.2 25z" fill="#C7FF2F" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-fg">
        AUTO<span className="text-lime">CARE</span>
      </span>
    </span>
  );
}
