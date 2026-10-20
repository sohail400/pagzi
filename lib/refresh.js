import "server-only";
import { revalidatePath } from "next/cache";

const OWNER_PATHS = ["/admin", "/sites", "/style", "/settings", "/publish"];

export function refreshOwnerPages(username) {
  OWNER_PATHS.forEach((path) => revalidatePath(path));
  if (username) revalidatePath(`/${username}`);
}
