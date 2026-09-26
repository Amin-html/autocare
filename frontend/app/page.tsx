import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <p className="label-uppercase text-medium-gray">Autocare</p>
      <h1 className="text-hero text-center">
        PRECISION<br />IN EVERY SERVICE.
      </h1>
      <Button variant="primary" size="lg">Book a Service</Button>
    </main>
  );
}