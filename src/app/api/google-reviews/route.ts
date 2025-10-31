import { NextResponse } from "next/server";

export const runtime = "edge";

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlaceDetailsResponse {
  result: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  console.log("API Key exists:", !!apiKey);
  console.log("Place ID:", placeId);

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing Google Places API configuration" },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

    console.log("Fetching from Google Places API...");

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    console.log("Response status:", response.status);

    const data: GooglePlaceDetailsResponse = await response.json();

    console.log("Google API response status:", data.status);
    console.log("Full response:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      // Provide more detailed error message
      const errorDetails = {
        REQUEST_DENIED: "Places API issue. Common causes: 1) API not enabled, 2) Billing not enabled (required even for free tier), 3) API key restrictions, 4) Changes not propagated yet (wait 5 min)",
        INVALID_REQUEST: "Invalid Place ID or request parameters",
        OVER_QUERY_LIMIT: "API quota exceeded",
        ZERO_RESULTS: "No results found for this Place ID",
        UNKNOWN_ERROR: "Server error, please try again"
      };

      const errorMsg = errorDetails[data.status as keyof typeof errorDetails] || `Google API error: ${data.status}`;

      console.error("Google Places API Error:", {
        status: data.status,
        placeId,
        // Don't log the full API key, just indicate if it exists
        hasApiKey: !!apiKey
      });

      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: data.result.reviews || [],
      rating: data.result.rating,
      totalReviews: data.result.user_ratings_total,
    });
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
