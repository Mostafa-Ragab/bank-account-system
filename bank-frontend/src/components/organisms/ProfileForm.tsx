"use client";

import { useState } from "react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export type ProfileData = {
  name: string;
  address: string | null;
  profilePic: string | null;
  email: string;
  mobile: string;
};

type Props = {
  initial: ProfileData;
  onSubmit: (data: Partial<ProfileData>) => Promise<void>;
  loading?: boolean;
};

export function ProfileForm({ initial, onSubmit, loading }: Props) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address ?? "");
  const [profilePic, setProfilePic] = useState(initial.profilePic ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ name, address, profilePic });
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-1">
        <Label>Full Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Profile Picture URL</Label>
        <Input
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}