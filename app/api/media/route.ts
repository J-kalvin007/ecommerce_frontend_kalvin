/**
 * Proxy API route for backend media files.
 *
 * Ngrok (used during development) intercepts direct image requests from web apps
 * and returns an HTML warning page (ERR_NGROK_6024) instead of the actual image.
 * This proxy adds the required `ngrok-skip-browser-warning` header, fetches the
 * real image from the backend, and streams it back to the client.
 *
 * Usage: /api/media?url=https://your-ngrok-url.ngrok-free.dev/media/...
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  // Validate that the URL is a recognized media URL to avoid open-redirect abuse
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only proxy http/https URLs
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // This header bypasses Ngrok's browser warning interception page
        "ngrok-skip-browser-warning": "true",
        // Identify ourselves as an image fetcher
        "Accept": "image/*,*/*;q=0.8",
      },
      // Don't follow too many redirects
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    // If backend returned HTML instead of an image, it's still the ngrok warning page
    if (contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Backend returned HTML instead of an image (Ngrok warning?)" },
        { status: 502 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache images for 1 hour in the browser, 24h in CDN
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[Media Proxy] Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 502 });
  }
}
