import Image from "next/image";
import { findPublicImage } from "@/lib/publicImage";
import { CarIllustration } from "./CarIllustration";

/** Положите фотографию в frontend/public/images/hero-car.(jpg|webp|png) — подхватится без правок кода. */
export function HeroVisual() {
  const photo = findPublicImage("images", "hero-car");

  return (
    <div
      className="ac-fade-in relative aspect-[2/1] w-full overflow-hidden bg-gradient-to-b from-surface via-[#0B1217] to-night
                 lg:absolute lg:inset-0 lg:aspect-auto lg:bg-none"
    >
      {photo ? (
        <Image
          src={photo}
          alt="Спортивный автомобиль в гараже"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[55%_center] lg:object-[68%_center]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
          <div className="ac-glow absolute left-1/2 top-1/2 h-[55%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl lg:left-[68%]" />
          <CarIllustration className="relative w-full max-w-none lg:mr-[4%] lg:w-[62%]" />
        </div>
      )}

      {/* градиенты: мягкий переход фото в фон и читаемость текста */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night via-transparent to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[65%] bg-gradient-to-r from-night via-night/70 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-28 bg-gradient-to-b from-night/80 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}
