import { finishOAuth } from "@/lib/confirm-link";

export async function GET(request) {
  return finishOAuth(request);
}
