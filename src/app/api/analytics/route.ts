import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsDashboardData,
  getAnalyticsSummary,
  analyticsStorage,
} from "@/lib/analytics/analytics-service";

/**
 * GET /api/analytics
 * Fetch analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get("days") || "30");
    const format = searchParams.get("format") || "full";

    // Validate days parameter
    if (isNaN(daysBack) || daysBack < 1 || daysBack > 365) {
      return NextResponse.json(
        { error: "Invalid days parameter. Must be between 1 and 365." },
        { status: 400 },
      );
    }

    // Return summary or full data
    if (format === "summary") {
      const summary = getAnalyticsSummary();
      return NextResponse.json(summary);
    }

    const data = getAnalyticsDashboardData(daysBack);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/analytics
 * Add new analytics event (for client-side tracking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, action, label, value, metadata } = body;

    // Validate required fields
    if (!type || !category || !action) {
      return NextResponse.json(
        { error: "Missing required fields: type, category, action" },
        { status: 400 },
      );
    }

    // Note: This endpoint is for documentation purposes
    // Client-side tracking is handled directly via the analytics service
    return NextResponse.json({
      success: true,
      message: "Analytics tracking should be done client-side",
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track analytics event" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/analytics
 * Clear all analytics data (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const session = await getServerSession();
    // if (!session || !session.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // For now, this is a client-side operation
    return NextResponse.json({
      success: true,
      message: "Analytics clearing should be done from the dashboard",
    });
  } catch (error) {
    console.error("Analytics clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear analytics data" },
      { status: 500 },
    );
  }
}
