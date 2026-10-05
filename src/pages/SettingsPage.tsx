import DashboardLayout from "../components/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout active="settings">
      <main className="px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-3xl font-bold tracking-[-0.035em] text-stone-900">Settings</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">Manage your account and public page preferences.</p>
          </div>

          <div className="space-y-6">
            <div className="card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]">
              <div className="card-body gap-0 p-5 sm:p-7">
                <div className="border-b border-stone-100 pb-5">
                  <p className="text-lg font-bold text-stone-900">Account</p>
                  <p className="mt-1 text-sm text-stone-500">Your sign-in details and indie.site identity.</p>
                </div>
                <form className="mt-6 space-y-5" onSubmit={(event) => event.preventDefault()}>
                  <fieldset className="fieldset p-0">
                    <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Email</legend>
                    <input
                      type="email"
                      defaultValue="sohail@indie.site"
                      className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
                    />
                  </fieldset>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <fieldset className="fieldset p-0">
                      <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Username</legend>
                      <input
                        type="text"
                        defaultValue="sohail"
                        className="input h-11 w-full rounded-xl border-stone-300 bg-white px-4 focus:border-stone-700 focus:outline-none"
                      />
                    </fieldset>
                    <fieldset className="fieldset p-0">
                      <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">
                        Indie.site domain
                      </legend>
                      <input
                        type="text"
                        readOnly
                        value="indie.site/sohail"
                        className="input h-11 w-full rounded-xl border-stone-300 bg-stone-50 px-4 text-stone-500 focus:outline-none"
                      />
                    </fieldset>
                  </div>
                  <div className="flex justify-end border-t border-stone-100 pt-5">
                    <button
                      type="submit"
                      className="btn h-11 rounded-full border-stone-900 bg-stone-900 px-6 font-semibold text-white shadow-none hover:border-stone-800 hover:bg-stone-800"
                    >
                      Save account
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]">
              <div className="card-body p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-stone-900">Billing</p>
                    <p className="mt-1 text-sm text-stone-500">Your indie.site subscription.</p>
                  </div>
                  <span className="badge badge-success badge-outline">Active</span>
                </div>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Annual plan</p>
                    <p className="mt-1 text-sm text-stone-500">Renews yearly</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-stone-900">
                    $25 <span className="text-sm font-medium text-stone-400">/ year</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="card rounded-3xl border border-stone-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.05)]">
              <div className="card-body gap-0 p-5 sm:p-7">
                <div className="border-b border-stone-100 pb-5">
                  <p className="text-lg font-bold text-stone-900">Public page</p>
                  <p className="mt-1 text-sm text-stone-500">Control how your public page is displayed.</p>
                </div>
                <div className="mt-6 space-y-6">
                  <fieldset className="fieldset p-0">
                    <legend className="fieldset-legend pb-2 text-sm font-semibold text-stone-700">Public URL</legend>
                    <input
                      type="text"
                      readOnly
                      value="https://indie.site/sohail"
                      className="input h-11 w-full rounded-xl border-stone-300 bg-stone-50 px-4 text-stone-500 focus:outline-none"
                    />
                  </fieldset>
                  <div className="flex items-center justify-between gap-5 rounded-2xl border border-stone-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Show website name</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        Display each website’s name on your public page.
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle shrink-0 border-stone-400 bg-stone-300 checked:bg-stone-900" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card rounded-3xl border border-red-200 bg-white shadow-[0_10px_35px_rgba(28,25,23,0.04)]">
              <div className="card-body flex-row flex-wrap items-center justify-between gap-4 p-5 sm:p-7">
                <div>
                  <p className="text-lg font-bold text-stone-900">Delete account</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Permanently delete your account and public indie.site page.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline h-10 rounded-full border-red-300 px-5 text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
