import { mediaUrl } from "@/lib/format";

export function Avatar({ src, name, size = 40 }: { src: string | null | undefined; name: string; size?: number }) {
  const url = mediaUrl(src);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-light-gray"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-black text-white flex items-center justify-center font-medium shrink-0"
    >
      {initial}
    </div>
  );
}