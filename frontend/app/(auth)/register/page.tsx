"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({ email, password, full_name: fullName });
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="label-uppercase text-medium-gray mb-2 text-center">Autocare</p>
        <h1 className="text-3xl font-bold mb-8 text-center">CREATE ACCOUNT</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border border-light-gray px-4 py-3 rounded-sm focus:outline-none focus:border-black transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-light-gray px-4 py-3 rounded-sm focus:outline-none focus:border-black transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-light-gray px-4 py-3 rounded-sm focus:outline-none focus:border-black transition-colors"
          />
          {error && <p className="text-accent-red text-sm">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-medium-gray mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-black underline">Sign In</a>
        </p>
      </div>
    </main>
  );
}