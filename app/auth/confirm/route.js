import { confirmFromEmail } from "@/lib/confirm-link";

export async function GET(request) {
  return confirmFromEmail(request);
}
