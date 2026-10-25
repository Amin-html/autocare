import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { CarIllustration } from "./CarIllustration";

/** Положите свою фотографию сюда — она подхватится автоматически (без правок кода). */
const PHOTO_CANDIDATES = ["hero-car.jpg", "hero-car.jpeg", "hero-car.webp", "hero-car.png"];

/** Пропорции текущей фотографии (ширина/высота). Если замените фото на другое по формату — поправьте. */
const PHOTO_ASPECT = "aspect-[945/322]";

function findPhoto(): string | null {
  const dir = path.join(process.cwd(), "public", "images");
  const found = PHOTO_CANDIDATES.find((f) => fs.existsSync(path.join(dir, f)));
  return found ? `/images/${found}` : null;
}

/** Края фото плавно растворяются в фоне: слева, сверху и снизу. */
const PHOTO_MASK = {
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 35%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 35%), linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)",
  WebkitMaskComposite: "source-in",
} as React.CSSProperties;

const MOBILE_MASK = {
  maskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)",
} as React.CSSProperties;

export function HeroVisual() {
  const photo = findPhoto();

  return (
    <div
      className="ac-slide-in relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-surface via-[#0B1217] to-night
                 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[58%] lg:bg-none"
    >
      {photo ? (
        <div className="absolute inset-0 flex items-center">
          <div
            className={`relative ${PHOTO_ASPECT} -ml-[6%] w-[150%] max-w-none lg:ml-0 lg:w-[125%]`}
          >
            {/* на мобильном — только вертикальные края, на lg — ещё и левый */}
            <div className="absolute inset-0 lg:hidden" style={MOBILE_MASK}>
              <Image
                src={photo}
                alt="Спортивный автомобиль в гараже"
                fill
                priority
                sizes="150vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 hidden lg:block" style={PHOTO_MASK}>
              <Image
                src={photo}
                alt="Спортивный автомобиль в гараже"
                fill
                priority
                sizes="75vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="ac-glow absolute left-1/2 top-1/2 h-[55%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl" />
            <CarIllustration className="relative w-full max-w-none lg:w-[125%] lg:-ml-[6%]" />
          </div>
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-night via-night/55 to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
        </>
      )}
    </div>
  );
}