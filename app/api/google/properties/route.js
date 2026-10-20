import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getConnection, isAccessRevoked, listProperties } from "@/lib/google";

export async function GET() {
  const { userId } = await requireUser();
  let connection;
  try {
    connection = await getConnection(userId);
  } catch (error) {
    console.error("Loading Google connection failed:", error);
    return NextResponse.json({ connection: null, properties: [] });
  }
  if (!connection) return NextResponse.json({ connection: null, properties: [] });

  try {
    const properties = await listProperties(connection.refreshToken);
    return NextResponse.json({
      connection: { email: connection.email, status: "ok" },
      properties,
    });
  } catch (error) {
    if (!isAccessRevoked(error)) console.error("Listing Search Console sites failed:", error);
    return NextResponse.json({
      connection: { email: connection.email, status: isAccessRevoked(error) ? "revoked" : "error" },
      properties: [],
    });
  }
}
