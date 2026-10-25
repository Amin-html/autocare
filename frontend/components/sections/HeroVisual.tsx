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

export function HeroVisual() {
  const photo = findPhoto();

  return (
    <div
      className="ac-slide-in relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-surface via-[#0B1217] to-night
                 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[58%]"
    >
      {photo ? (
        <div className="absolute inset-0 flex items-center">
          <div className={`relative ${PHOTO_ASPECT} -ml-[20%] w-[170%] max-w-none lg:ml-0 lg:w-[125%]`}>
            <Image
              src={photo}
              alt="Спортивный автомобиль в гараже"
              fill
              priority
              sizes="(max-width: 1024px) 170vw, 75vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="ac-glow absolute left-1/2 top-1/2 h-[55%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl" />
          <CarIllustration className="relative w-full max-w-none lg:w-[125%] lg:-ml-[6%]" />
        </div>
      )}

      {/* градиенты: читаемость текста и мягкий переход фото в фон */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night via-transparent to-transparent lg:hidden" />
      {photo ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-night via-night/50 to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-1/3 bg-gradient-to-b from-night to-transparent lg:block" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-night via-night/55 to-transparent lg:block" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}