import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

// Proxies a story's narration audio through this Vercel route instead of
// linking straight to the raw Convex storage URL, so Vercel's edge network
// can cache the response. Narration is set once at generation and never
// overwritten afterward (see stories.ts — narrationFilePath is only ever
// written at creation or removed alongside full story deletion), so it's
// safe to cache as immutable, keyed by storyId.
//
// No auth/ownership check is added here on purpose: the underlying Convex
// query (getNarrationFileUrl) and the raw storage URL it returns have none
// today either — per Convex's own docs, storage.getUrl() is a bearer URL,
// "anyone with the URL can access the file without further authentication."
// This route preserves that exact access level rather than changing it.

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await context.params;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }
  const convex = new ConvexHttpClient(convexUrl);

  const result = await convex
    .query(api.stories.getNarrationFileUrl, { storyId: storyId as Id<"stories"> })
    .catch(() => null);

  const sourceUrl = result?.url;
  if (!sourceUrl) {
    return NextResponse.json({ error: "Narration not found" }, { status: 404 });
  }

  const upstream = await fetch(sourceUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Failed to fetch narration" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "audio/mpeg");
  const contentLength = upstream.headers.get("Content-Length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(upstream.body, { status: 200, headers });
}
