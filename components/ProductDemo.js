"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AnalyticsCard from "@/components/AnalyticsCard";
import Avatar from "@/components/Avatar";
import { startDemoClock } from "@/components/demoClock";
import SocialLinks from "@/components/SocialLinks";
import { STYLE_DEFAULTS } from "@/lib/style";

const SPEED = 2;

const MARKS = {
  nameClick: 700,
  nameEnd: 2600,
  locationClick: 3200,
  locationEnd: 5000,
  bioClick: 5600,
  bioEnd: 9800,
  photo: 10400,
  site: 11200,
  siteClick: 11800,
  siteEnd: 13600,
  addClick: 14200,
  chart: 15000,
  connectClick: 15600,
  preview: 18800,
  end: 25000,
};

function typed(text, start, end, elapsed) {
  if (!text || elapsed <= start) return "";
  if (elapsed >= end) return text;
  return text.slice(0, Math.ceil(((elapsed - start) / (end - start)) * text.length));
}

function sceneOf(elapsed) {
  if (elapsed >= MARKS.preview) return "preview";
  if (elapsed >= MARKS.chart) return "chart";
  if (elapsed >= MARKS.site) return "site";
  return "form";
}

function focusOf(elapsed) {
  if (elapsed < MARKS.locationClick) return "name";
  if (elapsed < MARKS.bioClick) return "location";
  if (elapsed < MARKS.site) return "bio";
  if (elapsed < MARKS.addClick) return "site";
  if (elapsed < MARKS.chart) return "add";
  if (elapsed < MARKS.preview) return "connect";
  return "done";
}

function clicking(elapsed) {
  return [MARKS.nameClick, MARKS.locationClick, MARKS.bioClick, MARKS.siteClick, MARKS.addClick, MARKS.connectClick].some(
    (mark) => elapsed >= mark && elapsed < mark + 180
  );
}

function clock(ms) {
  const total = Math.min(MARKS.end, Math.max(0, Math.round(ms / 1000)));
  return `0:${String(total).padStart(2, "0")}`;
}

