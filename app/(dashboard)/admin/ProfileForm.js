"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import PagePhone from "@/components/PagePhone";
import SocialLinks from "@/components/SocialLinks";
import { LIMITS, SOCIAL_LINKS, socialLinksOf } from "@/lib/profile";
import { inkFor, STYLE_DEFAULTS } from "@/lib/style";
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
    const raw = profile[link.key] ?? "";
    values[link.key] = link.kind === "email" ? raw.replace(/^mailto:/i, "") : raw;
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
      <div className="card rounded-3xl border border-white/10 bg-[#1F1F1F]">
        <div className="card-body gap-0 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-lg font-bold text-white">Profile</p>
              <p className="mt-1 text-sm text-stone-400">Your public details and social links.</p>
            </div>
            {savedUsername ? (
              <span className="badge badge-outline badge-sm border-emerald-300 text-emerald-700">Published</span>
            ) : (
              <span className="badge badge-outline badge-sm border-white/20 text-stone-300">Not published</span>
            )}
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="mb-3 text-sm font-semibold text-stone-200">Profile photo</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar src={avatarPreview} name={values.name} className="w-16" />
                <input
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="file-input file-input-bordered file-input-sm w-full max-w-xs rounded-xl border-white/15 bg-[#1F1F1F]"
                />
              </div>
              <p className={`pt-2 text-xs ${photoError ? "text-red-600" : "text-stone-400"}`}>
                {photoError || "JPG, PNG or WebP, up to 2 MB."}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Name</legend>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  className="input h-11 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 focus:border-stone-700 focus:outline-none"
                />
              </fieldset>
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Username</legend>
                <label className="input h-11 w-full rounded-xl border-white/15 bg-[#1F1F1F] focus-within:border-stone-700 focus-within:outline-none">
                  <span className="label text-stone-400">pagzi.online/</span>
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
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Bio</legend>
              <textarea
                name="bio"
                rows={4}
                maxLength={LIMITS.bio}
                value={values.bio}
                onChange={(event) => update("bio", event.target.value)}
                className="textarea w-full resize-none rounded-xl border-white/15 bg-[#1F1F1F] px-4 py-3 leading-6 focus:border-stone-700 focus:outline-none"
              />
              <p className="fieldset-label pt-2 text-xs text-stone-400">
                A short introduction for your page. {values.bio.length}/{LIMITS.bio}
              </p>
            </fieldset>

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Location</legend>
              <input
                type="text"
                name="location"
                maxLength={LIMITS.location}
                value={values.location}
                onChange={(event) => update("location", event.target.value)}
                className="input h-11 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 focus:border-stone-700 focus:outline-none"
              />
            </fieldset>

            <div>
              <p className="text-sm font-semibold text-stone-200">Social links</p>
              <p className="mt-1 text-xs text-stone-400">Add the profiles you want visitors to find.</p>
              <div className="mt-3 grid gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <label
                    key={link.key}
                    className="input h-11 w-full rounded-xl border-white/15 bg-[#1F1F1F] focus-within:border-stone-700 focus-within:outline-none"
                  >
                    <span className="label w-20 text-stone-400">{link.label}</span>
                    <input
                      type="text"
                      inputMode={link.kind === "email" ? "email" : "url"}
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
              <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-200">Public page URL</legend>
              <div className="join w-full">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  aria-label="Public page URL"
                  className="input join-item h-11 w-full rounded-l-xl border-white/15 bg-[#1F1F1F] px-4 text-stone-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  disabled={!savedUsername}
                  className="btn join-item h-11 rounded-r-xl border-white/15 bg-[#161616] px-5 text-stone-100 shadow-none hover:bg-white/10"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-white/10 pt-5">
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
                className="btn btn-save h-11 rounded-xl border-0 px-6 font-semibold text-white shadow-none"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="xl:sticky xl:top-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-200">Page preview</p>
          <span className="text-xs text-stone-400">Live</span>
        </div>
        <PagePhone
          profile={{
            avatarUrl: avatarPreview,
            name: values.name || "Your name",
            location: values.location,
            bio: values.bio,
            links: previewLinks,
          }}
          page={profile.page_color || STYLE_DEFAULTS.page}
          text={inkFor(profile.page_color || STYLE_DEFAULTS.page, profile.text_color)}
          share={profile.share_color || STYLE_DEFAULTS.share}
          font={profile.font_style || STYLE_DEFAULTS.font}
          clicks={profile.chart_clicks || STYLE_DEFAULTS.chartClicks}
          impressions={profile.chart_impressions || STYLE_DEFAULTS.chartImpressions}
          card={profile.card_color || STYLE_DEFAULTS.card}
        />
        {savedUsername ? (
          <Link
            href={`/${savedUsername}`}
            className="btn mt-4 h-11 w-full rounded-full border-white/15 bg-[#161616] font-semibold text-stone-100 shadow-none hover:bg-white/10"
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
