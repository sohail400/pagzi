"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import SocialLinks from "@/components/SocialLinks";
import { LIMITS, SOCIAL_LINKS, socialLinksOf } from "@/lib/profile";
import { updateProfile } from "./actions";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toFormValues(profile) {
  const values = {
    username: profile.username ?? "",
    name: profile.name ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
  };
  SOCIAL_LINKS.forEach((link) => {
    values[link.key] = profile[link.key] ?? "";
  });
  return values;
}

export default function ProfileForm({ profile, siteUrl }) {
  const [state, formAction, pending] = useActionState(updateProfile, null);
  const [values, setValues] = useState(() => toFormValues(profile));
  const [savedUsername, setSavedUsername] = useState(profile.username ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [photoError, setPhotoError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!state?.success) return;
    setSavedUsername(state.profile.username ?? "");
    setValues(toFormValues(state.profile));
    setAvatarPreview(state.profile.avatar_url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [state]);

  useEffect(() => {
    if (!avatarPreview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPhotoError("");
    if (!file) {
      setAvatarPreview(state?.profile?.avatar_url ?? profile.avatar_url);
      return;
    }
    if (!AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_BYTES) {
      setPhotoError("Please choose a JPG, PNG or WebP image smaller than 2 MB.");
      event.target.value = "";
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  async function copyPublicUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const publicUrl = `${siteUrl}/${savedUsername || "your-username"}`;
  const previewLinks = socialLinksOf(values).map((link) => ({
    ...link,
    url: /^https?:\/\//i.test(link.url) ? link.url : `https://${link.url}`,
  }));

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]">
        <div className="card-body gap-0 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <div>
              <p className="text-lg font-bold text-stone-900">Profile</p>
              <p className="mt-1 text-sm text-stone-500">Your public details and social links.</p>
            </div>
            {savedUsername ? (
              <span className="badge badge-outline badge-sm border-emerald-300 text-emerald-700">Published</span>
            ) : (
              <span className="badge badge-outline badge-sm border-stone-300 text-stone-500">Not published</span>
            )}
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="mb-3 text-sm font-semibold text-stone-700">Profile photo</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar src={avatarPreview} name={values.name} className="w-16 ring-2 ring-amber-200" />
                <input
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="file-input file-input-bordered file-input-sm w-full max-w-xs rounded-xl border-stone-300 bg-white"
                />
              </div>
              <p className={`pt-2 text-xs ${photoError ? "text-red-600" : "text-stone-400"}`}>
                {photoError || "JPG, PNG or WebP, up to 2 MB."}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Name</legend>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
                />
              </fieldset>
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Username</legend>
                <label className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none">
                  <span className="label text-stone-400">indie.site/</span>
                  <input
                    type="text"
                    name="username"
                    required
                    minLength={3}
                    maxLength={30}
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="your-name"
                    value={values.username}
                    onChange={(event) => update("username", event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="grow"
                  />
                </label>
                <p className="fieldset-label pt-2 text-xs text-stone-400">
                  {savedUsername ? "Lowercase letters, numbers, - and _." : "Choose a username to publish your page."}
                </p>
              </fieldset>
            </div>

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Bio</legend>
              <textarea
                name="bio"
                rows={4}
                maxLength={LIMITS.bio}
                value={values.bio}
                onChange={(event) => update("bio", event.target.value)}
                className="textarea w-full resize-none rounded-xl border-stone-300 bg-white px-4 py-3 leading-6 focus:border-stone-700 focus:outline-none"
              />
              <p className="fieldset-label pt-2 text-xs text-stone-400">
                A short introduction for your page. {values.bio.length}/{LIMITS.bio}
              </p>
            </fieldset>

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Location</legend>
              <input
                type="text"
                name="location"
                maxLength={LIMITS.location}
                value={values.location}
                onChange={(event) => update("location", event.target.value)}
                className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
              />
            </fieldset>

            <div>
              <p className="text-sm font-semibold text-stone-700">Social links</p>
              <p className="mt-1 text-xs text-stone-400">Add the profiles you want visitors to find.</p>
              <div className="mt-3 grid gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <label
                    key={link.key}
                    className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none"
                  >
                    <span className="label w-20 text-stone-500">{link.label}</span>
                    <input
                      type="text"
                      inputMode="url"
                      name={link.key}
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={LIMITS.url}
                      placeholder={link.placeholder}
                      value={values[link.key]}
                      onChange={(event) => update(link.key, event.target.value)}
                      className="grow"
                    />
                  </label>
                ))}
              </div>
            </div>

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Public page URL</legend>
              <div className="join w-full">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  aria-label="Public page URL"
                  className="input join-item h-11 w-full rounded-l-xl border-stone-300 bg-stone-50 px-4 text-stone-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  disabled={!savedUsername}
                  className="btn join-item h-11 rounded-r-xl border-stone-300 bg-white px-5 text-stone-700 shadow-none hover:bg-stone-50"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-stone-100 pt-5">
              {state?.error && (
                <p role="alert" className="mr-auto text-sm text-red-600">
                  {state.error}
                </p>
              )}
              {state?.success && !pending && (
                <p role="status" className="mr-auto text-sm text-emerald-700">
                  Changes saved.
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="btn h-11 rounded-full border-stone-900 bg-stone-900 px-6 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800 disabled:border-stone-700 disabled:bg-stone-700 disabled:text-white"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="xl:sticky xl:top-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-700">Page preview</p>
          <span className="text-xs text-stone-400">Live</span>
        </div>
        <div className="card overflow-hidden rounded-3xl border border-stone-200 bg-[#f5f0e8] shadow-[0_12px_40px_rgba(28,25,23,0.08)]">
          <div className="card-body p-5">
            <Avatar src={avatarPreview} name={values.name} className="w-16 ring-2 ring-amber-200" />
            <p className="mt-1 text-xl font-bold tracking-tight text-stone-900">{values.name || "Your name"}</p>
            {values.location && <p className="text-xs text-stone-500">{values.location}</p>}
            {values.bio && <p className="mt-2 whitespace-pre-line break-words text-xs leading-5 text-stone-600">{values.bio}</p>}
            <SocialLinks links={previewLinks} size="sm" className="mt-2" />
          </div>
        </div>
        {savedUsername ? (
          <Link
            href={`/${savedUsername}`}
            className="btn mt-4 h-11 w-full rounded-full border-stone-300 bg-white font-semibold text-stone-800 shadow-none hover:border-stone-400 hover:bg-stone-50"
          >
            View my page
          </Link>
        ) : (
          <p className="mt-4 text-center text-xs text-stone-400">Save a username to view your page.</p>
        )}
      </div>
    </div>
  );
}
