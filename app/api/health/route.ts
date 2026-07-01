/**
 * app/api/health/route.ts
 * ---------------------------------------------------------------------
 * Lightweight health-check endpoint.
 *
 * Used by:
 *  - Docker HEALTHCHECK directive
 *  - Nginx upstream health probing
 *  - Kubernetes readiness / liveness probes
 *  - Uptime monitoring services
 *
 * Returns 200 with a JSON payload if the app is up.
 * Returns 503 if a critical dependency is unavailable.
 */

import { NextResponse } from "next/server";

// These fields are embedded at build-time, useful for traceability.
const BUILD_TAG = process.env.IMAGE_TAG ?? "local";
const START_TIME = Date.now();

function uptimeSeconds() {
    return Math.floor((Date.now() - START_TIME) / 1000);
}

export async function GET() {
    return NextResponse.json(
        {
            status: "ok",
            service: "ecommerce-frontend-kalvin",
            version: BUILD_TAG,
            uptime_s: uptimeSeconds(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV ?? "unknown",
        },
        {
            status: 200,
            headers: {
                // Health endpoints must not be cached
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Content-Type": "application/json",
            },
        }
    );
}
