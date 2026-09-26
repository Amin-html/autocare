import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      <div className="relative z-10 text-center px-6">
        <p className="label-uppercase text-medium-gray mb-4">Autocare</p>
        <h1 className="text-hero mb-8">
          PRECISION<br />IN EVERY SERVICE.
        </h1>
        <p className="text-medium-gray text-lg mb-10 max-w-xl mx-auto">
          Professional automotive service management for your vehicle.
        </p>
        <Button variant="primary" size="lg">Book a Service</Button>
      </div>

      <div className="relative w-full max-w-5xl mx-auto mt-16 aspect-[16/9] px-6">
        <div className="relative w-full h-full rounded-md overflow-hidden bg-light-gray">
          <Image
            src="/hero-car-placeholder.jpg"
            alt="BMW M3"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
        <p className="label-uppercase text-medium-gray mt-4 text-center">
          BMW M3 / 48 320 KM
        </p>
      </div>
    </section>
  );
}