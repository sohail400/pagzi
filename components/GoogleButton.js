import Link from "next/link";
import { signInWithGoogle } from "@/app/auth/actions";

export default function GoogleButton({ plan = "" }) {
  return (
    <>
      <form action={signInWithGoogle}>
        {plan && <input type="hidden" name="plan" value={plan} />}
        <button
          type="submit"
          className="btn h-12 w-full gap-3 rounded-full border-white bg-white font-semibold text-stone-900 shadow-none hover:border-stone-200 hover:bg-stone-200"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
          </svg>
          Continue with Google
        </button>
      </form>
      <p className="mt-3 text-center text-xs leading-5 text-stone-500">
        By continuing with Google, you agree to the{" "}
        <Link href="/terms" className="link text-stone-300">terms</Link> and{" "}
        <Link href="/privacy" className="link text-stone-300">privacy policy</Link>.
      </p>
      <div className="divider my-6 text-xs text-stone-500 before:bg-white/10 after:bg-white/10">or</div>
    </>
  );
}
