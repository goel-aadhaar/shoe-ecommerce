'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import type { Profile } from '@/types';

export function ProfileForm() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService
      .getProfile()
      .then((res) => {
        if (res.data.profile) setProfile(res.data.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(profile);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-brown-100" />
      ))}
    </div>;
  }

  const fields: { key: keyof Profile; label: string; type?: string }[] = [
    { key: 'fullname', label: 'Full Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'pincode', label: 'Pincode' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-brown-700">
              {f.label}
            </label>
            <input
              type={f.type ?? 'text'}
              value={(profile[f.key] as string) ?? ''}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm text-brown-800 focus:border-copper focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brown-800 px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brown-900 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
