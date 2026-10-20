"use client";

export default function LiveUpdateDialog({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#2A2A2A] p-6" role="dialog" aria-modal="true" aria-labelledby="live-update-title">
        <p id="live-update-title" className="text-lg font-semibold text-white">Your page is updated</p>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          These changes are saved on your public page. Visitors can see them from View.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-save h-10 rounded-xl border-0 px-5 text-sm font-semibold text-white shadow-none"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
