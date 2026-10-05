import { Link } from "react-router";
import DashboardLayout from "../components/DashboardLayout";
import profileImage from "../assets/profile.jpg";

export default function AdminPage() {
  return (
    <DashboardLayout active="profile">
      <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900">Your indie.site</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Update what people see when they visit your public page.
            </p>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]">
              <div className="card-body gap-0 p-5 sm:p-7">
                <div className="flex items-center justify-between border-b border-stone-100 pb-5">
                  <div>
                    <p className="text-lg font-bold text-stone-900">Profile</p>
                    <p className="mt-1 text-sm text-stone-500">Your public details and social links.</p>
                  </div>
                  <span className="badge badge-success badge-outline badge-sm">Published</span>
                </div>

                <form className="mt-6 space-y-6" onSubmit={(event) => event.preventDefault()}>
                  <div>
                    <p className="mb-3 text-sm font-semibold text-stone-700">Profile photo</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="avatar">
                        <div className="w-16 rounded-full ring-2 ring-amber-200">
                          <img src={profileImage} alt="Sohail Shaikh" className="object-cover" />
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered file-input-sm w-full max-w-xs rounded-xl border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <fieldset className="fieldset p-0">
                      <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Name</legend>
                      <input
                        type="text"
                        defaultValue="Sohail Shaikh"
                        className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
                      />
                    </fieldset>
                    <fieldset className="fieldset p-0">
                      <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Username</legend>
                      <label className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none">
                        <span className="label text-stone-400">indie.site/</span>
                        <input type="text" defaultValue="sohail" className="grow" />
                      </label>
                    </fieldset>
                  </div>

                  <fieldset className="fieldset p-0">
                    <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Bio</legend>
                    <textarea
                      defaultValue="I design and build thoughtful digital products, turning ambitious ideas into simple and useful experiences."
                      rows={4}
                      className="textarea w-full resize-none rounded-xl border-stone-300 bg-white px-4 py-3 leading-6 focus:border-stone-700 focus:outline-none"
                    />
                    <p className="fieldset-label pt-2 text-xs text-stone-400">A short introduction for your page.</p>
                  </fieldset>

                  <fieldset className="fieldset p-0">
                    <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Location</legend>
                    <input
                      type="text"
                      defaultValue="Mumbai"
                      className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
                    />
                  </fieldset>

                  <div>
                    <p className="text-sm font-semibold text-stone-700">Social links</p>
                    <p className="mt-1 text-xs text-stone-400">Add the profiles you want visitors to find.</p>
                    <div className="mt-3 grid gap-3">
                      <label className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none">
                        <span className="label w-20 text-stone-500">X</span>
                        <input type="url" placeholder="https://x.com/username" className="grow" />
                      </label>
                      <label className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none">
                        <span className="label w-20 text-stone-500">LinkedIn</span>
                        <input type="url" placeholder="https://linkedin.com/in/username" className="grow" />
                      </label>
                      <label className="input h-11 w-full rounded-xl border-stone-300 bg-white focus-within:border-stone-700 focus-within:outline-none">
                        <span className="label w-20 text-stone-500">Instagram</span>
                        <input type="url" placeholder="https://instagram.com/username" className="grow" />
                      </label>
                    </div>
                  </div>

                  <fieldset className="fieldset p-0">
                    <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Public page URL</legend>
                    <div className="join w-full">
                      <input
                        type="text"
                        readOnly
                        value="https://indie.site/sohail"
                        className="input join-item h-11 w-full rounded-l-xl border-stone-300 bg-stone-50 px-4 text-stone-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        className="btn join-item h-11 rounded-r-xl border-stone-300 bg-white px-5 text-stone-700 shadow-none hover:bg-stone-50"
                      >
                        Copy
                      </button>
                    </div>
                  </fieldset>

                  <div className="flex justify-end border-t border-stone-100 pt-5">
                    <button
                      type="submit"
                      className="btn h-11 rounded-full border-stone-900 bg-stone-900 px-6 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800"
                    >
                      Save changes
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
                  <div className="avatar">
                    <div className="w-16 rounded-full ring-2 ring-amber-200">
                      <img src={profileImage} alt="" className="object-cover" />
                    </div>
                  </div>
                  <p className="mt-1 text-xl font-bold tracking-tight text-stone-900">Sohail Shaikh</p>
                  <p className="text-xs text-stone-500">Mumbai · X · LinkedIn</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">
                    I design and build thoughtful digital products, turning ambitious ideas into useful experiences.
                  </p>
                  <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800">shopify-store.com</p>
                        <p className="text-[9px] text-stone-400">Search Console</p>
                      </div>
                    </div>
                    <div className="mt-3 h-16 rounded-xl border border-stone-100 bg-stone-50 p-2">
                      <svg viewBox="0 0 220 46" aria-hidden="true" className="h-full w-full overflow-visible">
                        <path
                          d="M0 34 C24 10, 40 40, 62 31 S83 8, 105 18 S135 36, 158 17 S190 6, 220 13"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                to="/sohail"
                className="btn mt-4 h-11 w-full rounded-full border-stone-300 bg-white font-semibold text-stone-800 shadow-none hover:border-stone-400 hover:bg-stone-50"
              >
                View my page
              </Link>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
