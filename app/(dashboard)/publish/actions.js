"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireFullAccess } from "@/lib/payments";
import { profileDetailsReady, selectProfile } from "@/lib/profile";

export async function publishPage() {
  const { supabase, userId } = await requireFullAccess();
  const { data: profile } = await selectProfile(supabase, userId, "username, name, bio, location");
  if (!profileDetailsReady(profile)) redirect("/admin");

  const { error } = await supabase.from("profiles").update({ published_at: new Date().toISOString() }).eq("id", userId);
  if (error) {
    console.error("Publishing a page failed:", error);
    if (/published_at/.test(error.message ?? "")) redirect("/publish?error=setup");
    redirect("/publish?error=save");
  }

  revalidatePath("/", "layout");
  redirect("/publish?done=1");
}
