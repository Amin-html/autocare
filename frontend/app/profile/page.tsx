"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usersService } from "@/services/users.service";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setLocalUser(user);
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-medium-gray">Loading...</div>;
  }

  function saveName() {
    if (!fullName.trim()) return setNameError("Name can't be empty.");
    setNameError(null);
    setNameSaved(false);
    setSavingName(true);
    usersService
      .updateProfile(fullName.trim())
      .then((updated) => {
        setLocalUser(updated);
        setNameSaved(true);
      })
      .catch((err: Error) => setNameError(err.message))
      .finally(() => setSavingName(false));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setUploading(true);
    usersService
      .uploadAvatar(file)
      .then((updated) => setLocalUser(updated))
      .catch((err: Error) => setAvatarError(err.message))
      .finally(() => {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  }

  return (
    <div className="min-h-screen bg-warm-white text-black px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="label-uppercase text-medium-gray hover:text-black transition-colors">
          ← Autocare
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-10">My Profile</h1>

        <div className="flex items-center gap-6 mb-10">
          <Avatar src={localUser?.avatar_url} name={localUser?.full_name || "?"} size={80} />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-input"
            />
            <label htmlFor="avatar-input">
              <span className="label-uppercase border border-black px-4 py-2 cursor-pointer hover:bg-black hover:text-white transition-colors inline-block">
                {uploading ? "Uploading..." : "Change photo"}
              </span>
            </label>
            <p className="text-xs text-medium-gray mt-2">JPEG, PNG or WEBP, up to 5 MB</p>
            {avatarError && <p className="text-accent-red text-sm mt-2">{avatarError}</p>}
          </div>
        </div>

        <div className="border-t border-light-gray pt-8">
          <label className="label-uppercase text-medium-gray block mb-2" htmlFor="full-name">
            Full name
          </label>
          <input
            id="full-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setNameSaved(false);
            }}
            className="w-full max-w-sm border border-light-gray focus:border-black outline-none rounded-sm px-4 py-3 mb-3 transition-colors"
          />
          {nameError && <p className="text-accent-red text-sm mb-3">{nameError}</p>}
          {nameSaved && <p className="text-sm text-medium-gray mb-3">Saved.</p>}
          <Button variant="secondary" size="md" onClick={saveName} disabled={savingName}>
            {savingName ? "Saving..." : "Save name"}
          </Button>
        </div>

        <div className="border-t border-light-gray mt-10 pt-6">
          <p className="text-sm text-medium-gray">Email</p>
          <p>{localUser?.email}</p>
          <p className="text-sm text-medium-gray mt-4">Role</p>
          <p className="capitalize">{localUser?.role}</p>
        </div>
      </div>
    </div>
  );
}