export default function ProductDemo({ profile, site, sample = false }) {
  const stageRef = useRef(null);
  const fields = useRef({});
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cursor, setCursor] = useState({ x: 36, y: 48 });

  const name = profile?.name || "";
  const location = profile?.location || "";
  const bio = profile?.bio || "";
  const domain = site?.name || "";

  useEffect(() => {
    if (!playing) return undefined;
    return startDemoClock(stageRef, (step) => {
      setElapsed((current) => (current + step * SPEED >= MARKS.end ? 0 : current + step * SPEED));
    });
  }, [playing]);

  const scene = sceneOf(elapsed);
  const focus = focusOf(elapsed);
  const nameValue = typed(name, MARKS.nameClick, MARKS.nameEnd, elapsed);
  const locationValue = typed(location, MARKS.locationClick, MARKS.locationEnd, elapsed);
  const bioValue = typed(bio, MARKS.bioClick, MARKS.bioEnd, elapsed);
  const siteValue = typed(domain, MARKS.siteClick, MARKS.siteEnd, elapsed);
  const showPhoto = elapsed >= MARKS.photo || scene !== "form";
  const siteAdded = elapsed >= MARKS.addClick;
  const chartShown = elapsed >= MARKS.connectClick;

  useLayoutEffect(() => {
    const node = fields.current[focus];
    const stage = stageRef.current;
    if (!node || !stage) return;
    const field = node.getBoundingClientRect();
    const box = stage.getBoundingClientRect();
    setCursor({
      x: field.left - box.left + Math.min(36, field.width * 0.25),
      y: field.top - box.top + field.height / 2,
    });
  }, [focus, scene, showPhoto, siteAdded, chartShown]);

  function setField(key) {
    return (node) => {
      fields.current[key] = node;
    };
  }

  const fieldClass =
    "input pointer-events-none h-11 w-full rounded-xl border-white/15 bg-[#1F1F1F] px-4 text-sm text-stone-100 outline-none";

  return (
    <div className="overflow-hidden">
      <div ref={stageRef} inert className="relative overflow-hidden p-4 sm:p-6" aria-hidden="true">
        <div className="pointer-events-none grid w-full min-w-0">
          {scene === "form" && (
          <div className="mx-auto w-full min-w-0 max-w-full space-y-4">
            <div className="flex items-center gap-3">
              <div ref={setField("photo")} className={`transition-opacity duration-500 ${showPhoto ? "opacity-100" : "opacity-0"}`}>
                <Avatar src={showPhoto ? profile.avatarUrl : ""} name={nameValue || name} className="w-14" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Profile</p>
                <p className="text-xs text-stone-400">Photo, name, location, and bio</p>
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-300">Name</span>
              <input ref={setField("name")} readOnly value={nameValue} className={`${fieldClass} ${focus === "name" ? "border-[#ff4fa3]" : ""}`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-300">Location</span>
              <input ref={setField("location")} readOnly value={locationValue} className={`${fieldClass} ${focus === "location" ? "border-[#ff4fa3]" : ""}`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-stone-300">Bio</span>
              <textarea
                ref={setField("bio")}
                readOnly
                rows={3}
                value={bioValue}
                className={`textarea pointer-events-none w-full resize-none rounded-xl border-white/15 bg-[#1F1F1F] px-4 py-3 text-sm leading-6 text-stone-100 outline-none ${focus === "bio" ? "border-[#ff4fa3]" : ""}`}
              />
            </label>
          </div>
          )}

          {scene === "site" && (
          <div className="mx-auto w-full min-w-0 max-w-full space-y-4">
            <p className="text-sm font-semibold text-white">Add a website</p>
            <input ref={setField("site")} readOnly value={siteValue} placeholder="yoursite.com" className={`${fieldClass} ${focus === "site" ? "border-[#ff4fa3]" : ""}`} />
            <button ref={setField("add")} type="button" className="btn btn-save h-11 w-full rounded-xl border-0 text-white">
              Add website
            </button>
            {siteAdded && domain && (
              <p className="rounded-xl border border-white/10 bg-[#1F1F1F] px-4 py-3 text-sm font-semibold text-white">{domain}</p>
            )}
          </div>
          )}

          {scene === "chart" && (
          <div className="mx-auto w-full min-w-0 max-w-full space-y-4">
            <p className="text-sm font-semibold text-white">Google Search Console</p>
            <button ref={setField("connect")} type="button" className="btn btn-save h-11 w-full rounded-xl border-0 text-white">
              {chartShown ? "Saved chart" : "Connect Google Search Console"}
            </button>
            {chartShown && site ? (
              <>
                <AnalyticsCard
                  name={site.name}
                  description={site.description}
                  logoUrl={site.logoUrl}
                  category={site.category}
                  status={site.status}
                  anonymous={site.anonymous}
                  chart="area"
                  clicksColor={STYLE_DEFAULTS.chartClicks}
                  impressionsColor={STYLE_DEFAULTS.chartImpressions}
                  cardColor="#ffffff"
                  days={site.days}
                  compact
                />
                <p className="text-center text-xs text-stone-400">
                  {sample ? "Sample chart numbers" : "Saved Search Console numbers. This demo does not connect a new account."}
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-stone-400">The chart uses numbers already saved for this website.</p>
            )}
          </div>
          )}

          {scene === "preview" && (
          <div ref={setField("done")} className="mx-auto w-full min-w-0 max-w-full rounded-2xl bg-[#111111] p-4 text-stone-100 sm:p-5">
            <Avatar src={profile.avatarUrl} name={name} className="w-14" />
            <p className="mt-3 text-2xl font-bold leading-none">{name}</p>
            {location && <p className="mt-2 text-sm text-stone-400">{location}</p>}
            {bio && <p className="mt-3 text-sm leading-6 text-stone-200">{bio}</p>}
            <SocialLinks links={profile.links || []} className="mt-3" color="#E7E5E4" />
            {site && (
              <div className="mt-4">
                <AnalyticsCard
                  name={site.name}
                  description={site.description}
                  logoUrl={site.logoUrl}
                  category={site.category}
                  status={site.status}
                  anonymous={site.anonymous}
                  chart="area"
                  clicksColor={STYLE_DEFAULTS.chartClicks}
                  impressionsColor={STYLE_DEFAULTS.chartImpressions}
                  cardColor="#ffffff"
                  days={site.days}
                  compact
                />
              </div>
            )}
          </div>
          )}
        </div>

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute z-20 h-7 w-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${clicking(elapsed) ? 0.85 : 1})`,
              transition: "transform 500ms ease",
            }}
          >
            <path fill="#fff" stroke="#1F1F1F" strokeWidth="1.2" d="M5 3l10 14-4 1 2 5-2 1-2-5-4 3z" />
          </svg>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#ff4fa3]" style={{ width: `${(elapsed / MARKS.end) * 100}%` }} />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-stone-400">
          {clock(elapsed)} / {clock(MARKS.end)}
        </span>
        <button
          type="button"
          onClick={() => {
            setElapsed(0);
            setPlaying(true);
          }}
          className="btn btn-sm h-10 min-h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-semibold text-stone-100"
        >
          Replay
        </button>
      </div>
    </div>
  );
}
