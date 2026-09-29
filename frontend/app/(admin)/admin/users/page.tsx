"use client";

import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/services/auth.service";

const ROLES: User["role"][] = ["client", "manager", "master", "admin"];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  function load() {
    return usersService
      .list()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function changeRole(id: number, role: User["role"]) {
    setBusyId(id);
    setError(null);
    usersService
      .updateRole(id, role)
      .then((updated) => setUsers((prev) => prev.map((u) => (u.id === id ? updated : u))))
      .catch((err: Error) => setError(err.message))
      .finally(() => setBusyId(null));
  }

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q);
  });

  if (loading) return <div className="py-24 text-center text-medium-gray">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">USERS</h1>

      {error && (
        <p className="border border-accent-red rounded-md px-4 py-3 mb-6">{error}</p>
      )}

      <input
        placeholder="Search by name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm bg-transparent border border-dark-gray focus:border-white outline-none rounded-md px-4 py-3 mb-6 transition-colors"
      />

      <div className="border-t border-dark-gray">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px] gap-2 md:gap-4 items-center py-4 border-b border-dark-gray"
          >
            <div>
              <p className="font-medium">{u.full_name}</p>
              <p className="text-sm text-medium-gray">{u.email}</p>
            </div>
            <p className="label-uppercase text-medium-gray">{u.role}</p>
            <select
              value={u.role}
              disabled={u.id === me?.id || busyId === u.id}
              onChange={(e) => changeRole(u.id, e.target.value as User["role"])}
              className="bg-deep-black border border-dark-gray rounded-md px-3 py-2 disabled:opacity-40"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-medium-gray py-8">No users match.</p>}
      </div>
    </div>
  );
}